import path, { dirname, resolve } from 'node:path';
import fs from 'node:fs/promises';

import { pick } from 'lodash-es';
import { capitalize } from '../shared/utils/index.js';
import type { Options } from 'prettier';

import type { getHandlebars } from './handlebars.js';
import { logger } from '../shared/utils/logger.js';
import { maybePretty } from '../shared/maybe-pretty.js';
import type { TemplateContext, TemplateContextOptions } from '../context/index.js';
import { fileURLToPath } from 'node:url';

const templatesDir = resolve(dirname(fileURLToPath(import.meta.url)), './templates');

/**
 * Generate index file for grouped output
 *
 * @internal
 */
export async function generateIndexFile(
  data: TemplateContext,
  distPath: string | undefined,
  prettierConfig: Options | null | undefined,
  hbs: ReturnType<typeof getHandlebars>,
  willWriteToFile: boolean,
): Promise<string> {
  const groupNames = Object.fromEntries(
    Object.keys(data.endpointsGroups).map((groupName) => [
      `${capitalize(groupName)}Api`,
      groupName,
    ]),
  );

  const indexSource = await fs.readFile(path.join(templatesDir, 'grouped-index.hbs'), 'utf8');
  const indexTemplate = hbs.compile(indexSource);
  const indexOutput = await maybePretty(indexTemplate({ groupNames }), prettierConfig);

  if (willWriteToFile && distPath) {
    await fs.writeFile(path.join(distPath, 'index.ts'), indexOutput);
  }

  return indexOutput;
}

/**
 * Generate common schemas file for grouped output
 *
 * @internal
 */
export async function generateCommonFile(
  data: TemplateContext,
  distPath: string | undefined,
  prettierConfig: Options | null | undefined,
  hbs: ReturnType<typeof getHandlebars>,
  willWriteToFile: boolean,
): Promise<string | null> {
  const commonSchemaNames = [...(data.commonSchemaNames ?? [])];
  if (commonSchemaNames.length === 0) {
    return null;
  }

  const commonSource = await fs.readFile(path.join(templatesDir, 'grouped-common.hbs'), 'utf8');
  const commonTemplate = hbs.compile(commonSource);
  const commonOutput = await maybePretty(
    commonTemplate({
      schemas: pick(data.schemas, commonSchemaNames),
      types: pick(data.types, commonSchemaNames),
    }),
    prettierConfig,
  );

  if (willWriteToFile && distPath) {
    await fs.writeFile(path.join(distPath, 'common.ts'), commonOutput);
  }

  return commonOutput;
}

/**
 * Generate group files for grouped output
 *
 * @internal
 */
export async function generateGroupFiles(
  data: TemplateContext,
  compiledTemplate: ReturnType<ReturnType<typeof getHandlebars>['compile']>,
  effectiveOptions: TemplateContextOptions,
  withValidationHelpers: boolean | undefined,
  withSchemaRegistry: boolean | undefined,
  distPath: string | undefined,
  prettierConfig: Options | null | undefined,
  willWriteToFile: boolean,
): Promise<Record<string, string>> {
  const outputByGroupName: Record<string, string> = {};

  for (const groupName in data.endpointsGroups) {
    const groupOutput = compiledTemplate({
      ...data,
      ...data.endpointsGroups[groupName],
      options: {
        ...effectiveOptions,
        groupStrategy: 'none',
        apiClientName: `${capitalize(groupName)}Api`,
        withValidationHelpers,
        withSchemaRegistry,
      },
    });
    const prettyGroupOutput = await maybePretty(groupOutput, prettierConfig);
    outputByGroupName[groupName] = prettyGroupOutput;

    if (willWriteToFile && distPath) {
      logger.info('Writing to', path.join(distPath, `${groupName}.ts`));
      await fs.writeFile(path.join(distPath, `${groupName}.ts`), prettyGroupOutput);
    }
  }

  return outputByGroupName;
}

/**
 * Handle file grouping output strategy
 *
 * @internal
 */
export async function handleFileGrouping(
  data: TemplateContext,
  effectiveOptions: TemplateContextOptions,
  compiledTemplate: ReturnType<ReturnType<typeof getHandlebars>['compile']>,
  withValidationHelpers: boolean | undefined,
  withSchemaRegistry: boolean | undefined,
  distPath: string | undefined,
  prettierConfig: Options | null | undefined,
  hbs: ReturnType<typeof getHandlebars>,
  willWriteToFile: boolean,
): Promise<Record<string, string>> {
  const outputByGroupName: Record<string, string> = {};

  if (willWriteToFile && distPath) {
    await fs.mkdir(path.dirname(distPath), { recursive: true });
  }

  const indexOutput = await generateIndexFile(data, distPath, prettierConfig, hbs, willWriteToFile);
  outputByGroupName['__index'] = indexOutput;

  const commonOutput = await generateCommonFile(
    data,
    distPath,
    prettierConfig,
    hbs,
    willWriteToFile,
  );
  if (commonOutput !== null) {
    outputByGroupName['__common'] = commonOutput;
  }

  const groupFiles = await generateGroupFiles(
    data,
    compiledTemplate,
    effectiveOptions,
    withValidationHelpers,
    withSchemaRegistry,
    distPath,
    prettierConfig,
    willWriteToFile,
  );

  return { ...outputByGroupName, ...groupFiles };
}

/**
 * Handle single file output strategy
 *
 * @internal
 */
export async function handleSingleFileOutput(
  data: TemplateContext,
  effectiveOptions: TemplateContextOptions,
  compiledTemplate: ReturnType<ReturnType<typeof getHandlebars>['compile']>,
  withValidationHelpers: boolean | undefined,
  withSchemaRegistry: boolean | undefined,
  distPath: string | undefined,
  prettierConfig: Options | null | undefined,
  willWriteToFile: boolean,
): Promise<string> {
  const output = compiledTemplate({
    ...data,
    options: {
      ...effectiveOptions,
      apiClientName: effectiveOptions?.apiClientName ?? 'api',
      withValidationHelpers,
      withSchemaRegistry,
    },
  });
  const prettyOutput = await maybePretty(output, prettierConfig);

  if (willWriteToFile && distPath) {
    await fs.writeFile(distPath, prettyOutput);
  }

  return prettyOutput;
}
