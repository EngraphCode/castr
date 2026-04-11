import { join, split } from 'lodash-es';

import type { ValidationError } from '../validation-errors.js';

const JSON_POINTER_SEPARATOR = '/';
const JSON_POINTER_ESCAPED_SLASH = '~1';
const JSON_POINTER_ESCAPED_TILDE = '~0';
const OPEN_BRACE = '{';
const CLOSE_BRACE = '}';
const PATHS_KEY = 'paths';
const PATH_KEY_PREFIX = '/';
const MALFORMED_PATH_TEMPLATE_PREFIX = 'Malformed path template: ';
const TILDE_TOKEN = '~';

interface TemplateState {
  insideTemplate: boolean;
  templateLength: number;
}

interface PathsCarrier {
  paths?: unknown;
}

function isObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null;
}

function hasPathsProperty(value: object): value is PathsCarrier {
  return PATHS_KEY in value;
}

function replaceTokenEverywhere(text: string, token: string, replacement: string): string {
  return join(split(text, token), replacement);
}

function escapeJsonPointerSegment(segment: string): string {
  const escapedTildes = replaceTokenEverywhere(segment, TILDE_TOKEN, JSON_POINTER_ESCAPED_TILDE);
  return replaceTokenEverywhere(escapedTildes, JSON_POINTER_SEPARATOR, JSON_POINTER_ESCAPED_SLASH);
}

function createPathPointer(pathKey: string): string {
  return `${JSON_POINTER_SEPARATOR}${PATHS_KEY}${JSON_POINTER_SEPARATOR}${escapeJsonPointerSegment(pathKey)}`;
}

function onOpenBrace(state: TemplateState): string | undefined {
  if (state.insideTemplate) {
    return `${MALFORMED_PATH_TEMPLATE_PREFIX}nested "${OPEN_BRACE}" is not allowed inside a template expression`;
  }

  state.insideTemplate = true;
  state.templateLength = 0;
  return undefined;
}

function onCloseBrace(state: TemplateState): string | undefined {
  if (!state.insideTemplate) {
    return `${MALFORMED_PATH_TEMPLATE_PREFIX}unexpected "${CLOSE_BRACE}" outside a template expression`;
  }

  if (state.templateLength === 0) {
    return `${MALFORMED_PATH_TEMPLATE_PREFIX}empty template expressions like "{}" are not allowed`;
  }

  state.insideTemplate = false;
  return undefined;
}

function onLiteralCharacter(state: TemplateState): void {
  if (state.insideTemplate) {
    state.templateLength += 1;
  }
}

function validatePathCharacter(char: string, state: TemplateState): string | undefined {
  switch (char) {
    case OPEN_BRACE:
      return onOpenBrace(state);
    case CLOSE_BRACE:
      return onCloseBrace(state);
    default:
      onLiteralCharacter(state);
      return undefined;
  }
}

function finishValidation(state: TemplateState): string | undefined {
  if (!state.insideTemplate) {
    return undefined;
  }

  return `${MALFORMED_PATH_TEMPLATE_PREFIX}missing closing "${CLOSE_BRACE}" for a template expression`;
}

function validatePathTemplate(pathKey: string): string | undefined {
  const state: TemplateState = {
    insideTemplate: false,
    templateLength: 0,
  };

  for (const char of pathKey) {
    const message = validatePathCharacter(char, state);
    if (message !== undefined) {
      return message;
    }
  }

  return finishValidation(state);
}

export function validateTopLevelPathTemplates(document: unknown): ValidationError[] {
  if (!isObject(document)) {
    return [];
  }

  if (!hasPathsProperty(document)) {
    return [];
  }

  const { paths } = document;
  if (!isObject(paths)) {
    return [];
  }

  const errors: ValidationError[] = [];

  for (const pathKey of Object.keys(paths)) {
    if (pathKey[0] !== PATH_KEY_PREFIX) {
      continue;
    }

    const message = validatePathTemplate(pathKey);
    if (message === undefined) {
      continue;
    }

    errors.push({
      message,
      path: createPathPointer(pathKey),
    });
  }

  return errors;
}
