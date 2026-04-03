import { describe, expect, it } from 'vitest';
import { preflightValidate } from './preflight-validator.js';

describe('preflight-validator', () => {
  it('returns valid for a well-formed OpenAPI 3.1 document', async () => {
    const document = {
      openapi: '3.1.0',
      info: { title: 'Valid API', version: '1.0.0' },
      paths: {},
    };

    const result = await preflightValidate(document);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns valid for a well-formed OpenAPI 3.2 document', async () => {
    const document = {
      openapi: '3.2.0',
      info: { title: 'Valid API', version: '1.0.0' },
      paths: {},
    };

    const result = await preflightValidate(document);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns all unevaluatedProperties errors in a single pass', async () => {
    const document = {
      openapi: '3.1.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
      extraA: 'should be found',
      extraB: 'should also be found',
      extraC: 'and this too',
    };

    const result = await preflightValidate(document);
    expect(result.valid).toBe(false);

    // OpenAPI 3.1 uses JSON Schema 2020-12's unevaluatedProperties, not additionalProperties.
    // With allErrors: true, AJV returns one error per non-standard property in a single pass.
    const unevalErrors = result.errors.filter((e) => e.keyword === 'unevaluatedProperties');
    const foundProps = unevalErrors.map((e) =>
      typeof e.params['unevaluatedProperty'] === 'string'
        ? e.params['unevaluatedProperty']
        : undefined,
    );

    expect(foundProps).toContain('extraA');
    expect(foundProps).toContain('extraB');
    expect(foundProps).toContain('extraC');
  });

  it('returns nested unevaluatedProperties errors', async () => {
    const document = {
      openapi: '3.1.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {
        '/test': {
          get: {
            responses: {
              '200': {
                description: 'OK',
                nestedExtra: 'should be found',
              },
            },
            customFlag: true,
          },
        },
      },
    };

    const result = await preflightValidate(document);
    expect(result.valid).toBe(false);

    const unevalErrors = result.errors.filter((e) => e.keyword === 'unevaluatedProperties');

    // Should find non-standard properties at multiple nesting levels
    expect(unevalErrors.length).toBeGreaterThanOrEqual(2);
  });
});
