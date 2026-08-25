/**
 * Nested boolean-schema preservation proof (proof-programme Q-04, report F-03).
 *
 * PROVES that JSON Schema boolean schemas (`true`/`false`) survive the full
 * public pipeline `parseJsonSchema → writeJsonSchema → parseJsonSchema` at
 * every recursive position castr models — properties, patternProperties,
 * propertyNames, items, tuple items (prefixItems), contains, allOf, anyOf,
 * oneOf, not, if/then/else, dependentSchemas (2020-12 and Draft-07
 * `dependencies`), `$defs` through the document seam, and the document root
 * itself (parse leg here; the bare-boolean write leg is pinned in the
 * document writer's unit tests). The three `boolean |` keyword positions —
 * additionalProperties, unevaluatedProperties, unevaluatedItems — store
 * their boolean form as keyword booleans that never enter the recursion
 * callback, were never F-03-vulnerable, and keep their existing writer unit
 * coverage. Defect F-03's shape: `false` at a nested position silently became
 * `{}` (≡ `true`), inverting "reject everything" into "accept everything".
 *
 * Each case runs through the artifact-agnostic semantic-outcome runner
 * (`../utils/semantic-outcome-runner.ts`), whose structural non-vacuity
 * precheck recomputes that the IR equality and both oracles genuinely
 * discriminate the case's `separatingSource` — the separating source flips
 * the boolean under proof from `false` to `true`, so a pipeline that
 * collapses either into `{}` fails the precheck on the leg it collapses.
 * The proof asserts verdict INEQUALITY between `false` and `true`, never a
 * verdict direction: under `not` and `if` the collapse is fail-closed
 * rather than fail-open, so a "became more permissive" assertion would
 * silently pass there.
 *
 * Oracles are Ajv validation verdicts of fixed witness instances — meaning,
 * not representation. 2020-12 sources and all written outputs are compiled
 * with Ajv's 2020-12 engine; the two Draft-07-shaped sources (tuple `items`,
 * `dependencies`) are compiled with Ajv's Draft-07 engine, the dialect they
 * are authored in, and their written outputs with the 2020-12 engine — the
 * verdict vectors are dialect-independent observations of the same meaning.
 * Both engines are constructed with the identical option set.
 *
 * The IR clone override routes through a minimal `CastrDocument` wrapper and
 * `serializeIR`/`deserializeIR`, so every case also proves nested boolean
 * IR nodes survive the IR persistence boundary (the Q-03 precedent), and
 * branded `CastrSchemaProperties` values are cloned faithfully (the runner's
 * default `structuredClone` would silently de-brand them).
 */

import { isDeepStrictEqual } from 'node:util';

import { describe, expect, it } from 'vitest';
import Ajv2020Factory from 'ajv/dist/2020.js';
import AjvDraft07Factory from 'ajv/dist/ajv.js';

import {
  parseJsonSchema,
  parseJsonSchemaDocument,
  type Draft07Input,
} from '../../src/schema-processing/parsers/json-schema/index.js';
import {
  writeJsonSchema,
  writeJsonSchemaBundle,
} from '../../src/schema-processing/writers/json-schema/index.js';
import { deserializeIR, serializeIR } from '../../src/schema-processing/ir/index.js';
import { IR_SCHEMA_VERSION } from '../../src/schema-processing/ir/models/schema-document.js';
import type {
  CastrDocument,
  CastrSchema,
  CastrSchemaComponent,
} from '../../src/schema-processing/ir/index.js';
import type { JsonSchemaNode } from '../../src/schema-processing/writers/shared/json-schema-fields.js';
import {
  expectSemanticOutcome,
  runSemanticOutcome,
  type SemanticCase,
} from '../utils/semantic-outcome-runner.js';

// ---------------------------------------------------------------------------
// Oracles: Ajv validation verdicts over fixed witness instances
// ---------------------------------------------------------------------------

/** One option set, used for every engine, so oracle verdicts are comparable. */
const AJV_OPTIONS = { strict: false, validateFormats: false } as const;

type AjvSchemaInput = Parameters<InstanceType<typeof Ajv2020Factory.default>['compile']>[0];

function verdicts2020(schema: AjvSchemaInput, witnesses: readonly unknown[]): boolean[] {
  const ajv = new Ajv2020Factory.default(AJV_OPTIONS);
  const validate = ajv.compile(schema);
  return witnesses.map((witness) => validate(witness) === true);
}

function verdictsDraft07(schema: AjvSchemaInput, witnesses: readonly unknown[]): boolean[] {
  const ajv = new AjvDraft07Factory.default(AJV_OPTIONS);
  const validate = ajv.compile(schema);
  return witnesses.map((witness) => validate(witness) === true);
}

// ---------------------------------------------------------------------------
// IR persistence clone: minimal CastrDocument wrapper around the value under
// proof, round-tripped through serializeIR/deserializeIR
// ---------------------------------------------------------------------------

function wrapComponents(components: CastrSchemaComponent[]): CastrDocument {
  return {
    version: IR_SCHEMA_VERSION,
    openApiVersion: '3.1.0',
    info: { title: 'F-03 proof wrapper', version: '1.0.0' },
    servers: [],
    components,
    operations: [],
    additionalOperations: [],
    dependencyGraph: { nodes: new Map(), topologicalOrder: [], circularReferences: [] },
    schemaNames: [],
    enums: new Map(),
  };
}

function defaultNodeMetadata(): CastrSchemaComponent['metadata'] {
  return {
    required: false,
    nullable: false,
    zodChain: { presence: '', validations: [], defaults: [] },
    dependencyGraph: { references: [], referencedBy: [], depth: 0 },
    circularReferences: [],
  };
}

function persistenceCloneSchema(schema: CastrSchema): CastrSchema {
  const wrapped = wrapComponents([
    {
      type: 'schema',
      name: 'UnderProof',
      schema,
      metadata: defaultNodeMetadata(),
      description: '',
    },
  ]);
  const restored = deserializeIR(serializeIR(wrapped));
  const component = restored.components[0];
  if (component === undefined || component.type !== 'schema') {
    throw new Error('persistence clone lost the schema component');
  }
  return component.schema;
}

function persistenceCloneComponents(components: CastrSchemaComponent[]): CastrSchemaComponent[] {
  const restored = deserializeIR(serializeIR(wrapComponents(components)));
  const schemas = restored.components.filter(
    (component): component is CastrSchemaComponent => component.type === 'schema',
  );
  if (schemas.length !== components.length) {
    throw new Error('persistence clone lost a schema component');
  }
  return schemas;
}

// ---------------------------------------------------------------------------
// Case factory: schema-level pipeline through the public seams
// ---------------------------------------------------------------------------

type SchemaCase = SemanticCase<
  Draft07Input | boolean,
  CastrSchema,
  JsonSchemaNode | boolean,
  boolean[]
>;

function makeSchemaCase(
  name: string,
  source: Draft07Input | boolean,
  separatingSource: Draft07Input | boolean,
  witnesses: readonly unknown[],
  sourceDialect: '2020-12' | 'draft-07' = '2020-12',
): SchemaCase {
  const sourceVerdicts = sourceDialect === '2020-12' ? verdicts2020 : verdictsDraft07;
  return {
    name,
    source,
    separatingSource,
    parse: (input) => parseJsonSchema(input),
    write: (ir) => writeJsonSchema(ir),
    reparse: (output) => parseJsonSchema(output),
    equalIR: (a, b) => isDeepStrictEqual(a, b),
    sourceOracle: (input) => sourceVerdicts(input, witnesses),
    targetOracle: (output) => verdicts2020(output, witnesses),
    equalOracle: (a, b) => isDeepStrictEqual(a, b),
    cloneIR: persistenceCloneSchema,
  };
}

function runSchemaCase(caseUnderProof: SchemaCase): void {
  const proof = runSemanticOutcome(caseUnderProof);
  expectSemanticOutcome(proof);
  expect(proof.outcome).toStrictEqual({
    case: caseUnderProof.name,
    roundTripEqual: true,
    oraclesAgree: true,
    nonVacuous: true,
  });
}

// ---------------------------------------------------------------------------
// The proof cases: `false` under proof, `true` as the separating source
// ---------------------------------------------------------------------------

describe('nested boolean-schema preservation (F-03): parse → write → reparse', () => {
  it('preserves a boolean schema at the document root', () => {
    runSchemaCase(makeSchemaCase('root', false, true, [1]));
  });

  it('preserves a boolean property schema (the F-03 headline position)', () => {
    runSchemaCase(
      makeSchemaCase(
        'properties',
        { type: 'object', properties: { x: false }, additionalProperties: false },
        { type: 'object', properties: { x: true }, additionalProperties: false },
        [{ x: 1 }],
      ),
    );
  });

  it('preserves a boolean patternProperties schema', () => {
    runSchemaCase(
      makeSchemaCase(
        'patternProperties',
        { type: 'object', patternProperties: { '^a': false }, additionalProperties: false },
        { type: 'object', patternProperties: { '^a': true }, additionalProperties: false },
        [{ ab: 1 }],
      ),
    );
  });

  // The schema declares property `a`, so the witness lives inside the
  // closed world castr enforces (`additionalProperties: false`) and the
  // verdict flip isolates `propertyNames`: with `false` no property name is
  // acceptable, with `true` the declared property passes. A bare
  // `{ propertyNames: F }` source would be masked twice over — castr's IR
  // persistence validator requires `propertyNames` on an object-typed
  // schema, and the forced closed world rejects the witness under both
  // branches.
  it('preserves a boolean propertyNames schema', () => {
    runSchemaCase(
      makeSchemaCase(
        'propertyNames',
        {
          type: 'object',
          properties: { a: { type: 'integer' } },
          additionalProperties: false,
          propertyNames: false,
        },
        {
          type: 'object',
          properties: { a: { type: 'integer' } },
          additionalProperties: false,
          propertyNames: true,
        },
        [{ a: 1 }],
      ),
    );
  });

  it('preserves a boolean items schema', () => {
    runSchemaCase(
      makeSchemaCase('items', { type: 'array', items: false }, { type: 'array', items: true }, [
        [1],
      ]),
    );
  });

  it('preserves a boolean tuple member (Draft-07 items array → prefixItems)', () => {
    runSchemaCase(
      makeSchemaCase(
        'tuple-items',
        { type: 'array', items: [false] },
        { type: 'array', items: [true] },
        [[1]],
        'draft-07',
      ),
    );
  });

  it('preserves a boolean contains schema', () => {
    runSchemaCase(
      makeSchemaCase(
        'contains',
        { type: 'array', contains: false },
        { type: 'array', contains: true },
        [[1]],
      ),
    );
  });

  it('preserves a boolean allOf member', () => {
    runSchemaCase(makeSchemaCase('allOf', { allOf: [false] }, { allOf: [true] }, [1]));
  });

  it('preserves a boolean anyOf member', () => {
    runSchemaCase(makeSchemaCase('anyOf', { anyOf: [false] }, { anyOf: [true] }, [1]));
  });

  it('preserves a boolean oneOf member', () => {
    runSchemaCase(makeSchemaCase('oneOf', { oneOf: [false] }, { oneOf: [true] }, [1]));
  });

  it('preserves a boolean not schema (collapse here is fail-closed, not fail-open)', () => {
    runSchemaCase(makeSchemaCase('not', { not: false }, { not: true }, [1]));
  });

  it('preserves a boolean if schema (branch selection flips, not permissiveness)', () => {
    runSchemaCase(
      makeSchemaCase(
        'if',
        { if: false, then: { const: 'THEN' }, else: { const: 'ELSE' } },
        { if: true, then: { const: 'THEN' }, else: { const: 'ELSE' } },
        ['ELSE'],
      ),
    );
  });

  it('preserves a boolean then schema (write-side half of F-03)', () => {
    runSchemaCase(
      makeSchemaCase(
        'then',
        { if: { type: 'integer' }, then: false },
        { if: { type: 'integer' }, then: true },
        [1],
      ),
    );
  });

  it('preserves a boolean else schema (write-side half of F-03)', () => {
    runSchemaCase(
      makeSchemaCase(
        'else',
        { if: { type: 'integer' }, else: false },
        { if: { type: 'integer' }, else: true },
        ['a'],
      ),
    );
  });

  it('preserves a boolean dependentSchemas member', () => {
    runSchemaCase(
      makeSchemaCase(
        'dependentSchemas',
        {
          type: 'object',
          properties: { a: { type: 'integer' } },
          additionalProperties: false,
          dependentSchemas: { a: false },
        },
        {
          type: 'object',
          properties: { a: { type: 'integer' } },
          additionalProperties: false,
          dependentSchemas: { a: true },
        },
        [{ a: 1 }],
      ),
    );
  });

  it('preserves a boolean Draft-07 dependencies member (schema-form dependency)', () => {
    runSchemaCase(
      makeSchemaCase(
        'draft07-dependencies',
        {
          type: 'object',
          properties: { a: { type: 'integer' } },
          additionalProperties: false,
          dependencies: { a: false },
        },
        {
          type: 'object',
          properties: { a: { type: 'integer' } },
          additionalProperties: false,
          dependencies: { a: true },
        },
        [{ a: 1 }],
        'draft-07',
      ),
    );
  });

  // Positive control: no boolean schema anywhere, so this case passes on the
  // pre-fix pipeline too — proving the cases above go red for the boolean
  // collapse specifically, not for some unrelated pipeline breakage.
  it('preserves ordinary object property schemas (positive control)', () => {
    runSchemaCase(
      makeSchemaCase(
        'positive-control',
        { type: 'object', properties: { x: { type: 'integer' } }, additionalProperties: false },
        { type: 'object', properties: { x: { type: 'string' } }, additionalProperties: false },
        [{ x: 1 }],
      ),
    );
  });
});

// ---------------------------------------------------------------------------
// Document seam: $defs members through parseJsonSchemaDocument and
// writeJsonSchemaBundle
// ---------------------------------------------------------------------------

describe('nested boolean-schema preservation (F-03): document seam', () => {
  it('preserves a boolean $defs member through the document pipeline', () => {
    const witnesses: readonly unknown[] = [1];
    const defVerdicts = (underProof: AjvSchemaInput | undefined): boolean[] => {
      if (underProof === undefined) {
        throw new Error('the X definition under proof is missing');
      }
      return verdicts2020(underProof, witnesses);
    };

    const proof = runSemanticOutcome<
      Draft07Input,
      CastrSchemaComponent[],
      JsonSchemaNode,
      boolean[]
    >({
      // A $defs-only document: a pure-$ref member would be skipped by
      // parseJsonSchemaDocument's component extraction (by design), so the
      // boolean member X is the whole document's content.
      name: 'defs-member',
      source: { $defs: { X: false } },
      separatingSource: { $defs: { X: true } },
      parse: (input) => parseJsonSchemaDocument(input),
      write: (components) => writeJsonSchemaBundle(components),
      reparse: (bundle) => parseJsonSchemaDocument(bundle),
      equalIR: (a, b) => isDeepStrictEqual(a, b),
      sourceOracle: (input) => defVerdicts(input.$defs?.['X']),
      targetOracle: (bundle) => defVerdicts(bundle.$defs?.['X']),
      equalOracle: (a, b) => isDeepStrictEqual(a, b),
      cloneIR: persistenceCloneComponents,
    });
    expectSemanticOutcome(proof);
    expect(proof.outcome).toStrictEqual({
      case: 'defs-member',
      roundTripEqual: true,
      oraclesAgree: true,
      nonVacuous: true,
    });
  });

  it('parses a boolean document root to a single Root booleanSchema component', () => {
    const components = parseJsonSchemaDocument(false);
    expect(components).toHaveLength(1);
    expect(components[0]?.name).toBe('Root');
    expect(components[0]?.schema.booleanSchema).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Required-membership mirroring: a boolean property member still receives
// the parent's required-array mirroring on its metadata (the Zod/TS lanes
// read it for the presence chain)
// ---------------------------------------------------------------------------

describe('nested boolean-schema preservation (F-03): metadata mirroring', () => {
  it('mirrors required-array membership onto a boolean property member', () => {
    const ir = parseJsonSchema({
      type: 'object',
      properties: { x: false },
      required: ['x'],
      additionalProperties: false,
    });
    const member = ir.properties?.get('x');
    expect(member?.booleanSchema).toBe(false);
    expect(member?.metadata.required).toBe(true);
  });
});
