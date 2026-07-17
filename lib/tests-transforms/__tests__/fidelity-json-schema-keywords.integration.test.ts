/**
 * JSON Schema keyword fidelity proofs (initial-review H1 / H2 / H4 / L12).
 *
 * Behavioural round-trip and carrying proofs for the keyword-fidelity seams
 * reported by the initial review:
 *
 * - H1: Draft 07 normalisation recurses into if/then/else, patternProperties,
 *   propertyNames, contains, and unevaluated* keywords; deep `$ref` pointers
 *   below a `definitions` entry are rewritten to `$defs` form.
 * - H2: `contentEncoding` and boolean `exclusiveMinimum`/`exclusiveMaximum`
 *   survive writing (normalised to numeric 2020-12 form).
 * - H4: `$ref` sibling keywords and `contentMediaType`/`contentSchema` are
 *   carried into the IR and emitted by the writers.
 * - L12: `patternProperties`-only objects receive closed-world semantics.
 *
 * @see .agent/plans/active/02-ir-fidelity-proof-harness.md
 */

import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

import {
  parseJsonSchema,
  parseJsonSchemaDocument,
} from '../../src/schema-processing/parsers/json-schema/index.js';
import type { Draft07Input } from '../../src/schema-processing/parsers/json-schema/index.js';
import { writeJsonSchemaBundle } from '../../src/schema-processing/writers/json-schema/index.js';
import { writeOpenApiSchema } from '../../src/schema-processing/writers/openapi/schema/openapi-writer.schema.js';
import type { CastrSchema } from '../../src/schema-processing/ir/index.js';

// ============================================================================
// Fixtures
// ============================================================================

const EDGE_CASE_FIXTURES_DIR = resolve(__dirname, '../__fixtures__/edge-cases');

function assertDraft07Input(value: unknown, context: string): asserts value is Draft07Input {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`Expected JSON Schema object in ${context}`);
  }
}

async function loadJsonSchemaFixture(name: string): Promise<Draft07Input> {
  const path = `${EDGE_CASE_FIXTURES_DIR}/${name}`;
  const content = await readFile(path, 'utf-8');
  const parsed = JSON.parse(content);
  assertDraft07Input(parsed, `JSON Schema fixture ${path}`);
  return parsed;
}

function getComponentSchema(
  components: { name: string; schema: CastrSchema }[],
  name: string,
): CastrSchema {
  const component = components.find((c) => c.name === name);
  if (component === undefined) {
    throw new Error(`Expected component '${name}'`);
  }
  return component.schema;
}

function assertRoundTripIrEquality(fixture: Draft07Input): void {
  const components1 = parseJsonSchemaDocument(fixture);
  expect(components1.length).toBeGreaterThan(0);

  const output = writeJsonSchemaBundle(components1);
  const components2 = parseJsonSchemaDocument(output);

  expect(components2).toHaveLength(components1.length);
  for (const comp1 of components1) {
    const comp2 = components2.find((c) => c.name === comp1.name);
    if (comp2 === undefined) {
      throw new Error(`Component '${comp1.name}' missing after round-trip`);
    }
    expect(comp2.schema).toEqual(comp1.schema);
  }
}

// ============================================================================
// H1: Draft 07 normalisation recursion + deep $ref rewriting
// ============================================================================

describe('H1: Draft 07 normalisation recurses into all sub-schema keywords', () => {
  it('normalises boolean exclusive bounds nested inside then/else at depth', async () => {
    const fixture = await loadJsonSchemaFixture('draft-07-nested-keywords.json');
    const components = parseJsonSchemaDocument(fixture);
    const root = getComponentSchema(components, 'Draft07NestedKeywords');

    const thenAmount = root.then?.properties?.get('amount');
    expect(thenAmount?.exclusiveMinimum).toBe(10);
    expect(thenAmount?.minimum).toBeUndefined();

    const elseAmount = root.else?.properties?.get('amount');
    expect(elseAmount?.exclusiveMaximum).toBe(99);
    expect(elseAmount?.maximum).toBeUndefined();
  });

  it('normalises boolean exclusive bounds nested inside patternProperties', async () => {
    const fixture = await loadJsonSchemaFixture('draft-07-nested-keywords.json');
    const components = parseJsonSchemaDocument(fixture);
    const root = getComponentSchema(components, 'Draft07NestedKeywords');

    const patternSchema = root.patternProperties?.['^x-'];
    expect(patternSchema?.exclusiveMinimum).toBe(1);
    expect(patternSchema?.minimum).toBeUndefined();
  });

  it('rewrites deep $ref pointers below a definitions entry', async () => {
    const fixture = await loadJsonSchemaFixture('draft-07-nested-keywords.json');
    const components = parseJsonSchemaDocument(fixture);
    const root = getComponentSchema(components, 'Draft07NestedKeywords');

    expect(root.properties?.get('inner')?.$ref).toBe('#/$defs/Outer/properties/inner');
  });

  it('round-trips the Draft 07 nested-keyword document with IR equality', async () => {
    const fixture = await loadJsonSchemaFixture('draft-07-nested-keywords.json');
    assertRoundTripIrEquality(fixture);
  });
});

// ============================================================================
// L12: patternProperties-only closed-world semantics
// ============================================================================

describe('L12: patternProperties-only objects get closed-world semantics', () => {
  it('stamps type object and additionalProperties false on patternProperties-only input', () => {
    const result = parseJsonSchema({
      patternProperties: {
        '^x-': { type: 'string' },
      },
    });

    expect(result.type).toBe('object');
    expect(result.additionalProperties).toBe(false);
  });

  it('round-trips a patternProperties-only $defs entry with IR equality', async () => {
    const fixture = await loadJsonSchemaFixture('draft-07-nested-keywords.json');
    const components = parseJsonSchemaDocument(fixture);
    const patternOnly = getComponentSchema(components, 'PatternOnly');

    expect(patternOnly.type).toBe('object');
    expect(patternOnly.additionalProperties).toBe(false);
    assertRoundTripIrEquality(fixture);
  });
});

// ============================================================================
// H4: content keywords carried and emitted
// ============================================================================

describe('H4: contentMediaType and contentSchema are carried and emitted', () => {
  it('parses contentEncoding, contentMediaType, and contentSchema into the IR', async () => {
    const fixture = await loadJsonSchemaFixture('2020-12-content-keywords.json');
    const components = parseJsonSchemaDocument(fixture);

    const encodedImage = getComponentSchema(components, 'EncodedImage');
    expect(encodedImage.contentEncoding).toBe('base64');
    expect(encodedImage.contentMediaType).toBe('image/png');

    const embeddedDoc = getComponentSchema(components, 'EmbeddedDoc');
    expect(embeddedDoc.contentMediaType).toBe('application/json');
    expect(embeddedDoc.contentSchema?.type).toBe('object');
    expect(embeddedDoc.contentSchema?.properties?.get('id')?.type).toBe('string');
  });

  it('round-trips content keywords through the JSON Schema writer with IR equality', async () => {
    const fixture = await loadJsonSchemaFixture('2020-12-content-keywords.json');
    assertRoundTripIrEquality(fixture);
  });
});

// ============================================================================
// H2: writer emission of contentEncoding
// ============================================================================

describe('H2: OpenAPI writer emits contentEncoding', () => {
  it('emits contentEncoding for a parsed base64 string schema', async () => {
    const fixture = await loadJsonSchemaFixture('2020-12-content-keywords.json');
    const components = parseJsonSchemaDocument(fixture);
    const encodedImage = getComponentSchema(components, 'EncodedImage');

    const written = writeOpenApiSchema(encodedImage);

    expect(written).toEqual({
      type: 'string',
      contentEncoding: 'base64',
      contentMediaType: 'image/png',
    });
  });
});

// ============================================================================
// H4: $ref sibling keywords carried and emitted
// ============================================================================

describe('H4: $ref sibling keywords are carried and emitted', () => {
  it('carries description, minLength, and title siblings into the IR', async () => {
    const fixture = await loadJsonSchemaFixture('2020-12-ref-siblings.json');
    const components = parseJsonSchemaDocument(fixture);
    const constrained = getComponentSchema(components, 'Constrained');

    expect(constrained.$ref).toBe('#/$defs/Base');
    expect(constrained.description).toBe('hi');
    expect(constrained.minLength).toBe(5);
    expect(constrained.title).toBe('T');
  });

  it('emits the siblings alongside $ref through the OpenAPI writer', async () => {
    const fixture = await loadJsonSchemaFixture('2020-12-ref-siblings.json');
    const components = parseJsonSchemaDocument(fixture);
    const constrained = getComponentSchema(components, 'Constrained');

    const written = writeOpenApiSchema(constrained);

    expect(written).toEqual({
      $ref: '#/$defs/Base',
      description: 'hi',
      minLength: 5,
      title: 'T',
    });
  });
});
