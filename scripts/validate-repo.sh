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
  sed -n '2,/^---$/p' "$skill" | grep -Eq '^description: +[^" ].*: ' && bad "$skill: description holds ': ' and is not quoted"
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
# 5c. rules: frontmatter is only a list of quoted paths (an unreadable one makes the rule load in every session), the size
#     stays under the on-demand cap, references are flat file names, and setup knows every placeholder
for rule in plugins/*/templates/*/rules/*.md plugins/*/templates/*/variants/*/rules/*.md; do
  [ -f "$rule" ] || continue
  [ "$(wc -m <"$rule")" -le 40000 ] || bad "$rule: over 40000 characters"
  if head -n1 "$rule" | grep -qx -- '---'; then
    awk 'NR == 1 { next }
      /^---$/ { closed = 1; exit }
      NR == 2 { if ($0 != "paths:") wrong = 1; next }
      $0 !~ /^  - "[^"\\]+"$/ { wrong = 1 }
      END { exit (closed && !wrong) ? 0 : 1 }' "$rule" || bad "$rule: frontmatter must be paths: and quoted globs"
  fi
  grep -qE '`(shared|react|website|dashboard)(/rules)?/[a-z-]+[.]md`' "$rule" && bad "$rule: cites a template path; installed rules are flat"
done
for placeholder in $(grep -rhoE '[{][{][A-Z0-9_]+[}][}]' plugins/*/templates | sort -u); do
  grep -qF "$placeholder" plugins/*/skills/setup/SKILL.md || bad "setup skill does not name $placeholder"
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
# The hint triggers: English in the .tsv, Arabic in the -ar.txt. A skill missing from one of them, or a misspelled
# @group, fails silently in the hook.
for tsv in plugins/*/scripts/skill-triggers.tsv; do
  [ -f "$tsv" ] || continue
  ar="${tsv%.tsv}-ar.txt"
  [ -f "$ar" ] || { bad "$ar missing"; continue; }
  grep -v '^#' "$tsv" | LC_ALL=C grep -q $'[\330\331]' && bad "$tsv: Arabic triggers belong in ${ar##*/}"
  trigger_problems="$(LC_ALL=C awk '
    FILENAME == ARGV[1] { if ($0 !~ /^(#|$)/) english[$1] = 1; next }
    /^[ \t]*(#|$)/ { next }
    {
      if ($0 ~ /^@/) group[$1] = 1
      else if ($0 !~ /^[ \t]/) arabic[$1] = 1
      for (i = 1; i <= NF; i++) { word = $i; sub(/^!/, "", word); if (word ~ /^@/) used[word] = 1 }
    }
    END {
      n = split("@personal @everyday @software @building @artefact", needed, " ")
      for (i = 1; i <= n; i++) used[needed[i]] = 1
      for (s in english) if (!(s in arabic)) print "no Arabic trigger for " s
      for (s in arabic) if (!(s in english)) print "no English trigger for " s
      for (g in used) if (!(g in group)) print "undefined group " g
    }' "$tsv" "$ar")"
  [ -z "$trigger_problems" ] || bad "$ar: $(printf '%s' "$trigger_problems" | paste -sd';' -)"
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

# 9. what the READMEs and the descriptions say matches what ships
KIT=plugins/frontend-kit
count_dirs() { find "$1" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' '; }
SKILLS="$(count_dirs "$KIT/skills")"
AGENTS="$(find "$KIT/agents" -name '*.md' | wc -l | tr -d ' ')"
EVENTS="$(jq '.hooks | length' "$KIT/hooks/hooks.json")"
EXAMPLES="$(count_dirs examples)"
EVALS="$(find "$KIT/evals/dev" -name prompt.md | wc -l | tr -d ' ')"
grep -Eq "^\| Skills .*\| $SKILLS \|\$" README.md || bad "README.md: there are $SKILLS skills"
grep -Eq "^\| Agents .*\| $AGENTS \|\$" README.md || bad "README.md: there are $AGENTS agents"
grep -Eq "^\| Hooks .*\| $EVENTS events \|\$" README.md || bad "README.md: there are $EVENTS hook events"
grep -q " of $EVALS development evals" README.md || bad "README.md: there are $EVALS development evals"
for doc in README.md docs/README.md; do
  grep -Eq "\| $EXAMPLES (reference )?projects showing" "$doc" || bad "$doc: there are $EXAMPLES examples"
done
for profile in "$KIT"/templates/*/; do
  profile="$(basename "$profile")"
  [ "$profile" = shared ] && continue
  jq -r .description "$KIT/.claude-plugin/plugin.json" | grep -qw "$profile" || bad "plugin.json description: no $profile profile"
  jq -r '.plugins[].description' .claude-plugin/marketplace.json | grep -qw "$profile" || bad "marketplace.json description: no $profile profile"
  grep -q "\`$profile\`" README.md || bad "README.md: no $profile profile"
  grep -q "^| $profile " docs/TEMPLATE-CONTRACT.md || bad "docs/TEMPLATE-CONTRACT.md: no $profile profile"
done

# 10. agents: name = file, YAML-safe description, tools that fit the prompt, servers that ship
for agent in "$KIT"/agents/*.md; do
  base="$(basename "$agent" .md)"
  head="$(sed -n '2,/^---$/p' "$agent")"
  tools="$(printf '%s\n' "$head" | sed -n 's/^tools: *//p' | tr -d ' ')"
  [ "$(printf '%s\n' "$head" | sed -n 's/^name: *//p')" = "$base" ] || bad "$agent: name differs from the file"
  # an unquoted ": " makes the frontmatter unreadable, and Claude Code then drops every field, tools included
  printf '%s\n' "$head" | grep -Eq '^description: +[^" ].*: ' && bad "$agent: description holds ': ' and is not quoted"
  if grep -Eq '[Ll]oad[^.]*skill|`[a-z0-9-]+` skill' "$agent"; then
    case ",$tools," in *,Skill,*) ;; *) bad "$agent: names a skill to load but has no Skill tool" ;; esac
  fi
  if printf '%s\n' "$head" | grep -q '^disallowedTools:.*Write'; then
    case ",$tools," in *,Write,* | *,Edit,* | *,NotebookEdit,*) bad "$agent: denies Write but grants a write tool" ;; esac
  fi
  if printf '%s\n' "$head" | grep -q '^description:.*Read-only'; then
    case ",$tools," in *,Bash,*) bad "$agent: says read-only but has Bash" ;; esac
  fi
  for server in $(printf '%s\n' "$tools" | tr ',' '\n' | sed -n 's/^mcp__plugin_frontend-kit_\(.*\)__.*/\1/p' | sort -u); do
    jq -e --arg s "$server" '.mcpServers[$s]' "$KIT/.mcp.json" >/dev/null || bad "$agent: no MCP server $server in .mcp.json"
  done
done

# A script that deletes its temp folder must never delete the caller's (it once could).
SAFETY="$(bash scripts/test-temp-safety.sh 2>&1)" || { bad "temp-folder safety (scripts/test-temp-safety.sh):"; printf '%s\n' "$SAFETY"; }

[ "$FAIL" -eq 0 ] && echo "repo checks passed" || { echo "$FAIL problem(s)"; exit 1; }
