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
  capitalize(camelCase(path).replaceAll('/', ''))
    .replaceAll(pathParamWithBracketsRegex, (group) => capitalize(group.slice(1, -1)))
    .replaceAll(wordPrecededByNonWordCharacter, '_');
