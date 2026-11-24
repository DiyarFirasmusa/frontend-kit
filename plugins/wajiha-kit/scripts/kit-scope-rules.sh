#!/bin/bash
# Copies one kit rule file and rewrites the `paths:` globs in its frontmatter so the rule only loads for one app of a
# project that has several (a website and an admin dashboard in one tree). Used by /wajiha-kit:setup for the
# "fullstack" profile.
#
#   kit-scope-rules.sh admin <rule.md> <out.md> [--admin-dir src/admin] [--admin-routes src/routes/admin]
#       dashboard rule → only under the admin folders:  "src/api/**" → "src/admin/api/**",
#       "src/routes/**" → "src/routes/admin/**", "src/routes/_app/**" → "src/routes/admin/_app/**"
#   kit-scope-rules.sh site <rule.md> <out.md> [--site-routes src/routes/_site]
#       website rule → only the site's folders:  "src/**/services/**" → "src/features/**/services/**" + "src/shared/**/services/**",
#       "src/routes/**" → "src/routes/_site/**"
#
# Root files (src/router.tsx, src/routes/__root.tsx, src/main.tsx, src/start.ts) stay as they are: both apps share them.
set -u
SCOPE="${1:-}"
IN="${2:-}"
OUT="${3:-}"
case "$SCOPE" in admin | site) ;; *) echo "usage: kit-scope-rules.sh <admin|site> <rule.md> <out.md> [options]" >&2; exit 64 ;; esac
[ -f "$IN" ] && [ -n "$OUT" ] || { echo "usage: kit-scope-rules.sh <admin|site> <rule.md> <out.md> [options]" >&2; exit 64; }
shift 3
ADMIN_DIR="src/admin"
ADMIN_ROUTES="src/routes/admin"
SITE_ROUTES="src/routes/_site"
while [ $# -gt 0 ]; do
  case "$1" in
    --admin-dir) ADMIN_DIR="${2%/}"; shift 2 ;;
    --admin-routes) ADMIN_ROUTES="${2%/}"; shift 2 ;;
    --site-routes) SITE_ROUTES="${2%/}"; shift 2 ;;
    *) echo "unknown option $1" >&2; exit 64 ;;
  esac
done

# The sibling rule names: an admin copy cites admin-<name>.md, not the site's rule of the same name.
RULE_NAMES="$(for rule in "$(dirname "$IN")"/*.md; do basename "$rule" .md; done | tr '\n' ' ')"
awk -v scope="$SCOPE" -v rule_names="$RULE_NAMES" -v admin_dir="$ADMIN_DIR" -v admin_routes="$ADMIN_ROUTES" -v site_routes="$SITE_ROUTES" '
  # Slashed globs match at any depth, so a site glob is anchored at the root: a nested admin has the same folders.
  function emit(glob) { print "  - \"" (scope == "site" && glob ~ /^src\// ? "/" : "") glob "\"" }
  BEGIN { fm = 0; count = split(rule_names, names, " ") }
  /^---[[:space:]]*$/ { fm++; print; next }
  fm == 1 && /^  - "src\// {
    glob = $0
    sub(/^  - "/, "", glob); sub(/"[[:space:]]*$/, "", glob)
    if (glob == "src/router.tsx" || glob == "src/main.tsx" || glob == "src/start.ts" || glob == "src/routes/__root.tsx") { emit(glob); next }
    if (scope == "admin") {
      if (glob ~ /^src\/routes\//) { rest = substr(glob, length("src/routes/") + 1); emit(admin_routes "/" rest); next }
      rest = substr(glob, length("src/") + 1); emit(admin_dir "/" rest); next
    }
    # site
    if (glob ~ /^src\/routes\//) { rest = substr(glob, length("src/routes/") + 1); emit(site_routes "/" rest); next }
    if (glob ~ /^src\/\*\*\//) { rest = substr(glob, length("src/**/") + 1); emit("src/features/**/" rest); emit("src/shared/**/" rest); next }
    if (glob == "src/**") { emit("src/features/**"); emit("src/shared/**"); emit(site_routes "/**"); next }
    emit(glob); next
  }
  # The rule text: in an admin rule every `src/...` it mentions is admin code (the dashboard rules are written for the
  # dashboard layout), so those paths move under the admin folders too. Root files stay.
  fm >= 2 && scope == "admin" {
    line = $0
    gsub(/src\/routes\/__root\.tsx/, "@@ROOT@@", line)
    gsub(/src\/router\.tsx/, "@@ROUTER@@", line)
    gsub(/src\/main\.tsx/, "@@MAIN@@", line)
    gsub(/src\/routeTree\.gen\.ts/, "@@TREE@@", line)
    gsub(/src\/routes\//, admin_routes "/", line)
    gsub(/src\/(api|components|constants|features|guards|hooks|layout|lib|locales|services|store|styles|test|types|utils|validations)\//, admin_dir "/&", line)
    gsub(admin_dir "/src\/", admin_dir "/", line)
    gsub(/@@ROOT@@/, "src/routes/__root.tsx", line)
    gsub(/@@ROUTER@@/, "src/router.tsx", line)
    gsub(/@@MAIN@@/, "src/main.tsx", line)
    gsub(/@@TREE@@/, "src/routeTree.gen.ts", line)
    for (i = 1; i <= count; i++) {
      gsub("`" names[i] "[.]md`", "`admin-" names[i] ".md`", line)
      gsub("[.]claude/rules/" names[i] "[.]md", ".claude/rules/admin-" names[i] ".md", line)
    }
    print line; next
  }
  { print }
' "$IN" >"$OUT"
