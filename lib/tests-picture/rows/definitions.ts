import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { isJsonObject, type JsonObject } from './json.js';

const DEFINITIONS_DIR = new URL('../__fixtures__/definitions/', import.meta.url);

/**
 * One published definition of a format, copied into the repository and pinned.
 */
export interface DefinitionPin {
  readonly file: string;
  readonly id: string;
  readonly bytes: number;
  readonly sha256: string;
}

/**
 * A pinned definition whose bytes matched its pin, parsed.
 */
export interface Definition {
  readonly pin: DefinitionPin;
  readonly schema: JsonObject;
}

function readBytes(file: string): Buffer {
  return readFileSync(fileURLToPath(new URL(file, DEFINITIONS_DIR)));
}

function parseObject(bytes: Buffer, file: string): JsonObject {
  const parsed: unknown = JSON.parse(bytes.toString('utf8'));
  if (!isJsonObject(parsed)) {
    throw new Error(`${file} does not hold a JSON object`);
  }
  return parsed;
}

function toPin(entry: unknown): DefinitionPin {
  if (!isJsonObject(entry)) {
    throw new Error('provenance.json holds an entry that is not an object');
  }
  const { file, id, bytes, sha256 } = entry;
  if (
    typeof file !== 'string' ||
    typeof id !== 'string' ||
    typeof bytes !== 'number' ||
    typeof sha256 !== 'string'
  ) {
    throw new Error('provenance.json holds an entry without file, id, bytes and sha256');
  }
  return { file, id, bytes, sha256 };
}

/**
 * The pins recorded for every published definition the picture reads.
 */
export function readPins(): readonly DefinitionPin[] {
  const record = parseObject(readBytes('provenance.json'), 'provenance.json');
  const { definitions } = record;
  if (!Array.isArray(definitions)) {
    throw new Error('provenance.json has no definitions list');
  }
  return definitions.map(toPin);
}

/**
 * Reads one pinned definition, refusing bytes that do not match the pin or a document
 * whose own identifier is not the one pinned.
 */
export function loadDefinition(file: string): Definition {
  const pin = readPins().find((candidate) => candidate.file === file);
  if (pin === undefined) {
    throw new Error(`${file} has no pin in provenance.json`);
  }
  const bytes = readBytes(file);
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  if (bytes.length !== pin.bytes || sha256 !== pin.sha256) {
    throw new Error(`${file} does not match its pin: ${String(bytes.length)} bytes, ${sha256}`);
  }
  const schema = parseObject(bytes, file);
  if (schema['$id'] !== pin.id) {
    throw new Error(`${file} identifies itself as ${String(schema['$id'])}, not ${pin.id}`);
  }
  return { pin, schema };
}
