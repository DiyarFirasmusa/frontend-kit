#!/bin/bash
# Detects a project's stack from package.json, the lockfile and the config files, and prints it as JSON for
# /frontend-kit:setup (the "stack", "srcDirs" and "commands" of .claude/frontend-kit.json). Reads files only: no installs,
# never .env. A field it cannot find is an empty string, never a guess.
#
#   kit-detect-stack.sh [project-dir]
set -u
PROJECT="${1:-$PWD}"
PKG="$PROJECT/package.json"
[ -f "$PKG" ] || { echo "no package.json in $PROJECT" >&2; exit 1; }
command -v jq >/dev/null || { echo "jq is required" >&2; exit 1; }

has() { jq -e --arg n "$1" '((.dependencies // {}) + (.devDependencies // {})) | has($n)' "$PKG" >/dev/null 2>&1; }
script_of() { jq -r --arg n "$1" '.scripts[$n] // empty' "$PKG"; }
first() { # first <label:package>... → label of the first installed package
  local pair
  for pair in "$@"; do has "${pair#*:}" && { printf '%s' "${pair%%:*}"; return 0; }; done
  return 0
}

if [ -f "$PROJECT/pnpm-lock.yaml" ]; then PM=pnpm; RUN="pnpm run"; EXEC="pnpm exec"
elif [ -f "$PROJECT/yarn.lock" ]; then PM=yarn; RUN="yarn"; EXEC="yarn"
elif [ -f "$PROJECT/bun.lock" ] || [ -f "$PROJECT/bun.lockb" ]; then PM=bun; RUN="bun run"; EXEC="bunx"
else PM=npm; RUN="npm run"; EXEC="npx"; fi

FRAMEWORK="$(first "Next.js:next" "TanStack Start:@tanstack/react-start" "React Router framework:@react-router/dev" "Remix:@remix-run/react" "Expo:expo" "Gatsby:gatsby" "Create React App:react-scripts" "Vite:vite")"
case "$FRAMEWORK" in
  "Next.js") ROUTER="Next.js router" ;;
  "TanStack Start") ROUTER="TanStack Router" ;;
  "React Router framework") ROUTER="React Router" ;;
  Remix) ROUTER="Remix" ;;
  *) ROUTER="$(first "TanStack Router:@tanstack/react-router" "React Router:react-router-dom" "React Router:react-router" "Wouter:wouter")" ;;
esac
DATA="$(first "TanStack Query:@tanstack/react-query" "SWR:swr" "RTK Query:@reduxjs/toolkit" "Apollo:@apollo/client" "urql:urql")"
STATE="$(first "Zustand:zustand" "Redux:@reduxjs/toolkit" "Redux:redux" "Jotai:jotai" "Recoil:recoil" "MobX:mobx")"
STYLING="$(first "Tailwind:tailwindcss" "styled-components:styled-components" "Emotion:@emotion/react" "MUI:@mui/material" "Sass:sass")"
TESTS="$(first "vitest:vitest" "jest:jest")"
E2E="$(first "playwright:@playwright/test" "cypress:cypress")"
LINT="$(first "oxlint:oxlint" "eslint:eslint" "biome:@biomejs/biome")"
FORMAT="$(first "oxfmt:oxfmt" "prettier:prettier" "biome:@biomejs/biome")"
I18N="$(first "i18next:react-i18next" "i18next:i18next" "next-intl:next-intl" "react-intl:react-intl" "formatjs:@formatjs/intl")"
FORMS="$(first "react-hook-form:react-hook-form" "formik:formik" "tanstack-form:@tanstack/react-form")"

TS=false
{ has typescript || [ -f "$PROJECT/tsconfig.json" ]; } && TS=true
# A solution-style tsconfig ("references", no files of its own) is checked with `tsc -b`: `tsc --noEmit` on it checks nothing.
SOLUTION=false
[ -f "$PROJECT/tsconfig.json" ] && grep -q '"references"' "$PROJECT/tsconfig.json" && SOLUTION=true

SRC=()
for dir in src app pages components lib; do [ -d "$PROJECT/$dir" ] && SRC+=("$dir"); done
SRC_JSON="$(printf '%s\n' "${SRC[@]:-}" | jq -R . | jq -s 'map(select(. != ""))')"

TYPECHECK=""
if [ -n "$(script_of typecheck)" ]; then TYPECHECK="$RUN --silent typecheck"
elif [ "$TS" = true ]; then
  if [ "$SOLUTION" = true ]; then TYPECHECK="$EXEC tsc -b"; else TYPECHECK="$EXEC tsc --noEmit"; fi
fi
RELATED=""
case "$TESTS" in
  vitest) RELATED="$EXEC vitest related --run --passWithNoTests" ;;
  jest) RELATED="$EXEC jest --findRelatedTests --passWithNoTests" ;;
esac
DEV_PORT="$(script_of dev | grep -oE -- '--port[ =][0-9]+|-p [0-9]+' | grep -oE '[0-9]+' | head -n1)"
if [ -z "$DEV_PORT" ]; then
  case "$FRAMEWORK" in "Next.js" | "TanStack Start" | "Create React App" | Remix | "React Router framework") DEV_PORT=3000 ;; Vite) DEV_PORT=5173 ;; Gatsby) DEV_PORT=8000 ;; *) DEV_PORT="" ;; esac
fi

jq -n \
  --arg pm "$PM" --arg run "$RUN" --arg fw "$FRAMEWORK" --arg router "$ROUTER" --arg data "$DATA" --arg state "$STATE" \
  --arg styling "$STYLING" --arg tests "$TESTS" --arg e2e "$E2E" --arg lint "$LINT" --arg fmt "$FORMAT" --arg i18n "$I18N" \
  --arg forms "$FORMS" --argjson ts "$TS" --argjson solution "$SOLUTION" --argjson src "$SRC_JSON" \
  --arg typecheck "$TYPECHECK" --arg related "$RELATED" --arg port "$DEV_PORT" \
  '{stack: {packageManager: $pm, run: $run, framework: $fw, router: $router, data: $data, state: $state, styling: $styling,
            tests: $tests, e2e: $e2e, lint: $lint, format: $fmt, i18n: $i18n, forms: $forms, typescript: $ts, solutionTsconfig: $solution},
    srcDirs: $src, devPort: $port, commands: {typecheck: $typecheck, relatedTests: $related},
    missing: ([if $tests == "" then "test runner" else empty end, if $lint == "" then "linter" else empty end,
               if $fmt == "" then "formatter" else empty end, if $ts == false then "TypeScript" else empty end])}'
