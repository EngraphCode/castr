import type { SchemaObject } from 'openapi3-ts/oas30';
import { camelCase } from 'lodash-es';
import { match, P } from 'ts-pattern';

/**
 * Capitalizes the first letter of a string, preserving the rest
 * @example capitalize("hello") → "Hello"
 * @example capitalize("mediaObjects") → "MediaObjects"
 * @example capitalize("world") → "World"
 */
export const capitalize = (str: string): string => {
  if (!str) {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const asComponentSchema = (name: string): string => `#/components/schemas/${name}`;

export function normalizeString(text: string): string {
  const prefixed = prefixStringStartingWithNumberIfNeeded(text);
  return prefixed
    .normalize('NFKD') // The normalize() using NFKD method returns the Unicode Normalization Form of a given string.
    .trim() // Remove whitespace from both sides of a string (optional)
    .replaceAll(/\s+/g, '_') // Replace spaces with _
    .replaceAll(/-+/g, '_') // Replace - with _
    .replaceAll(/[^\w-]+/g, '_') // Remove all non-word chars
    .replaceAll(/--+/g, '-'); // Replace multiple - with single -
}

export const wrapWithQuotesIfNeeded = (str: string): string => {
  if (/^[a-zA-Z]\w*$/.test(str)) {
    return str;
  }

  return `"${str}"`;
};

const prefixStringStartingWithNumberIfNeeded = (str: string): string => {
  const firstAsNumber = Number(str[0]);
  if (typeof firstAsNumber === 'number' && !Number.isNaN(firstAsNumber)) {
    return '_' + str;
  }

  return str;
};

const pathParamWithBracketsRegex = /({\w+})/g;
const wordPrecededByNonWordCharacter = /[^\w-]+/g;

export const pathParamToVariableName = (name: string): string => {
  // Preserve colons (path params like :id) by temporarily replacing them
  // lodash camelCase treats : as a delimiter and strips it
  const hasColon = name.startsWith(':');
  const nameWithoutColon = hasColon ? name.slice(1) : name;

  // Replace all underscores with # to preserve them when doing camelCase conversion
  const preserveUnderscore = nameWithoutColon.replaceAll('_', '#');
  const result = camelCase(preserveUnderscore.replaceAll('-', '_')).replaceAll('#', '_');

  // Restore the colon prefix if it was present
  return hasColon ? `:${result}` : result;
};

const matcherRegex = /{(\b\w+(?:-\w+)*\b)}/g;
export const replaceHyphenatedPath = (path: string): string => {
  const matches = path.match(matcherRegex);
  if (matches === null) {
    return path.replaceAll(matcherRegex, ':$1');
  }

  matches.forEach((match) => {
    const replacement = pathParamToVariableName(match.replaceAll(matcherRegex, ':$1'));
    path = path.replaceAll(match, replacement);
  });
  return path;
};

/** @example turns `/media-objects/{id}` into `MediaObjectsId` */
export const pathToVariableName = (path: string): string =>
  capitalize(camelCase(path).replaceAll('/', '')) // /media-objects/{id} -> MediaObjects{id}
    .replaceAll(pathParamWithBracketsRegex, (group) => capitalize(group.slice(1, -1))) // {id} -> Id
    .replaceAll(wordPrecededByNonWordCharacter, '_'); // "/robots.txt" -> "/robots_txt"

/**
 * Primitive schema types (subset of SchemaObjectType from openapi3-ts)
 * Domain concept: types that map to simple primitives
 *
 * Pattern per RULES.md §5: Literals tied to library types
 */
export type PrimitiveSchemaType = Extract<
  NonNullable<SchemaObject['type']>,
  'string' | 'number' | 'integer' | 'boolean' | 'null'
>;

const PRIMITIVE_SCHEMA_TYPES: readonly PrimitiveSchemaType[] = [
  'string',
  'number',
  'integer',
  'boolean',
  'null',
] as const;

/**
 * Type predicate to narrow unknown values to primitive schema types
 * Pattern: literals tied to library types per RULES.md §5
 */
export const isPrimitiveSchemaType = (value: unknown): value is PrimitiveSchemaType => {
  if (typeof value !== 'string') {
    return false;
  }
  const typeStrings: readonly string[] = PRIMITIVE_SCHEMA_TYPES;
  return typeStrings.includes(value);
};

export const escapeControlCharacters = (str: string): string => {
  return str
    .replaceAll('\t', String.raw`\t`) // U+0009
    .replaceAll('\n', String.raw`\n`) // U+000A
    .replaceAll('\r', String.raw`\r`) // U+000D

    .replaceAll(
      // eslint-disable-next-line no-control-regex, sonarjs/no-control-regex
      /([\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\uFFFE\uFFFF])/g,
      (_m, p1: string) => {
        const codePoint = p1.codePointAt(0);
        if (codePoint === undefined) {
          return '';
        }
        const dec: number = codePoint;
        const hex: string = dec.toString(16);

        if (dec <= 0xff) {
          const paddedHex = `00${hex}`.slice(-2);
          return `\\x${paddedHex}`;
        }
        const paddedHex = `0000${hex}`.slice(-4);
        return `\\u${paddedHex}`;
      },
    )
    .replaceAll('/', String.raw`\/`);
};

export const toBoolean = (value: undefined | string | boolean, defaultValue: boolean): boolean =>
  match(value)
    .with(P.string.regex(/^false$/i), false, () => false)
    .with(P.string.regex(/^true$/i), true, () => true)
    .otherwise(() => defaultValue);
