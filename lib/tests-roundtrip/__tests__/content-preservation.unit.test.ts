/**
 * Content Preservation Unit Tests
 *
 * Tests that validate NO CONTENT LOSS during round-trip transformation.
 * These tests specifically target bugs discovered during manual review:
 *
 * 1. Header description loss — HeaderObject.description not preserved
 * 2. Path-level parameter ref expansion — $ref replaced with inline copies
 *
 * @see ADR-027 Round-Trip Validation as Correctness Proof
 */

import { describe, expect, it } from 'vitest';
import { resolve } from 'node:path';
import type { HeaderObject, PathsObject } from 'openapi3-ts/oas31';

import { buildIR } from '../../src/parsers/openapi/index.js';
import { loadOpenApiDocument } from '../../src/shared/load-openapi-document/index.js';
import { writeOpenApi } from '../../src/writers/openapi/index.js';

// ============================================================================
// Bug #1: Header Description Loss
// ============================================================================

describe('Content Preservation: Header Description', () => {
  it('preserves header description through round-trip', async () => {
    // Petstore has a header with description
    const fixturePath = resolve(import.meta.dirname, '../__fixtures__/arbitrary/petstore-3.0.yaml');

    // Load and transform
    const result = await loadOpenApiDocument(fixturePath);
    const ir = buildIR(result.document);
    const output = writeOpenApi(ir);

    // The x-next header should preserve its description
    const paths = output.paths as PathsObject;
    const petsPath = paths['/pets'];
    const getOp = petsPath?.get;
    const response200 = getOp?.responses?.['200'];

    // Type guard for response object (not $ref)
    if (response200 === undefined || '$ref' in response200) {
      throw new Error('Expected response object, not $ref');
    }

    const headers = response200.headers;
    expect(headers).toBeDefined();

    const xNextHeader = headers?.['x-next'] as HeaderObject | undefined;
    expect(xNextHeader).toBeDefined();

    // BUG: header description is currently lost
    expect(xNextHeader?.description).toBe('A link to the next page of responses');
  });
});

// ============================================================================
// Bug #2: Path-Level Parameter Ref Expansion
// ============================================================================

describe('Content Preservation: Path-Level Parameter Refs', () => {
  it('preserves path-level parameter $refs instead of expanding them', async () => {
    // Tictactoe has path-level parameters as $refs
    const fixturePath = resolve(
      import.meta.dirname,
      '../__fixtures__/arbitrary/tictactoe-3.1.yaml',
    );

    // Load and transform
    const result = await loadOpenApiDocument(fixturePath);
    const ir = buildIR(result.document);
    const output = writeOpenApi(ir);

    // Check that path-level parameters are preserved as refs
    const paths = output.paths as PathsObject;
    const boardPath = paths['/board/{row}/{column}'];

    // Path-level parameters should exist and be refs
    expect(boardPath?.parameters).toBeDefined();
    expect(Array.isArray(boardPath?.parameters)).toBe(true);

    // BUG: refs are currently expanded to inline objects
    const firstParam = boardPath?.parameters?.[0];
    expect(firstParam).toHaveProperty('$ref');
    expect(firstParam).toEqual({ $ref: '#/components/parameters/rowParam' });
  });
});
