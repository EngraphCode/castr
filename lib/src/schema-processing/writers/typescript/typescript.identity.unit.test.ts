import { describe, it, expect } from 'vitest';
import { writeTypeScript } from './index.js';
import type { TemplateContext } from '../../context/index.js';
import type { CastrDocument, CastrSchema, CastrSchemaComponent } from '../../ir/index.js';
import {
  CastrSchemaProperties,
  createMockCastrDocument,
  createMockCastrSchema,
  createMockCastrSchemaNode,
} from '../../ir/index.js';

function required(overrides: Partial<CastrSchema>): CastrSchema {
  return createMockCastrSchema({
    metadata: createMockCastrSchemaNode({ required: true }),
    ...overrides,
  });
}

function component(name: string, schema: CastrSchema): CastrSchemaComponent {
  return { type: 'schema', name, schema, metadata: schema.metadata };
}

function contextFor(ir: CastrDocument, sortedSchemaNames: readonly string[]): TemplateContext {
  return {
    sortedSchemaNames: [...sortedSchemaNames],
    endpoints: [],
    endpointsGroups: {},
    mcpTools: [],
    _ir: ir,
  };
}

describe('writers/typescript component identity', () => {
  it('emits valid symbols for component names that are not identifiers, keyed by wire name', () => {
    const ir = createMockCastrDocument({
      components: [
        component('1Name-With-Special---Characters', required({ type: 'string' })),
        component(
          'class',
          required({
            type: 'object',
            properties: new CastrSchemaProperties({
              ref: required({ $ref: '#/components/schemas/1Name-With-Special---Characters' }),
            }),
          }),
        ),
      ],
    });
    // The emit list carries full refs for document components and bare names for
    // inline components; the writer resolves both forms by wire name.
    const output = writeTypeScript(
      contextFor(ir, ['#/components/schemas/1Name-With-Special---Characters', 'class']),
    );

    expect(output).toContain('export type _1_Name_With_Special_Characters = string');
    expect(output).toContain('export const _1_Name_With_Special_Characters = z.string()');
    expect(output).toContain('export type class_ =');
    expect(output).toContain('ref: _1_Name_With_Special_Characters');
    expect(output).not.toMatch(/[:=]\s*1Name-With-Special---Characters/);
  });

  it('projects a built-in-global component name the same way in type and value position', () => {
    const ir = createMockCastrDocument({
      components: [
        component(
          'Error',
          required({
            type: 'object',
            properties: new CastrSchemaProperties({ message: required({ type: 'string' }) }),
          }),
        ),
        component(
          'Wrapper',
          required({
            type: 'object',
            properties: new CastrSchemaProperties({
              err: required({ $ref: '#/components/schemas/Error' }),
            }),
          }),
        ),
      ],
    });

    const output = writeTypeScript(
      contextFor(ir, ['#/components/schemas/Error', '#/components/schemas/Wrapper']),
    );

    expect(output).toContain('export type ErrorSchema =');
    expect(output).toContain('err: ErrorSchema;');
    expect(output).toMatch(/export const ErrorSchema\s*=/);
    expect(output).toMatch(/err: ErrorSchema\b/);
  });

  it('throws on an emit-list entry naming a component the document does not carry', () => {
    const ir = createMockCastrDocument();

    expect(() => writeTypeScript(contextFor(ir, ['#/components/schemas/Missing']))).toThrow(
      /Missing/,
    );
  });

  it('throws on a property reference to a component the document does not carry', () => {
    const ir = createMockCastrDocument({
      components: [
        component(
          'Wrapper',
          required({
            type: 'object',
            properties: new CastrSchemaProperties({
              gone: required({ $ref: '#/components/schemas/Gone' }),
            }),
          }),
        ),
      ],
    });

    expect(() => writeTypeScript(contextFor(ir, ['#/components/schemas/Wrapper']))).toThrow(
      '"#/components/schemas/Gone"',
    );
  });

  it('throws when two wire names would emit one symbol', () => {
    const ir = createMockCastrDocument({
      components: [
        component('a-b', required({ type: 'string' })),
        component('a_b', required({ type: 'number' })),
      ],
    });

    expect(() =>
      writeTypeScript(contextFor(ir, ['#/components/schemas/a-b', '#/components/schemas/a_b'])),
    ).toThrow('"a_b"');
  });

  it('throws when two components share a wire name', () => {
    const ir = createMockCastrDocument({
      components: [
        component('Pet', required({ type: 'string' })),
        component('Pet', required({ type: 'number' })),
      ],
    });

    expect(() => writeTypeScript(contextFor(ir, ['#/components/schemas/Pet']))).toThrow('"Pet"');
  });

  it('throws when a component would take a symbol the generated file declares', () => {
    const ir = createMockCastrDocument({
      components: [component('endpoints', required({ type: 'string' }))],
    });

    expect(() => writeTypeScript(contextFor(ir, ['#/components/schemas/endpoints']))).toThrow(
      '"endpoints"',
    );
  });
});
