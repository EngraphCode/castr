/**
 * A pinned definition is accepted only when its bytes and its own identifier are the ones
 * the pin records.
 */

import { createHash } from 'node:crypto';

import { describe, it, expect } from 'vitest';

import { verifyDefinition, type DefinitionPin } from './definitions.js';

function pinFor(text: string, id: string): DefinitionPin {
  const bytes = Buffer.from(text, 'utf8');
  return {
    file: 'a.json',
    id,
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  };
}

describe('verifyDefinition', () => {
  const text = '{"$id":"https://example.com/a","properties":{}}';

  it('parses bytes that match the pin', () => {
    const pin = pinFor(text, 'https://example.com/a');

    expect(verifyDefinition(pin, Buffer.from(text, 'utf8'))).toEqual({
      pin,
      schema: { $id: 'https://example.com/a', properties: {} },
    });
  });

  it('refuses bytes that differ from the pinned bytes', () => {
    const pin = pinFor(text, 'https://example.com/a');

    expect(() => verifyDefinition(pin, Buffer.from(`${text} `, 'utf8'))).toThrow(
      'a.json does not match its pin',
    );
  });

  it('refuses a document that identifies itself as something other than the pin says', () => {
    const pin = pinFor(text, 'https://example.com/b');

    expect(() => verifyDefinition(pin, Buffer.from(text, 'utf8'))).toThrow(
      'a.json identifies itself as https://example.com/a, not https://example.com/b',
    );
  });

  it('refuses bytes that do not hold a JSON object', () => {
    const list = '[]';

    expect(() => verifyDefinition(pinFor(list, 'x'), Buffer.from(list, 'utf8'))).toThrow(
      'a.json does not hold a JSON object',
    );
  });
});
