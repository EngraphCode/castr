import { camelCase, join, split, startCase, startsWith } from 'lodash-es';

const COLON_PREFIX = ':' as const;
const UNDERSCORE_TOKEN = '_' as const;
const HASH_PLACEHOLDER = '#' as const;
const HYPHEN_TOKEN = '-' as const;
const SPACE_TOKEN = ' ' as const;
const EMPTY_TEXT = '' as const;
const OPEN_BRACE = '{' as const;
const CLOSE_BRACE = '}' as const;
const TOKEN_LITERAL = 'literal' as const;
const TOKEN_PARAM = 'param' as const;

interface PathToken {
  kind: typeof TOKEN_LITERAL | typeof TOKEN_PARAM;
  value: string;
}

interface PathParseState {
  tokens: PathToken[];
  literalBuffer: string;
  paramBuffer: string;
  insideParam: boolean;
}

function replaceTokenEverywhere(text: string, token: string, replacement: string): string {
  return join(split(text, token), replacement);
}

function removeLeadingColon(name: string): string {
  let result = EMPTY_TEXT;
  const startIndex = startsWith(name, COLON_PREFIX) ? 1 : 0;
  for (let i = startIndex; i < name.length; i++) {
    result += name[i] ?? EMPTY_TEXT;
  }
  return result;
}

function flushLiteralBuffer(state: PathParseState): void {
  if (state.literalBuffer.length === 0) {
    return;
  }
  state.tokens.push({ kind: TOKEN_LITERAL, value: state.literalBuffer });
  state.literalBuffer = EMPTY_TEXT;
}

function closeParameterToken(state: PathParseState): void {
  state.tokens.push({ kind: TOKEN_PARAM, value: state.paramBuffer });
  state.paramBuffer = EMPTY_TEXT;
  state.insideParam = false;
}

function handleParameterCharacter(state: PathParseState, char: string): void {
  if (char === CLOSE_BRACE) {
    closeParameterToken(state);
    return;
  }
  state.paramBuffer += char;
}

function handleLiteralCharacter(state: PathParseState, char: string): void {
  if (char !== OPEN_BRACE) {
    state.literalBuffer += char;
    return;
  }

  flushLiteralBuffer(state);
  state.insideParam = true;
}

function finalizePathTokens(state: PathParseState): PathToken[] {
  if (state.insideParam) {
    state.literalBuffer += `${OPEN_BRACE}${state.paramBuffer}`;
  }
  flushLiteralBuffer(state);
  return state.tokens;
}

function parseBracketedPath(path: string): PathToken[] {
  const state: PathParseState = {
    tokens: [],
    literalBuffer: EMPTY_TEXT,
    paramBuffer: EMPTY_TEXT,
    insideParam: false,
  };

  for (const char of path) {
    if (state.insideParam) {
      handleParameterCharacter(state, char);
      continue;
    }
    handleLiteralCharacter(state, char);
  }

  return finalizePathTokens(state);
}

export const pathParamToVariableName = (name: string): string => {
  const hasColon = startsWith(name, COLON_PREFIX);
  const nameWithoutColon = removeLeadingColon(name);
  const preserveUnderscore = replaceTokenEverywhere(
    nameWithoutColon,
    UNDERSCORE_TOKEN,
    HASH_PLACEHOLDER,
  );
  const hyphenToUnderscore = replaceTokenEverywhere(
    preserveUnderscore,
    HYPHEN_TOKEN,
    UNDERSCORE_TOKEN,
  );
  const camelCased = camelCase(hyphenToUnderscore);
  const result = replaceTokenEverywhere(camelCased, HASH_PLACEHOLDER, UNDERSCORE_TOKEN);
  return hasColon ? `${COLON_PREFIX}${result}` : result;
};

export const replaceHyphenatedPath = (path: string): string => {
  const tokens = parseBracketedPath(path);
  let result = EMPTY_TEXT;

  for (const token of tokens) {
    if (token.kind === TOKEN_LITERAL) {
      result += token.value;
      continue;
    }

    result += pathParamToVariableName(`${COLON_PREFIX}${token.value}`);
  }

  return result;
};

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
      result.push(UNDERSCORE_TOKEN);
    }
  }
  return result.join(EMPTY_TEXT);
}

/**
 * Convert a string to PascalCase using lodash startCase.
 * @internal
 */
function toPascalCase(str: string): string {
  return replaceTokenEverywhere(startCase(str), SPACE_TOKEN, EMPTY_TEXT);
}

/** @example turns `/media-objects/{id}` into `MediaObjectsId` */
export const pathToVariableName = (path: string): string => {
  const pascalCased = toPascalCase(path);
  const tokens = parseBracketedPath(pascalCased);

  let result = EMPTY_TEXT;
  for (const token of tokens) {
    if (token.kind === TOKEN_LITERAL) {
      result += token.value;
      continue;
    }
    result += toPascalCase(token.value);
  }

  return replaceNonWordChars(result);
};
