import { CodeBlockWriter } from 'ts-morph';
import { writeZodSchema } from '../schema-processing/writers/zod/index.js';
import type { CastrSchemaContext, CastrSchema } from '../schema-processing/ir/index.js';

/**
 * Helper to generate a Zod schema string from an CastrSchema object.
 * Useful for testing and snapshots.
 */
export function generateZodSchema(schema: CastrSchema): string {
  const writer = new CodeBlockWriter({
    useTabs: false,
    indentNumberOfSpaces: 2,
  });

  // Wrap in a dummy component context for testing
  const context: CastrSchemaContext = {
    contextType: 'component',
    name: 'TestSchema',
    schema,
    metadata: schema.metadata,
  };

  writeZodSchema(context)(writer);
  return writer.toString();
}
