/**
 * Pure helpers for the specification approval validator. No IO here; the shell in
 * `validate-specification-approval.ts` reads the file and prints the outcome.
 *
 * The specification's change control (docs/SPECIFICATION.md §13) defines what this checks.
 * SPEC-CC-2: the approved text is the file's bytes above the `## Change log` heading, and the
 * approval is recorded as a change-log row holding the approver's words, the date and the
 * SHA-256 of that text. SPEC-CC-3 (version 0.5.1): "A required check fails when this
 * document's content does not match its latest approved record. The latest approved record is
 * the latest ever approved, not the latest left in the file, so from the first ratification
 * (version 0.5.0) the check also fails when the change log holds no approval record". The
 * first ratification has happened, so a change log without a record always fails.
 *
 * The document is read as Markdown, never scanned as text: the frontmatter, the heading and
 * the table are syntax-tree nodes, so a heading-like line inside a code fence or a pipe inside
 * a cell cannot move the cut. That is a design choice for correctness; the owner's no-string
 * rule (SPEC-AR-3) binds Castr's compiler and decompiler, not repository tooling.
 *
 * @packageDocumentation
 */

import { createHash } from 'node:crypto';

import { frontmatter } from 'micromark-extension-frontmatter';
import { gfmTable } from 'micromark-extension-gfm-table';
import { frontmatterFromMarkdown } from 'mdast-util-frontmatter';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { gfmTableFromMarkdown } from 'mdast-util-gfm-table';
import { parseDocument } from 'yaml';
import { z } from 'zod';

import { isSha256Hex } from '../../core/sha256-hex.js';
import type { ValidatorOutcome } from '../../core/validator-outcome.js';

/** Repo-relative path of the specification this validator guards. */
export const SPECIFICATION_FILE = 'docs/SPECIFICATION.md';

const CHANGE_LOG_HEADING = 'Change log';
const CHANGE_LOG_COLUMNS = ['Version', 'Date', 'Change', 'Approval'] as const;
const NO_APPROVAL = 'none';
/** SPEC-CC-2: "Approval is given locally by Jim Cresswell or mantagen". */
const APPROVERS = ['Jim Cresswell', 'mantagen'] as const;
const RATIFIED = 'ratified';
/** SPEC-CC-3 (0.5.1): from this version on, the change log always holds an approval record. */
const FIRST_RATIFIED_VERSION = '0.5.0';
const BYTE_ORDER_MARK = 0xfeff;

const REMEDY =
  'The specification changes only by an approved amendment (SPEC-CC-1): the amended text is ' +
  'committed together with its version, its change-log row and the approver’s recorded words ' +
  'and SHA-256 (SPEC-CC-2). A change of formatting alone is an amendment too.';

/** The two statuses the specification has carried; any other value is unreadable, not a draft. */
const frontmatterSchema = z.object({
  version: z.string().min(1),
  status: z.enum(['draft-awaiting-owner-ratification', RATIFIED]),
});
type Frontmatter = z.infer<typeof frontmatterSchema>;

const calendarDateSchema = z.iso.date();

type MarkdownRoot = ReturnType<typeof fromMarkdown>;
type RootNode = MarkdownRoot['children'][number];
type HeadingNode = Extract<RootNode, { type: 'heading' }>;
type TableNode = Extract<RootNode, { type: 'table' }>;
type TableRowNode = TableNode['children'][number];
type TableCellNode = TableRowNode['children'][number];

interface ApprovalRecord {
  readonly version: string;
  readonly sha256: string;
}

interface ReadDocument {
  readonly version: Frontmatter['version'];
  readonly status: Frontmatter['status'];
  readonly approvedTextSha256: string;
  readonly records: readonly ApprovalRecord[];
}

interface ReadFailure {
  readonly ok: false;
  readonly error: string;
}
type Read<T> = { readonly ok: true; readonly value: T } | ReadFailure;

type ApprovalCell =
  | { readonly kind: 'none' }
  | { readonly kind: 'record'; readonly sha256: string }
  | { readonly kind: 'malformed'; readonly reason: string };

const fail = (error: string): ReadFailure => ({ ok: false, error });

const unreadable = (error: string): ValidatorOutcome => ({
  exitCode: 2,
  stdout: [],
  stderr: [`${SPECIFICATION_FILE}: cannot be read for change control: ${error}.`],
});

function decode(bytes: Uint8Array): Read<string> {
  try {
    const text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
    if (text.charCodeAt(0) === BYTE_ORDER_MARK) {
      return fail('the file starts with a byte-order mark, which is not part of any approved text');
    }
    return { ok: true, value: text };
  } catch {
    return fail('the file is not UTF-8');
  }
}

/** The value of a heading or cell that holds exactly one text node, or nothing. */
function singleText(parent: HeadingNode | TableCellNode | undefined): string | undefined {
  const [only, ...rest] = parent?.children ?? [];
  return only?.type === 'text' && rest.length === 0 ? only.value : undefined;
}

/** Where a node starts, for a reader who must find it in the file. */
const lineOf = (node: {
  readonly position?: { readonly start: { readonly line: number } };
}): string =>
  node.position === undefined ? 'an unknown line' : `line ${node.position.start.line}`;

/**
 * An Approval cell is exactly `none`, or exactly one record: words that open with an approver
 * the specification names and the row's date, continue with the approver's words, and end
 * with one inline-code SHA-256.
 */
function classifyApprovalCell(cell: TableCellNode | undefined, date: string): ApprovalCell {
  if (singleText(cell) === NO_APPROVAL) {
    return { kind: 'none' };
  }
  const [words, digest, ...rest] = cell?.children ?? [];
  if (words?.type !== 'text' || digest?.type !== 'inlineCode' || rest.length > 0) {
    return {
      kind: 'malformed',
      reason: `it is neither "${NO_APPROVAL}" nor words followed by one SHA-256 in code, and nothing after it`,
    };
  }
  const opening = APPROVERS.map((approver) => `${approver}, ${date}, `).find((prefix) =>
    words.value.startsWith(prefix),
  );
  if (opening === undefined) {
    return {
      kind: 'malformed',
      reason: `it does not open with an approver the specification names (${APPROVERS.join(' or ')}) and the row's date, ${date}`,
    };
  }
  if (words.value.slice(opening.length).trim() === '') {
    return {
      kind: 'malformed',
      reason: 'it holds no words of approval after the approver and the date',
    };
  }
  if (!isSha256Hex(digest.value)) {
    return {
      kind: 'malformed',
      reason: `its code "${digest.value}" is not a SHA-256 of 64 lower-case hexadecimal characters`,
    };
  }
  return { kind: 'record', sha256: digest.value };
}

function readFrontmatter(node: RootNode | undefined): Read<Frontmatter> {
  if (node?.type !== 'yaml') {
    return fail('it does not open with YAML frontmatter');
  }
  const document = parseDocument(node.value, { uniqueKeys: true });
  const problems = [...document.errors, ...document.warnings];
  if (problems.length > 0) {
    return fail(`its frontmatter is not plain YAML: ${problems.map((p) => p.message).join('; ')}`);
  }
  const raw: unknown = document.toJS();
  const parsed = frontmatterSchema.safeParse(raw);
  return parsed.success
    ? { ok: true, value: parsed.data }
    : fail(
        `its frontmatter version or status is not one it can carry: ${z.prettifyError(parsed.error)}`,
      );
}

/** A version, a calendar date, a change and an Approval cell, as one row states them. */
function readRow(
  row: TableRowNode,
): Read<{ readonly version: string; readonly approval: ApprovalCell }> {
  const [versionCell, dateCell, changeCell, approvalCell] = row.children;
  const where = `the change-log row at ${lineOf(row)}`;
  if (row.children.length !== CHANGE_LOG_COLUMNS.length) {
    return fail(`${where} has ${row.children.length} cells, not ${CHANGE_LOG_COLUMNS.length}`);
  }
  const version = singleText(versionCell);
  if (version === undefined || version.trim() === '') {
    return fail(`${where} has no version`);
  }
  const date = singleText(dateCell);
  if (date === undefined || !calendarDateSchema.safeParse(date).success) {
    return fail(`${where} (version ${version}) has no calendar date (YYYY-MM-DD)`);
  }
  if (changeCell === undefined || changeCell.children.length === 0) {
    return fail(`${where} (version ${version}) states no change`);
  }
  const approval = classifyApprovalCell(approvalCell, date);
  if (approval.kind === 'malformed') {
    return fail(
      `the Approval cell of row ${version} at ${lineOf(row)} cannot be read: ${approval.reason}`,
    );
  }
  return { ok: true, value: { version, approval } };
}

function readRecords(table: TableNode): Read<readonly ApprovalRecord[]> {
  const [header, ...rows] = table.children;
  const columns = header?.children.map((cell) => singleText(cell) ?? '(not plain text)') ?? [];
  if (
    columns.length !== CHANGE_LOG_COLUMNS.length ||
    columns.some((column, index) => column !== CHANGE_LOG_COLUMNS[index])
  ) {
    return fail(
      `the change log's columns are ${columns.join(', ')}, not ${CHANGE_LOG_COLUMNS.join(', ')}`,
    );
  }
  const records: ApprovalRecord[] = [];
  const versions = new Set<string>();
  for (const row of rows) {
    const read = readRow(row);
    if (!read.ok) {
      return read;
    }
    if (versions.has(read.value.version)) {
      return fail(
        `the change log has a second row for version ${read.value.version}, at ${lineOf(row)}`,
      );
    }
    versions.add(read.value.version);
    if (read.value.approval.kind === 'record') {
      records.push({ version: read.value.version, sha256: read.value.approval.sha256 });
    }
  }
  return { ok: true, value: records };
}

const describeBlock = (node: RootNode | undefined): string =>
  node === undefined ? 'nothing' : `a ${node.type} at ${lineOf(node)}`;

function readDocument(text: string): Read<ReadDocument> {
  const tree = fromMarkdown(text, {
    extensions: [frontmatter(['yaml']), gfmTable()],
    mdastExtensions: [frontmatterFromMarkdown(['yaml']), gfmTableFromMarkdown()],
  });
  const front = readFrontmatter(tree.children[0]);
  if (!front.ok) {
    return front;
  }
  const [heading, table] = tree.children.slice(-2);
  // An ATX heading on one line at column 1: a setext underline or an indent would put
  // characters the reader does not see as the heading into, or out of, the approved text.
  if (
    heading?.type !== 'heading' ||
    heading.depth !== 2 ||
    singleText(heading) !== CHANGE_LOG_HEADING ||
    heading.position?.start.column !== 1 ||
    heading.position.start.line !== heading.position.end.line ||
    table?.type !== 'table'
  ) {
    return fail(
      `its last two blocks must be the "## ${CHANGE_LOG_HEADING}" heading, at column 1 on one line, ` +
        `and its table; they are ${describeBlock(heading)} and ${describeBlock(table)}`,
    );
  }
  const cut = heading.position.start.offset;
  if (cut === undefined) {
    return fail('the change-log heading has no source offset');
  }
  const records = readRecords(table);
  if (!records.ok) {
    return records;
  }
  // mdast offsets count string code units, not bytes: the text is cut, then encoded as UTF-8.
  const approvedText = new TextEncoder().encode(text.slice(0, cut));
  return {
    ok: true,
    value: {
      version: front.value.version,
      status: front.value.status,
      approvedTextSha256: createHash('sha256').update(approvedText).digest('hex'),
      records: records.value,
    },
  };
}

function judge(document: ReadDocument): ValidatorOutcome {
  const latest = document.records.at(-1);
  if (latest === undefined) {
    return {
      exitCode: 1,
      stdout: [],
      stderr: [
        `${SPECIFICATION_FILE}: version ${document.version}, status "${document.status}", but the ` +
          'change log holds no approval record. Since the first ratification (version ' +
          `${FIRST_RATIFIED_VERSION}) the latest approved record is the latest ever approved, so ` +
          'an approval row may never be removed (SPEC-CC-3). Only the approver can approve a ' +
          'version, in their own words in a working session, and an agent never writes an ' +
          'approval it was not given (SPEC-CC-2).',
      ],
    };
  }
  const problems: string[] = [];
  if (latest.sha256 !== document.approvedTextSha256) {
    problems.push(
      `the text above the change log hashes to ${document.approvedTextSha256}, but the latest ` +
        `approval record (row ${latest.version}) holds ${latest.sha256}`,
    );
  }
  if (latest.version !== document.version) {
    problems.push(
      `the frontmatter names version ${document.version}, but the latest approval record is row ${latest.version}`,
    );
  }
  if (document.status !== RATIFIED) {
    problems.push(
      `an approval record governs, but the status is "${document.status}", not "${RATIFIED}"`,
    );
  }
  return problems.length === 0
    ? {
        exitCode: 0,
        stdout: [
          `${SPECIFICATION_FILE}: matches the approval record of version ${latest.version} (SHA-256 ${latest.sha256}).`,
        ],
        stderr: [],
      }
    : {
        exitCode: 1,
        stdout: [],
        stderr: [
          ...problems.map((problem) => `${SPECIFICATION_FILE}: ${problem} (SPEC-CC-3).`),
          REMEDY,
        ],
      };
}

/** Check the specification's bytes against its change control (SPEC-CC-2, SPEC-CC-3). */
export function checkSpecificationBytes(bytes: Uint8Array): ValidatorOutcome {
  const text = decode(bytes);
  if (!text.ok) {
    return unreadable(text.error);
  }
  const document = readDocument(text.value);
  return document.ok ? judge(document.value) : unreadable(document.error);
}
