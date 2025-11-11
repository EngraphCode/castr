import type { HelperOptions } from 'handlebars';
import Handlebars from 'handlebars';

/**
 * Handlebars data context interface
 *
 * NOTE: This file will be completely removed in Phase 3 Session 3.7 (Handlebars Decommission).
 * Type safety compromises here are temporary and will not exist after ts-morph migration.
 *
 * eslint-disable-next-line @typescript-eslint/no-explicit-any -- Temporary: Handlebars library uses 'any' for data context, will be removed in Phase 3.7
 */
interface HandlebarsDataContext {
  root?: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

/**
 * Register ifeq helper: conditional equality check
 */
function registerIfeqHelper(instance: typeof Handlebars): void {
  instance.registerHelper('ifeq', function (a: string, b: string, options: HelperOptions) {
    if (a === b) {
      // @ts-expect-error - Handlebars HelperOptions.fn expects context as 'any', but we're in strict mode
      return options.fn(this);
    }
    // @ts-expect-error - Handlebars HelperOptions.inverse expects context as 'any', but we're in strict mode
    return options.inverse(this);
  });
}

/**
 * Register ifNotEmptyObj helper: check if object is non-empty
 */
function registerIfNotEmptyObjHelper(instance: typeof Handlebars): void {
  instance.registerHelper('ifNotEmptyObj', function (obj: object, options: HelperOptions) {
    if (typeof obj === 'object' && Object.keys(obj).length > 0) {
      // @ts-expect-error - Handlebars HelperOptions.fn expects context as 'any', but we're in strict mode
      return options.fn(this);
    }
    // @ts-expect-error - Handlebars HelperOptions.inverse expects context as 'any', but we're in strict mode
    return options.inverse(this);
  });
}

/**
 * Register toCamelCase helper: convert string to camelCase
 */
function registerToCamelCaseHelper(instance: typeof Handlebars): void {
  instance.registerHelper('toCamelCase', function (input: string) {
    // Check if input string is already in camelCase
    if (/^[a-z][a-zA-Z0-9]*$/.test(input)) {
      return input;
    }

    const words = input.split(/[\s_-]/);
    return words
      .map((word, index) => {
        if (index === 0) {
          return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join('');
  });
}

/**
 * Register json helper: stringify with optional indentation
 */
function registerJsonHelper(instance: typeof Handlebars): void {
  instance.registerHelper('json', function (value: unknown, indent?: number) {
    const json = JSON.stringify(value, null, 2);
    if (indent === undefined) {
      return json;
    }

    const indentValue = Number(indent);
    if (Number.isNaN(indentValue) || indentValue <= 0) {
      return json;
    }

    const indentString = ' '.repeat(indentValue);
    return json
      .split('\n')
      .map((line, index) => (index === 0 ? line : `${indentString}${line}`))
      .join('\n');
  });
}

/**
 * Register isFirstOfType helper: check if first occurrence of type
 * Used to prevent duplicate keys when iterating parameters
 *
 * NOTE: Will be removed in Phase 3 Session 3.7 (Handlebars Decommission)
 */
function registerIsFirstOfTypeHelper(instance: typeof Handlebars): void {
  instance.registerHelper(
    'isFirstOfType',
    function (currentType: string, targetType: string, scopeId: number, options: HelperOptions) {
      // Handlebars types options.data as 'any', runtime validation before narrowing
      const dataUnknown: unknown = options.data;
      const data =
        dataUnknown && typeof dataUnknown === 'object'
          ? // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Temporary: Handlebars integration, will be removed in Phase 3.7
            (dataUnknown as HandlebarsDataContext)
          : {};
      const root = data.root || {};

      // Use scopeId (endpoint index) to create a unique key per endpoint
      const seenKey = `_seen_${scopeId}_${targetType}`;

      if (currentType === targetType) {
        if (!root[seenKey]) {
          root[seenKey] = true;
          // @ts-expect-error - Handlebars HelperOptions.fn expects context as 'any', but we're in strict mode
          return options.fn(this);
        }
      }
      // @ts-expect-error - Handlebars HelperOptions.inverse expects context as 'any', but we're in strict mode
      return options.inverse(this);
    },
  );
}

/**
 * Create and configure Handlebars instance with custom helpers
 */
export const getHandlebars = (): typeof Handlebars => {
  const instance = Handlebars.create();

  registerIfeqHelper(instance);
  registerIfNotEmptyObjHelper(instance);
  registerToCamelCaseHelper(instance);
  registerJsonHelper(instance);
  registerIsFirstOfTypeHelper(instance);

  return instance;
};
