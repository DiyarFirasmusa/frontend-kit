#!/bin/bash
# PreToolUse(WebFetch + browser navigation tools): keeps every check off the live site. Testing happens
# locally or on the test environment, never on the hosts in liveHosts (.claude/frontend-kit.json), where a
# test order or login touches real customers' data.
set -u
# shellcheck disable=SC2034 # read by lib.sh
HOOK_KIND=guard # fail closed: see lib.sh
. "$(dirname "$0")/lib.sh"

hook_read_input
URL="$(hook_field '.tool_input.url')"
[ -z "$URL" ] && exit 0

# The host as the browser reads it. A leading blank, credentials, a port, a trailing dot, capitals, %2E for a dot,
# an ideographic or fullwidth dot, invisible characters, a view-source: or blob: wrapper and a scheme written
# without slashes (https:host) don't make it another host. (Fullwidth letters need Unicode folding: out of reach
# in bash, left to the sandbox's deniedDomains.)
percent_decode() { printf '%b' "$(printf '%s' "$1" | sed 's/\\/\\\\/g; s/%\([0-9A-Fa-f][0-9A-Fa-f]\)/\\x\1/g')"; }
HOST="$(percent_decode "$(printf '%s' "$URL" | tr -d '\t\r\n')" | LC_ALL=C sed $'s/\xe3\x80\x82/./g; s/\xef\xbc\x8e/./g; s/\xef\xbd\xa1/./g; s/\xe2\x80[\x8b-\x8d]//g; s/\xe2\x81\xa0//g; s/\xef\xbb\xbf//g; s/\xc2\xad//g' |
  tr '[:upper:]' '[:lower:]' | sed -E 's#^[[:space:]]+##; s#^(view-source|blob|jar):##; s#^(https?|wss?|ftp|file):[/\\]*##; s#[/?\#\\].*$##; s#^.*@##; s#:[0-9]*$##; s#[. ]+$##' | tr '[:upper:]' '[:lower:]')"
while IFS= read -r live; do
  live="$(printf '%s' "$live" | tr '[:upper:]' '[:lower:]')"
  live="${live%.}"
  [ -z "$live" ] && continue
  if [ "$HOST" = "$live" ] || [ "$HOST" = "www.$live" ]; then
    hook_deny "Blocked: never test against the live site ($HOST). Use http://localhost:$KIT_DEV_PORT or $KIT_UAT_HOST. If the user wants something checked on the live site, ask them to open it themselves."
  fi
done <<EOF_HOSTS
$(kit_list '.liveHosts')
EOF_HOSTS
exit 0
