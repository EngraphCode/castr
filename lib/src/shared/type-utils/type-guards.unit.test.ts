import { describe, expect, it } from 'vitest';
import { CastrSchemaProperties } from '../../schema-processing/ir/index.js';
import { isCastrSchemaProperties } from './type-guards.js';

function createStringSchema() {
  return {
    type: 'string' as const,
    metadata: {
      required: false,
      nullable: false,
      zodChain: { presence: '', validations: [], defaults: [] },
      dependencyGraph: { references: [], referencedBy: [], depth: 0 },
      circularReferences: [],
    },
  };
}

function createCrossRealmLikeProperties() {
  const live = new CastrSchemaProperties({
    name: createStringSchema(),
  });

  const crossRealmLike = {
    get: live.get.bind(live),
    has: live.has.bind(live),
    entries: live.entries.bind(live),
  };

  Object.defineProperty(crossRealmLike, Symbol.for('@engraph/castr/CastrSchemaProperties'), {
    value: true,
    enumerable: false,
    configurable: false,
    writable: false,
  });

  return crossRealmLike;
}

describe('isCastrSchemaProperties', () => {
  it('accepts a live branded instance', () => {
    expect(isCastrSchemaProperties(new CastrSchemaProperties({ name: createStringSchema() }))).toBe(
      true,
    );
  });

  it('accepts a branded cross-realm-like object', () => {
    const crossRealmLike = createCrossRealmLikeProperties();

    expect(crossRealmLike).not.toBeInstanceOf(CastrSchemaProperties);
    expect(isCastrSchemaProperties(crossRealmLike)).toBe(true);
  });

  it('rejects the serialized toJSON envelope', () => {
    const serialized = new CastrSchemaProperties({ name: createStringSchema() }).toJSON();

    expect(isCastrSchemaProperties(serialized)).toBe(false);
  });
});
