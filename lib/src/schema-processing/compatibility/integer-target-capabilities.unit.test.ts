import type { HeaderObject, PathItemObject } from 'openapi3-ts/oas31';
import { describe, expect, it } from 'vitest';
import { CANONICAL_OPENAPI_TARGET_LABEL } from '../../shared/openapi/version.js';
import {
  CastrSchemaProperties,
  createMockCastrDocument,
  createMockCastrSchema,
  createMockCastrSchemaNode,
} from '../ir/index.js';
import type { CastrSchema, CastrSchemaComponent } from '../ir/index.js';
import {
  assertDocumentSupportsIntegerTargetCapabilities,
  assertPortableIntegerInputSemanticsSupported,
  assertSchemaComponentsSupportIntegerTargetCapabilities,
  assertSchemaSupportsIntegerTargetCapabilities,
} from './integer-target-capabilities.js';

const INT64_ERROR = /JSON Schema 2020-12 cannot represent signed 64-bit integer semantics natively/;
const BIGINT_ERROR = /cannot represent arbitrary-precision bigint natively/;

function createInt64Schema(): CastrSchema {
  return createMockCastrSchema({
    type: 'integer',
    format: 'int64',
    integerSemantics: 'int64',
  });
}

function createBigIntSchema(): CastrSchema {
  return createMockCastrSchema({
    type: 'integer',
    integerSemantics: 'bigint',
  });
}

function createBigIntHeaderComponentSchema(): HeaderObject {
  return {
    schema: {
      type: 'integer',
      format: 'bigint',
    },
  };
}

function createRefSiblingBigIntHeaderComponentSchema(
  type: 'integer' | ['integer', 'null'] = 'integer',
): HeaderObject {
  return {
    schema: {
      $ref: '#/components/schemas/Count',
      type,
      format: 'bigint',
    },
  };
}

function createBigIntWebhookPathItem(): PathItemObject {
  return {
    post: {
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'integer',
              format: 'bigint',
            },
          },
        },
      },
      responses: {
        '204': {
          description: 'Accepted',
        },
      },
    },
  };
}

function createRefSiblingBigIntWebhookPathItem(
  type: 'integer' | ['integer', 'null'],
): PathItemObject {
  return {
    post: {
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Count',
              type,
              format: 'bigint',
            },
          },
        },
      },
      responses: {
        '204': {
          description: 'Accepted',
        },
      },
    },
  };
}

const nestedSchemaCases = [
  {
    label: 'properties',
    wrap: (child: CastrSchema) =>
      createMockCastrSchema({
        type: 'object',
        properties: new CastrSchemaProperties({ nested: child }),
      }),
  },
  {
    label: 'additionalProperties',
    wrap: (child: CastrSchema) =>
      createMockCastrSchema({
        type: 'object',
        additionalProperties: child,
      }),
  },
  {
    label: 'items',
    wrap: (child: CastrSchema) =>
      createMockCastrSchema({
        type: 'array',
        items: child,
      }),
  },
  {
    label: 'tuple items',
    wrap: (child: CastrSchema) =>
      createMockCastrSchema({
        type: 'array',
        items: [child],
      }),
  },
  {
    label: 'prefixItems',
    wrap: (child: CastrSchema) =>
      createMockCastrSchema({
        type: 'array',
        prefixItems: [child],
      }),
  },
  {
    label: 'allOf',
    wrap: (child: CastrSchema) =>
      createMockCastrSchema({
        allOf: [child],
      }),
  },
  {
    label: 'oneOf',
    wrap: (child: CastrSchema) =>
      createMockCastrSchema({
        oneOf: [child],
      }),
  },
  {
    label: 'anyOf',
    wrap: (child: CastrSchema) =>
      createMockCastrSchema({
        anyOf: [child],
      }),
  },
  {
    label: 'not',
    wrap: (child: CastrSchema) =>
      createMockCastrSchema({
        not: child,
      }),
  },
  {
    label: 'unevaluatedProperties',
    wrap: (child: CastrSchema) =>
      createMockCastrSchema({
        type: 'object',
        unevaluatedProperties: child,
      }),
  },
  {
    label: 'unevaluatedItems',
    wrap: (child: CastrSchema) =>
      createMockCastrSchema({
        type: 'array',
        unevaluatedItems: child,
      }),
  },
  {
    label: 'dependentSchemas',
    wrap: (child: CastrSchema) =>
      createMockCastrSchema({
        type: 'object',
        dependentSchemas: { nested: child },
      }),
  },
] as const;

describe('assertSchemaSupportsIntegerTargetCapabilities', () => {
  it.each(nestedSchemaCases)(
    'rejects nested int64 semantics in %s when JSON Schema cannot represent them',
    ({ wrap }) => {
      expect(() =>
        assertSchemaSupportsIntegerTargetCapabilities(
          wrap(createInt64Schema()),
          'JSON Schema 2020-12',
        ),
      ).toThrow(INT64_ERROR);
    },
  );

  it.each(nestedSchemaCases)(
    'rejects nested bigint semantics in %s when OpenAPI cannot represent them',
    ({ wrap }) => {
      expect(() =>
        assertSchemaSupportsIntegerTargetCapabilities(
          wrap(createBigIntSchema()),
          CANONICAL_OPENAPI_TARGET_LABEL,
        ),
      ).toThrow(BIGINT_ERROR);
    },
  );
});

describe('component and document traversal', () => {
  it('rejects unsupported int64 semantics in schema components before JSON Schema emission', () => {
    const components: CastrSchemaComponent[] = [
      {
        type: 'schema',
        name: 'WrappedInt64',
        schema: createMockCastrSchema({
          type: 'array',
          prefixItems: [createInt64Schema()],
        }),
        metadata: createMockCastrSchemaNode(),
      },
    ];

    expect(() =>
      assertSchemaComponentsSupportIntegerTargetCapabilities(components, 'JSON Schema 2020-12'),
    ).toThrow(INT64_ERROR);
  });

  it('rejects unsupported int64 semantics in operation request bodies', () => {
    const requestBodySchema = createMockCastrSchema({
      type: 'object',
      properties: new CastrSchemaProperties({
        count: createInt64Schema(),
      }),
    });

    const document = createMockCastrDocument({
      operations: [
        {
          method: 'post',
          path: '/counts',
          parameters: [],
          parametersByLocation: { query: [], path: [], header: [], cookie: [] },
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: requestBodySchema },
            },
          },
          responses: [{ statusCode: '200' }],
        },
      ],
    });

    expect(() =>
      assertDocumentSupportsIntegerTargetCapabilities(document, 'JSON Schema 2020-12'),
    ).toThrow(INT64_ERROR);
  });

  it('rejects unsupported bigint semantics in response headers', () => {
    const document = createMockCastrDocument({
      operations: [
        {
          method: 'get',
          path: '/counts',
          parameters: [],
          parametersByLocation: { query: [], path: [], header: [], cookie: [] },
          responses: [
            {
              statusCode: '200',
              content: {
                'application/json': {
                  schema: createMockCastrSchema({ type: 'string' }),
                },
              },
              headers: {
                'X-Count': {
                  schema: createBigIntSchema(),
                },
              },
            },
          ],
        },
      ],
    });

    expect(() =>
      assertDocumentSupportsIntegerTargetCapabilities(document, CANONICAL_OPENAPI_TARGET_LABEL),
    ).toThrow(BIGINT_ERROR);
  });

  it('rejects unsupported bigint semantics in raw header components before OpenAPI emission', () => {
    const document = createMockCastrDocument({
      components: [
        {
          type: 'header',
          name: 'X-Huge',
          header: createBigIntHeaderComponentSchema(),
        },
      ],
    });

    expect(() =>
      assertDocumentSupportsIntegerTargetCapabilities(document, CANONICAL_OPENAPI_TARGET_LABEL),
    ).toThrow(BIGINT_ERROR);
  });

  it('rejects unsupported bigint semantics in raw header components when schema uses $ref siblings', () => {
    const document = createMockCastrDocument({
      components: [
        {
          type: 'header',
          name: 'X-Huge',
          header: createRefSiblingBigIntHeaderComponentSchema(),
        },
      ],
    });

    expect(() =>
      assertDocumentSupportsIntegerTargetCapabilities(document, CANONICAL_OPENAPI_TARGET_LABEL),
    ).toThrow(BIGINT_ERROR);
  });

  it('rejects unsupported bigint semantics in raw webhook path items before OpenAPI emission', () => {
    const document = createMockCastrDocument({
      webhooks: new Map([['newCount', createBigIntWebhookPathItem()]]),
    });

    expect(() =>
      assertDocumentSupportsIntegerTargetCapabilities(document, CANONICAL_OPENAPI_TARGET_LABEL),
    ).toThrow(BIGINT_ERROR);
  });

  it('rejects unsupported bigint semantics in raw webhook path items when schema uses $ref siblings', () => {
    const document = createMockCastrDocument({
      webhooks: new Map([['newCount', createRefSiblingBigIntWebhookPathItem('integer')]]),
    });

    expect(() =>
      assertDocumentSupportsIntegerTargetCapabilities(document, CANONICAL_OPENAPI_TARGET_LABEL),
    ).toThrow(BIGINT_ERROR);
  });

  it('rejects unsupported bigint semantics in raw webhook path items when nullable type arrays use $ref siblings', () => {
    const document = createMockCastrDocument({
      webhooks: new Map([['newCount', createRefSiblingBigIntWebhookPathItem(['integer', 'null'])]]),
    });

    expect(() =>
      assertDocumentSupportsIntegerTargetCapabilities(document, CANONICAL_OPENAPI_TARGET_LABEL),
    ).toThrow(BIGINT_ERROR);
  });

  it('does not reject OpenAPI-only raw webhook bigint surfaces for TypeScript emission', () => {
    const document = createMockCastrDocument({
      webhooks: new Map([['newCount', createBigIntWebhookPathItem()]]),
    });

    expect(() =>
      assertDocumentSupportsIntegerTargetCapabilities(document, 'TypeScript'),
    ).not.toThrow();
  });
});

describe('assertPortableIntegerInputSemanticsSupported', () => {
  it('accepts native OpenAPI int64 input', () => {
    expect(() =>
      assertPortableIntegerInputSemanticsSupported(
        CANONICAL_OPENAPI_TARGET_LABEL,
        'integer',
        'int64',
      ),
    ).not.toThrow();
  });

  it('rejects non-native OpenAPI bigint input', () => {
    expect(() =>
      assertPortableIntegerInputSemanticsSupported(
        CANONICAL_OPENAPI_TARGET_LABEL,
        'integer',
        'bigint',
      ),
    ).toThrow(BIGINT_ERROR);
  });

  it('rejects non-native OpenAPI bigint input when integer is part of a nullable type array', () => {
    expect(() =>
      assertPortableIntegerInputSemanticsSupported(
        CANONICAL_OPENAPI_TARGET_LABEL,
        ['integer', 'null'],
        'bigint',
      ),
    ).toThrow(BIGINT_ERROR);
  });

  it('rejects non-native JSON Schema int64 input', () => {
    expect(() =>
      assertPortableIntegerInputSemanticsSupported('JSON Schema 2020-12', 'integer', 'int64'),
    ).toThrow(INT64_ERROR);
  });

  it('rejects non-native JSON Schema bigint input', () => {
    expect(() =>
      assertPortableIntegerInputSemanticsSupported('JSON Schema 2020-12', 'integer', 'bigint'),
    ).toThrow(BIGINT_ERROR);
  });
});
