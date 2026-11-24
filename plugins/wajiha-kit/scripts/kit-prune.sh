#!/bin/bash
# Finds (and, with --apply, removes) kit files in a project that do not belong to the chosen profile, e.g. website rules
# left in a dashboard project. Used by /wajiha-kit:setup after the user approved the list. Nothing is ever deleted:
# applied files are MOVED to .claude/kit-backup/<timestamp>/ so they can be restored.
#
#   kit-prune.sh <website|dashboard|react|fullstack> [--apply] [--include-edited] [project-dir]
#
# Output, one line per file:
#   REMOVE <path>   identical to a kit template of another profile (safe)
#   EDITED <path>   same name as another profile's kit rule, but you changed it (kept unless --include-edited)
#   YOURS <path>    not a kit file at all (never touched)
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
TEMPLATES="$HERE/../templates"
PROFILE="${1:-}"
case "$PROFILE" in website | dashboard | react | fullstack) shift ;; *) echo "usage: kit-prune.sh <website|dashboard|react|fullstack> [--apply] [--include-edited] [project-dir]" >&2; exit 64 ;; esac
APPLY=0
EDITED=0
PROJECT="$PWD"
for arg in "$@"; do
  case "$arg" in
    --apply) APPLY=1 ;;
    --include-edited) EDITED=1 ;;
    *) PROJECT="$arg" ;;
  esac
done
RULES="$PROJECT/.claude/rules"
[ -d "$RULES" ] || { echo "no .claude/rules in $PROJECT"; exit 0; }

# Rule names this profile keeps: shared + its own.
# fullstack = the site (website rules) + the admin (dashboard rules copied as admin-<name>.md with scoped paths).
rule_names() { local dir file; for dir in "$@"; do for file in "$dir"/*.md; do [ -f "$file" ] && basename "$file"; done; done; }
if [ "$PROFILE" = fullstack ]; then
  KEEP="$(rule_names "$TEMPLATES/shared/rules" "$TEMPLATES/website/rules"; rule_names "$TEMPLATES/dashboard/rules" | sed 's/^/admin-/')"
else
  KEEP="$(rule_names "$TEMPLATES/shared/rules" "$TEMPLATES/$PROFILE/rules" | sort -u)"
fi
BACKUP="$PROJECT/.claude/kit-backup/$(date +%Y%m%d-%H%M%S)"

for file in "$RULES"/*.md; do
  [ -f "$file" ] || continue
  name="$(basename "$file")"
  # In a fullstack project a dashboard rule that was copied unscoped (its globs would load for the site too) is a leftover.
  if [ "$PROFILE" = fullstack ] && [ -f "$TEMPLATES/dashboard/rules/$name" ] && cmp -s "$file" "$TEMPLATES/dashboard/rules/$name" \
    && ! { [ -f "$TEMPLATES/website/rules/$name" ] && cmp -s "$file" "$TEMPLATES/website/rules/$name"; }; then
    echo "REMOVE .claude/rules/$name (dashboard rule copied without app scope)"
    [ "$APPLY" -eq 1 ] && { mkdir -p "$BACKUP/rules" && mv "$file" "$BACKUP/rules/$name"; }
    continue
  fi
  printf '%s\n' "$KEEP" | grep -qx "$name" && continue
  # Which other profile's template is it? Same content = unchanged kit file.
  owner=""
  identical=0
  for other in website dashboard react; do
    [ "$other" = "$PROFILE" ] && continue
    template="$TEMPLATES/$other/rules/$name"
    [ -f "$template" ] || continue
    owner="$other"
    cmp -s "$file" "$template" && identical=1
  done
  # A dashboard variant's own rule (structure.md, framework.md) stays, unless it is another profile's unchanged file.
  if [ "$PROFILE" = dashboard ] && [ "$identical" -eq 0 ] && compgen -G "$TEMPLATES/dashboard/variants/*/rules/$name" >/dev/null; then
    continue
  fi
  # admin-<name>.md is a fullstack project's scoped copy of a dashboard rule.
  base="${name#admin-}"
  if [ -z "$owner" ] && [ "$base" != "$name" ] && [ -f "$TEMPLATES/dashboard/rules/$base" ]; then
    owner="fullstack"
    cmp -s "$file" <(bash "$HERE/kit-scope-rules.sh" admin "$TEMPLATES/dashboard/rules/$base" /dev/stdout) && identical=1
  fi
  rel=".claude/rules/$name"
  if [ -z "$owner" ]; then
    echo "YOURS $rel"
  elif [ "$identical" -eq 1 ] || [ "$EDITED" -eq 1 ]; then
    [ "$identical" -eq 1 ] && echo "REMOVE $rel ($owner profile, unchanged)" || echo "REMOVE $rel ($owner profile, edited by you; --include-edited)"
    if [ "$APPLY" -eq 1 ]; then
      mkdir -p "$BACKUP/rules" && mv "$file" "$BACKUP/rules/$name"
    fi
  else
    echo "EDITED $rel ($owner profile, changed by you: kept)"
  fi
done
[ "$APPLY" -eq 1 ] && [ -d "$BACKUP" ] && echo "moved to ${BACKUP#"$PROJECT"/} (restore with mv)"
exit 0
