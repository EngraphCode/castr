import type { CastrSchema } from '../../../ir/index.js';
import { getSortedPropertyEntries } from '../../zod/properties.js';

const COMPOSITION_KEYS: readonly ('allOf' | 'oneOf' | 'anyOf')[] = ['allOf', 'oneOf', 'anyOf'];
const SCHEMA_TYPE_NULL = 'null';

function getAdditionalPropertiesSchema(schema: CastrSchema): CastrSchema | undefined {
  if (
    schema.additionalProperties === undefined ||
    typeof schema.additionalProperties === 'boolean'
  ) {
    return undefined;
  }
  return schema.additionalProperties;
}

function hasMembers<T>(
  members: readonly T[] | undefined,
  predicate: (member: T) => boolean,
): boolean {
  return members?.some(predicate) ?? false;
}

function hasItemsSchemaReference(schema: CastrSchema): boolean {
  return Boolean(schema.items && !Array.isArray(schema.items) && hasSchemaReference(schema.items));
}

function hasSchemaReference(schema: CastrSchema): boolean {
  const additionalPropertiesSchema = getAdditionalPropertiesSchema(schema);
  return (
    Boolean(schema.$ref) ||
    (additionalPropertiesSchema ? hasSchemaReference(additionalPropertiesSchema) : false) ||
    hasItemsSchemaReference(schema) ||
    hasMembers(schema.prefixItems, hasSchemaReference) ||
    COMPOSITION_KEYS.some((key) => hasMembers(schema[key], hasSchemaReference))
  );
}

function hasCircularReferenceTarget(
  circularReferences: string[] | undefined,
  componentRef: string,
): boolean {
  return (
    circularReferences?.some((circularReference) => circularReference === componentRef) ?? false
  );
}

function targetsItemsCycle(schema: CastrSchema, componentRef: string): boolean {
  return Boolean(
    schema.items &&
    !Array.isArray(schema.items) &&
    schemaTargetsComponentCycle(schema.items, componentRef),
  );
}

function schemaTargetsComponentCycle(schema: CastrSchema, componentRef: string): boolean {
  const additionalPropertiesSchema = getAdditionalPropertiesSchema(schema);
  return (
    hasCircularReferenceTarget(schema.metadata?.circularReferences, componentRef) ||
    (additionalPropertiesSchema
      ? schemaTargetsComponentCycle(additionalPropertiesSchema, componentRef)
      : false) ||
    targetsItemsCycle(schema, componentRef) ||
    hasMembers(schema.prefixItems, (item) => schemaTargetsComponentCycle(item, componentRef)) ||
    COMPOSITION_KEYS.some((key) =>
      hasMembers(schema[key], (member) => schemaTargetsComponentCycle(member, componentRef)),
    )
  );
}

function isNullSchema(schema: CastrSchema): boolean {
  return schema.type === SCHEMA_TYPE_NULL;
}

function getNullableReferenceCompositionMembers(schema: CastrSchema): CastrSchema[] | undefined {
  const members = schema.anyOf ?? schema.oneOf;
  return members && members.length === 2 ? members : undefined;
}

function getSingleReferenceMember(members: CastrSchema[]): CastrSchema | undefined {
  const referenceMembers = members.filter((member) => member.$ref);
  return referenceMembers.length === 1 ? referenceMembers[0] : undefined;
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

function hasCircularReferences(schema: CastrSchema): boolean {
  return (schema.metadata?.circularReferences.length ?? 0) > 0;
}

export function detectCircularReference(
  propSchema: CastrSchema,
  parentSchema: CastrSchema,
): boolean {
  return (
    hasCircularReferences(propSchema) ||
    (hasCircularReferences(parentSchema) && hasSchemaReference(propSchema))
  );
}

export function shouldUseGetterSyntax(propSchema: CastrSchema, parentSchema: CastrSchema): boolean {
  return detectCircularReference(propSchema, parentSchema);
}

function objectPropertiesContainReferences(schema: CastrSchema): boolean {
  const additionalPropertiesSchema = getAdditionalPropertiesSchema(schema);
  return (
    (additionalPropertiesSchema ? hasSchemaReference(additionalPropertiesSchema) : false) ||
    getSortedPropertyEntries(schema).some(([, propSchema]) => hasSchemaReference(propSchema))
  );
}

function objectPropertiesTargetComponentCycle(schema: CastrSchema, componentRef: string): boolean {
  const additionalPropertiesSchema = getAdditionalPropertiesSchema(schema);
  return (
    (additionalPropertiesSchema
      ? hasSchemaReference(additionalPropertiesSchema) &&
        schemaTargetsComponentCycle(additionalPropertiesSchema, componentRef)
      : false) ||
    getSortedPropertyEntries(schema).some(
      ([, propSchema]) =>
        hasSchemaReference(propSchema) && schemaTargetsComponentCycle(propSchema, componentRef),
    )
  );
}

function hasParentMarkedRecursiveObjectCycle(schema: CastrSchema): boolean {
  return hasCircularReferences(schema) && objectPropertiesContainReferences(schema);
}

export function isRecursiveObjectSchema(schema: CastrSchema, componentRef?: string): boolean {
  return (
    hasParentMarkedRecursiveObjectCycle(schema) ||
    (componentRef ? objectPropertiesTargetComponentCycle(schema, componentRef) : false)
  );
}
