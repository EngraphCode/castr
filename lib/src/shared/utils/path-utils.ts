import { camelCase } from 'lodash-es';
import { capitalize } from './string-utils.js';

const pathParamWithBracketsRegex = /({\w+})/g;
const wordPrecededByNonWordCharacter = /[^\w-]+/g;

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

/** @example turns `/media-objects/{id}` into `MediaObjectsId` */
export const pathToVariableName = (path: string): string =>
  capitalize(camelCase(path).replaceAll('/', ''))
    .replaceAll(pathParamWithBracketsRegex, (group) => capitalize(group.slice(1, -1)))
    .replaceAll(wordPrecededByNonWordCharacter, '_');
