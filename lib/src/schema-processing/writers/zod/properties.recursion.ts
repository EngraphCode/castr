/**
 * Recursive object and getter-detection helpers for Zod object writing.
 *
 * Extracted from `properties.ts` to keep the public helpers small and within
 * the repo's file-size limits.
 *
 * @module writers/zod/properties.recursion
 * @internal
 */

import type { CastrSchema } from '../../ir/index.js';
import { UNKNOWN_KEY_MODE_CATCHALL } from '../../ir/index.js';

const COMPOSITION_KEYS: readonly ('allOf' | 'oneOf' | 'anyOf')[] = ['allOf', 'oneOf', 'anyOf'];
const SCHEMA_TYPE_NULL = 'null';

function getSortedPropertyEntries(schema: CastrSchema): [string, CastrSchema][] {
  if (!schema.properties) {
    return [];
  }

  return [...schema.properties.entries()].sort(([leftKey], [rightKey]) =>
    leftKey.localeCompare(rightKey),
  );
}

function hasSchemaReference(schema: CastrSchema): boolean {
  if (schema.$ref) {
    return true;
  }

  if (schema.items && !Array.isArray(schema.items) && hasSchemaReference(schema.items)) {
    return true;
  }

  return hasCompositionSchemaReference(schema);
}

function hasCompositionSchemaReference(schema: CastrSchema): boolean {
  for (const key of COMPOSITION_KEYS) {
    const members = schema[key];
    if (hasSchemaReferenceMembers(members)) {
      return true;
    }
  }

  return false;
}

function hasSchemaReferenceMembers(members: CastrSchema[] | undefined): boolean {
  if (!members) {
    return false;
  }

  for (const member of members) {
    if (hasSchemaReference(member)) {
      return true;
    }
  }

  return false;
}

function getObjectUnknownKeySchema(schema: CastrSchema): CastrSchema | undefined {
  if (schema.unknownKeyBehavior?.mode === UNKNOWN_KEY_MODE_CATCHALL) {
    return schema.unknownKeyBehavior.schema;
  }

  if (schema.additionalProperties && typeof schema.additionalProperties !== 'boolean') {
    return schema.additionalProperties;
  }

  return undefined;
}

function schemaTargetsComponentCycle(schema: CastrSchema, componentRef: string): boolean {
  if (hasCircularReferenceTarget(schema.metadata?.circularReferences, componentRef)) {
    return true;
  }

  if (
    schema.items &&
    !Array.isArray(schema.items) &&
    schemaTargetsComponentCycle(schema.items, componentRef)
  ) {
    return true;
  }

  return hasCompositionTargetingComponentCycle(schema, componentRef);
}

function hasCircularReferenceTarget(
  circularReferences: string[] | undefined,
  componentRef: string,
): boolean {
  if (!circularReferences) {
    return false;
  }

  for (const circularReference of circularReferences) {
    if (circularReference === componentRef) {
      return true;
    }
  }

  return false;
}

function hasCompositionTargetingComponentCycle(schema: CastrSchema, componentRef: string): boolean {
  for (const key of COMPOSITION_KEYS) {
    const members = schema[key];
    if (schemaMembersTargetComponentCycle(members, componentRef)) {
      return true;
    }
  }

  return false;
}

function schemaMembersTargetComponentCycle(
  members: CastrSchema[] | undefined,
  componentRef: string,
): boolean {
  if (!members) {
    return false;
  }

  for (const member of members) {
    if (schemaTargetsComponentCycle(member, componentRef)) {
      return true;
    }
  }

  return false;
}

function isNullSchema(schema: CastrSchema): boolean {
  return schema.type === SCHEMA_TYPE_NULL;
}

function getNullableReferenceCompositionMembers(schema: CastrSchema): CastrSchema[] | undefined {
  const members = schema.anyOf ?? schema.oneOf;

  if (!members || members.length !== 2) {
    return undefined;
  }

  return members;
}

function getSingleReferenceMember(members: CastrSchema[]): CastrSchema | undefined {
  const referenceMembers = members.filter((member) => member.$ref);

  if (referenceMembers.length !== 1) {
    return undefined;
  }

  return referenceMembers[0];
}

function hasSingleNullMember(members: CastrSchema[], referenceMember: CastrSchema): boolean {
  const nonReferenceMembers = members.filter((member) => member !== referenceMember);
  const nullableMember = nonReferenceMembers[0];
  return (
    nullableMember !== undefined && nonReferenceMembers.length === 1 && isNullSchema(nullableMember)
  );
}

export function getNullableReferenceCompositionBaseSchema(
  schema: CastrSchema,
): CastrSchema | undefined {
  const members = getNullableReferenceCompositionMembers(schema);
  if (!members) {
    return undefined;
  }

  const referenceMember = getSingleReferenceMember(members);
  if (!referenceMember) {
    return undefined;
  }

  return hasSingleNullMember(members, referenceMember) ? referenceMember : undefined;
}

export function detectCircularReference(
  propSchema: CastrSchema,
  parentSchema: CastrSchema,
): boolean {
  const propHasCircularRef =
    propSchema.metadata?.circularReferences && propSchema.metadata.circularReferences.length > 0;

  if (propHasCircularRef) {
    return true;
  }

  const parentHasCircularRef =
    parentSchema.metadata?.circularReferences &&
    parentSchema.metadata.circularReferences.length > 0;

  if (parentHasCircularRef && hasSchemaReference(propSchema)) {
    return true;
  }

  return false;
}

export function shouldUseGetterSyntax(propSchema: CastrSchema, parentSchema: CastrSchema): boolean {
  return detectCircularReference(propSchema, parentSchema);
}

export function isRecursiveObjectSchema(schema: CastrSchema, componentRef?: string): boolean {
  if (hasParentMarkedRecursiveObjectCycle(schema)) {
    return true;
  }

  if (!componentRef) {
    return false;
  }

  return hasChildMarkedRecursiveObjectCycle(schema, componentRef);
}

function hasParentMarkedRecursiveObjectCycle(schema: CastrSchema): boolean {
  const circularReferences = schema.metadata?.circularReferences;
  if (!circularReferences || circularReferences.length === 0) {
    return false;
  }

  return objectPropertiesContainReferences(schema) || unknownKeySchemaContainsReference(schema);
}

function objectPropertiesContainReferences(schema: CastrSchema): boolean {
  for (const [, propSchema] of getSortedPropertyEntries(schema)) {
    if (hasSchemaReference(propSchema)) {
      return true;
    }
  }

  return false;
}

function unknownKeySchemaContainsReference(schema: CastrSchema): boolean {
  const unknownKeySchema = getObjectUnknownKeySchema(schema);
  return unknownKeySchema !== undefined && hasSchemaReference(unknownKeySchema);
}

function hasChildMarkedRecursiveObjectCycle(schema: CastrSchema, componentRef: string): boolean {
  return (
    objectPropertiesTargetComponentCycle(schema, componentRef) ||
    unknownKeySchemaTargetsComponentCycle(schema, componentRef)
  );
}

function objectPropertiesTargetComponentCycle(schema: CastrSchema, componentRef: string): boolean {
  for (const [, propSchema] of getSortedPropertyEntries(schema)) {
    if (hasSchemaReference(propSchema) && schemaTargetsComponentCycle(propSchema, componentRef)) {
      return true;
    }
  }

  return false;
}

function unknownKeySchemaTargetsComponentCycle(schema: CastrSchema, componentRef: string): boolean {
  const unknownKeySchema = getObjectUnknownKeySchema(schema);
  return (
    unknownKeySchema !== undefined &&
    hasSchemaReference(unknownKeySchema) &&
    schemaTargetsComponentCycle(unknownKeySchema, componentRef)
  );
}
