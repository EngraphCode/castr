import { expect, test, describe } from 'vitest';
import { attemptNonStandardPropertyRescue } from './prefix-nonstandard.js';

describe('prefix-nonstandard', () => {
  test('does nothing if the document is not an object', async () => {
    const warnings: { readonly message: string }[] = [];
    const result = await attemptNonStandardPropertyRescue(
      null,
      { valid: false, errors: [] },
      warnings,
    );
    expect(result.valid).toBe(false);
    expect(warnings).toHaveLength(0);
  });

  test('prefixes a simple non-standard property at the root', async () => {
    const doc = {
      openapi: '3.1.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
      extraDocs: 'This should be x-nonstandard-extraDocs',
    };

    const initialResult = {
      valid: false,
      errors: [{ message: 'Property extraDocs is not expected to be here', path: [] }],
    };

    const warnings: { message: string }[] = [];
    const result = await attemptNonStandardPropertyRescue(doc, initialResult, warnings);

    // validate() runs on the mutated doc, which is now valid OpenAPI 3.1.0
    expect(result.valid).toBe(true);
    expect(Reflect.get(doc, 'x-nonstandard-extraDocs')).toBe(
      'This should be x-nonstandard-extraDocs',
    );
    expect(Reflect.get(doc, 'extraDocs')).toBeUndefined();
    expect(warnings).toHaveLength(1);
    expect(warnings[0]?.message).toMatch(/Auto-prefixed non-standard property 'extraDocs'/);
  });

  test('handles nested properties and escaped json pointers', async () => {
    const doc = {
      openapi: '3.1.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {
        '/my~path/with~1slashes': {
          get: {
            responses: {
              '200': {
                description: 'Success',
                customFlag: true,
              },
            },
          },
        },
      },
    };

    const initialResult = {
      valid: false,
      errors: [
        {
          message: 'Property customFlag is not expected to be here',
          path: ['paths', '~1my~0path~1with~01slashes', 'get', 'responses', '200'],
        },
      ],
    };

    const warnings: { message: string }[] = [];
    const result = await attemptNonStandardPropertyRescue(doc, initialResult, warnings);

    expect(result.valid).toBe(true);
    const responseObject = doc.paths['/my~path/with~1slashes'].get.responses['200'];
    expect(Reflect.get(responseObject, 'x-nonstandard-customFlag')).toBe(true);
    expect(Reflect.get(responseObject, 'customFlag')).toBeUndefined();
    expect(warnings).toHaveLength(1);
  });

  test('prefixes multiple root-level non-standard properties in bounded retries', async () => {
    const doc = {
      openapi: '3.1.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
      propA: 'a',
      propB: 'b',
      propC: 'c',
      propD: 'd',
      propE: 'e',
    };

    const initialResult = {
      valid: false,
      errors: [{ message: 'Property propA is not expected to be here', path: [] }],
    };

    const warnings: { message: string }[] = [];
    const diagnostics = { retryCount: 0 };
    const result = await attemptNonStandardPropertyRescue(
      doc,
      initialResult,
      warnings,
      diagnostics,
    );

    // All five properties should be prefixed
    expect(result.valid).toBe(true);
    expect(Reflect.get(doc, 'x-nonstandard-propA')).toBe('a');
    expect(Reflect.get(doc, 'x-nonstandard-propB')).toBe('b');
    expect(Reflect.get(doc, 'x-nonstandard-propC')).toBe('c');
    expect(Reflect.get(doc, 'x-nonstandard-propD')).toBe('d');
    expect(Reflect.get(doc, 'x-nonstandard-propE')).toBe('e');
    expect(warnings).toHaveLength(5);

    // With preflight batch rescue, retryCount should be very small (≤ 5)
    expect(diagnostics.retryCount).toBeLessThanOrEqual(5);
  });

  test('prefixes multiple nested non-standard properties under the same parent in bounded retries', async () => {
    const doc = {
      openapi: '3.1.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {
        '/test': {
          get: {
            responses: {
              '200': {
                description: 'OK',
                nestedA: 1,
                nestedB: 2,
                nestedC: 3,
              },
            },
          },
        },
      },
    };

    const initialResult = {
      valid: false,
      errors: [
        {
          message: 'Property nestedA is not expected to be here',
          path: ['paths', '~1test', 'get', 'responses', '200'],
        },
      ],
    };

    const warnings: { message: string }[] = [];
    const diagnostics = { retryCount: 0 };
    const result = await attemptNonStandardPropertyRescue(
      doc,
      initialResult,
      warnings,
      diagnostics,
    );

    expect(result.valid).toBe(true);
    const response = doc.paths['/test'].get.responses['200'];
    expect(Reflect.get(response, 'x-nonstandard-nestedA')).toBe(1);
    expect(Reflect.get(response, 'x-nonstandard-nestedB')).toBe(2);
    expect(Reflect.get(response, 'x-nonstandard-nestedC')).toBe(3);
    expect(Reflect.get(response, 'nestedA')).toBeUndefined();
    expect(Reflect.get(response, 'nestedB')).toBeUndefined();
    expect(Reflect.get(response, 'nestedC')).toBeUndefined();
    expect(warnings).toHaveLength(3);

    // With preflight batch rescue, retryCount should be very small
    expect(diagnostics.retryCount).toBeLessThanOrEqual(5);
  });

  test('does not prefix x-extension properties', async () => {
    const doc = {
      openapi: '3.1.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
      'x-custom-extension': 'already valid',
    };

    const initialResult = {
      valid: true,
      errors: [],
    };

    const warnings: { message: string }[] = [];
    const result = await attemptNonStandardPropertyRescue(doc, initialResult, warnings);

    expect(result.valid).toBe(true);
    expect(Reflect.get(doc, 'x-custom-extension')).toBe('already valid');
    expect(warnings).toHaveLength(0);
  });
});
