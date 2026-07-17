import { prepareOpenApiDocument } from '../../src/shared/prepare-openapi-document.js';
import { type Options, resolveConfig } from 'prettier';
import { getZodClientTemplateContext } from '../../src/schema-processing/context/index.js';
import { writeTypeScript } from '../../src/schema-processing/writers/typescript/index.js';
import { maybePretty } from '../../src/shared/maybe-pretty.js';

import { sync } from 'fast-glob';

import path from 'node:path';
import { beforeAll, describe, expect, test } from 'vitest';

let prettierConfig: Options | null;
const pkgRoot = process.cwd();

beforeAll(async () => {
  // Resolve the prettier config that governs files in this package. Anchoring
  // on a file INSIDE the package makes resolution deterministic: prettier
  // searches upward from the file's directory, so this finds the repo-root
  // config regardless of where the checkout lives. (The previous anchor —
  // the repo root directory itself — made prettier search the repo's PARENT
  // directories, resolving null on one machine and an unrelated config on
  // another.)
  prettierConfig = await resolveConfig(path.resolve(pkgRoot, 'package.json'));
});

describe('openapi-examples', () => {
  const standardExamplesPath = path.resolve(
    pkgRoot,
    String.raw`./examples/openapi/v3\.*/**/*.yaml`,
  );
  const customExamplesPath = path.resolve(
    pkgRoot,
    String.raw`./examples/custom/openapi/v3\.*/**/*.yaml`,
  );

  const list = [...sync([standardExamplesPath]), ...sync([customExamplesPath])]
    .filter((file) => !file.includes('webhook-example.yaml'))
    .sort();

  const examplesRoot = path.resolve(pkgRoot, './examples');
  const resultByFile: Record<string, string> = {};

  for (const docPath of list) {
    test(docPath, async () => {
      const openApiDoc = await prepareOpenApiDocument(docPath);
      const data = getZodClientTemplateContext(openApiDoc);

      const output = writeTypeScript({
        ...data,
        options: { ...data.options, apiClientName: 'api' },
      });
      const prettyOutput = await maybePretty(output, prettierConfig);
      const relativePath = path.relative(examplesRoot, docPath);
      const key = relativePath.replace(/\.ya?ml$/u, '');

      // means the .ts file is valid
      expect(prettyOutput).not.toBe(output);
      resultByFile[key] = prettyOutput;
    });
  }

  test('results by file', () => {
    const expectedKeys = list.map((docPath) =>
      path.relative(examplesRoot, docPath).replace(/\.ya?ml$/u, ''),
    );
    const actualKeys = Object.keys(resultByFile).sort();
    const sortedExpectedKeys = [...expectedKeys].sort();
    expect(actualKeys).toEqual(sortedExpectedKeys);
    expect(actualKeys).toContain('custom/openapi/v3.1/multi-auth');
    for (const key of expectedKeys) {
      expect(resultByFile[key]).toBeDefined();
    }
    const toDisplayKey = (key: string): string => {
      if (key.startsWith('custom/openapi/')) {
        return key.replace(/^custom\/openapi\//u, 'custom/');
      }
      if (key.startsWith('openapi/')) {
        return key.replace(/^openapi\//u, '');
      }
      return key;
    };

    const snapshotObject = Object.fromEntries(
      expectedKeys.map((key) => [toDisplayKey(key), resultByFile[key]]),
    );
    expect(snapshotObject).toMatchSnapshot();
  });
});
