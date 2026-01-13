/**
 * Test Helpers for IR Characterization Tests
 *
 * These helpers reduce cyclomatic complexity by extracting common patterns
 * and providing single-responsibility functions with clear semantics.
 *
 * @module ir-test-helpers
 */

import type { GenerationResult } from '../rendering/generation-result.js';
import { isSingleFileResult } from '../rendering/generation-result.js';
import type { IRComponent } from '../ir/schema.js';

/**
 * Assert that a generation result is a single file result and return the content.
 * Throws with a helpful error if the result is not a single file.
 *
 * @param result - The generation result to check
 * @returns The content string from the single file result
 * @throws Error if result is not a single file
 */
export function assertAndGetSingleFileContent(result: GenerationResult): string {
  if (!isSingleFileResult(result)) {
    throw new Error('Expected single file result but got grouped files');
  }
  return result.content;
}

/**
 * Find a component by name in an IR component array.
 * Returns undefined if not found or if components array is undefined.
 *
 * @param components - Array of IR components (may be undefined)
 * @param name - Name of the component to find
 * @returns The component if found, undefined otherwise
 */
export function findComponent(
  components: IRComponent[] | undefined,
  name: string,
): IRComponent | undefined {
  if (!components) {
    return undefined;
  }
  return components.find((c) => c.name === name);
}

/**
 * Count total circular references across multiple components.
 * Safely handles undefined/null values and missing metadata.
 *
 * @param components - Array of components to check (may be undefined)
 * @returns Total count of circular references across all components
 */
export function countTotalCircularRefs(components: (IRComponent | undefined)[]): number {
  let total = 0;
  for (const component of components) {
    if (component && component.type === 'schema' && component.schema.metadata.circularReferences) {
      total += component.schema.metadata.circularReferences.length;
    }
  }
  return total;
}

/**
 * Assert that a component is defined and return it with a narrowed type.
 * Throws with a helpful error if the component is undefined.
 *
 * @param component - Component to check (may be undefined)
 * @param name - Name of component for error message
 * @returns The component with narrowed non-undefined type
 * @throws Error if component is undefined
 */
export function assertComponentExists(
  component: IRComponent | undefined,
  name: string,
): IRComponent {
  if (!component) {
    throw new Error(`Expected component "${name}" to exist but it was undefined`);
  }
  return component;
}

/**
 * Assert that generated content contains expected strings.
 * Reduces repetitive expect().toContain() chains.
 *
 * @param content - Generated code content to check
 * @param expectedStrings - Array of strings that should be in content
 */
export function assertContentContains(content: string, expectedStrings: string[]): void {
  for (const expected of expectedStrings) {
    if (!content.includes(expected)) {
      throw new Error(`Expected content to contain "${expected}" but it was not found`);
    }
  }
}

/**
 * Assert that generated content contains expected strings (case insensitive).
 * Useful for checking schema names that might have different casing.
 *
 * @param content - Generated code content to check
 * @param expectedStrings - Array of strings that should be in content (case insensitive)
 */
export function assertContentContainsInsensitive(content: string, expectedStrings: string[]): void {
  const lowerContent = content.toLowerCase();
  for (const expected of expectedStrings) {
    if (!lowerContent.includes(expected.toLowerCase())) {
      throw new Error(
        `Expected content to contain "${expected}" (case insensitive) but it was not found`,
      );
    }
  }
}
