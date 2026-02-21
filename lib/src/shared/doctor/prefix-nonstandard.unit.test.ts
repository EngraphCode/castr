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
      errors: [{ message: 'Property extraDocs is not expected to be here', path: '' }],
    };

    const warnings: { message: string }[] = [];
    const result = await attemptNonStandardPropertyRescue(doc, initialResult, warnings);

    // validate() runs on the mutated doc, which is now valid OpenAPI 3.1.0
    expect(result.valid).toBe(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((doc as any)['x-nonstandard-extraDocs']).toBe('This should be x-nonstandard-extraDocs');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((doc as any).extraDocs).toBeUndefined();
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
          path: '/paths/~1my~0path~1with~01slashes/get/responses/200',
        },
      ],
    };

    const warnings: { message: string }[] = [];
    const result = await attemptNonStandardPropertyRescue(doc, initialResult, warnings);

    expect(result.valid).toBe(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const responseObj = (doc as any).paths['/my~path/with~1slashes'].get.responses['200'];
    expect(responseObj['x-nonstandard-customFlag']).toBe(true);
    expect(responseObj.customFlag).toBeUndefined();
    expect(warnings).toHaveLength(1);
  });

  test('ignores missing errors or paths', async () => {
    const doc = {
      openapi: '3.1.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
      customFlag: true,
    };

    const initialResult = {
      valid: false,
      errors: [
        { message: 'Some other error', path: '/info' },
        { message: 'Property customFlag is not expected to be here', path: '/invalid/path' },
      ],
    };

    const warnings: { message: string }[] = [];
    const result = await attemptNonStandardPropertyRescue(doc, initialResult, warnings);

    // Should still be invalid because fixing failed / other errors exist
    expect(result.valid).toBe(false);
    expect(warnings).toHaveLength(0);
  });
});
