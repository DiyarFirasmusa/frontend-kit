#!/bin/bash
# Static checks for the marketplace repo (no project, no node_modules needed). Run locally or from CI:
#   bash scripts/validate-repo.sh
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT" || exit 1
FAIL=0
bad() { echo "✗ $1"; FAIL=$((FAIL + 1)); }
command -v jq >/dev/null || { echo "jq is required"; exit 1; }

# 1. every JSON file parses
while IFS= read -r f; do
  jq empty "$f" 2>/dev/null || bad "invalid JSON: $f"
done < <(find .claude-plugin plugins -name '*.json' -not -path '*/node_modules/*')

# 2. marketplace entries match their plugin.json (name, version) and point at real folders
while IFS=$'\t' read -r name source; do
  dir="${source#./}"
  [ -f "$dir/.claude-plugin/plugin.json" ] || { bad "marketplace entry $name: no $dir/.claude-plugin/plugin.json"; continue; }
  pv="$(jq -r .version "$dir/.claude-plugin/plugin.json")"
  mv="$(jq -r --arg n "$name" '.plugins[] | select(.name==$n) | .version // empty' .claude-plugin/marketplace.json)"
  [ -z "$mv" ] || [ "$pv" = "$mv" ] || bad "version mismatch for $name: marketplace $mv, plugin.json $pv"
  [ "$(jq -r .name "$dir/.claude-plugin/plugin.json")" = "$name" ] || bad "name mismatch for $name"
done < <(jq -r '.plugins[] | [.name, .source] | @tsv' .claude-plugin/marketplace.json)

# 3. skills: folder name = frontmatter name, description present, body size
for skill in plugins/*/skills/*/SKILL.md; do
  dir="$(basename "$(dirname "$skill")")"
  name="$(sed -n 's/^name: *//p' "$skill" | head -n1 | tr -d '"')"
  [ "$name" = "$dir" ] || bad "$skill: frontmatter name '$name' != folder '$dir'"
  grep -q '^description: *.\{20,\}' "$skill" || bad "$skill: missing or too short description"
done

# 4. hooks.json scripts exist and are executable
for hooks in plugins/*/hooks/hooks.json; do
  base="$(dirname "$(dirname "$hooks")")"
  while IFS= read -r script; do
    [ -x "$base/scripts/$script" ] || bad "$hooks: scripts/$script missing or not executable"
  done < <(jq -r '.. | .command? // empty' "$hooks" | sed -n 's#.*/scripts/\([A-Za-z0-9._-]*\).*#\1#p')
done

# 5. template contract: CLAUDE.md templates stay within 150 lines; shell syntax is valid
for t in plugins/*/templates/*/CLAUDE.md; do
  [ "$(wc -l <"$t")" -le 150 ] || bad "$t is over 150 lines"
done
# 5b. dashboard variants (templates/dashboard/variants/<name>): CLAUDE.md within the cap, config JSON with the framework
#     the setup skill names, every rule has frontmatter paths, and the variant is described in the setup skill
for v in plugins/*/templates/dashboard/variants/*/; do
  name="$(basename "$v")"
  [ -f "$v/CLAUDE.md" ] || bad "$v: CLAUDE.md missing"
  [ "$(wc -l <"$v/CLAUDE.md")" -le 150 ] || bad "$v/CLAUDE.md is over 150 lines"
  jq -e '.stack.framework and .profile == "dashboard"' "$v/frontend-kit.json" >/dev/null 2>&1 || bad "$v/frontend-kit.json: needs profile dashboard and stack.framework"
  for rule in "$v"/rules/*.md; do
    [ -f "$rule" ] && { head -1 "$rule" | grep -qx -- '---' || bad "$rule: no frontmatter"; }
  done
  grep -q "| \`$name\` |" plugins/*/skills/setup/SKILL.md || bad "setup skill does not mention the $name variant"
  [ "$name" != "tanstack-start" ] || [ -f "$v/e2e/serve-spa.ts" ] || bad "$v: e2e/serve-spa.ts missing"
done
for awk_file in plugins/*/scripts/*.awk; do
  [ -f "$awk_file" ] || continue
  awk -f "$awk_file" </dev/null >/dev/null 2>&1 || bad "awk syntax error: $awk_file"
done
for sh in plugins/*/scripts/*.sh scripts/*.sh; do
  bash -n "$sh" 2>/dev/null || bad "shell syntax error: $sh"
done
command -v shellcheck >/dev/null && { shellcheck -S warning plugins/*/scripts/*.sh scripts/*.sh >/tmp/shellcheck.out 2>&1 || { bad "shellcheck findings (see below)"; cat /tmp/shellcheck.out; }; }

# 6. no playground domain in templates or skills, and no private name in anything that gets pushed. The private
#    names are not written here (the repo is public): one per line in .private-names (git-ignored), or in the
#    file KIT_PRIVATE_NAMES points at.
if grep -rniE 'bazaar' plugins/*/templates plugins/*/skills 2>/dev/null | grep -v THIRD_PARTY | grep -q .; then
  bad "playground domain names in templates or skills:"; grep -rniE 'bazaar' plugins/*/templates plugins/*/skills | head
fi
PRIVATE_NAMES="${KIT_PRIVATE_NAMES:-$ROOT/.private-names}"
if [ -f "$PRIVATE_NAMES" ]; then
  NAMES="$(sed '/^[[:space:]]*$/d' "$PRIVATE_NAMES")"
  if [ -n "$NAMES" ]; then
    LEAKS="$(git grep --untracked -nIiwF -e "$NAMES" -- . 2>/dev/null | cut -c1-160)"
    [ -z "$LEAKS" ] || { bad "private names in files that get pushed:"; printf '%s\n' "$LEAKS" | head; }
  fi
fi

# 7. eval cases: a prompt, at least one grader, dev-/heldout- name matching the folder they sit in
for prompt in plugins/*/evals/*/*/prompt.md; do
  [ -f "$prompt" ] || continue
  dir="$(dirname "$prompt")"
  group="$(basename "$(dirname "$dir")")"
  name="$(sed -n 's/^name: *//p' "$prompt" | head -n1)"
  ls "$dir"/graders/*.md >/dev/null 2>&1 || bad "$dir: eval case without graders"
  case "$name" in "$group"-*) ;; *) bad "$prompt: case name '$name' must start with '$group-'" ;; esac
done

# 8. examples: a README, valid JSON, no placeholders or absolute paths left, and the config's srcDirs match what detection finds
for dir in examples/*/; do
  dir="${dir%/}"
  [ -f "$dir/README.md" ] || bad "$dir: no README.md"
  if [ -f "$dir/.claude/frontend-kit.json" ]; then
    jq empty "$dir/.claude/frontend-kit.json" 2>/dev/null || bad "$dir: invalid .claude/frontend-kit.json"
    if [ -f "$dir/package.json" ]; then
      want="$(jq -c '.srcDirs // []' "$dir/.claude/frontend-kit.json")"
      got="$(bash plugins/frontend-kit/scripts/kit-detect-stack.sh "$dir" 2>/dev/null | jq -c '.srcDirs' 2>/dev/null)"
      [ "$want" = "$got" ] || bad "$dir: srcDirs $want in the config, detection finds $got"
    fi
  fi
done
if grep -rIlE '\{\{[A-Z_]+\}\}' examples 2>/dev/null | grep -q .; then bad "examples: unreplaced {{PLACEHOLDER}}:"; grep -rIlE '\{\{[A-Z_]+\}\}' examples | head -3; fi
if grep -rIlE '/Users/|/private/tmp|/var/folders' examples 2>/dev/null | grep -q .; then bad "examples: absolute paths:"; grep -rIlE '/Users/|/private/tmp|/var/folders' examples | head -3; fi

[ "$FAIL" -eq 0 ] && echo "repo checks passed" || { echo "$FAIL problem(s)"; exit 1; }
