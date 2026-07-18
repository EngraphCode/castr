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
  readonly columns?: unknown;
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

/** Narrow an unknown to a positive integer, else `undefined`. */
const positiveInteger = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : undefined;

/**
 * Parse a `COLUMNS`-style environment value to a positive integer, else
 * `undefined`. The harness sets `COLUMNS`/`LINES` before running the script
 * (platform contract: code.claude.com/docs/en/statusline
 * §how-status-lines-work, v2.1.153+); env values are strings by nature, so a
 * digits-only parse is the honest boundary here — unlike the payload
 * `columns`, which is a number or nothing.
 */
const parseEnvColumns = (value: string | undefined): number | undefined =>
  value !== undefined && /^[0-9]+$/u.test(value) ? positiveInteger(Number(value)) : undefined;

/**
 * Clip a styled row to a visible-cell budget without counting ANSI codes.
 *
 * The harness renders each row's `content` as-is, so a row wider than the
 * terminal's `columns` would wrap and break the one-line-per-task contract.
 * A clipped row keeps its leading styling, ends with an ellipsis in the last
 * visible cell, and closes with a style reset so no styling dangles.
 *
 * @param row - The composed row, possibly containing ANSI style sequences.
 * @param maxVisible - The visible-cell budget; callers pass a positive
 *   integer (the narrowed harness `columns`).
 * @returns The row unchanged when it fits, else the clipped form.
 */
export function clipVisible(row: string, maxVisible: number): string {
  const characters = [...row];
  const isAnsiStart = (character: string): boolean => character.charCodeAt(0) === 27;
  let totalVisible = 0;
  let inAnsi = false;
  for (const character of characters) {
    if (inAnsi) {
      inAnsi = character !== 'm';
    } else if (isAnsiStart(character)) {
      inAnsi = true;
    } else {
      totalVisible += 1;
    }
  }
  if (totalVisible <= maxVisible) {
    return row;
  }
  let clipped = '';
  let kept = 0;
  inAnsi = false;
  for (const character of characters) {
    if (inAnsi) {
      clipped += character;
      inAnsi = character !== 'm';
    } else if (isAnsiStart(character)) {
      clipped += character;
      inAnsi = true;
    } else {
      if (kept === maxVisible - 1) {
        break;
      }
      clipped += character;
      kept += 1;
    }
  }
  return `${clipped}…${RESET}`;
}

/**
 * Plan a tick from the raw stdin JSON: one `{"id","content"}` output line per
 * addressable task (a task with no `id` cannot be addressed and is skipped).
 * Rows are clipped to the payload's `columns` budget when it is a positive
 * integer (the harness renders content as-is, so an over-wide row would wrap).
 * Malformed or task-less input is a silent no-op — a broken statusline never
 * disrupts a session.
 *
 * @param rawJson - The harness's per-refresh payload JSON from stdin.
 * @param envColumns - The adapter-supplied `COLUMNS` environment value; used
 *   as the width budget only when the payload carries no valid `columns`.
 */
export function planSubagentStatusline(
  rawJson: string,
  envColumns?: string,
): SubagentStatuslinePlan {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return { kind: 'noop' };
  }
  if (!isSubagentPayload(parsed) || !Array.isArray(parsed.tasks)) {
    return { kind: 'noop' };
  }
  const columns = positiveInteger(parsed.columns) ?? parseEnvColumns(envColumns);
  const tasks: readonly unknown[] = parsed.tasks;
  const rows = tasks
    .map((candidate) => narrowTask(candidate))
    .filter((task): task is SubagentTask & { readonly id: string } => task?.id !== undefined)
    .map((task) => {
      const row = renderTaskRow(task);
      const content = columns === undefined ? row : clipVisible(row, columns);
      return JSON.stringify({ id: task.id, content });
    });
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
