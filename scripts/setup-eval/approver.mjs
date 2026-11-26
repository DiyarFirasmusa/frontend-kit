#!/usr/bin/env node
// The "user" who answers the child session's permission prompts (claude -p --permission-prompt-tool).
// A minimal MCP server over stdio, no dependencies. It plays a cooperative user who stays at the keyboard:
// - yes to Write/Edit/MultiEdit of <project>/CLAUDE.md and <project>/.claude/** (Claude Code always asks for these
//   "sensitive files"; the setup flow tells the user to approve them);
// - yes to a shell command that only touches the project, or only reads the plugin folder: Claude Code asks when a
//   path holds a `$` it cannot resolve (TanStack routes: src/routes/$locale/...), when a command reads outside the
//   project (tar -C <plugin>/starters/...), or when a helper is not on the allow list (find, wc, printf);
// - no to everything else: network tools, git commit/push/reset, npm install/ci/uninstall/publish (the kit's ask
//   list: a refusal there means the flow asked at the wrong time), sudo, other shells, command substitution, `..`,
//   absolute paths outside the project and the plugin, `$VARS` it cannot see the value of, and writes into the
//   plugin folder. The kit's own guard hooks run before this and still block what they block.
// Every request is logged.
//
//   env: SETUP_EVAL_PROJECT=<project dir>  SETUP_EVAL_PLUGIN=<plugin dir>  SETUP_EVAL_APPROVALS=<log file, JSON lines>
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const PROJECT = path.resolve(process.env.SETUP_EVAL_PROJECT ?? '.');
const PLUGIN = process.env.SETUP_EVAL_PLUGIN ? path.resolve(process.env.SETUP_EVAL_PLUGIN) : null;
const LOG = process.env.SETUP_EVAL_APPROVALS;

const within = (p, dir) => {
  const rel = path.relative(dir, p);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
};
// A Git Bash path (/c/Users/...) as a native one.
const native = (p) => (process.platform === 'win32' ? p.replace(/^\/([a-zA-Z])(?=\/|$)/, '$1:') : p);

const NEVER = new RegExp(
  [
    // as a word of its own, not inside a path such as wajiha-setup-eval-x/
    String.raw`(?<![\w./\\-])(curl|wget|ssh|scp|sftp|ftp|ncat|nc|telnet|sudo|su|doas|powershell|pwsh|cmd|reg|setx|taskkill|kill|pkill|shutdown|chmod|chown|eval|exec|source)(?![\w./\\-])`,
    'Invoke-',
    String.raw`\bgit\s+(push|commit|reset|clean|checkout|stash|rebase|merge|config|remote)\b`,
    String.raw`\bnpm\s+(i|install|ci|uninstall|publish|audit|link|exec)\b`,
    String.raw`\bnpx\s+(-y|--yes)\b`,
    '--no-verify',
  ].join('|'),
);
const ROUTE_PARAMS = new Set(['locale', 'locale_', 'slug', 'id', 'splat', '_splat']);
const WRITES = /(^|[;&|]\s*)(rm|mv|cp|tee|touch|mkdir|rmdir|ln|sed\s+-i|git\s+(rm|mv))\b|(^|[^0-9&])>(?!&|\s*\/dev\/null)/;

function cooperativeBash(command) {
  if (typeof command !== 'string' || /`|\$\(|<\(/.test(command) || NEVER.test(command)) return false;
  const assigned = new Set([
    ...[...command.matchAll(/(?:^|[\s;&|])([A-Za-z_][A-Za-z0-9_]*)=/g)].map((m) => m[1]),
    ...[...command.matchAll(/\bfor\s+([A-Za-z_][A-Za-z0-9_]*)\s+in\b/g)].map((m) => m[1]),
  ]);
  // Relative paths count from a leading `cd <dir>` when there is one, else from the project.
  const cd = command.match(/^\s*cd\s+("[^"]+"|'[^']+'|\S+)/)?.[1]?.replace(/^['"]|['"]$/g, '');
  const base = cd ? path.resolve(PROJECT, native(cd)) : PROJECT;
  for (const m of command.matchAll(/\$\{?([A-Za-z_][A-Za-z0-9_]*)/g))
    if (!assigned.has(m[1]) && !ROUTE_PARAMS.has(m[1]) && m[1] !== 'CLAUDE_PLUGIN_ROOT') return false;
  const words = (command.match(/'[^']*'|"[^"]*"|[^\s;&|]+/g) ?? []).map((w) =>
    w
      .replace(/^['"]|['"]$/g, '')
      .replace(/^--?[A-Za-z-]+=/, '')
      .replace(/^[A-Za-z_][A-Za-z0-9_]*=/, '')
      .replace(/^['"]|['"]$/g, ''),
  );
  let touchesPlugin = false;
  for (const w of words) {
    if (w.startsWith('~')) return false;
    if (w.split(/[\\/]/).includes('..') && (/^([A-Za-z]:[\\/]|\/)/.test(w) || !within(path.resolve(base, w.replace(/\\\$/g, '$')), PROJECT))) return false;
    const expanded = PLUGIN ? w.replace(/^\$\{?CLAUDE_PLUGIN_ROOT\}?/, PLUGIN) : w;
    if (!/^([A-Za-z]:[\\/]|\/)/.test(expanded)) continue;
    if (expanded.startsWith('/dev/null')) continue;
    const abs = path.resolve(native(expanded));
    if (within(abs, PROJECT)) continue;
    if (PLUGIN && within(abs, PLUGIN)) {
      touchesPlugin = true;
      continue;
    }
    return false;
  }
  // A variable set in the command may hold the plugin's path: then, as with a written-out plugin path, read only
  // (the copy's own `rm wajiha-foundation.tar` of the archive in the project excepted).
  const pluginMaybe = touchesPlugin || command.includes('CLAUDE_PLUGIN_ROOT') || assigned.size > 0;
  if (pluginMaybe && WRITES.test(command.replace(/&&\s*rm wajiha-foundation\.tar\b/g, ''))) return false;
  return true;
}

function decide(toolName, input) {
  if (['Write', 'Edit', 'MultiEdit'].includes(toolName) && typeof input?.file_path === 'string') {
    const rel = path.relative(PROJECT, path.resolve(PROJECT, input.file_path)).split(path.sep).join('/');
    if (!rel.startsWith('..') && !path.isAbsolute(rel) && (rel === 'CLAUDE.md' || rel.startsWith('.claude/')))
      return { behavior: 'allow', updatedInput: input };
  }
  if (toolName === 'Bash' && cooperativeBash(input?.command)) return { behavior: 'allow', updatedInput: input };
  return { behavior: 'deny', message: 'The user is not here to approve this (unattended eval run). Do not work around it; report it.' };
}

export { cooperativeBash };

const send = (msg) => process.stdout.write(`${JSON.stringify(msg)}\n`);
if (!process.env.SETUP_EVAL_APPROVER_TEST)
  readline.createInterface({ input: process.stdin }).on('line', (line) => {
    let req;
    try {
      req = JSON.parse(line);
    } catch {
      return;
    }
    const { id, method, params } = req;
    if (id === undefined) return; // notifications
    if (method === 'initialize')
      send({ jsonrpc: '2.0', id, result: { protocolVersion: params?.protocolVersion ?? '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: 'setup-eval-approver', version: '1.0.0' } } });
    else if (method === 'tools/list')
      send({
        jsonrpc: '2.0',
        id,
        result: {
          tools: [
            {
              name: 'approve',
              description: 'Answers permission prompts for the unattended setup eval.',
              inputSchema: {
                type: 'object',
                properties: { tool_name: { type: 'string' }, input: { type: 'object' }, tool_use_id: { type: 'string' } },
                required: ['tool_name', 'input'],
              },
            },
          ],
        },
      });
    else if (method === 'tools/call') {
      const { tool_name: toolName, input } = params?.arguments ?? {};
      const decision = decide(toolName, input);
      if (LOG) {
        const what = input?.file_path ?? input?.command ?? JSON.stringify(input).slice(0, 200);
        fs.appendFileSync(LOG, `${JSON.stringify({ at: new Date().toISOString(), tool: toolName, what, behavior: decision.behavior })}\n`);
      }
      send({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: JSON.stringify(decision) }] } });
    } else send({ jsonrpc: '2.0', id, error: { code: -32601, message: `no method ${method}` } });
  });
