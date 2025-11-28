import type { IRSchema } from './ir-schema.js';

/**
 * Type-safe wrapper for IRSchema properties.
 * Provides checked access to dynamic property names.
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
   */
  get(name: string): IRSchema | undefined {
    return this.props[name];
  }

  /**
   * Check if property exists.
   *
   * @param name - Property name to check
   * @returns True if property exists, false otherwise
   */
  has(name: string): boolean {
    return name in this.props;
  }

  /**
   * Get all property names.
   *
   * @returns Array of property names
   */
  keys(): string[] {
    return Object.keys(this.props);
  }

  /**
   * Get all properties as entries.
   *
   * @returns Array of [name, schema] tuples
   */
  entries(): [string, IRSchema][] {
    return Object.entries(this.props);
  }

  /**
   * Returns all property values as an array.
   *
   * @returns Array of IR schemas for all properties
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

  /**
   * Custom serialization for JSON.stringify.
   *
   * Serializes to a structure that can be revived by deserializeIR.
   *
   * @returns Serialization structure with metadata
   */
  toJSON(): { dataType: 'IRSchemaProperties'; value: Record<string, IRSchema> } {
    return {
      dataType: 'IRSchemaProperties',
      value: this.props,
    };
  }
}
