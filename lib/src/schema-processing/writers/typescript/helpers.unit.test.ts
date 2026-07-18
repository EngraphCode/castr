/**
 * The generated `buildSchemaRegistry` default rename must be derived from the
 * canonical `safeSchemaName` seam — the single code-symbol sanitiser. A second,
 * divergent sanitisation algorithm inside the generated output would map raw
 * component names to keys that do not match the emitted schema symbols
 * (e.g. `Error` → `Error` while the emitted symbol is `ErrorSchema`).
 *
 * The helper therefore embeds a rename map precomputed FROM `safeSchemaName`
 * over the component names the generator emitted; these tests recompute the
 * seam and assert the embedded map agrees for every name.
 */

import { describe, expect, it } from 'vitest';
import { Project } from 'ts-morph';
import { z } from 'zod';

import { addSchemaRegistryHelper } from './helpers.js';
import { safeSchemaName } from '../../../shared/utils/identifier-utils.js';

/** Names where `safeSchemaName` output differs from the raw name. */
const DIVERGENT_NAMES = ['Error', 'Date', 'class', '1Thing', 'Basic.Thing', 'kebab-name'];

/**
 * Names `safeSchemaName` leaves unchanged. The last three collide with
 * `Object.prototype` members: the generated lookup must fall back to the
 * original key for them, not return an inherited function or the prototype.
 */
const IDENTITY_NAMES = ['User', 'IsActive', 'snake_case', 'constructor', 'toString', '__proto__'];

const renameEntriesSchema = z.array(z.tuple([z.string(), z.string()]));

function generateRegistryHelper(componentNames: readonly string[]): string {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile('helper.ts', '', { overwrite: true });
  addSchemaRegistryHelper(sourceFile, componentNames);
  return sourceFile.getFullText();
}

function extractDefaultRenames(generated: string): ReadonlyMap<string, string> {
  const match = generated.match(
    /const DEFAULT_SCHEMA_RENAMES: ReadonlyMap<string, string> = new Map<string, string>\((\[.*\])\);/,
  );
  if (!match || match[1] === undefined) {
    throw new Error('generated helper does not embed the safeSchemaName-derived rename entries');
  }
  return new Map(renameEntriesSchema.parse(JSON.parse(match[1])));
}

describe('addSchemaRegistryHelper default rename', () => {
  it('derives the default rename from the safeSchemaName seam for every emitted name', () => {
    const names = [...DIVERGENT_NAMES, ...IDENTITY_NAMES];
    const generated = generateRegistryHelper(names);
    const renames = extractDefaultRenames(generated);

    for (const name of names) {
      // The generated default is `DEFAULT_SCHEMA_RENAMES.get(key) ?? key`;
      // recompute the canonical seam and demand identical output for every
      // name. Map#get never reads Object.prototype, so names such as
      // "constructor" fall back to the original key instead of a function.
      expect(renames.get(name) ?? name, `default rename for "${name}"`).toBe(safeSchemaName(name));
    }
  });

  it('emits the seam-derived lookup as the only sanitisation logic', () => {
    const generated = generateRegistryHelper(DIVERGENT_NAMES);

    expect(generated).toContain('DEFAULT_SCHEMA_RENAMES.get(key) ?? key');
    // The former inline algorithm (character replacement + digit prefixing)
    // diverged from safeSchemaName; no parallel implementation may remain.
    expect(generated).not.toContain('replace(');
    // A caller-supplied rename must still take precedence over the default.
    expect(generated).toContain('options?.rename ??');
  });

  it('emits own-property-safe lookup and registry construction only', () => {
    const generated = generateRegistryHelper(DIVERGENT_NAMES);

    // Bracket reads on a plain object return inherited Object.prototype
    // members for keys like "constructor"; bracket writes swallow "__proto__"
    // via the legacy setter. Neither construct may appear in the emitted
    // helper: the rename table is a Map and the registry is assembled with
    // Object.fromEntries, which defines own data properties.
    expect(generated).not.toContain('DEFAULT_SCHEMA_RENAMES[');
    expect(generated).toContain('Object.fromEntries(');
    expect(generated).not.toMatch(/result\[[a-zA-Z_]+\] *=/);
  });

  it('emits a deterministic, deduplicated map regardless of input order', () => {
    const forward = generateRegistryHelper(['Error', 'Basic.Thing', 'Error']);
    const reversed = generateRegistryHelper(['Basic.Thing', 'Error']);

    expect(forward).toBe(reversed);
    expect(forward).toContain('["Basic.Thing","Basic_Thing"]');
  });
});
