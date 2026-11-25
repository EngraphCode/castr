/**
 * The documents of the cases the model's design must hold, read out of the note that
 * states them.
 *
 * The note, `.agent/analysis-and-reports/model-design-cases-2026-11-25.md`, gives each
 * case a heading (`### B2. …`) and its documents in fences. This module reads the JSON
 * and the Zod documents of every case, so that a test can run them and so that nothing
 * the note states of a document rests on the note's own word.
 */

import { readFileSync } from 'node:fs';

import { isJsonValue, type JsonValue } from '../refusals/judge.js';

/** One case of the note. */
export interface CaseDocuments {
  /** The case's key: a section letter and a number, as `B2`. */
  readonly id: string;
  readonly title: string;
  /** The JSON documents of the case, in order. */
  readonly json: readonly JsonValue[];
  /** The Zod documents of the case, as written, in order. */
  readonly zod: readonly string[];
}

const HEADING = /^### ([A-Z]\d+)\. (.+)$/;

/**
 * Reads the cases out of the text of the note.
 *
 * @throws when a JSON fence does not parse, or two cases share a key
 */
export function readCaseDocuments(note: string): readonly CaseDocuments[] {
  const cases: { id: string; title: string; json: JsonValue[]; zod: string[] }[] = [];
  let fence: { language: string; lines: string[] } | undefined;
  for (const line of note.split('\n')) {
    const heading = HEADING.exec(line);
    if (fence === undefined && heading !== null) {
      cases.push({ id: heading[1] ?? '', title: heading[2] ?? '', json: [], zod: [] });
    } else if (fence === undefined && line.startsWith('```')) {
      fence = { language: line.slice(3).trim(), lines: [] };
    } else if (fence !== undefined && line.startsWith('```')) {
      const current = cases.at(-1);
      const source = fence.lines.join('\n');
      if (current !== undefined && fence.language === 'json') {
        current.json.push(parseJson(source, current.id));
      }
      if (current !== undefined && fence.language === 'ts') {
        current.zod.push(source);
      }
      fence = undefined;
    } else {
      fence?.lines.push(line);
    }
  }
  const ids = cases.map((entry) => entry.id);
  const twice = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (twice.length > 0) {
    throw new Error(`more than one case has the key ${twice.join(', ')}`);
  }
  return cases;
}

function parseJson(source: string, id: string): JsonValue {
  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch (cause) {
    throw new Error(`a JSON document of case ${id} does not parse`, { cause });
  }
  if (!isJsonValue(parsed)) {
    throw new Error(`a JSON document of case ${id} is not a JSON value`);
  }
  return parsed;
}

/**
 * Reads the cases of the note as it stands in the repository.
 */
export function readCasesNote(): readonly CaseDocuments[] {
  return readCaseDocuments(
    readFileSync(
      new URL(
        '../../../.agent/analysis-and-reports/model-design-cases-2026-11-25.md',
        import.meta.url,
      ),
      'utf8',
    ),
  );
}

/**
 * The documents of one case.
 *
 * @throws when the note has no case of that key
 */
export function caseOf(cases: readonly CaseDocuments[], id: string): CaseDocuments {
  const found = cases.find((entry) => entry.id === id);
  if (found === undefined) {
    throw new Error(`the note has no case ${id}`);
  }
  return found;
}
