# shellcheck shell=bash
# Sourced, never run. jq on Windows ends every output line with a carriage return, so a value read with -r
# carries a stray \r and no comparison with it ever matches. This makes jq print plain lines there; on a Mac
# or Linux it changes nothing. Source it after checking that jq exists.
# (The test counts bytes: bash on Windows drops the \r when it reads the output into a variable.)
if [ "$(command jq -nr '"x"' 2>/dev/null | wc -c | tr -d ' ')" -gt 2 ]; then
  if [ "$(command jq -b -nr '"x"' 2>/dev/null | wc -c | tr -d ' ')" -eq 2 ]; then
    jq() { command jq -b "$@"; }
  else
    jq() { command jq "$@" | tr -d '\r'; }
  fi
fi
