import { describe, expect, test } from 'vitest';
import {
  assertDistinctSafeSchemaNames,
  isValidJsIdentifier,
  safeSchemaName,
  toIdentifier,
} from './identifier-utils.js';

describe('isValidJsIdentifier', () => {
  test('accepts identifiers and rejects everything else', () => {
    expect(isValidJsIdentifier('foo')).toBe(true);
    expect(isValidJsIdentifier('_1_Name')).toBe(true);
    expect(isValidJsIdentifier('foo-bar')).toBe(false);
    expect(isValidJsIdentifier('123foo')).toBe(false);
    expect(isValidJsIdentifier('Basic.Thing')).toBe(false);
    expect(isValidJsIdentifier('')).toBe(false);
  });
});

describe('toIdentifier', () => {
  test('returns a valid identifier unchanged', () => {
    expect(toIdentifier('User')).toBe('User');
    expect(toIdentifier('IsActive')).toBe('IsActive');
  });

  test('tokenises invalid characters, prefixes a leading digit and suffixes a reserved word', () => {
    expect(toIdentifier('perform-search_Body')).toBe('perform_search_Body');
    expect(toIdentifier('1Name-With-Special---Characters')).toBe('_1_Name_With_Special_Characters');
    expect(toIdentifier('123test')).toBe('_123_test');
    expect(toIdentifier('class')).toBe('class_');
    expect(toIdentifier('Basic.Thing')).toBe('Basic_Thing');
  });

  test('always yields a valid identifier', () => {
    for (const name of ['', '   ', '---', 'a b', 'π', 'x.y.z', '9', 'function']) {
      expect(isValidJsIdentifier(toIdentifier(name))).toBe(true);
    }
  });
});

describe('safeSchemaName (the wire-name to emitted-symbol projection)', () => {
  test('leaves a plain valid name alone', () => {
    expect(safeSchemaName('User')).toBe('User');
  });

  test('suffixes a name that would shadow a built-in global, before or after projection', () => {
    expect(safeSchemaName('Error')).toBe('ErrorSchema');
    expect(safeSchemaName('Date')).toBe('DateSchema');
    expect(safeSchemaName('Error-')).toBe('ErrorSchema');
    expect(safeSchemaName('Date.')).toBe('DateSchema');
  });

  test('suffixes a name TypeScript cannot use as a type alias or module binding', () => {
    expect(safeSchemaName('string')).toBe('stringSchema');
    expect(safeSchemaName('unknown')).toBe('unknownSchema');
    expect(safeSchemaName('eval')).toBe('evalSchema');
    expect(safeSchemaName('arguments')).toBe('argumentsSchema');
  });

  test('projects an invalid wire name to a valid identifier', () => {
    expect(safeSchemaName('1Name-With-Special---Characters')).toBe(
      '_1_Name_With_Special_Characters',
    );
    expect(safeSchemaName('class')).toBe('class_');
    expect(safeSchemaName('Basic.Thing')).toBe('Basic_Thing');
  });

  test('every projection is a valid identifier that shadows no built-in', () => {
    for (const name of ['Error', '1a', 'x-y', 'Map', 'function', 'a.b']) {
      const symbol = safeSchemaName(name);
      expect(isValidJsIdentifier(symbol)).toBe(true);
      expect(safeSchemaName(symbol)).toBe(symbol);
    }
  });
});

describe('assertDistinctSafeSchemaNames', () => {
  test('passes when every wire name projects to its own symbol', () => {
    expect(() => assertDistinctSafeSchemaNames(['User', 'user-list', 'Error'])).not.toThrow();
  });

  test('throws naming both wire names and the shared symbol on a collision', () => {
    const act = (): void => assertDistinctSafeSchemaNames(['a-b', 'a.b']);
    expect(act).toThrow('"a-b"');
    expect(act).toThrow('"a.b"');
    expect(act).toThrow('"a_b"');
  });

  test('throws when the built-in suffix itself creates the collision', () => {
    expect(() => assertDistinctSafeSchemaNames(['Date', 'DateSchema'])).toThrow('"DateSchema"');
  });

  test('throws when a wire name is repeated, saying so', () => {
    expect(() => assertDistinctSafeSchemaNames(['User', 'User'])).toThrow(
      '"User" is carried twice',
    );
  });

  test('throws when a component would take a symbol the writer reserves', () => {
    expect(() => assertDistinctSafeSchemaNames(['endpoints'], ['endpoints'])).toThrow(
      '"endpoints"',
    );
    expect(() => assertDistinctSafeSchemaNames(['User'], ['endpoints'])).not.toThrow();
  });
});
