/**
 * The last quality gate, as frontend-kit's `scripts/record-gate.sh` writes it to `.claude/state/last-gate.json`.
 * `fingerprint` is the src/ fingerprint (lib.sh hook_src_fingerprint) the gate ran against.
 */
export type Gate = { result: 'pass' | 'fail'; source: string; at: string; summary: string; fingerprint: string | null }

/** What the band shows; `null` until the first read, and outside a frontend-kit project. */
export type RepoStatus = {
  branch: string
  changed: number
  ahead: number | null
  behind: number | null
  gate: Gate | null
  /** The src/ fingerprint now; null when it can't be computed. */
  srcFingerprint: string | null
  isDevServerUp: boolean
  devPort: number
  defaultBranch: string
  /** On one of the project's protectedBranches. */
  isProtected: boolean
}

declare module 'claude-code' {
  interface PluginState {
    'frontend-status': { status: Shaped<RepoStatus | null> }
  }
}
