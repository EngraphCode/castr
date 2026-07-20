/**
 * ARC rapid-comms channel-file grammar — the single authoritative parser for
 * channel STRUCTURE (title line, opening block, `Channel-colour` lines, entry
 * headers). Entry BODIES are deliberately schema-free: the protocol's
 * zero-ceremony property is load-bearing for its latency benefit, so this
 * module never inspects dialogue content.
 *
 * Two consumers share this module (consolidate-at-second-consumer, satisfied
 * at birth): `validators/arc-channels` (the quality gate, tracked files only)
 * and the Claude statusline gathering (feather badges, directory-as-present).
 * The prose description of this grammar lives in
 * `.agent/reference/arc-rapid-communication.md` §Conventions; this module is
 * authoritative for the exact shapes — the doc describes, the code enforces.
 *
 * Strictness is tiered by the channel filename's date against
 * {@link ARC_SCHEMA_ADOPTION_DATE}: pre-adoption files are grandfathered
 * (append-only forbids retro-editing them), post-adoption files carry the
 * full structural contract. Grandfathering matches the REAL corpus as
 * observed on 2026-07-08 — minutes-precision and timestamp-less entry
 * headers exist and must parse.
 *
 * @packageDocumentation
 */

import { z } from 'zod';

/**
 * First calendar day the strict tier binds. Deliberately the day AFTER the
 * convention landed, so channels that were live-appending while the schema
 * merged can never red a gate mid-append (Director note, 2026-07-08).
 */
export const ARC_SCHEMA_ADOPTION_DATE = '2026-07-09';

/**
 * Number of palette slots a `Channel-colour` index may address. The colour
 * VALUES live in the statusline palette module; the SIZE is a protocol-level
 * contract (colour-out-of-range binds at the gate), so it lives here with the
 * grammar and the palette module must carry exactly this many entries.
 */
export const ARC_PALETTE_SIZE = 8;

/**
 * Liveness window for "active channel" semantics (mtime age, seconds): the
 * feather/wing lights, colour assignment scans, and gate-free statusline
 * reads all share this 30-minute window. Protocol-level; consumers import it
 * from here rather than redefining.
 */
export const ARC_ACTIVE_WINDOW_SECONDS = 1800;

/** One parsed `## [<name> <prefix>] <timestamp?> — <subject>` entry header. */
export interface ArcEntryHeader {
  readonly authorName: string;
  /** Six lowercase hex chars — the PDR-027 session_id_prefix short form. */
  readonly sessionIdPrefix: string;
  /** Absent on grandfathered timestamp-less headers. */
  readonly timestampIso?: string;
  readonly subject: string;
  /** 1-indexed line number in the channel file. */
  readonly line: number;
}

/** Closed set of structural finding codes this grammar can emit. */
export type ArcFindingCode =
  | 'malformed-entry-header'
  | 'malformed-colour-line'
  | 'missing-timestamp'
  | 'timestamp-precision'
  | 'malformed-title'
  | 'missing-preamble'
  | 'missing-colour'
  | 'missing-entries'
  | 'colour-after-first-entry'
  | 'colour-out-of-range'
  | 'undated-filename';

/** One structural finding, anchored to its file and line. */
export interface ArcFinding {
  readonly code: ArcFindingCode;
  readonly surface: string;
  /** 1-indexed line number; 0 for whole-file findings (e.g. missing colour). */
  readonly line: number;
  readonly detail: string;
}

/** The structural facts one channel file yields. */
export interface ArcChannelParse {
  readonly fileName: string;
  /** The first line when it is a `#` heading; undefined otherwise. */
  readonly titleLine: string | undefined;
  readonly entries: readonly ArcEntryHeader[];
  /** Parsed, well-formed `Channel-colour: <index>` lines (1-indexed line numbers). */
  readonly colourLines: ReadonlyArray<{ readonly index: number; readonly line: number }>;
  /**
   * Non-empty prose lines between the title and the first entry header —
   * excludes the title itself, colour lines, and header candidates. Zero when
   * no prose preamble exists (the strict tier requires at least one line).
   */
  readonly preambleProseLineCount: number;
  /** Parse-time findings only (malformed candidates); tier logic adds more. */
  readonly findings: readonly ArcFinding[];
}

/** Resolved channel colour: last colour line wins (append-only re-assignment). */
export type ArcChannelColourResolution =
  { readonly kind: 'indexed'; readonly index: number } | { readonly kind: 'none' };

/** One unique on-channel participant, derived from entry headers. */
export interface ArcRosterMember {
  readonly authorName: string;
  readonly sessionIdPrefix: string;
}

const entryHeaderSchema = z.object({
  authorName: z.string().min(1),
  sessionIdPrefix: z.string().regex(/^[0-9a-f]{6}$/),
  timestampIso: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?Z$/)
    .optional(),
  subject: z.string().min(1),
});

/**
 * Full entry-header grammar. Timestamp is optional AT PARSE TIME (the
 * grandfathered shapes must parse); the strict tier upgrades its absence or
 * minutes-precision to violations in {@link evaluateArcChannelStrictness}.
 * The double-space `]  —` shape observed in the live corpus is covered by
 * `\s+` between the bracket, optional timestamp, and em-dash.
 */
const ENTRY_HEADER_PATTERN =
  /^## \[(?<name>[^\][]+) (?<prefix>[0-9a-f]{6})\]\s+(?:(?<ts>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?Z)\s+)?— (?<subject>.+)$/;

/** Any line that LOOKS like it wants to be an entry header. */
const ENTRY_HEADER_CANDIDATE = /^## \[/;

const COLOUR_LINE_PATTERN = /^Channel-colour: (?<index>\d+)$/;

/** Any line that names the colour key but may fail the value grammar. */
const COLOUR_LINE_CANDIDATE = /^Channel-colour:/;

/** Strict-tier title shape: `# ARC channel: <topic> — <names>`. */
const STRICT_TITLE_PATTERN = /^# ARC channel: .+ — .+$/;

const SECONDS_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

const FILE_DATE_PATTERN = /^(?<date>\d{4}-\d{2}-\d{2})-/;

/**
 * Strip directory segments (either separator convention — `path.relative`
 * emits backslashes on Windows) down to the channel file's basename. The
 * single basename home for this module: name-shaped facts (date tier,
 * cross-host marker, README exclusion) are BASENAME facts, while callers keep
 * their full repo-relative paths as the finding/reporting surface.
 */
function channelBaseName(fileName: string): string {
  return fileName.split(/[\\/]/).at(-1) ?? fileName;
}

/**
 * True when the digit-shaped `YYYY-MM-DD` string names a real calendar date —
 * a UTC round-trip check, so `2026-99-99` or `2026-02-30` cannot satisfy the
 * dated-filename requirement (and can never enter the strict tier) on digit
 * shape alone.
 */
function isRealCalendarDate(isoDate: string): boolean {
  const year = Number(isoDate.slice(0, 4));
  const month = Number(isoDate.slice(5, 7));
  const day = Number(isoDate.slice(8, 10));
  const roundTrip = new Date(Date.UTC(year, month - 1, day));
  return (
    roundTrip.getUTCFullYear() === year &&
    roundTrip.getUTCMonth() === month - 1 &&
    roundTrip.getUTCDate() === day
  );
}

/**
 * Extract the channel's calendar date from its BASENAME
 * (`YYYY-MM-DD-<topic...>.md`; directory segments in either separator
 * convention are stripped first, so a nested tracked path stays dated), or
 * undefined when the filename is undated or its digits do not form a real
 * calendar date.
 */
export function channelDateFromFileName(fileName: string): string | undefined {
  const date = FILE_DATE_PATTERN.exec(channelBaseName(fileName))?.groups?.['date'];
  return date !== undefined && isRealCalendarDate(date) ? date : undefined;
}

/**
 * True when a directory-listing or `git ls-files` name is an ARC channel
 * file: a markdown file whose BASENAME is not exactly `README.md`. The single
 * predicate home shared by the gate, the statusline gatherer, and the colour
 * CLI (consolidate-at-second-consumer) — README exclusion binds on the exact
 * basename, so a dated channel whose topic merely ends in `README`
 * (e.g. `2026-07-18-api-README.md`) is a channel, never a skipped README.
 */
export function isArcChannelFileName(fileName: string): boolean {
  const baseName = channelBaseName(fileName);
  return baseName.endsWith('.md') && baseName !== 'README.md';
}

/**
 * Normalise a display name or channel filename for participant/name
 * matching: lower-case with every non-alphanumeric run collapsed to a single
 * dash, so "Monsoon guards Cirrus" matches
 * `arc-monsoon-guards-cirrus-and-fern.md` regardless of the separator
 * convention a channel author chose. The single normalisation home
 * (consolidated at its second consumer): the statusline's participant
 * matching and the cross-host detector both read names through it.
 */
export function normaliseForFilenameMatch(value: string): string {
  return value.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-');
}

/** Cross-host token as a hyphen-delimited segment of the normalised basename. */
const CROSS_HOST_SEGMENT = /(^|-)cross-host(-|$)/;

/**
 * True when a channel is a cross-machine ARC guest window (PDR-138), detected
 * from its BASENAME carrying `cross-host` as a hyphen-delimited segment.
 *
 * @remarks
 * Cross-machine ARC windows are guest windows into another machine's estate;
 * nothing in the local substrate can detect them, so the channel BASENAME is
 * the honest carrier. This marker is **honest-by-convention** — the same class
 * of trust as a `--role` claim: it holds because the window-open ceremony
 * mandates the `cross-host` token, not because anything enforces it.
 *
 * Directories are stripped (only the basename is tested, either separator
 * convention), and a `YYYY-MM-DD`
 * date prefix or `.md` extension may be present. The basename is normalised
 * the way this module's name-matching does — lower-cased with every
 * non-alphanumeric run collapsed to a single dash — before the segment test,
 * so any separator convention matches while embedded near-misses do not
 * (`crossword-host-notes.md` and `across-hosting.md` are NOT cross-host).
 * The founding live instance is
 * `2026-07-09-cross-host-window-sparking-firing-cinder-starlit-threading-dawn.md`.
 */
export function isCrossHostChannelName(fileName: string): boolean {
  return CROSS_HOST_SEGMENT.test(normaliseForFilenameMatch(channelBaseName(fileName)));
}

/**
 * Parse one channel file's STRUCTURE. Never throws on malformed content —
 * a half-written trailing line (live channels are appended while read) or a
 * malformed candidate becomes a finding, and parsing continues. Entry bodies
 * are never inspected.
 */
export function parseArcChannel(fileName: string, content: string): ArcChannelParse {
  const lines = content.split('\n');
  const entries: ArcEntryHeader[] = [];
  const colourLines: Array<{ index: number; line: number }> = [];
  const findings: ArcFinding[] = [];
  let preambleProseLineCount = 0;

  const firstLine = lines[0];
  const titleLine = firstLine !== undefined && firstLine.startsWith('#') ? firstLine : undefined;

  lines.forEach((text, i) => {
    const line = i + 1;
    if (ENTRY_HEADER_CANDIDATE.test(text)) {
      const match = ENTRY_HEADER_PATTERN.exec(text);
      const groups = match?.groups;
      if (groups === undefined) {
        findings.push({
          code: 'malformed-entry-header',
          surface: fileName,
          line,
          detail: `entry-header candidate fails the grammar: ${JSON.stringify(text)}`,
        });
        return;
      }
      const parsed = entryHeaderSchema.safeParse({
        authorName: groups['name'],
        sessionIdPrefix: groups['prefix'],
        timestampIso: groups['ts'],
        subject: groups['subject'],
      });
      if (!parsed.success) {
        findings.push({
          code: 'malformed-entry-header',
          surface: fileName,
          line,
          detail: `entry-header fields fail validation: ${parsed.error.issues
            .map((issue) => issue.message)
            .join('; ')}`,
        });
        return;
      }
      entries.push({ ...parsed.data, line });
      return;
    }
    if (COLOUR_LINE_CANDIDATE.test(text)) {
      const match = COLOUR_LINE_PATTERN.exec(text);
      const indexText = match?.groups?.['index'];
      if (indexText === undefined) {
        findings.push({
          code: 'malformed-colour-line',
          surface: fileName,
          line,
          detail: `colour line fails the grammar (expected "Channel-colour: <non-negative integer>"): ${JSON.stringify(text)}`,
        });
        return;
      }
      colourLines.push({ index: Number(indexText), line });
      return;
    }
    if (entries.length === 0 && line > 1 && text.trim() !== '') {
      preambleProseLineCount += 1;
    }
  });

  return { fileName, titleLine, entries, colourLines, preambleProseLineCount, findings };
}

/**
 * Resolve the channel's colour: the LAST well-formed colour line wins, which
 * is what makes colour re-assignment (and colouring a grandfathered live
 * channel) append-only-legal.
 */
export function resolveChannelColour(parse: ArcChannelParse): ArcChannelColourResolution {
  const last = parse.colourLines.at(-1);
  return last === undefined ? { kind: 'none' } : { kind: 'indexed', index: last.index };
}

/**
 * The unique on-channel roster in first-appearance order — the membership
 * source that cures the filename-only blind spot (roster-accretion joiners
 * appear here even when the filename never names them).
 */
export function deriveArcRoster(parse: ArcChannelParse): readonly ArcRosterMember[] {
  const seen = new Set<string>();
  const roster: ArcRosterMember[] = [];
  for (const entry of parse.entries) {
    const key = `${entry.authorName}|${entry.sessionIdPrefix}`;
    if (!seen.has(key)) {
      seen.add(key);
      roster.push({ authorName: entry.authorName, sessionIdPrefix: entry.sessionIdPrefix });
    }
  }
  return roster;
}

/** Options for {@link evaluateArcChannelStrictness}. */
export interface ArcStrictnessOptions {
  /** First calendar day the strict tier binds (YYYY-MM-DD). */
  readonly adoptionDate: string;
  /** Number of palette slots; a colour index must be in `[0, paletteSize)`. */
  readonly paletteSize: number;
}

/**
 * Evaluate the tiered structural contract over a parse.
 *
 * ALL files (grandfathered included): malformed entry-header/colour
 * candidates, colour-index range, dated filename. Files dated on or after
 * `adoptionDate` additionally: canonical title, a preamble, seconds-precision
 * timestamps on every header, at least one entry header (a conforming opening
 * block with ZERO entries is the documented non-append rewrite/truncation
 * corruption tell), and a colour line whose first occurrence precedes the
 * first entry.
 *
 * The returned violations RECOMPUTE everything from the parse — nothing is
 * trusted from recorded state (validators-must-recompute).
 */
export function evaluateArcChannelStrictness(
  parse: ArcChannelParse,
  options: ArcStrictnessOptions,
): readonly ArcFinding[] {
  const violations: ArcFinding[] = [...parse.findings];
  const fileDate = channelDateFromFileName(parse.fileName);
  const strict = fileDate !== undefined && fileDate >= options.adoptionDate;

  if (fileDate === undefined) {
    violations.push({
      code: 'undated-filename',
      surface: parse.fileName,
      line: 0,
      detail: 'channel filenames must carry a YYYY-MM-DD prefix',
    });
  }

  for (const colour of parse.colourLines) {
    if (colour.index >= options.paletteSize) {
      violations.push({
        code: 'colour-out-of-range',
        surface: parse.fileName,
        line: colour.line,
        detail: `colour index ${String(colour.index)} outside palette [0, ${String(options.paletteSize)})`,
      });
    }
  }

  if (!strict) {
    return violations;
  }

  if (parse.titleLine === undefined || !STRICT_TITLE_PATTERN.test(parse.titleLine)) {
    violations.push({
      code: 'malformed-title',
      surface: parse.fileName,
      line: 1,
      detail: 'post-adoption channels open with "# ARC channel: <topic> — <names>"',
    });
  }

  if (parse.entries.length === 0) {
    violations.push({
      code: 'missing-entries',
      surface: parse.fileName,
      line: 0,
      detail:
        'post-adoption channels carry at least one entry header — a structurally valid opening block with zero entries is the non-append rewrite/truncation tell',
    });
  }

  for (const entry of parse.entries) {
    if (entry.timestampIso === undefined) {
      violations.push({
        code: 'missing-timestamp',
        surface: parse.fileName,
        line: entry.line,
        detail: 'post-adoption entry headers carry a seconds-precision ISO-UTC timestamp',
      });
    } else if (!SECONDS_TIMESTAMP.test(entry.timestampIso)) {
      violations.push({
        code: 'timestamp-precision',
        surface: parse.fileName,
        line: entry.line,
        detail: `post-adoption timestamps carry seconds precision; saw ${entry.timestampIso}`,
      });
    }
  }

  const firstEntryLine = parse.entries[0]?.line;
  const firstColour = parse.colourLines[0];
  if (firstColour === undefined) {
    violations.push({
      code: 'missing-colour',
      surface: parse.fileName,
      line: 0,
      detail: 'post-adoption channels record a "Channel-colour: <index>" line at open',
    });
  } else if (firstEntryLine !== undefined && firstColour.line > firstEntryLine) {
    violations.push({
      code: 'colour-after-first-entry',
      surface: parse.fileName,
      line: firstColour.line,
      detail: 'the opening colour assignment precedes the first entry header',
    });
  }

  if (firstEntryLine !== undefined && parse.preambleProseLineCount === 0) {
    violations.push({
      code: 'missing-preamble',
      surface: parse.fileName,
      line: 1,
      detail: 'post-adoption channels carry a prose preamble between title and first entry',
    });
  }

  return violations;
}
