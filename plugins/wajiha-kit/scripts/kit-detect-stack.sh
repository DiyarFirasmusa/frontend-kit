#!/bin/bash
# Detects a project's stack from package.json, the lockfile and the config files, and prints it as JSON for
# /wajiha-kit:setup (the "stack", "srcDirs" and "commands" of .claude/wajiha-kit.json). Reads files only: no installs,
# never .env. A field it cannot find is an empty string, never a guess. In a monorepo (pnpm/npm/yarn workspaces) it lists
# the packages as "apps" (path = cwd = the package folder) and their src folders as srcDirs.
#
#   kit-detect-stack.sh [project-dir]
set -u
PROJECT="${1:-$PWD}"
PKG="$PROJECT/package.json"
[ -f "$PKG" ] || { echo "no package.json in $PROJECT" >&2; exit 1; }
command -v jq >/dev/null || { echo "jq is required" >&2; exit 1; }
. "$(dirname "$0")/jq-compat.sh"

# Monorepo: the workspace packages (pnpm-workspace.yaml "packages:" or package.json "workspaces") count as part of the project.
WS_GLOBS="$({ [ -f "$PROJECT/pnpm-workspace.yaml" ] && sed -n "s/^[[:space:]]*-[[:space:]]*['\"]\{0,1\}\([^'\"#]*\)['\"]\{0,1\}[[:space:]]*\$/\1/p" "$PROJECT/pnpm-workspace.yaml"; jq -r '(.workspaces // []) | (if type == "object" then .packages else . end)[]?' "$PKG" 2>/dev/null; } | sed 's#/$##')"
WS_DIRS=()
while IFS= read -r glob; do
  [ -n "$glob" ] || continue
  # The glob is expanded, never split: a project path may hold spaces.
  OLD_IFS="$IFS"
  IFS=
  for dir in "$PROJECT"/$glob; do [ -f "$dir/package.json" ] && WS_DIRS+=("${dir#"$PROJECT"/}"); done
  IFS="$OLD_IFS"
done <<<"$WS_GLOBS"
ALL_PKGS=("$PKG")
for dir in "${WS_DIRS[@]:-}"; do [ -n "$dir" ] && ALL_PKGS+=("$PROJECT/$dir/package.json"); done

has() { jq -s -e --arg n "$1" 'map((.dependencies // {}) + (.devDependencies // {})) | add | has($n)' "${ALL_PKGS[@]}" >/dev/null 2>&1; }
script_of() { jq -r --arg n "$1" '.scripts[$n] // empty' "$PKG"; }
first() { # first <label:package>... → label of the first installed package
  local pair
  for pair in "$@"; do has "${pair#*:}" && { printf '%s' "${pair%%:*}"; return 0; }; done
  return 0
}

if [ -f "$PROJECT/pnpm-lock.yaml" ]; then PM=pnpm; RUN="pnpm run"; EXEC="pnpm exec"
elif [ -f "$PROJECT/yarn.lock" ]; then PM=yarn; RUN="yarn"; EXEC="yarn"
elif [ -f "$PROJECT/bun.lock" ] || [ -f "$PROJECT/bun.lockb" ]; then PM=bun; RUN="bun run"; EXEC="bunx"
else
  # No lockfile (a fresh clone, an example): the "packageManager" field of package.json (Corepack) says which one.
  case "$(jq -r '.packageManager // ""' "$PKG")" in
    pnpm@*) PM=pnpm; RUN="pnpm run"; EXEC="pnpm exec" ;;
    yarn@*) PM=yarn; RUN="yarn"; EXEC="yarn" ;;
    bun@*) PM=bun; RUN="bun run"; EXEC="bunx" ;;
    *) PM=npm; RUN="npm run"; EXEC="npx" ;;
  esac
fi

FRAMEWORK="$(first "Next.js:next" "TanStack Start:@tanstack/react-start" "React Router framework:@react-router/dev" "Remix:@remix-run/react" "Expo:expo" "Gatsby:gatsby" "Create React App:react-scripts" \
  "Nuxt:nuxt" "SvelteKit:@sveltejs/kit" "Angular:@angular/core" "Astro:astro")"
# A UI library names the app only when it isn't a React one that merely has a tool built on that library.
[ -n "$FRAMEWORK" ] || has react || FRAMEWORK="$(first "Vue:vue" "Svelte:svelte" "Solid:solid-js")"
[ -n "$FRAMEWORK" ] || FRAMEWORK="$(first "Vite:vite")"
case "$FRAMEWORK" in
  "Next.js") ROUTER="Next.js router" ;;
  "TanStack Start") ROUTER="TanStack Router" ;;
  "React Router framework") ROUTER="React Router" ;;
  Remix) ROUTER="Remix" ;;
  Nuxt) ROUTER="Nuxt pages" ;;
  SvelteKit) ROUTER="SvelteKit" ;;
  Astro) ROUTER="Astro pages" ;;
  Angular) ROUTER="$(first "Angular Router:@angular/router")" ;;
  Vue) ROUTER="$(first "Vue Router:vue-router")" ;;
  *) ROUTER="$(first "TanStack Router:@tanstack/react-router" "React Router:react-router-dom" "React Router:react-router" "Wouter:wouter")" ;;
esac
DATA="$(first "TanStack Query:@tanstack/react-query" "SWR:swr" "Redux Toolkit:@reduxjs/toolkit" "Apollo:@apollo/client" "urql:urql" "TanStack Query:@tanstack/vue-query" "TanStack Query:@tanstack/svelte-query" "TanStack Query:@tanstack/angular-query-experimental")"
STATE="$(first "Zustand:zustand" "Redux:@reduxjs/toolkit" "Redux:redux" "Jotai:jotai" "Recoil:recoil" "MobX:mobx" "Pinia:pinia" "Vuex:vuex" "NgRx:@ngrx/signals" "NgRx:@ngrx/store" "NGXS:@ngxs/store")"
STYLING="$(first "Tailwind:tailwindcss" "styled-components:styled-components" "Emotion:@emotion/react" "MUI:@mui/material" "Sass:sass")"
TESTS="$(first "vitest:vitest" "jest:jest")"
E2E="$(first "playwright:@playwright/test" "cypress:cypress")"
LINT="$(first "oxlint:oxlint" "eslint:eslint" "biome:@biomejs/biome")"
FORMAT="$(first "oxfmt:oxfmt" "prettier:prettier" "biome:@biomejs/biome")"
I18N="$(first "i18next:react-i18next" "i18next:i18next" "next-intl:next-intl" "react-intl:react-intl" "formatjs:@formatjs/intl" "vue-i18n:vue-i18n" "Transloco:@jsverse/transloco" "svelte-i18n:svelte-i18n")"
FORMS="$(first "react-hook-form:react-hook-form" "formik:formik" "tanstack-form:@tanstack/react-form")"

TS=false
{ has typescript || [ -f "$PROJECT/tsconfig.json" ]; } && TS=true
# A solution-style tsconfig ("references", no files of its own) is checked with `tsc -b`: `tsc --noEmit` on it checks nothing.
SOLUTION=false
[ -f "$PROJECT/tsconfig.json" ] && grep -q '"references"' "$PROJECT/tsconfig.json" && SOLUTION=true

SRC=()
for dir in src app pages components lib; do [ -d "$PROJECT/$dir" ] && SRC+=("$dir"); done
# And the project's own layout: a top folder with UI files, or with any code when none of the usual folders exists.
KNOWN=${#SRC[@]}
for path in "$PROJECT"/*/; do
  [ -d "$path" ] || continue
  dir="$(basename "$path")"
  case "$dir" in
    src | app | pages | components | lib | node_modules | dist | build | out | coverage | vendor | public | static | docs) continue ;;
    e2e | test | tests | __tests__ | cypress | scripts | examples | evals | playwright-report | test-results | storybook-static) continue ;;
  esac
  workspace=""
  for ws in "${WS_DIRS[@]:-}"; do case "$ws/" in "$dir"/*) workspace=1 ;; esac; done
  [ -z "$workspace" ] || continue
  if [ "$KNOWN" -eq 0 ]; then
    found="$(find "$path" \( -name node_modules -o -name dist -o -name '.?*' \) -prune -o -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' -o -name '*.vue' -o -name '*.svelte' -o -name '*.astro' \) -print 2>/dev/null | head -n 1)"
  else
    found="$(find "$path" \( -name node_modules -o -name dist -o -name '.?*' \) -prune -o -type f \( -name '*.tsx' -o -name '*.jsx' -o -name '*.vue' -o -name '*.svelte' -o -name '*.astro' \) -print 2>/dev/null | head -n 1)"
  fi
  [ -n "$found" ] && SRC+=("$dir")
done
# Workspace packages keep their code in <package>/src (or app/, pages/): list those instead of guessing the root.
APPS_JSON="[]"
for dir in "${WS_DIRS[@]:-}"; do
  [ -n "$dir" ] || continue
  for sub in src app pages; do [ -d "$PROJECT/$dir/$sub" ] && SRC+=("$dir/$sub"); done
  pkg_name="$(jq -r '.name // empty' "$PROJECT/$dir/package.json")"
  pkg_tests=""
  jq -e '((.dependencies // {}) + (.devDependencies // {})) | has("vitest")' "$PROJECT/$dir/package.json" >/dev/null 2>&1 && pkg_tests=vitest
  jq -e '((.dependencies // {}) + (.devDependencies // {})) | has("jest")' "$PROJECT/$dir/package.json" >/dev/null 2>&1 && pkg_tests=jest
  related=""
  case "$pkg_tests" in
    vitest) related="$EXEC vitest related --run --passWithNoTests" ;;
    jest) related="$EXEC jest --findRelatedTests --passWithNoTests" ;;
  esac
  APPS_JSON="$(printf '%s' "$APPS_JSON" | jq --arg name "${pkg_name:-$(basename "$dir")}" --arg path "$dir" --arg related "$related" \
    '. + [{name: $name, path: $path, cwd: $path, commands: (if $related == "" then {} else {relatedTests: $related} end)}]')"
done
SRC_JSON="$(printf '%s\n' "${SRC[@]:-}" | jq -R . | jq -s 'map(select(. != ""))')"

# `next typegen` exists from 15.5. An unreadable range (latest, workspace:) counts as current.
next_has_typegen() {
  local version major minor=99
  version="$(jq -rs 'map((.dependencies // {}) + (.devDependencies // {})) | add | .next // ""' "${ALL_PKGS[@]}" | grep -oE '[0-9]+(\.[0-9]+)?' | head -n1)"
  [ -n "$version" ] || return 0
  major="${version%%.*}"
  case "$version" in *.*) minor="${version#*.}" ;; esac
  [ "$major" -gt 15 ] || { [ "$major" -eq 15 ] && [ "$minor" -ge 5 ]; }
}

TYPECHECK=""
if [ -n "$(script_of typecheck)" ]; then TYPECHECK="$RUN --silent typecheck"
elif [ "$TS" = true ] && has vue-tsc; then
  if [ "$SOLUTION" = true ]; then TYPECHECK="$EXEC vue-tsc -b"; else TYPECHECK="$EXEC vue-tsc --noEmit"; fi
elif [ "$TS" = true ] && has svelte-check; then
  if [ "$SOLUTION" = false ]; then TYPECHECK="$EXEC svelte-check --tsconfig ./tsconfig.json"
  elif [ -f "$PROJECT/tsconfig.app.json" ]; then TYPECHECK="$EXEC svelte-check --tsconfig ./tsconfig.app.json"
  else TYPECHECK="$EXEC svelte-check --no-tsconfig"; fi
elif [ "$TS" = true ]; then
  if [ "$SOLUTION" = true ]; then TYPECHECK="$EXEC tsc -b"; else TYPECHECK="$EXEC tsc --noEmit"; fi
  # Generated route types: a clean checkout fails (or checks nothing) without typegen (Next 15.5+, React Router framework).
  if has next && next_has_typegen; then TYPECHECK="$EXEC next typegen && $TYPECHECK"
  elif has @react-router/dev; then TYPECHECK="$EXEC react-router typegen && $TYPECHECK"; fi
fi
RELATED=""
case "$TESTS" in
  vitest) RELATED="$EXEC vitest related --run --passWithNoTests" ;;
  jest) RELATED="$EXEC jest --findRelatedTests --passWithNoTests" ;;
esac
DEV_PORT="$(script_of dev | grep -oE -- '--port[ =][0-9]+|-p [0-9]+' | grep -oE '[0-9]+' | head -n1)"
if [ -z "$DEV_PORT" ]; then
  case "$FRAMEWORK" in "Next.js" | "TanStack Start" | "Create React App" | Remix | Nuxt) DEV_PORT=3000 ;; Vite | SvelteKit | "React Router framework") DEV_PORT=5173 ;; Angular) DEV_PORT=4200 ;; Astro) DEV_PORT=4321 ;;
    Vue | Svelte | Solid) if has vite; then DEV_PORT=5173; fi ;; Gatsby) DEV_PORT=8000 ;; *) DEV_PORT="" ;; esac
fi

jq -n \
  --arg pm "$PM" --arg run "$RUN" --arg fw "$FRAMEWORK" --arg router "$ROUTER" --arg data "$DATA" --arg state "$STATE" \
  --arg styling "$STYLING" --arg tests "$TESTS" --arg e2e "$E2E" --arg lint "$LINT" --arg fmt "$FORMAT" --arg i18n "$I18N" \
  --arg forms "$FORMS" --argjson apps "$APPS_JSON" --argjson ts "$TS" --argjson solution "$SOLUTION" --argjson src "$SRC_JSON" \
  --arg typecheck "$TYPECHECK" --arg related "$RELATED" --arg port "$DEV_PORT" \
  '{stack: {packageManager: $pm, run: $run, framework: $fw, router: $router, data: $data, state: $state, styling: $styling,
            tests: $tests, e2e: $e2e, lint: $lint, format: $fmt, i18n: $i18n, forms: $forms, typescript: $ts, solutionTsconfig: $solution},
    srcDirs: $src, apps: $apps, devPort: $port, commands: {typecheck: $typecheck, relatedTests: $related},
    missing: ([if $tests == "" then "test runner" else empty end, if $lint == "" then "linter" else empty end,
               if $fmt == "" then "formatter" else empty end, if $ts == false then "TypeScript" else empty end])}'
