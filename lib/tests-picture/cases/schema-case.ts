import type { UnknownRecord } from '../../src/shared/type-utils/types.js';

/**
 * One case of the picture: a schema that exercises a construct kind, and values that the
 * construct decides. The samples hold at least one value the construct accepts and one it
 * refuses, so a validator that ignores the construct cannot be right.
 */
export interface SchemaCase {
  /** The identity of the row the case exercises. */
  readonly rowId: string;
  /** The schema, placed in a document as the component `T`. */
  readonly schema: unknown;
  /** Other component schemas the schema refers to. */
  readonly components?: Readonly<UnknownRecord>;
  readonly samples: readonly unknown[];
}

/** The name of the component a case's schema is given. */
export const CASE_COMPONENT = 'T';

/**
 * A whole, valid OpenAPI 3.1 document that holds a case's schema as a named component and
 * uses it as the body of one response.
 */
export function documentFor(schemaCase: Pick<SchemaCase, 'schema' | 'components'>): UnknownRecord {
  return {
    openapi: '3.1.0',
    info: { title: 'A case of the picture', version: '1' },
    paths: {
      '/case': {
        get: {
          operationId: 'getCase',
          responses: {
            '200': {
              description: 'The shape under test.',
              content: {
                'application/json': {
                  schema: { $ref: `#/components/schemas/${CASE_COMPONENT}` },
                },
              },
            },
          },
        },
      },
    },
    components: { schemas: { ...schemaCase.components, [CASE_COMPONENT]: schemaCase.schema } },
  };
}
