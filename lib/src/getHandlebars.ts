import type { HelperOptions } from 'handlebars';
import Handlebars from 'handlebars';

export const getHandlebars = () => {
  const instance = Handlebars.create();
  instance.registerHelper('ifeq', function (a: string, b: string, options: HelperOptions) {
    if (a === b) {
      // @ts-expect-error - Handlebars HelperOptions.fn expects context as 'any', but we're in strict mode
      return options.fn(this);
    }

    // @ts-expect-error - Handlebars HelperOptions.inverse expects context as 'any', but we're in strict mode
    return options.inverse(this);
  });
  instance.registerHelper(
    'ifNotEmptyObj',
    function (obj: Record<string, unknown>, options: HelperOptions) {
      if (typeof obj === 'object' && Object.keys(obj).length > 0) {
        // @ts-expect-error - Handlebars HelperOptions.fn expects context as 'any', but we're in strict mode
        return options.fn(this);
      }

      // @ts-expect-error - Handlebars HelperOptions.inverse expects context as 'any', but we're in strict mode
      return options.inverse(this);
    },
  );
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

  return instance;
};
