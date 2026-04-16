import type { CastrSchema } from '../../../ir/index.js';

const COMPOSITION_KEYS: readonly ('allOf' | 'oneOf' | 'anyOf')[] = ['allOf', 'oneOf', 'anyOf'];

export function hasRecursiveCatchallSubtree(schema: CastrSchema): boolean {
  const catchallSchema = getAdditionalPropertiesSchema(schema);
  if (!catchallSchema) {
    return false;
  }

  return schemaSubtreeHasCircularReference(
    catchallSchema,
    new Set(schema.metadata?.circularReferences ?? []),
  );
}

function schemaSubtreeHasCircularReference(
  schema: CastrSchema,
  recursiveTargets: ReadonlySet<string>,
): boolean {
  return (
    schemaTargetsRecursiveComponent(schema, recursiveTargets) ||
    propertiesSubtreeHasCircularReference(schema, recursiveTargets) ||
    itemsSubtreeHasCircularReference(schema, recursiveTargets) ||
    prefixItemsSubtreeHasCircularReference(schema, recursiveTargets) ||
    compositionSubtreeHasCircularReference(schema, recursiveTargets) ||
    catchallSubtreeHasCircularReference(schema, recursiveTargets)
  );
}

function schemaTargetsRecursiveComponent(
  schema: CastrSchema,
  recursiveTargets: ReadonlySet<string>,
): boolean {
  return (
    (schema.metadata?.circularReferences.length ?? 0) > 0 ||
    (schema.$ref !== undefined && recursiveTargets.has(schema.$ref)) ||
    (schema.metadata?.circularReferences.some((ref) => recursiveTargets.has(ref)) ?? false)
  );
}

function propertiesSubtreeHasCircularReference(
  schema: CastrSchema,
  recursiveTargets: ReadonlySet<string>,
): boolean {
  if (!schema.properties) {
    return false;
  }

  return [...schema.properties.values()].some((propSchema) =>
    schemaSubtreeHasCircularReference(propSchema, recursiveTargets),
  );
}

function catchallSubtreeHasCircularReference(
  schema: CastrSchema,
  recursiveTargets: ReadonlySet<string>,
): boolean {
  const catchallSchema = getAdditionalPropertiesSchema(schema);
  return catchallSchema
    ? schemaSubtreeHasCircularReference(catchallSchema, recursiveTargets)
    : false;
}

function itemsSubtreeHasCircularReference(
  schema: CastrSchema,
  recursiveTargets: ReadonlySet<string>,
): boolean {
  if (schema.items === undefined || Array.isArray(schema.items)) {
    return false;
  }

  return schemaSubtreeHasCircularReference(schema.items, recursiveTargets);
}

function prefixItemsSubtreeHasCircularReference(
  schema: CastrSchema,
  recursiveTargets: ReadonlySet<string>,
): boolean {
  return (
    schema.prefixItems?.some((item) => schemaSubtreeHasCircularReference(item, recursiveTargets)) ??
    false
  );
}

function compositionSubtreeHasCircularReference(
  schema: CastrSchema,
  recursiveTargets: ReadonlySet<string>,
): boolean {
  return COMPOSITION_KEYS.some(
    (key) =>
      schema[key]?.some((member) => schemaSubtreeHasCircularReference(member, recursiveTargets)) ??
      false,
  );
}

function getAdditionalPropertiesSchema(schema: CastrSchema): CastrSchema | undefined {
  if (
    schema.additionalProperties === undefined ||
    typeof schema.additionalProperties === 'boolean'
  ) {
    return undefined;
  }

  return schema.additionalProperties;
}
