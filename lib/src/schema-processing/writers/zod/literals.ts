import type { CodeBlockWriter } from 'ts-morph';

/**
 * Write z.literal() for const values.
 *
 * @param value - Literal value to encode
 * @param writer - Writer receiving generated code
 *
 * @internal
 */
export function writeConstSchema(value: unknown, writer: CodeBlockWriter): void {
  writer.write(`z.literal(${JSON.stringify(value)})`);
}
