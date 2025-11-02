import { match, P } from 'ts-pattern';

export const toBoolean = (value: undefined | string | boolean, defaultValue: boolean): boolean =>
  match(value)
    .with(P.string.regex(/^false$/i), false, () => false)
    .with(P.string.regex(/^true$/i), true, () => true)
    .otherwise(() => defaultValue);
