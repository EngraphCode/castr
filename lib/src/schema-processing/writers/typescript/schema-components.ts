import { take } from 'lodash-es';
import type {
  CastrDocument,
  CastrSchema,
  CastrSchemaComponent,
  IRComponent,
} from '../../ir/index.js';
import { parseComponentRef, type ParsedRef } from '../../../shared/ref-resolution.js';
import { assertDistinctSafeSchemaNames } from '../../../shared/utils/identifier-utils.js';
import {
  visitDocumentSchemas,
  visitSchemaChildren,
} from '../../compatibility/integer-target-capabilities.traversal.js';

const COMPONENT_TYPE_SCHEMA = 'schema';
const SCHEMAS_REF_TYPE = 'schemas';
const KNOWN_NAMES_SHOWN = 10;

/**
 * Symbols the TypeScript writer declares itself; no component may emit one of them.
 * @internal
 */
export const TYPESCRIPT_WRITER_RESERVED_SYMBOLS: readonly string[] = [
  'z',
  'endpoints',
  'mcpTools',
  'validateRequest',
  'validateResponse',
  'buildSchemaRegistry',
];

function isSchemaComponent(component: IRComponent): component is CastrSchemaComponent {
  return component.type === COMPONENT_TYPE_SCHEMA;
}

/**
 * Index a document's schema components by wire name, exactly as `$ref` targets
 * name them, and fail fast when a wire name is repeated, when two wire names
 * would emit the same symbol, or when a component would take a symbol the
 * writer declares itself.
 *
 * @param ir - The document whose components are about to be emitted
 * @returns The schema components keyed by wire name
 * @throws `Error` when component names collide under the projection or with a reserved symbol
 * @internal
 */
export function buildSchemaComponentsMap(
  ir: CastrDocument,
): ReadonlyMap<string, CastrSchemaComponent> {
  const schemaComponents = ir.components.filter(isSchemaComponent);
  assertDistinctSafeSchemaNames(
    schemaComponents.map((component) => component.name),
    TYPESCRIPT_WRITER_RESERVED_SYMBOLS,
  );
  const componentsMap = new Map<string, CastrSchemaComponent>();
  for (const component of schemaComponents) {
    componentsMap.set(component.name, component);
  }
  return componentsMap;
}

/**
 * Resolve a schema name or reference to the component the document carries.
 * Components are keyed by wire name, exactly as `$ref` targets name them.
 *
 * @param componentsMap - The document's schema components keyed by wire name
 * @param ref - A `$ref` or a bare component name
 * @returns The component the reference names
 * @throws `Error` naming the reference when the document carries no such component
 * @internal
 */
export function requireSchemaComponent(
  componentsMap: ReadonlyMap<string, CastrSchemaComponent>,
  ref: string,
): CastrSchemaComponent {
  const { componentName } = parseComponentRef(ref);
  const component = componentsMap.get(componentName);
  if (!component) {
    const known = [...componentsMap.keys()];
    const shown = take(known, KNOWN_NAMES_SHOWN).join(', ');
    const more = known.length > KNOWN_NAMES_SHOWN ? `, … (${known.length} in all)` : '';
    throw new Error(
      `Schema reference "${ref}" names a component the document does not carry ` +
        `(known components: ${shown || 'none'}).${more}`,
    );
  }
  return component;
}

function parseReferenceIn(ref: string, owner: string): ParsedRef {
  try {
    return parseComponentRef(ref);
  } catch (error: unknown) {
    throw new Error(`Schema reference "${ref}" in ${owner} cannot be parsed.`, { cause: error });
  }
}

function isInternalSchemaReference(parsed: ParsedRef): boolean {
  return parsed.componentType === SCHEMAS_REF_TYPE && !parsed.isExternal;
}

function collectReferences(root: CastrSchema, seen: Set<CastrSchema>): string[] {
  const refs: string[] = [];
  const visit = (schema: CastrSchema, visited: Set<CastrSchema>): void => {
    if (visited.has(schema)) {
      return;
    }
    visited.add(schema);
    if (schema.$ref !== undefined) {
      refs.push(schema.$ref);
    }
    visitSchemaChildren(schema, visited, visit);
  };
  visit(root, seen);
  return refs;
}

function assertReferencesKnown(
  refs: readonly string[],
  known: ReadonlySet<string>,
  owner: string,
): void {
  for (const ref of refs) {
    const parsed = parseReferenceIn(ref, owner);
    if (isInternalSchemaReference(parsed) && !known.has(parsed.componentName)) {
      throw new Error(
        `Schema reference "${ref}" in ${owner} names a component that is not declared there.`,
      );
    }
  }
}

/**
 * Assert that every internal schema reference anywhere in a document (its
 * components of every type and its operations) names a schema component the
 * document carries, so a writer never emits a symbol nothing declares.
 *
 * @param ir - The document about to be written
 * @throws `Error` naming the first dangling or unparsable reference
 * @internal
 */
export function assertSchemaReferencesResolve(ir: CastrDocument): void {
  const known = new Set(ir.components.filter(isSchemaComponent).map((component) => component.name));
  const refs: string[] = [];
  const seen = new Set<CastrSchema>();
  visitDocumentSchemas(ir, seen, (schema, visited) => {
    refs.push(...collectReferences(schema, visited));
  });
  assertReferencesKnown(refs, known, 'the document');
}

/**
 * Assert that every schema reference inside the components a file emits names
 * a component the same file declares, so no emitted file references a symbol it
 * does not declare (grouped output declares shared components per file).
 *
 * @param emitted - The components the file declares, in emission order
 * @throws `Error` naming the reference and its owning component when the file does not declare the target
 * @internal
 */
export function assertEmittedReferencesDeclared(emitted: readonly CastrSchemaComponent[]): void {
  const declared = new Set(emitted.map((component) => component.name));
  for (const component of emitted) {
    const refs = collectReferences(component.schema, new Set<CastrSchema>());
    assertReferencesKnown(refs, declared, `component "${component.name}"`);
  }
}
