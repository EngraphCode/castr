/**
 * Security-formula preservation proof (proof-programme Q-03, report F-01 / review C2).
 *
 * PROVES that the OpenAPI security formula — OR across the entries of a
 * `security` array, AND across the schemes named inside one Security
 * Requirement Object — survives the full public pipeline
 * `buildIR → writeOpenApi → buildIR` with no silent regrouping: `{A AND B}`
 * and `A OR B` are distinguishable end to end, the spec's optional-security
 * alternative (`{}`) survives, duplicate alternatives are not deduplicated,
 * and alternative order is preserved as document content.
 *
 * Each formula case runs through the artifact-agnostic semantic-outcome runner
 * (`../utils/semantic-outcome-runner.ts`), whose structural non-vacuity
 * precheck recomputes that the IR equality and both oracles genuinely
 * discriminate the case's `separatingSource` — a pipeline that collapses
 * the AND-group into OR alternatives fails that precheck, which is exactly
 * defect F-01's shape. The IR clone override routes through
 * `serializeIR`/`deserializeIR`, so every case also proves the security
 * formula survives the IR persistence boundary.
 *
 * Scope notes, deliberate:
 *
 * - Sources are hand-authored canonical 3.2.0 documents fed straight to
 *   `buildIR` — the runner is synchronous, so the async
 *   `loadOpenApiDocument` preparation boundary is NOT exercised here.
 * - Operation-override cases separately prove absent security, `[]` and
 *   `[{}]` under global authentication through explicit parse, persistence,
 *   write and reparse boundaries, including authored property presence and
 *   an independent observation of anonymous access.
 */

import { isDeepStrictEqual } from 'node:util';

import { describe, expect, it } from 'vitest';

import { buildIR } from '../../src/schema-processing/parsers/openapi/index.js';
import { deserializeIR, serializeIR } from '../../src/schema-processing/ir/index.js';
import { writeOpenApi } from '../../src/schema-processing/writers/openapi/index.js';
import type {
  OpenAPIDocument,
  SecurityRequirementObject,
  SecuritySchemeObject,
} from '../../src/shared/openapi-types.js';
import {
  expectSemanticOutcome,
  runSemanticOutcome,
  type SemanticCase,
} from '../utils/semantic-outcome-runner.js';

/**
 * The proof's source-document shape: one operation at a fixed path, the two
 * security surfaces injectable per case, and the schemes the requirements
 * name declared in components so the document is self-contained.
 */
interface ProofDocument {
  readonly openapi: string;
  readonly info: { readonly title: string; readonly version: string };
  readonly security?: SecurityRequirementObject[];
  readonly paths: {
    readonly '/items': {
      readonly get: {
        readonly security?: SecurityRequirementObject[];
        readonly responses: { readonly '200': { readonly description: string } };
      };
    };
  };
  readonly components: {
    readonly securitySchemes: Record<string, SecuritySchemeObject>;
  };
}

/**
 * One AND-group of the formula: the schemes of a single Security Requirement
 * Object, in authored key order, each with its scope list verbatim.
 */
type FormulaGroup = { readonly schemeName: string; readonly scopes: string[] }[];

/**
 * The whole security formula of a document, both surfaces, with grouping and
 * order preserved exactly as authored — never sorted, merged, or flattened.
 */
interface SecurityFormula {
  readonly document: FormulaGroup[] | undefined;
  readonly operation: FormulaGroup[] | undefined;
}

const SECURITY_SCHEMES: ProofDocument['components']['securitySchemes'] = {
  alphaAuth: { type: 'http', scheme: 'bearer' },
  betaAuth: { type: 'http', scheme: 'basic' },
  oauthAuth: { type: 'http', scheme: 'bearer' },
};

function makeOperationSecurityDoc(security: SecurityRequirementObject[]): ProofDocument {
  return {
    openapi: '3.2.0',
    info: { title: 'Security Formula Proof', version: '1.0.0' },
    paths: {
      '/items': {
        get: {
          security,
          responses: { '200': { description: 'OK' } },
        },
      },
    },
    components: { securitySchemes: SECURITY_SCHEMES },
  };
}

function makeDocumentSecurityDoc(security: SecurityRequirementObject[]): ProofDocument {
  return {
    openapi: '3.2.0',
    info: { title: 'Security Formula Proof', version: '1.0.0' },
    security,
    paths: {
      '/items': {
        get: {
          responses: { '200': { description: 'OK' } },
        },
      },
    },
    components: { securitySchemes: SECURITY_SCHEMES },
  };
}

function requirementFormula(requirement: SecurityRequirementObject): FormulaGroup {
  return Object.entries(requirement).map(([schemeName, scopes]) => ({ schemeName, scopes }));
}

function formulaOf(security: SecurityRequirementObject[] | undefined): FormulaGroup[] | undefined {
  return security?.map(requirementFormula);
}

function sourceFormula(source: ProofDocument): SecurityFormula {
  return {
    document: formulaOf(source.security),
    operation: formulaOf(source.paths['/items'].get.security),
  };
}

function outputFormula(output: OpenAPIDocument): SecurityFormula {
  return {
    document: formulaOf(output.security),
    operation: formulaOf(output.paths?.['/items']?.get?.security),
  };
}

function makeCase(
  name: string,
  source: ProofDocument,
  separatingSource: ProofDocument,
): SemanticCase<ProofDocument, ReturnType<typeof buildIR>, OpenAPIDocument, SecurityFormula> {
  return {
    name,
    source,
    separatingSource,
    parse: (doc) => buildIR(doc),
    write: (ir) => writeOpenApi(ir),
    reparse: (output) => buildIR(output),
    // Whole-document IR equality via the persistence surface: two IRs are
    // equal exactly when they serialise identically.
    equalIR: (a, b) => serializeIR(a) === serializeIR(b),
    sourceOracle: sourceFormula,
    targetOracle: outputFormula,
    equalOracle: (a, b) => isDeepStrictEqual(a, b),
    // CastrDocument carries branded class values (`CastrSchemaProperties`),
    // which the runner's default `structuredClone` would silently de-brand;
    // the serialisation round trip is the faithful clone AND the proof that
    // the security formula survives IR persistence (Q-03's named surface).
    cloneIR: (ir) => deserializeIR(serializeIR(ir)),
  };
}

describe('security formula preservation (F-01): parse → write → reparse', () => {
  it('preserves an operation-level AND-group as distinct from its OR flattening', () => {
    const proof = runSemanticOutcome(
      makeCase(
        'operation-and-group',
        makeOperationSecurityDoc([{ alphaAuth: [], betaAuth: [] }]),
        makeOperationSecurityDoc([{ alphaAuth: [] }, { betaAuth: [] }]),
      ),
    );
    expectSemanticOutcome(proof);
    expect(proof.outcome).toStrictEqual({
      case: 'operation-and-group',
      roundTripEqual: true,
      oraclesAgree: true,
      nonVacuous: true,
    });
  });

  it('preserves a document-level AND-group as distinct from its OR flattening', () => {
    const proof = runSemanticOutcome(
      makeCase(
        'document-and-group',
        makeDocumentSecurityDoc([{ alphaAuth: [], betaAuth: [] }]),
        makeDocumentSecurityDoc([{ alphaAuth: [] }, { betaAuth: [] }]),
      ),
    );
    expectSemanticOutcome(proof);
    expect(proof.outcome).toStrictEqual({
      case: 'document-and-group',
      roundTripEqual: true,
      oraclesAgree: true,
      nonVacuous: true,
    });
  });

  it('preserves the optional-security alternative ({}) instead of dropping it', () => {
    const proof = runSemanticOutcome(
      makeCase(
        'optional-security-alternative',
        makeOperationSecurityDoc([{}, { oauthAuth: ['read:items', 'write:items'] }]),
        makeOperationSecurityDoc([{ oauthAuth: ['read:items', 'write:items'] }]),
      ),
    );
    expectSemanticOutcome(proof);
    expect(proof.outcome).toStrictEqual({
      case: 'optional-security-alternative',
      roundTripEqual: true,
      oraclesAgree: true,
      nonVacuous: true,
    });
  });

  // Positive control: duplicate alternatives involve no AND-group, so this
  // case pins that legal duplicates (`[{a},{a}]`) are never deduplicated —
  // it holds on the pre-fix pipeline too, proving the red cases above are
  // red for the formula defect, not for some unrelated breakage.
  it('preserves duplicate alternatives without deduplication (positive control)', () => {
    const proof = runSemanticOutcome(
      makeCase(
        'duplicate-alternatives',
        makeOperationSecurityDoc([{ alphaAuth: [] }, { alphaAuth: [] }]),
        makeOperationSecurityDoc([{ alphaAuth: [] }]),
      ),
    );
    expectSemanticOutcome(proof);
    expect(proof.outcome).toStrictEqual({
      case: 'duplicate-alternatives',
      roundTripEqual: true,
      oraclesAgree: true,
      nonVacuous: true,
    });
  });

  it('preserves authored alternative order as document content', () => {
    const proof = runSemanticOutcome(
      makeCase(
        'alternative-order-preservation',
        makeOperationSecurityDoc([{ betaAuth: [] }, { alphaAuth: [] }]),
        makeOperationSecurityDoc([{ alphaAuth: [] }, { betaAuth: [] }]),
      ),
    );
    expectSemanticOutcome(proof);
    expect(proof.outcome).toStrictEqual({
      case: 'alternative-order-preservation',
      roundTripEqual: true,
      oraclesAgree: true,
      nonVacuous: true,
    });
  });
});

/**
 * An independent observation of the OpenAPI document's anonymous-access
 * contract, without Castr's IR or security projection helpers.
 * @see https://spec.openapis.org/oas/v3.2.0.html#operation-object
 * @see https://spec.openapis.org/oas/v3.2.0.html#security-requirement-object
 */
function permitsAnonymousAccess(
  documentSecurity: SecurityRequirementObject[] | undefined,
  operationSecurity: SecurityRequirementObject[] | undefined,
): boolean {
  const effectiveSecurity = operationSecurity ?? documentSecurity;
  return (
    effectiveSecurity === undefined ||
    effectiveSecurity.length === 0 ||
    effectiveSecurity.some((requirement) => Object.keys(requirement).length === 0)
  );
}

function makeGlobalSecurityDoc(
  operationSecurity: SecurityRequirementObject[] | undefined,
): ProofDocument {
  const security = [{ alphaAuth: [] }];
  return operationSecurity === undefined
    ? makeDocumentSecurityDoc(security)
    : { ...makeOperationSecurityDoc(operationSecurity), security };
}

describe('operation security overrides: parse → persist → write → reparse', () => {
  it.each([
    { name: 'absent', security: undefined, own: false, anonymous: false },
    { name: 'empty array', security: [], own: true, anonymous: true },
    { name: 'anonymous alternative', security: [{}], own: true, anonymous: true },
  ])('preserves $name under global authentication', ({ security, own, anonymous }) => {
    const source = makeGlobalSecurityDoc(security);
    const sourceOperation = source.paths['/items'].get;
    const parsed = buildIR(source);
    const serialized = serializeIR(parsed);
    const restored = deserializeIR(serialized);
    const output = writeOpenApi(restored);
    const outputOperation = output.paths?.['/items']?.get;
    const reparsed = buildIR(output);

    expect(Object.hasOwn(sourceOperation, 'security')).toBe(own);
    expect(Object.hasOwn(parsed.operations[0] ?? {}, 'security')).toBe(own);
    expect(Object.hasOwn(restored.operations[0] ?? {}, 'security')).toBe(own);
    expect(serializeIR(restored)).toBe(serialized);
    expect(Object.hasOwn(outputOperation ?? {}, 'security')).toBe(own);
    expect(outputOperation?.security).toStrictEqual(security);
    expect(output.security).toStrictEqual(source.security);
    expect(Object.hasOwn(reparsed.operations[0] ?? {}, 'security')).toBe(own);
    expect(serializeIR(reparsed)).toBe(serialized);
    expect(permitsAnonymousAccess(source.security, sourceOperation.security)).toBe(anonymous);
    expect(permitsAnonymousAccess(output.security, outputOperation?.security)).toBe(anonymous);
  });
});
