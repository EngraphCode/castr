/**
 * IR Test Helpers - Validation and Assertion Utilities
 *
 * These helpers reduce test complexity by providing reusable assertion patterns
 * for IR (Information Retrieval) validation tests.
 *
 * @module ir-test-helpers
 */

import type { IRComponent, IRSchema, IRSchemaComponent } from './ir-schema.js';
import { IRSchemaProperties } from './ir-schema.js';

/**
 * Assert that a component is a schema component.
 *
 * @param component - Component to check
 * @returns The schema component
 * @throws Error if component is undefined or not a schema component
 */
export function assertSchemaComponent(component: IRComponent | undefined): IRSchemaComponent {
  if (!component) {
    throw new Error('Component is undefined');
  }
  if (component.type !== 'schema') {
    throw new Error(`Expected component type 'schema' but got '${component.type}'`);
  }
  return component;
}

/**
 * Find a component by name in an IR component array.
 * Throws with a helpful error if not found.
 *
 * @param components - Array of IR components (may be undefined)
 * @param name - Name of the component to find
 * @returns The component
 * @throws Error if component is not found
 */
export function getComponent(components: IRComponent[] | undefined, name: string): IRComponent {
  if (!components) {
    throw new Error(`Cannot find component "${name}" - components array is undefined`);
  }
  for (const component of components) {
    if (component.name === name) {
      return component;
    }
  }
  throw new Error(`Component "${name}" not found in IR components`);
}

/**
 * Get a property from an IR schema with type safety.
 * Throws with a helpful error if schema properties are not accessible.
 *
 * @param schema - IR schema with properties
 * @param propName - Name of the property to get
 * @returns The property schema
 * @throws Error if schema doesn't have properties or property not found
 */
export function getSchemaProperty(schema: IRSchema, propName: string): IRSchema {
  if (schema.type !== 'object' || !schema.properties) {
    throw new Error(
      `Cannot access property "${propName}" - schema is not an object with properties`,
    );
  }

  const prop = schema.properties.get(propName);
  if (!prop) {
    throw new Error(
      `Property "${propName}" not found in schema. Available: ${Array.from(
        schema.properties.keys(),
      ).join(', ')}`,
    );
  }

  return prop;
}

/**
 * Assert that a schema property exists and has expected required status.
 *
 * @param schema - IR schema with properties
 * @param propName - Name of the property to check
 * @param isRequired - Expected required status
 * @returns The property schema for further assertions
 * @throws Error if property not found or required status doesn't match
 */
export function assertPropertyRequired(
  schema: IRSchema,
  propName: string,
  isRequired: boolean,
): IRSchema {
  const prop = getSchemaProperty(schema, propName);

  if (prop.metadata.required !== isRequired) {
    throw new Error(
      `Property "${propName}" expected required=${isRequired} but got ${prop.metadata.required}`,
    );
  }

  return prop;
}

/**
 * Assert that a schema property exists and has expected nullable status.
 *
 * @param schema - IR schema with properties
 * @param propName - Name of the property to check
 * @param isNullable - Expected nullable status
 * @returns The property schema for further assertions
 * @throws Error if property not found or nullable status doesn't match
 */
export function assertPropertyNullable(
  schema: IRSchema,
  propName: string,
  isNullable: boolean,
): IRSchema {
  const prop = getSchemaProperty(schema, propName);

  if (prop.metadata.nullable !== isNullable) {
    throw new Error(
      `Property "${propName}" expected nullable=${isNullable} but got ${prop.metadata.nullable}`,
    );
  }

  return prop;
}

/**
 * Assert that schema properties have correct metadata for required fields.
 * Checks multiple properties at once to reduce assertion boilerplate.
 *
 * @param schema - IR schema with properties
 * @param requiredProps - Array of property names that should be required
 * @param optionalProps - Array of property names that should be optional
 */
export function assertPropertiesMetadata(
  schema: IRSchema,
  requiredProps: string[],
  optionalProps: string[],
): void {
  for (const propName of requiredProps) {
    assertPropertyRequired(schema, propName, true);
  }

  for (const propName of optionalProps) {
    assertPropertyRequired(schema, propName, false);
  }
}

/**
 * Count total circular references across multiple components.
 * Safely handles undefined values and missing metadata.
 *
 * @param components - Array of components to check
 * @returns Total count of circular references
 */
export function countCircularRefs(components: IRComponent[]): number {
  let total = 0;
  for (const component of components) {
    if (component.type === 'schema' && component.schema.metadata.circularReferences) {
      total += component.schema.metadata.circularReferences.length;
    }
  }
  return total;
}

/**
 * Assert that a schema has IRSchemaProperties (not plain object).
 *
 * @param schema - Schema to check
 * @throws Error if schema doesn't have IRSchemaProperties
 */
export function assertHasIRSchemaProperties(schema: IRSchema): void {
  if (schema.type !== 'object' || !(schema.properties instanceof IRSchemaProperties)) {
    throw new Error('Expected schema to have IRSchemaProperties');
  }
}
