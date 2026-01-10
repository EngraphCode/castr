import { camelCase, startCase } from 'lodash-es';

export const pathParamToVariableName = (name: string): string => {
  const hasColon = name.startsWith(':');
  const nameWithoutColon = hasColon ? name.slice(1) : name;
  const preserveUnderscore = nameWithoutColon.replaceAll('_', '#');
  const result = camelCase(preserveUnderscore.replaceAll('-', '_')).replaceAll('#', '_');
  return hasColon ? `:${result}` : result;
};

export const replaceHyphenatedPath = (path: string): string => {
  let result = '';
  let cursor = 0;

  while (cursor < path.length) {
    const openIndex = path.indexOf('{', cursor);
    if (openIndex === -1) {
      result += path.slice(cursor);
      break;
    }

    const closeIndex = path.indexOf('}', openIndex + 1);
    if (closeIndex === -1) {
      result += path.slice(cursor);
      break;
    }

    const segment = path.slice(cursor, openIndex);
    const parameterName = path.slice(openIndex + 1, closeIndex);
    const normalizedParameter = pathParamToVariableName(`:${parameterName}`);

    result += segment + normalizedParameter;
    cursor = closeIndex + 1;
  }

  return result;
};

/**
 * Extract path parameters from brackets in path string.
 * Uses index-based parsing instead of regex.
 * @internal
 */
function extractBracketedParams(path: string): { start: number; end: number; param: string }[] {
  const params: { start: number; end: number; param: string }[] = [];
  let cursor = 0;

  while (cursor < path.length) {
    const openIndex = path.indexOf('{', cursor);
    if (openIndex === -1) {
      break;
    }

    const closeIndex = path.indexOf('}', openIndex + 1);
    if (closeIndex === -1) {
      break;
    }

    params.push({
      start: openIndex,
      end: closeIndex + 1,
      param: path.slice(openIndex + 1, closeIndex),
    });
    cursor = closeIndex + 1;
  }

  return params;
}

/**
 * Check if a character code is a word character (alphanumeric, underscore, or hyphen).
 * @internal
 */
function isWordOrHyphenChar(code: number): boolean {
  return (
    (code >= 0x30 && code <= 0x39) || // 0-9
    (code >= 0x41 && code <= 0x5a) || // A-Z
    (code >= 0x61 && code <= 0x7a) || // a-z
    code === 0x5f || // _
    code === 0x2d // -
  );
}

/**
 * Replace non-word characters (except hyphen) with underscore.
 * @internal
 */
function replaceNonWordChars(str: string): string {
  const result: string[] = [];
  for (const char of str) {
    const code = char.codePointAt(0);
    if (code !== undefined && isWordOrHyphenChar(code)) {
      result.push(char);
    } else {
      result.push('_');
    }
  }
  return result.join('');
}

/**
 * Convert a string to PascalCase using lodash startCase.
 * @internal
 */
function toPascalCase(str: string): string {
  return startCase(str).replaceAll(' ', '');
}

/** @example turns `/media-objects/{id}` into `MediaObjectsId` */
export const pathToVariableName = (path: string): string => {
  // Use lodash's startCase for proper PascalCase (handles v1 → V1)
  // Apply startCase BEFORE removing slashes so lodash tokenizes correctly
  const pascalCased = toPascalCase(path);

  // Handle bracketed parameters
  const params = extractBracketedParams(pascalCased);
  if (params.length === 0) {
    return replaceNonWordChars(pascalCased);
  }

  // Replace bracketed params with PascalCase version
  let result = '';
  let lastEnd = 0;
  for (const { start, end, param } of params) {
    result += pascalCased.slice(lastEnd, start);
    result += toPascalCase(param);
    lastEnd = end;
  }
  result += pascalCased.slice(lastEnd);

  return replaceNonWordChars(result);
};
