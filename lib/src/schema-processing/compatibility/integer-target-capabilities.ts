import type { SchemaObject } from '../../shared/openapi-types.js';
import type { CastrDocument, CastrSchema, CastrSchemaComponent } from '../ir/index.js';
import {
  getIntegerSemantics,
  schemaTypeIncludesInteger,
  INTEGER_SEMANTICS_BIGINT,
  INTEGER_SEMANTICS_INT64,
} from '../ir/index.js';
import { visitDocumentOpenApiSchemas } from './integer-target-capabilities.openapi.js';
import {
  visitDocumentSchemas,
  visitSchemaChildren,
} from './integer-target-capabilities.traversal.js';

const INTEGER_CAPABILITY_TARGET_OPENAPI_32 = 'OpenAPI 3.2';
const INTEGER_CAPABILITY_TARGET_JSON_SCHEMA_2020_12 = 'JSON Schema 2020-12';

type PortableIntegerInputTarget =
  | typeof INTEGER_CAPABILITY_TARGET_OPENAPI_32
  | typeof INTEGER_CAPABILITY_TARGET_JSON_SCHEMA_2020_12;

export type IntegerCapabilityTarget =
  | typeof INTEGER_CAPABILITY_TARGET_OPENAPI_32
  | typeof INTEGER_CAPABILITY_TARGET_JSON_SCHEMA_2020_12
  | 'Zod 4'
  | 'TypeScript';

function createUnsupportedBigIntMessage(target: IntegerCapabilityTarget): string {
  return `${target} cannot represent arbitrary-precision bigint natively. Castr deliberately does not support custom types for this case. If your values fit signed 64-bit range, consider int64.`;
}

function createUnsupportedInt64Message(target: IntegerCapabilityTarget): string {
  return `${target} cannot represent signed 64-bit integer semantics natively. Castr deliberately does not support custom types for this case. Consider generic integer if the 64-bit contract does not matter, or use OpenAPI 3.2 when native int64 support is required.`;
}

function assertIntegerSemanticsSupported(
  schema: CastrSchema,
  target: IntegerCapabilityTarget,
): void {
  const integerSemantics = getIntegerSemantics(schema);
  if (integerSemantics === undefined) {
    return;
  }

  if (integerSemantics === INTEGER_SEMANTICS_BIGINT) {
    if (
      target === INTEGER_CAPABILITY_TARGET_OPENAPI_32 ||
      target === INTEGER_CAPABILITY_TARGET_JSON_SCHEMA_2020_12
    ) {
      throw new Error(createUnsupportedBigIntMessage(target));
    }
    return;
  }

  if (
    integerSemantics === INTEGER_SEMANTICS_INT64 &&
    target === INTEGER_CAPABILITY_TARGET_JSON_SCHEMA_2020_12
  ) {
    throw new Error(createUnsupportedInt64Message(target));
  }
}

function visitSchema(
  schema: CastrSchema,
  target: IntegerCapabilityTarget,
  seen: Set<CastrSchema>,
): void {
  if (seen.has(schema)) {
    return;
  }
  seen.add(schema);

  assertIntegerSemanticsSupported(schema, target);

  if (schema.$ref !== undefined) {
    return;
  }

  visitSchemaChildren(schema, seen, (childSchema, childSeen) =>
    visitSchema(childSchema, target, childSeen),
  );
}

export function assertSchemaSupportsIntegerTargetCapabilities(
  schema: CastrSchema,
  target: IntegerCapabilityTarget,
): void {
  visitSchema(schema, target, new Set<CastrSchema>());
}

export function assertSchemaComponentsSupportIntegerTargetCapabilities(
  components: CastrSchemaComponent[],
  target: IntegerCapabilityTarget,
): void {
  const seen = new Set<CastrSchema>();
  for (const component of components) {
    visitSchema(component.schema, target, seen);
  }
}

export function assertDocumentSupportsIntegerTargetCapabilities(
  document: CastrDocument,
  target: IntegerCapabilityTarget,
): void {
  const seen = new Set<CastrSchema>();

  visitDocumentSchemas(document, seen, (schema, childSeen) =>
    visitSchema(schema, target, childSeen),
  );

  if (target !== INTEGER_CAPABILITY_TARGET_OPENAPI_32) {
    return;
  }

  visitDocumentOpenApiSchemas(document, new WeakSet<object>(), (schema) =>
    assertPortableIntegerInputSemanticsSupported(
      INTEGER_CAPABILITY_TARGET_OPENAPI_32,
      schema.type,
      schema.format,
    ),
  );
}

export function assertPortableIntegerInputSemanticsSupported(
  containerFormat: PortableIntegerInputTarget,
  schemaType: CastrSchema['type'] | SchemaObject['type'] | undefined,
  format: string | undefined,
): void {
  if (!schemaTypeIncludesInteger(schemaType) || format === undefined) {
    return;
  }

  if (format === INTEGER_SEMANTICS_BIGINT) {
    throw new Error(createUnsupportedBigIntMessage(containerFormat));
  }

  if (
    format === INTEGER_SEMANTICS_INT64 &&
    containerFormat === INTEGER_CAPABILITY_TARGET_JSON_SCHEMA_2020_12
  ) {
    throw new Error(createUnsupportedInt64Message(containerFormat));
  }
}
