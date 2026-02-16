import { match } from 'ts-pattern';
import { toLower } from 'lodash-es';

/**
 * Convert a string or boolean value to a boolean.
 * Uses ts-pattern for clean pattern matching.
 * @public
 */
export const toBoolean = (value: undefined | string | boolean, defaultValue: boolean): boolean =>
  match(toLower(value?.toString()))
    .with('false', () => false)
    .with('true', () => true)
    .otherwise(() => defaultValue);
