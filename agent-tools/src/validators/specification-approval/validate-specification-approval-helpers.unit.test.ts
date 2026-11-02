import { describe, expect, it } from 'vitest';

import { checkSpecificationBytes } from './validate-specification-approval-helpers.js';

/**
 * Fixture prefixes: everything above the change-log heading. Each SHA-256 below was computed
 * once with `shasum -a 256` over these exact UTF-8 bytes, never by the code under test. The
 * prose holds characters of two, three and four bytes (one outside the Basic Multilingual
 * Plane), so a cut made at a byte offset or a code-point offset instead of the string offset
 * the parser reports gives a different hash.
 */
const front = (version: string, status: string): string =>
  `---\ntitle: Fixture specification\nversion: ${version}\nstatus: ${status}\n---\n\n` +
  '# Fixture specification\n\nThe owner’s text — café \u{1D11E}.\n\n';

const RATIFIED_050 = front('0.5.0', 'ratified');
const RATIFIED_050_SHA256 = '52cec4b23985e0cf8a5391639b7662f4091ddb99c0e0f6c4b264444a38eb7367';
const RATIFIED_051 = front('0.5.1', 'ratified');
const RATIFIED_051_SHA256 = '9463d094ed7172fda5e8aad841bc3178ed581c75a4f519987744a38efcf85312';
const DRAFT_050 = front('0.5.0', 'draft-awaiting-owner-ratification');
const DRAFT_050_SHA256 = 'f1bed8382ea4f2b3b489eb347fa1b011df9bbd214a5e5ef1d7041675e1126b1c';
/** RATIFIED_050 with one space added after the last full stop. */
const RATIFIED_050_SPACE = RATIFIED_050.replace('\u{1D11E}.', '\u{1D11E}. ');
const RATIFIED_050_SPACE_SHA256 =
  '12c0d4d56568965e94fed308c8992ad5a5f8eec7a6a820e139195524910f2dd8';
/** RATIFIED_050 followed by a fenced block whose content looks like the change-log heading. */
const RATIFIED_050_FENCED = `${RATIFIED_050}\`\`\`md\n## Change log\n\`\`\`\n\n`;
const RATIFIED_050_FENCED_SHA256 =
  '78bfc237aec783e4f1fe17395981cb45b5f945f51b68614cb688df5c4ae3ab58';

const HEADER = '| Version | Date | Change | Approval |\n| --- | --- | --- | --- |\n';
const changeLog = (rows: readonly string[]): string =>
  `## Change log\n\n${HEADER}${rows.join('\n')}\n`;
const unapproved = (version: string): string => `| ${version} | 2026-09-23 | Draft. | none |`;
const approved = (version: string, sha256: string, approver = 'Jim Cresswell'): string =>
  `| ${version} | 2026-11-02 | Ratified. | ${approver}, 2026-11-02, in a working session: ` +
  `"I approve ${version}." SHA-256 of the text above this log: \`${sha256}\` |`;

const bytes = (text: string): Uint8Array => new TextEncoder().encode(text);
const check = (prefix: string, rows: readonly string[]) =>
  checkSpecificationBytes(bytes(`${prefix}${changeLog(rows)}`));
const report = (lines: readonly string[]): string => lines.join('\n');

describe('checkSpecificationBytes: SPEC-CC-3 with no approval record', () => {
  it('passes a draft that has no approval record', () => {
    const outcome = check(DRAFT_050, [unapproved('0.4.0')]);
    expect(outcome.exitCode).toBe(0);
    expect(report(outcome.stdout)).toContain('no approval record');
  });

  it('fails a document marked ratified that has no approval record', () => {
    const outcome = check(RATIFIED_050, [unapproved('0.4.0')]);
    expect(outcome.exitCode).toBe(1);
    expect(report(outcome.stderr)).toContain('"ratified"');
    expect(report(outcome.stderr)).toContain('no approval record');
  });
});

describe('checkSpecificationBytes: SPEC-CC-3 against the latest approval record', () => {
  it('passes when the bytes above the change log hash to the latest record', () => {
    const outcome = check(RATIFIED_050, [
      unapproved('0.4.0'),
      approved('0.5.0', RATIFIED_050_SHA256),
    ]);
    expect(outcome.exitCode).toBe(0);
    expect(report(outcome.stdout)).toContain(RATIFIED_050_SHA256);
  });

  it('fails a one-byte change above the change log, naming both hashes and the remedy', () => {
    const outcome = check(RATIFIED_050_SPACE, [approved('0.5.0', RATIFIED_050_SHA256)]);
    expect(outcome.exitCode).toBe(1);
    const lines = report(outcome.stderr);
    expect(lines).toContain(RATIFIED_050_SHA256);
    expect(lines).toContain(RATIFIED_050_SPACE_SHA256);
    expect(lines).toContain('SPEC-CC-1');
  });

  it('ignores a row added below the latest record, which is outside the approved text', () => {
    const outcome = check(RATIFIED_050, [
      approved('0.5.0', RATIFIED_050_SHA256),
      unapproved('0.6.0'),
    ]);
    expect(outcome.exitCode).toBe(0);
  });

  it('fails when the record that matches the text names another version, and says only that', () => {
    const outcome = check(RATIFIED_051, [approved('0.5.0', RATIFIED_051_SHA256)]);
    expect(outcome.exitCode).toBe(1);
    const lines = report(outcome.stderr);
    expect(lines).toContain('version 0.5.1');
    expect(lines).toContain('row 0.5.0');
    expect(lines).not.toContain(RATIFIED_051_SHA256);
  });

  it('is governed by the latest of two records, and reports every problem with it', () => {
    const rows = [approved('0.5.0', RATIFIED_050_SHA256), approved('0.5.1', RATIFIED_051_SHA256)];
    expect(check(RATIFIED_051, rows).exitCode).toBe(0);
    const stale = check(RATIFIED_050, rows);
    expect(stale.exitCode).toBe(1);
    const lines = report(stale.stderr);
    expect(lines).toContain(RATIFIED_051_SHA256);
    expect(lines).toContain('version 0.5.0');
  });

  it('fails a governing record over text whose status is not ratified', () => {
    const outcome = check(DRAFT_050, [approved('0.5.0', DRAFT_050_SHA256)]);
    expect(outcome.exitCode).toBe(1);
    expect(report(outcome.stderr)).toContain('"draft-awaiting-owner-ratification"');
  });

  it('accepts mantagen as an approver', () => {
    const outcome = check(RATIFIED_050, [approved('0.5.0', RATIFIED_050_SHA256, 'mantagen')]);
    expect(outcome.exitCode).toBe(0);
  });

  it('cuts at the real heading, not at a heading-like line inside a code fence', () => {
    const outcome = check(RATIFIED_050_FENCED, [approved('0.5.0', RATIFIED_050_FENCED_SHA256)]);
    expect(outcome.exitCode).toBe(0);
  });
});

describe('checkSpecificationBytes: an Approval cell is `none` or one approval record', () => {
  const recordRow = (cell: string): string => `| 0.5.0 | 2026-11-02 | Ratified. | ${cell} |`;
  const malformed = [
    ['a 62-character digest', approved('0.5.0', RATIFIED_050_SHA256.slice(2)), 'SHA-256'],
    ['a 63-character digest', approved('0.5.0', RATIFIED_050_SHA256.slice(1)), 'SHA-256'],
    ['an upper-case digest', approved('0.5.0', RATIFIED_050_SHA256.toUpperCase()), 'SHA-256'],
    ['a non-hex digest', approved('0.5.0', `${RATIFIED_050_SHA256.slice(1)}g`), 'SHA-256'],
    [
      'an approver the specification does not name',
      approved('0.5.0', RATIFIED_050_SHA256, 'An agent for Jim Cresswell'),
      'approver',
    ],
    [
      'a record dated other than its row',
      recordRow(`Jim Cresswell, 2026-11-03, said so. \`${RATIFIED_050_SHA256}\``),
      'approver',
    ],
    [
      'a record with no words of approval',
      recordRow(`Jim Cresswell, 2026-11-02, \`${RATIFIED_050_SHA256}\``),
      'words',
    ],
    [
      'a digest written beside "none"',
      recordRow(`none; draft SHA-256 \`${RATIFIED_050_SHA256}\``),
      'approver',
    ],
    [
      'two digests',
      recordRow(
        `Jim Cresswell, 2026-11-02, said so. \`${RATIFIED_050_SHA256}\` and \`${RATIFIED_050_SHA256}\``,
      ),
      'one SHA-256',
    ],
    [
      'words after the digest',
      recordRow(`Jim Cresswell, 2026-11-02, said so. \`${RATIFIED_050_SHA256}\` and more`),
      'one SHA-256',
    ],
  ] as const;

  it.each(malformed)('cannot read %s', (_case, row, reason) => {
    const outcome = check(RATIFIED_050, [row]);
    expect(outcome.exitCode).toBe(2);
    const lines = report(outcome.stderr);
    expect(lines).toContain('Approval cell of row 0.5.0');
    expect(lines).toContain(reason);
  });
});

describe('checkSpecificationBytes: every change-log row is well formed', () => {
  it.each([
    ['an empty version', '|  | 2026-09-23 | Draft. | none |', 'version'],
    ['a date that is not a calendar date', '| 0.4.0 | soon | Draft. | none |', 'date'],
    ['an empty change', '| 0.4.0 | 2026-09-23 |  | none |', 'change'],
  ])('cannot read a row with %s', (_case, row, reason) => {
    const outcome = check(DRAFT_050, [row]);
    expect(outcome.exitCode).toBe(2);
    expect(report(outcome.stderr)).toContain(reason);
  });

  it('cannot read two rows for one version', () => {
    const outcome = check(DRAFT_050, [unapproved('0.4.0'), unapproved('0.4.0')]);
    expect(outcome.exitCode).toBe(2);
    expect(report(outcome.stderr)).toContain('0.4.0');
  });

  it('names the line of a row it cannot read', () => {
    const outcome = check(DRAFT_050, ['| 0.4.0 | soon | Draft. | none |']);
    const tableStartsOnLine = DRAFT_050.split('\n').length + 2;
    expect(report(outcome.stderr)).toContain(`line ${tableStartsOnLine + 2}`);
  });
});

describe('checkSpecificationBytes: the document must be readable', () => {
  const record = approved('0.5.0', RATIFIED_050_SHA256);

  it('cannot read a document without YAML frontmatter', () => {
    const outcome = checkSpecificationBytes(bytes(`# Untitled\n\n${changeLog([record])}`));
    expect(outcome.exitCode).toBe(2);
    expect(report(outcome.stderr)).toContain('frontmatter');
  });

  it('cannot read a status outside the two the specification uses', () => {
    const outcome = check(front('0.5.0', 'Ratified'), [record]);
    expect(outcome.exitCode).toBe(2);
    expect(report(outcome.stderr)).toContain('status');
  });

  it('cannot read frontmatter that states a key twice', () => {
    const twice = DRAFT_050.replace(
      'status: draft-awaiting-owner-ratification\n',
      'status: draft-awaiting-owner-ratification\nstatus: ratified\n',
    );
    const outcome = check(twice, [record]);
    expect(outcome.exitCode).toBe(2);
    expect(report(outcome.stderr)).toContain('frontmatter');
  });

  it('cannot read frontmatter that YAML only warns about', () => {
    const tagged = RATIFIED_050.replace(
      'title: Fixture specification',
      'title: !custom Fixture specification',
    );
    const outcome = check(tagged, [record]);
    expect(outcome.exitCode).toBe(2);
    expect(report(outcome.stderr)).toContain('frontmatter');
  });

  it('cannot read a document whose change log is not its last two blocks', () => {
    const outcome = checkSpecificationBytes(
      bytes(`${RATIFIED_050}${changeLog([record])}\n## Appendix\n\nUnhashed text.\n`),
    );
    expect(outcome.exitCode).toBe(2);
    expect(report(outcome.stderr)).toContain('last two blocks');
  });

  it.each([
    ['another heading', `## History\n\n${HEADER}${record}\n`],
    ['a first-level heading', `# Change log\n\n${HEADER}${record}\n`],
    ['a setext heading', `Change log\n----------\n\n${HEADER}${record}\n`],
    ['an indented heading', `   ## Change log\n\n${HEADER}${record}\n`],
  ])('cannot read a change log under %s', (_case, changeLogText) => {
    const outcome = checkSpecificationBytes(bytes(`${RATIFIED_050}${changeLogText}`));
    expect(outcome.exitCode).toBe(2);
    expect(report(outcome.stderr)).toContain('last two blocks');
  });

  it.each([
    ['a misnamed column', '| Version | Date | Change | Approved |\n| --- | --- | --- | --- |\n'],
    ['three columns', '| Version | Date | Change |\n| --- | --- | --- |\n'],
  ])('cannot read a change log with %s', (_case, header) => {
    const outcome = checkSpecificationBytes(
      bytes(`${RATIFIED_050}## Change log\n\n${header}| 0.5.0 | 2026-11-02 | Draft. |\n`),
    );
    expect(outcome.exitCode).toBe(2);
    expect(report(outcome.stderr)).toContain('columns');
  });

  it('cannot read bytes that are not UTF-8', () => {
    const outcome = checkSpecificationBytes(
      new Uint8Array([...bytes(RATIFIED_050), 0xff, ...bytes(changeLog([record]))]),
    );
    expect(outcome.exitCode).toBe(2);
    expect(report(outcome.stderr)).toContain('UTF-8');
  });

  it('cannot read a document that starts with a byte-order mark', () => {
    const outcome = checkSpecificationBytes(
      new Uint8Array([0xef, 0xbb, 0xbf, ...bytes(`${RATIFIED_050}${changeLog([record])}`)]),
    );
    expect(outcome.exitCode).toBe(2);
    expect(report(outcome.stderr)).toContain('byte-order mark');
  });
});
