#!/bin/bash
# Prints, as JSON, the package.json scripts /frontend-kit:setup should add to a project: only names the project does
# not have yet, and only for tools it actually uses (typescript, oxlint/eslint/biome, oxfmt/prettier/biome,
# vitest/jest, playwright, TanStack router-cli). It never prints a script whose tool is missing.
#
#   kit-package-scripts.sh [project-dir]      e.g. {"typecheck":"tsc --noEmit","lint:check":"eslint ."}
set -u
PROJECT="${1:-$PWD}"
PKG="$PROJECT/package.json"
[ -f "$PKG" ] || { echo "no package.json in $PROJECT" >&2; exit 1; }
command -v jq >/dev/null || { echo "jq is required" >&2; exit 1; }

has() { jq -e --arg n "$1" '((.dependencies // {}) + (.devDependencies // {})) | has($n)' "$PKG" >/dev/null 2>&1; }
script_exists() { jq -e --arg n "$1" '(.scripts // {}) | has($n)' "$PKG" >/dev/null 2>&1; }

if [ -f "$PROJECT/pnpm-lock.yaml" ]; then RUN="pnpm run"
elif [ -f "$PROJECT/yarn.lock" ]; then RUN="yarn"
elif [ -f "$PROJECT/bun.lock" ] || [ -f "$PROJECT/bun.lockb" ]; then RUN="bun run"
else
  case "$(jq -r '.packageManager // ""' "$PKG")" in
    pnpm@*) RUN="pnpm run" ;; yarn@*) RUN="yarn" ;; bun@*) RUN="bun run" ;; *) RUN="npm run" ;;
  esac
fi

OUT="{}"
add() { OUT="$(printf '%s' "$OUT" | jq --arg k "$1" --arg v "$2" '. + {($k): $v}')"; }

if has typescript; then
  # A solution-style tsconfig (create-vite's default) is checked with tsc -b; tsc --noEmit on it checks nothing.
  if grep -q '"references"' "$PROJECT/tsconfig.json" 2>/dev/null; then add typecheck "tsc -b"; else add typecheck "tsc --noEmit"; fi
fi
if has oxlint; then add lint "oxlint --fix"; add lint:check "oxlint"
elif has eslint; then add lint "eslint --fix ."; add lint:check "eslint ."
elif has @biomejs/biome; then add lint "biome check --write"; add lint:check "biome check"; fi
if has oxfmt; then add fmt "oxfmt"; add fmt:check "oxfmt --check"
elif has prettier; then add fmt "prettier --write ."; add fmt:check "prettier --check ."
elif has @biomejs/biome; then add fmt "biome format --write"; add fmt:check "biome format"; fi
if has vitest; then add test "vitest run"; add test:watch "vitest"; add test:coverage "vitest run --coverage"
elif has jest; then add test "jest"; add test:watch "jest --watch"; add test:coverage "jest --coverage"; fi
if has @playwright/test; then add test:e2e "playwright test"; add test:e2e:ui "playwright test --ui"; add e2e:install "playwright install chromium"; fi
has @tanstack/router-cli && add routes:generate "tsr generate"
{ has i18next || has react-i18next; } && [ -f "$PROJECT/scripts/validate-i18n.ts" ] && add i18n:validate "node scripts/validate-i18n.ts"

# check / check:full chain only what exists (the project's own scripts count too).
exists() { script_exists "$1" || printf '%s' "$OUT" | jq -e --arg n "$1" 'has($n)' >/dev/null; }
CHAIN=""
for name in typecheck lint:check test; do exists "$name" && CHAIN="${CHAIN:+$CHAIN && }$RUN $name"; done
[ -n "$CHAIN" ] && add check "$CHAIN"
FULL="$RUN check"
for name in test:e2e build; do exists "$name" && FULL="$FULL && $RUN $name"; done
[ -n "$CHAIN" ] && add check:full "$FULL"

# Names the project already has are never overwritten.
printf '%s' "$OUT" | jq -S --slurpfile pkg "$PKG" 'with_entries(select(.key as $k | (($pkg[0].scripts // {}) | has($k)) | not))'
