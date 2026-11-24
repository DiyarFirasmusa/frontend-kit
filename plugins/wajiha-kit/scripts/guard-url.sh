#!/bin/bash -p
# PreToolUse(WebFetch + browser navigation tools): keeps every check off the live site. Testing happens
# locally or on the test environment, never on the hosts in liveHosts (.claude/wajiha-kit.json), where a
# test order or login touches real customers' data.
#
# It reads every field that carries a URL (url, ws.url, the navigations inside a batch, install and upstream
# URLs). It can't see a redirect, a click or a script that navigates: that is the sandbox's deniedDomains.
set -u
# shellcheck disable=SC2034 # read by lib.sh
HOOK_KIND=guard # fail closed: see lib.sh
. "$(dirname "$0")/lib.sh"

hook_read_input
kit_config_guard
printf '%s' "$HOOK_INPUT" | jq -e '.tool_input | type == "object"' >/dev/null 2>&1 ||
  hook_deny "Blocked: this call has no input the guard can read, so it is refused."
[ -n "$RAW_LIVE" ] || exit 0
URLS="$(printf '%s' "$HOOK_INPUT" | jq -r '[.tool_input | .url?, .ws?.url?, .installUrlOrBundleUrl?, .upstream?, (.actions? | arrays | .[] | .input?.url?)]
  | map(strings | gsub("[\t\r\n]"; "") | select(. != "")) | unique | .[]' 2>/dev/null)" ||
  hook_deny "Blocked: the URLs of this call can't be read, so it is refused."
[ -n "$URLS" ] || exit 0

# The host as the browser reads it. The authority is cut out first and only that is percent-decoded: a %0A or %2F
# decoded earlier would move where the host ends. Then a leading blank or control, credentials, a port, a trailing
# dot, capitals, %2E for a dot, ideographic and fullwidth letters and dots, invisible characters, a view-source: or
# blob: wrapper and a scheme written without slashes (https:host) don't make it another host.
export LC_ALL=C
authorities() {
  sed -E $'s/^[\x01-\x20]+//; s/[\x01-\x20]+$//' | tr '[:upper:]' '[:lower:]' |
    sed -E 's#^(view-source|blob|jar):##; s#^(view-source|blob|jar):##; s#^(https?|wss?|ftp|file):[/\\]*##; s#[/?\#\\].*$##; s#^.*@##; s#:[0-9]*$##'
}
percent_decode() {
  local line
  sed 's/%\([0-9a-f][0-9a-f]\)/\\x\1/g' | while IFS= read -r line || [ -n "$line" ]; do printf '%b\n' "$line"; done | tr -d '\000'
}
unfold() {
  sed $'s/\xe3\x80\x82/./g; s/\xef\xbd\xa1/./g; s/\xe2\x80[\x8b-\x8f]//g; s/\xe2\x81\xa0//g; s/\xef\xbb\xbf//g; s/\xc2\xad//g; s/\xe2\x84\xaa/k/g; s/\xc5\xbf/s/g' |
    awk '
      BEGIN {
        for (i = 0; i < 26; i++) {
          ascii[sprintf("%c%c%c", 239, 188, 161 + i)] = sprintf("%c", 97 + i)
          ascii[sprintf("%c%c%c", 239, 189, 129 + i)] = sprintf("%c", 97 + i)
        }
        for (i = 0; i < 10; i++) ascii[sprintf("%c%c%c", 239, 188, 144 + i)] = sprintf("%c", 48 + i)
        ascii[sprintf("%c%c%c", 239, 188, 141)] = "-"
        ascii[sprintf("%c%c%c", 239, 188, 142)] = "."
        wide = sprintf("%c", 239)
      }
      index($0, wide) { for (from in ascii) gsub(from, ascii[from]) }
      { print }
    ' | tr '[:upper:]' '[:lower:]' | sed 's/[. ]*$//'
}
HOSTS="$(printf '%s\n' "$URLS" | authorities | percent_decode | unfold)"

LIVE="$(printf '%s\n' "$RAW_LIVE" | tr '\037' '\n' | tr '[:upper:]' '[:lower:]')"
while IFS= read -r live; do
  live="${live%.}"
  [ -n "$live" ] || continue
  while IFS= read -r host; do
    if [ "$host" = "$live" ] || [ "$host" = "www.$live" ]; then
      hook_deny "Blocked: never test against the live site ($host). Use http://localhost:$KIT_DEV_PORT or $KIT_UAT_HOST. If the user wants something checked on the live site, ask them to open it themselves."
    fi
  done <<<"$HOSTS"
done <<<"$LIVE"
exit 0
