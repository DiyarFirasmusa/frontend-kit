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

# A leading blank, credentials, a port, a trailing dot or capitals don't make it another host.
HOST="$(printf '%s' "$URL" | tr -d '\t\r\n' | sed -E 's#^ +##; s#^[A-Za-z][A-Za-z0-9+.-]*:[/\\]+##; s#[/?\#\\].*$##; s#^.*@##; s#:[0-9]*$##; s#[. ]+$##' | tr '[:upper:]' '[:lower:]')"
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
