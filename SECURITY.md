# Security

## Reporting a problem

Please report a security problem privately, not in a public issue.

Use GitHub's private reporting: open the **Security** tab of this repository and
choose **Report a vulnerability**.

Include what you found, how to reproduce it, and which version of Wajiha Kit
you used (`plugins/wajiha-kit/.claude-plugin/plugin.json`).

## What counts

Wajiha Kit runs hooks and scripts on your computer inside Claude Code. A problem
that lets a command, file read or network call get past a guard, or that makes
the kit run code you did not expect, is in scope. Please report those.

The guards stop known risky commands. They cannot read inside every script, so
they are a safety net, not a sandbox.

## Supported versions

Only the latest release gets fixes.
