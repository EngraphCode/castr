import { prepareOpenApiDocument } from '../../src/shared/prepare-openapi-document.js';
import { getZodClientTemplateContext } from '../../src/schema-processing/context/index.js';
import { writeTypeScript } from '../../src/schema-processing/writers/typescript/index.js';
import { maybePretty } from '../../src/shared/maybe-pretty.js';

import { sync } from 'fast-glob';

import path from 'node:path';
import { describe, expect, test } from 'vitest';

/**
 * The samples snapshot encodes prettier's DEFAULT formatting; `null` pins
 * "no prettier config" for {@link maybePretty}. The pin keeps the suite
 * byte-identical wherever the checkout sits on disk: resolving a config from
 * the filesystem here would tie the snapshot to whatever config the search
 * happens to find (prettier's `resolveConfig` given a directory path starts
 * its search at the directory's PARENT, so a checkout nested inside another
 * repository — e.g. a git worktree — would pick up the enclosing
 * repository's config). `src/cli/resolve-prettier-config.test.ts` carries
 * the regression proof for that directory-argument escape.
 */
const SNAPSHOT_PRETTIER_CONFIG = null;

const pkgRoot = process.cwd();

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
      const prettyOutput = await maybePretty(output, SNAPSHOT_PRETTIER_CONFIG);
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
