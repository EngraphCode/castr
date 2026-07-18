/**
 * Fidelity proofs: security AND-groups (C2), component-name identity (C3),
 * and empty-string descriptions (M10).
 *
 * Each test drives the real pipeline (loadOpenApiDocument → buildIR →
 * writeOpenApi / code generation) against a minimal edge-case fixture and
 * asserts the behaviour the losslessness doctrine requires:
 *
 * - C2: a SecurityRequirementObject with multiple schemes means logical AND.
 *   It must survive `buildIR` → `writeOpenApi` as ONE requirement object and
 *   resolve to ONE MCP requirement set containing all schemes.
 * - C3: the original component key (e.g. `Basic.Thing`) is the IR identity.
 *   Written documents must keep the original key so every `$ref` resolves;
 *   sanitisation happens only when emitting code symbols.
 * - M10: an explicit empty-string description/summary is a distinct valid
 *   value and must round-trip, not be dropped by truthy guards.
 */

import { describe, expect, it } from 'vitest';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildIR,
  generateZodFromOpenAPI,
  loadOpenApiDocument,
  writeOpenApi,
} from '../utils/transform-helpers.js';
import { resolveOperationSecurityFromIR } from '../../src/schema-processing/context/mcp/template-context.mcp.security.from-ir.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EDGE_CASES_DIR = resolve(__dirname, '../__fixtures__/edge-cases');
const SECURITY_AND_GROUP_FIXTURE = resolve(EDGE_CASES_DIR, 'security-and-group.yaml');
const DOTTED_COMPONENT_NAME_FIXTURE = resolve(EDGE_CASES_DIR, 'dotted-component-name.yaml');
const EMPTY_STRING_DESCRIPTIONS_FIXTURE = resolve(EDGE_CASES_DIR, 'empty-string-descriptions.yaml');
const OPTIONAL_AND_PUBLIC_SECURITY_FIXTURE = resolve(
  EDGE_CASES_DIR,
  'security-optional-and-public.yaml',
);

const SCHEMA_REF_PREFIX = '#/components/schemas/';

/**
 * Recursively collect every `$ref` string value in a document.
 */
function collectRefs(value: unknown, refs: string[] = []): string[] {
  if (Array.isArray(value)) {
    for (const entry of value) {
      collectRefs(entry, refs);
    }
    return refs;
  }
  if (value !== null && typeof value === 'object') {
    for (const [key, entry] of Object.entries(value)) {
      if (key === '$ref' && typeof entry === 'string') {
        refs.push(entry);
      } else {
        collectRefs(entry, refs);
      }
    }
  }
  return refs;
}

describe('C2: security AND-groups survive the round-trip', () => {
  it('writes one requirement object per AND-set at operation and document level', async () => {
    const { document } = await loadOpenApiDocument(SECURITY_AND_GROUP_FIXTURE);
    const ir = buildIR(document);
    const out = writeOpenApi(ir);

    // One requirement object containing BOTH schemes = "apiKey AND oauth2".
    // Two separate objects would weaken the requirement to "apiKey OR oauth2".
    expect(out.paths?.['/things']?.get?.security).toEqual([{ apiKey: [], oauth2: ['read'] }]);
    expect(out.security).toEqual([{ apiKey: [], oauth2: ['read'] }]);
  });

  it('models the AND-set in the IR as one requirement set', async () => {
    const { document } = await loadOpenApiDocument(SECURITY_AND_GROUP_FIXTURE);
    const ir = buildIR(document);

    expect(ir.operations[0]?.security).toEqual([
      {
        schemes: [
          { schemeName: 'apiKey', scopes: [] },
          { schemeName: 'oauth2', scopes: ['read'] },
        ],
      },
    ]);
    expect(ir.security).toEqual([
      {
        schemes: [
          { schemeName: 'apiKey', scopes: [] },
          { schemeName: 'oauth2', scopes: ['read'] },
        ],
      },
    ]);
  });

  it('resolves the AND-set as one MCP requirement set carrying both schemes', async () => {
    const { document } = await loadOpenApiDocument(SECURITY_AND_GROUP_FIXTURE);
    const ir = buildIR(document);

    const operation = ir.operations[0];
    expect(operation).toBeDefined();
    const security = resolveOperationSecurityFromIR(ir, operation ?? {});

    expect(security.isPublic).toBe(false);
    expect(security.requirementSets).toHaveLength(1);
    expect(security.requirementSets[0]?.schemes.map((scheme) => scheme.schemeName)).toEqual([
      'apiKey',
      'oauth2',
    ]);
  });
});

describe('optional security: the empty requirement object {} is preserved', () => {
  it('carries {} into the IR as an empty requirement set at both levels', async () => {
    const { document } = await loadOpenApiDocument(OPTIONAL_AND_PUBLIC_SECURITY_FIXTURE);
    const ir = buildIR(document);

    // Document level: "apiKey OR unauthenticated" — the {} alternative makes
    // authentication optional and must survive as an empty schemes set.
    expect(ir.security).toEqual([
      { schemes: [{ schemeName: 'apiKey', scopes: [] }] },
      { schemes: [] },
    ]);

    const optionalOperation = ir.operations.find(
      (operation) => operation.operationId === 'getOptional',
    );
    expect(optionalOperation?.security).toEqual([{ schemes: [] }]);
  });

  it('re-emits {} as an empty requirement object', async () => {
    const { document } = await loadOpenApiDocument(OPTIONAL_AND_PUBLIC_SECURITY_FIXTURE);
    const ir = buildIR(document);
    const out = writeOpenApi(ir);

    // The writer sorts alternatives deterministically; the empty set sorts first.
    expect(out.security).toEqual([{}, { apiKey: [] }]);
    expect(out.paths?.['/optional']?.get?.security).toEqual([{}]);
  });

  it('represents {} in MCP metadata as an alternative with zero required schemes', async () => {
    const { document } = await loadOpenApiDocument(OPTIONAL_AND_PUBLIC_SECURITY_FIXTURE);
    const ir = buildIR(document);

    const optionalOperation = ir.operations.find(
      (operation) => operation.operationId === 'getOptional',
    );
    expect(optionalOperation).toBeDefined();
    const optionalSecurity = resolveOperationSecurityFromIR(ir, optionalOperation ?? {});

    // Optional auth is NOT public: a requirement set exists, it just demands
    // no schemes. Collapsing this to isPublic would lose the distinction.
    expect(optionalSecurity.isPublic).toBe(false);
    expect(optionalSecurity.usesGlobalSecurity).toBe(false);
    expect(optionalSecurity.requirementSets).toEqual([{ schemes: [] }]);

    const inheritingOperation = ir.operations.find(
      (operation) => operation.operationId === 'getInherits',
    );
    expect(inheritingOperation).toBeDefined();
    const inheritedSecurity = resolveOperationSecurityFromIR(ir, inheritingOperation ?? {});

    expect(inheritedSecurity.isPublic).toBe(false);
    expect(inheritedSecurity.usesGlobalSecurity).toBe(true);
    expect(inheritedSecurity.requirementSets).toHaveLength(2);
    expect(inheritedSecurity.requirementSets[0]?.schemes.map((s) => s.schemeName)).toEqual([
      'apiKey',
    ]);
    expect(inheritedSecurity.requirementSets[1]?.schemes).toEqual([]);
  });

  it('is round-trip stable through a second parse and write', async () => {
    const { document } = await loadOpenApiDocument(OPTIONAL_AND_PUBLIC_SECURITY_FIXTURE);
    const out = writeOpenApi(buildIR(document));
    const out2 = writeOpenApi(buildIR(out));

    expect(out2).toEqual(out);
  });
});

describe('operation-level security: [] is an explicit public override, distinct from absent', () => {
  it('carries the empty array into the IR distinct from undefined', async () => {
    const { document } = await loadOpenApiDocument(OPTIONAL_AND_PUBLIC_SECURITY_FIXTURE);
    const ir = buildIR(document);

    const publicOperation = ir.operations.find(
      (operation) => operation.operationId === 'getPublic',
    );
    expect(publicOperation?.security).toEqual([]);

    const inheritingOperation = ir.operations.find(
      (operation) => operation.operationId === 'getInherits',
    );
    expect(inheritingOperation).toBeDefined();
    expect(inheritingOperation?.security).toBeUndefined();
  });

  it('writes security: [] back out so the override still disables document security', async () => {
    const { document } = await loadOpenApiDocument(OPTIONAL_AND_PUBLIC_SECURITY_FIXTURE);
    const ir = buildIR(document);
    const out = writeOpenApi(ir);

    // Dropping the empty array would silently re-attach the document-level
    // requirement to a deliberately public operation.
    expect(out.paths?.['/public']?.get?.security).toEqual([]);
    expect(out.paths?.['/inherits']?.get).not.toHaveProperty('security');
  });

  it('resolves the override as public in MCP metadata, without touching inheritance', async () => {
    const { document } = await loadOpenApiDocument(OPTIONAL_AND_PUBLIC_SECURITY_FIXTURE);
    const ir = buildIR(document);

    const publicOperation = ir.operations.find(
      (operation) => operation.operationId === 'getPublic',
    );
    expect(publicOperation).toBeDefined();
    const publicSecurity = resolveOperationSecurityFromIR(ir, publicOperation ?? {});

    expect(publicSecurity.isPublic).toBe(true);
    expect(publicSecurity.usesGlobalSecurity).toBe(false);
    expect(publicSecurity.requirementSets).toEqual([]);
  });
});

describe('C3: original component names are the IR identity', () => {
  it('preserves the dotted component key and keeps every $ref resolvable', async () => {
    const { document } = await loadOpenApiDocument(DOTTED_COMPONENT_NAME_FIXTURE);
    const ir = buildIR(document);
    const out = writeOpenApi(ir);

    const schemas = out.components?.schemas ?? {};
    expect(Object.keys(schemas).sort()).toEqual(['Basic.Thing', 'Ref']);

    const refs = collectRefs(out);
    expect(refs.length).toBeGreaterThan(0);
    for (const ref of refs) {
      expect(ref.startsWith(SCHEMA_REF_PREFIX), `unexpected ref shape: ${ref}`).toBe(true);
      const componentKey = ref.slice(SCHEMA_REF_PREFIX.length);
      expect(schemas[componentKey], `dangling $ref: ${ref}`).toBeDefined();
    }

    // The written document must itself be parseable again.
    expect(() => buildIR(out)).not.toThrow();
  });

  it('sanitises component names only when emitting code symbols', async () => {
    const { document } = await loadOpenApiDocument(DOTTED_COMPONENT_NAME_FIXTURE);
    const zodSource = await generateZodFromOpenAPI(document);

    // The dotted component must be emitted under a valid identifier, and no
    // emitted symbol may retain the raw dotted name (which would reference a
    // non-existent `Basic` namespace in generated TypeScript).
    expect(zodSource).toContain('Basic_Thing');
    expect(zodSource).not.toContain('Basic.Thing');
  });
});

describe('M10: empty-string descriptions are distinct from absent', () => {
  it('carries explicit empty strings into the IR', async () => {
    const { document } = await loadOpenApiDocument(EMPTY_STRING_DESCRIPTIONS_FIXTURE);
    const ir = buildIR(document);

    const operation = ir.operations[0];
    expect(operation?.summary).toBe('');
    expect(operation?.description).toBe('');
    expect(operation?.parameters[0]?.description).toBe('');
    expect(operation?.requestBody?.description).toBe('');
    expect(operation?.responses[0]?.description).toBe('');
    expect(ir.enums.get('Color')?.description).toBe('');
  });

  it('writes explicit empty strings back out', async () => {
    const { document } = await loadOpenApiDocument(EMPTY_STRING_DESCRIPTIONS_FIXTURE);
    const ir = buildIR(document);
    const out = writeOpenApi(ir);

    const operation = out.paths?.['/items']?.post;
    expect(operation?.summary).toBe('');
    expect(operation?.description).toBe('');
    expect(operation?.parameters?.[0]).toMatchObject({ description: '' });
    expect(operation?.requestBody).toMatchObject({ description: '' });
    expect(operation?.responses?.['200']).toMatchObject({ description: '' });
  });
});
