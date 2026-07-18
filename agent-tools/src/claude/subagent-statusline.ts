/**
 * Pure planning and rendering for the Claude Code SUBAGENT statusline.
 *
 * @remarks
 * The `subagentStatusLine` harness surface is distinct from the main
 * `statusLine`: one invocation per refresh carries EVERY visible subagent row
 * in a single stdin JSON (`columns` + `tasks[]`), and the command answers with
 * one `{"id","content"}` JSON line per task row, rendered as-is (platform
 * contract: code.claude.com/docs/en/statusline.md §subagent-status-lines).
 * Each task's `model` is the SUBAGENT'S resolved model id — surfacing it is
 * the point of this module (owner directive, 2026-07-18: the one-line
 * subagent statusline includes the model).
 *
 * This module is pure (no I/O, no clock); the impure stdin/stdout adapter
 * lives in `subagent-statusline-adapter.ts`.
 *
 * @packageDocumentation
 */

import { DIM, HORIZONTAL_SEPARATOR, RESET } from './statusline-ansi.js';
import { isPlainObject, nonBlankString } from '../core/json-narrowing.js';

/** The harness payload, every field optional `unknown` (see json-narrowing). */
interface SubagentPayload {
  readonly tasks?: unknown;
}
const isSubagentPayload = (value: unknown): value is SubagentPayload => isPlainObject(value);

/** One raw task entry, every field optional `unknown` (see json-narrowing). */
interface RawTask {
  readonly id?: unknown;
  readonly name?: unknown;
  readonly type?: unknown;
  readonly status?: unknown;
  readonly description?: unknown;
  readonly label?: unknown;
  readonly model?: unknown;
}
const isRawTask = (value: unknown): value is RawTask => isPlainObject(value);

/** One visible subagent row, as narrowed from the harness payload. */
export interface SubagentTask {
  readonly id: string | undefined;
  readonly name: string | undefined;
  readonly type: string | undefined;
  readonly status: string | undefined;
  readonly description: string | undefined;
  readonly label: string | undefined;
  readonly model: string | undefined;
}

/** The execution plan for one subagent-statusline tick. */
export type SubagentStatuslinePlan =
  { readonly kind: 'noop' } | { readonly kind: 'render'; readonly rows: readonly string[] };

/** A task's own status is display-noise while it is simply running. */
const QUIET_STATUS = 'running';

/**
 * Shorten a resolved Claude model id to its display form: `claude-sonnet-5` →
 * `Sonnet 5`, `claude-haiku-4-5-20251001` → `Haiku 4.5`, `claude-opus-4-8` →
 * `Opus 4.8`. The first segment after `claude-` is the capitalised name; the
 * following numeric segments join as a dotted version (a trailing 8-digit date
 * pin is dropped). Anything outside that shape passes through raw — an honest
 * fallback beats a wrong prettification.
 */
export function formatModelDisplay(modelId: string): string {
  const match = modelId.match(/^claude-(?<name>[a-z]+)-(?<version>\d+(?:-\d+)*?)(?:-\d{8})?$/u);
  const name = match?.groups?.['name'];
  const version = match?.groups?.['version'];
  if (name === undefined || version === undefined) {
    return modelId;
  }
  const capitalised = `${name[0]?.toUpperCase() ?? ''}${name.slice(1)}`;
  return `${capitalised} ${version.replaceAll('-', '.')}`;
}

/**
 * Render one task's row body: `<label> · <status?> · <model>` — the label
 * falling back to name then description, the status shown DIM only when it is
 * not the quiet `running` state, and the model display DIM at the row end.
 */
export function renderTaskRow(task: SubagentTask): string {
  const title = task.label ?? task.name ?? task.description;
  const status =
    task.status === undefined || task.status === QUIET_STATUS ? undefined : task.status;
  const model = task.model === undefined ? undefined : formatModelDisplay(task.model);
  return [
    title,
    status === undefined ? undefined : `${DIM}${status}${RESET}`,
    model === undefined ? undefined : `${DIM}${model}${RESET}`,
  ]
    .filter((part): part is string => part !== undefined)
    .join(HORIZONTAL_SEPARATOR);
}

/**
 * Plan a tick from the raw stdin JSON: one `{"id","content"}` output line per
 * addressable task (a task with no `id` cannot be addressed and is skipped).
 * Malformed or task-less input is a silent no-op — a broken statusline never
 * disrupts a session.
 */
export function planSubagentStatusline(rawJson: string): SubagentStatuslinePlan {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return { kind: 'noop' };
  }
  if (!isSubagentPayload(parsed) || !Array.isArray(parsed.tasks)) {
    return { kind: 'noop' };
  }
  const tasks: readonly unknown[] = parsed.tasks;
  const rows = tasks
    .map((candidate) => narrowTask(candidate))
    .filter((task): task is SubagentTask & { readonly id: string } => task?.id !== undefined)
    .map((task) => JSON.stringify({ id: task.id, content: renderTaskRow(task) }));
  return { kind: 'render', rows };
}

function narrowTask(candidate: unknown): SubagentTask | undefined {
  if (!isRawTask(candidate)) {
    return undefined;
  }
  return {
    id: nonBlankString(candidate.id),
    name: nonBlankString(candidate.name),
    type: nonBlankString(candidate.type),
    status: nonBlankString(candidate.status),
    description: nonBlankString(candidate.description),
    label: nonBlankString(candidate.label),
    model: nonBlankString(candidate.model),
  };
}
