/**
 * Fidelity: object schema with empty `properties` survives IR persistence (C4).
 *
 * `{ type: 'object', properties: {} }` is valid OpenAPI/JSON Schema (and a valid
 * `z.object({})`). The documented persistence surface
 * `buildIR → serializeIR → deserializeIR` must round-trip it losslessly instead
 * of throwing `Invalid CastrDocument structure`.
 *
 * @see .agent/report/initial-review/02-findings-critical.md (C4)
 */

import { describe, expect, it } from 'vitest';

import { buildIR } from '../../src/schema-processing/parsers/openapi/index.js';
import {
  CastrSchemaProperties,
  deserializeIR,
  serializeIR,
  type CastrSchemaComponent,
} from '../../src/schema-processing/ir/index.js';

const EMPTY_PROPERTIES_DOCUMENT = {
  openapi: '3.1.0',
  info: { title: 'Empty Properties Fixture', version: '1.0.0' },
  components: {
    schemas: {
      EmptyObject: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
    },
  },
};

describe('IR fidelity: object schema with empty properties (C4)', () => {
  it('round-trips buildIR → serializeIR → deserializeIR unchanged', () => {
    const ir = buildIR(EMPTY_PROPERTIES_DOCUMENT);

    const roundTripped = deserializeIR(serializeIR(ir));

    expect(roundTripped).toEqual(ir);
  });

  it('revives the empty properties map as a CastrSchemaProperties instance', () => {
    const ir = buildIR(EMPTY_PROPERTIES_DOCUMENT);

    const roundTripped = deserializeIR(serializeIR(ir));

    const schemaComponent = roundTripped.components.find(
      (component): component is CastrSchemaComponent =>
        component.type === 'schema' && component.name === 'EmptyObject',
    );
    expect(schemaComponent).toBeDefined();

    const properties = schemaComponent?.schema.properties;
    expect(properties).toBeInstanceOf(CastrSchemaProperties);
    expect([...(properties?.entries() ?? [])]).toEqual([]);
  });
});
