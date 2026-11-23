import { describe, expect, it } from 'vitest';

import { assertSchemaComponent } from '../../../ir/index.js';
import { parseZodSource } from '../index.js';

function read(expression: string): ReturnType<typeof assertSchemaComponent>['schema'] {
  const source = `import { z } from 'zod';\nexport const Subject = ${expression};\n`;
  return assertSchemaComponent(parseZodSource(source).ir.components[0]).schema;
}

describe('the Zod reader and a default held as an annotation', () => {
  it.each([
    ['z.number().meta({ default: 20 })', 20],
    ['z.boolean().meta({ default: false })', false],
    ['z.string().nullable().meta({ description: "d", default: "x" })', 'x'],
  ])('reads %s as an annotation that inserts nothing', (expression, value) => {
    const schema = read(expression);

    expect(schema.default).toBe(value);
    expect(schema.metadata.zodChain.defaults).toEqual([]);
  });

  it('still reads a Zod default as one that inserts', () => {
    const schema = read('z.number().default(20)');

    expect(schema.default).toBe(20);
    expect(schema.metadata.zodChain.defaults).toEqual(['.default(20)']);
  });
});
