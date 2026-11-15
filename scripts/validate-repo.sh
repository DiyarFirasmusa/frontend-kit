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
for sh in plugins/*/scripts/*.sh scripts/*.sh; do
  bash -n "$sh" 2>/dev/null || bad "shell syntax error: $sh"
done
command -v shellcheck >/dev/null && { shellcheck -S warning plugins/*/scripts/*.sh scripts/*.sh >/tmp/shellcheck.out 2>&1 || { bad "shellcheck findings (see below)"; cat /tmp/shellcheck.out; }; }

# 6. no project or company names leaked into templates
if grep -rniE 'hassa|inventory-storage|bazaar' plugins/*/templates plugins/*/skills 2>/dev/null | grep -v THIRD_PARTY | grep -q .; then
  bad "domain-specific names in templates or skills:"; grep -rniE 'hassa|inventory-storage|bazaar' plugins/*/templates plugins/*/skills | head
fi

[ "$FAIL" -eq 0 ] && echo "repo checks passed" || { echo "$FAIL problem(s)"; exit 1; }
