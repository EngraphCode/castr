import { describe, it, expect } from 'vitest';
import { buildIR } from '../index.js';
import type { OpenAPIObject } from 'openapi3-ts/oas31';

describe('IR Builder - Component Schema Optionality', () => {
  it('should mark component schemas as required by default', () => {
    const doc: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              name: { type: 'string' },
            },
            required: ['name'],
          },
        },
      },
    };

    const ir = buildIR(doc);
    const userSchema = ir.components.find((c) => c.name === 'User');

    expect(userSchema).toBeDefined();

    if (userSchema?.type !== 'schema') {
      throw new Error('Expected schema component');
    }

    // Check metadata.required (boolean)
    expect(userSchema.schema.metadata.required).toBe(true);

    // Check zodChain.presence (should be empty string, NOT .optional())
    expect(userSchema.schema.metadata.zodChain.presence).toBe('');
  });
});
