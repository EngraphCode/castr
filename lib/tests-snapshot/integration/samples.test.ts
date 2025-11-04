import SwaggerParser from '@apidevtools/swagger-parser';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { type Options, resolveConfig } from 'prettier';
import { getZodClientTemplateContext } from '../../src/context/index.js';
import { getHandlebars } from '../../src/rendering/index.js';
import { maybePretty } from '../../src/shared/maybe-pretty.js';

import { sync } from 'fast-glob';

import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { beforeAll, describe, expect, test } from 'vitest';

let prettierConfig: Options | null;
const pkgRoot = process.cwd();

beforeAll(async () => {
  prettierConfig = await resolveConfig(path.resolve(pkgRoot, '../'));
});

describe('openapi-examples', () => {
  const examplesPath = path.resolve(pkgRoot, String.raw`./examples/openapi/v3\.*/**/*.yaml`);
  const list = sync([examplesPath]);

  const template = getHandlebars().compile(
    readFileSync('./src/rendering/templates/schemas-with-metadata.hbs', 'utf8'),
  );
  const resultByFile = {} as Record<string, string>;

  for (const docPath of list) {
    test(docPath, async () => {
      const openApiDoc = (await SwaggerParser.parse(docPath)) as OpenAPIObject;
      const data = getZodClientTemplateContext(openApiDoc);

      const output = template({ ...data, options: { ...data.options, apiClientName: 'api' } });
      const prettyOutput = await maybePretty(output, prettierConfig);
      const fileName = docPath.replace('yaml', '');

      // means the .ts file is valid
      expect(prettyOutput).not.toBe(output);
      resultByFile[fileName] = prettyOutput;
    });
  }

  test('results by file', () => {
    expect(
      Object.fromEntries(
        Object.entries(resultByFile).map(([key, value]) => [
          key.split('examples/openapi/').at(1),
          value,
        ]),
      ),
    ).toMatchSnapshot();
  });
});
