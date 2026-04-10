import { describe, expect, it } from 'vitest';
import { isOpenAPIDocument } from './cli-type-guards.js';

describe('isOpenAPIDocument', () => {
  it('rejects documents missing info', () => {
    expect(
      isOpenAPIDocument({
        openapi: '3.2.0',
        paths: {},
      }),
    ).toBe(false);
  });

  it('rejects documents missing info.title', () => {
    expect(
      isOpenAPIDocument({
        openapi: '3.2.0',
        info: { version: '1.0.0' },
        paths: {},
      }),
    ).toBe(false);
  });

  it('rejects documents missing info.version', () => {
    expect(
      isOpenAPIDocument({
        openapi: '3.2.0',
        info: { title: 'Test API' },
        paths: {},
      }),
    ).toBe(false);
  });

  it('rejects documents with server entries missing url', () => {
    expect(
      isOpenAPIDocument({
        openapi: '3.2.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
        servers: [{ description: 'Broken server' }],
      }),
    ).toBe(false);
  });

  it('accepts 3.2 responses without description', () => {
    expect(
      isOpenAPIDocument({
        openapi: '3.2.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/users': {
            get: {
              responses: {
                '200': {
                  content: {
                    'application/json': {
                      schema: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ).toBe(true);
  });
});
