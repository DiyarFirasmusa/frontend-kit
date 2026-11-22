#!/bin/bash
# The scripts that work in a throwaway folder and delete it at the end must stop when they didn't get that folder:
# `cd ""` succeeds and stays, so an unchecked mktemp once made the caller's project "the temp folder".
#
#   bash scripts/test-temp-safety.sh        (scripts/validate-repo.sh runs it)
#
# It can't delete or write into a real project, even when the bug is back: only the start of each script runs, up to
# the first real work, in an empty decoy folder, and with rm, rmdir, rsync, cp and ln replaced by stand-ins that
# only write their name to a log.
set -u

ROOT="$(cd "$(dirname "$0")/.." && pwd)" || exit 1
[ -n "$ROOT" ] || exit 1
BOX="$(mktemp -d "${TMPDIR:-/tmp}/kit-safety.XXXXXX")" || { echo "temp safety: mktemp failed" >&2; exit 1; }
case "${BOX##*/}" in kit-safety.?*) ;; *) echo "temp safety: no temp folder" >&2; exit 1 ;; esac
BOX="$(cd -- "$BOX" && pwd -P)" || exit 1
case "${BOX##*/}" in kit-safety.?*) trap 'rm -rf -- "$BOX"' EXIT ;; *) exit 1 ;; esac

PASS=0
FAIL=0
ok() { PASS=$((PASS + 1)); }
ko() {
  FAIL=$((FAIL + 1))
  echo "  ✗ $1"
}

STUBS="$BOX/stubs"
mkdir -p "$STUBS" "$BOX/project/node_modules/.bin" "$BOX/not-a-temp-folder"
printf 'a task\n' >"$BOX/task.txt"
for name in rm rmdir rsync cp ln; do
  printf '#!/bin/sh\necho "%s" >>"$SAFETY_LOG"\n' "$name" >"$STUBS/$name"
  chmod +x "$STUBS/$name"
done
cat >"$STUBS/mktemp" <<'STUB'
#!/bin/sh
case "$SAFETY_MKTEMP" in
  fails) echo "mktemp: failed" >&2; exit 1 ;;
  empty) exit 0 ;;
  missing) echo "$SAFETY_BOX/kit-does-not-exist"; exit 0 ;;
  foreign) echo "$SAFETY_BOX/not-a-temp-folder"; exit 0 ;;
  dot) echo .; exit 0 ;;
  works)
    last=
    for arg in "$@"; do last="$arg"; done
    made="$SAFETY_BOX/$(echo "$last" | sed 's#.*/##; s#XXXXXX#made#')"
    mkdir -p "$made"
    echo "$made"
    ;;
esac
STUB
chmod +x "$STUBS/mktemp"

# start_of <script> <first line of real work> → a copy of the script that ends there and says it got that far.
start_of() {
  START="$BOX/start-${1##*/}"
  grep -q "$2" "$ROOT/$1" || { ko "$1 no longer has the line /$2/: update this test"; return 1; }
  {
    sed "/$2/,\$d" "$ROOT/$1"
    # Single quotes: these are the copied script's variables.
    printf '%s\n' 'echo "REACHED"' 'echo "GIT_DIR=[${GIT_DIR:-}] GIT_INDEX_FILE=[${GIT_INDEX_FILE:-}]"' 'echo "WORK=[$WORK]"'
  } >"$START"
}

# run_start <what mktemp does> [args...] → OUT, CODE, CALLS (the stand-ins that were called)
RUNS=0
run_start() {
  local how="$1"
  shift
  RUNS=$((RUNS + 1))
  DECOY="$BOX/decoy-$RUNS"
  LOG="$BOX/log-$RUNS"
  mkdir "$DECOY"
  : >"$LOG"
  OUT="$(cd "$DECOY" && PATH="$STUBS:$PATH" SAFETY_LOG="$LOG" SAFETY_BOX="$BOX" SAFETY_MKTEMP="$how" \
    KIT_TEST_PROJECT="$BOX/project" GIT_DIR="$DECOY/.git" GIT_INDEX_FILE="$DECOY/index" \
    /bin/bash "$START" "$@" 2>/dev/null)"
  CODE=$?
  CALLS="$(sort -u "$LOG" | tr '\n' ' ')"
}

# stops <name> <what went wrong> → the script ended with an error, before any write and before the trap.
stops() {
  if [ "$CODE" -ne 0 ] && [ -z "$CALLS" ] && ! printf '%s' "$OUT" | grep -q REACHED; then
    ok
  else
    ko "$1 goes on when $2 (exit $CODE, would have run: ${CALLS:-nothing})"
  fi
}

check_script() { # <script> <first line of real work> [args...]
  local script="$1" marker="$2"
  shift 2
  start_of "$script" "$marker" || return 0
  local how
  for how in fails empty missing foreign dot; do
    run_start "$how" "$@"
    stops "$script" "mktemp: $how"
  done
  run_start works "$@"
  if [ "$CODE" -eq 0 ] && printf '%s' "$OUT" | grep -q '^WORK=\[/.*made\]$'; then ok; else ko "$script doesn't start with a good temp folder (exit $CODE: $OUT)"; fi
  # Run from a git hook, these point every fixture's git command at the caller's repository.
  if printf '%s' "$OUT" | grep -qF 'GIT_DIR=[] GIT_INDEX_FILE=[]'; then ok; else ko "$script keeps the caller's GIT_DIR"; fi
}

check_script plugins/frontend-kit/scripts/test-hooks.sh '^PASS=0'
check_script plugins/frontend-kit/scripts/mode-test.sh '^PASS=0'
check_script scripts/e2e-bench.sh '^git init ' "$BOX/project" "$BOX/task.txt" bare "$BOX/out.jsonl"

# The bench with a project folder that isn't there: it used to copy from the root of the disk.
if start_of scripts/e2e-bench.sh '^git init '; then
  run_start works "$BOX/no-such-project" "$BOX/task.txt" bare "$BOX/out.jsonl"
  stops scripts/e2e-bench.sh "the project folder doesn't exist"
fi

# The pattern itself, in any shell script of the repository.
while IFS= read -r file; do
  case "$file" in */test-temp-safety.sh) continue ;; esac
  if grep -nE '^[^#]*cd[^#|;&]*\$\( *mktemp' "$file" >/dev/null; then ko "${file#"$ROOT"/}: cd into an unchecked mktemp"; else ok; fi
done < <(find "$ROOT/plugins" "$ROOT/scripts" -type f -name '*.sh' -not -path '*/node_modules/*')

echo "temp safety: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
