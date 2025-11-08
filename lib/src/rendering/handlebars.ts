import type { HelperOptions } from 'handlebars';
import Handlebars from 'handlebars';

export const getHandlebars = (): typeof Handlebars => {
  const instance = Handlebars.create();
  instance.registerHelper('ifeq', function (a: string, b: string, options: HelperOptions) {
    if (a === b) {
      // @ts-expect-error - Handlebars HelperOptions.fn expects context as 'any', but we're in strict mode
      return options.fn(this);
    }

    // @ts-expect-error - Handlebars HelperOptions.inverse expects context as 'any', but we're in strict mode
    return options.inverse(this);
  });
  instance.registerHelper('ifNotEmptyObj', function (obj: object, options: HelperOptions) {
    if (typeof obj === 'object' && Object.keys(obj).length > 0) {
      // @ts-expect-error - Handlebars HelperOptions.fn expects context as 'any', but we're in strict mode
      return options.fn(this);
    }

    // @ts-expect-error - Handlebars HelperOptions.inverse expects context as 'any', but we're in strict mode
    return options.inverse(this);
  });
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

  return instance;
};
