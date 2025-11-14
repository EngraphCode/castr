/**
 * Type-Safe IR Schema Properties Wrapper
 *
 * Provides type-safe access to dynamic property names in IRSchema objects.
 * Encapsulates Record<string, IRSchema> to prevent index signature type pollution.
 *
 * @module ir-schema-properties
 * @since 2.0.0
 * @public
 */

import type { IRSchema } from './ir-schema.js';

/**
 * Type-safe wrapper for IRSchema properties.
 *
 * Provides checked access to dynamic property names without exposing
 * index signature types that pollute the type system.
 *
 * @example
 * ```typescript
 * const props = new IRSchemaProperties({
 *   name: { type: 'string', metadata: {...} },
 *   age: { type: 'number', metadata: {...} },
 * });
 *
 * const nameSchema = props.get('name'); // IRSchema | undefined
 * if (props.has('email')) {
 *   // Safe to access
 * }
 * ```
 *
 * @public
 */
export class IRSchemaProperties {
  private readonly props: Record<string, IRSchema>;

  /**
   * Create a new IRSchemaProperties wrapper.
   *
   * @param properties - The properties record to wrap
   */
  constructor(properties: Record<string, IRSchema> = {}) {
    this.props = properties;
  }

  /**
   * Get property by name with type-safe undefined handling.
   *
   * @param name - Property name to retrieve
   * @returns The schema for the property, or undefined if not found
   *
   * @example
   * ```typescript
   * const nameSchema = properties.get('name');
   * if (nameSchema) {
   *   console.log(nameSchema.type);
   * }
   * ```
   */
  get(name: string): IRSchema | undefined {
    return this.props[name];
  }

  /**
   * Check if property exists.
   *
   * @param name - Property name to check
   * @returns True if property exists, false otherwise
   *
   * @example
   * ```typescript
   * if (properties.has('email')) {
   *   const emailSchema = properties.get('email')!;
   * }
   * ```
   */
  has(name: string): boolean {
    return name in this.props;
  }

  /**
   * Get all property names.
   *
   * @returns Array of property names
   *
   * @example
   * ```typescript
   * const names = properties.keys(); // ['name', 'age', 'email']
   * ```
   */
  keys(): string[] {
    return Object.keys(this.props);
  }

  /**
   * Get all properties as entries.
   *
   * @returns Array of [name, schema] tuples
   *
   * @example
   * ```typescript
   * for (const [name, schema] of properties.entries()) {
   *   console.log(`${name}: ${schema.type}`);
   * }
   * ```
   */
  entries(): [string, IRSchema][] {
    return Object.entries(this.props);
  }

  /**
   * Returns all property values as an array.
   *
   * @returns Array of IR schemas for all properties
   *
   * @example
   * ```typescript
   * const schemas = properties.values(); // [IRSchema, IRSchema, ...]
   * for (const schema of properties.values()) {
   *   console.log(schema.type);
   * }
   * ```
   */
  values(): IRSchema[] {
    return Object.values(this.props);
  }

  /**
   * Get raw properties record (for serialization).
   *
   * Returns a shallow copy to prevent external mutation.
   *
   * @returns Copy of the internal properties record
   *
   * @example
   * ```typescript
   * const record = properties.toRecord();
   * JSON.stringify(record); // Safe serialization
   * ```
   */
  toRecord(): Record<string, IRSchema> {
    return { ...this.props };
  }

  /**
   * Get the number of properties.
   *
   * @returns Number of properties in the collection
   */
  get size(): number {
    return Object.keys(this.props).length;
  }
}
