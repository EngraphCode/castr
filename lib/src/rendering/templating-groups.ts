import path from 'node:path';
import fs from 'node:fs/promises';
import { pick } from 'lodash-es';
import type { Options } from 'prettier';
import { capitalize } from '../shared/utils/index.js';
import { logger } from '../shared/utils/logger.js';
import { maybePretty } from '../shared/maybe-pretty.js';
import type { TemplateContext, TemplateContextOptions } from '../context/index.js';
import { writeIndexFile, writeCommonFile, writeTypeScript } from '../writers/typescript.js';

/**
 * Generate index file for grouped output
 *
 * @internal
 */
export async function generateIndexFile(
  data: TemplateContext,
  distPath: string | undefined,
  prettierConfig: Options | null | undefined,
  willWriteToFile: boolean,
): Promise<string> {
  const groupNames = Object.fromEntries(
    Object.keys(data.endpointsGroups).map((groupName) => [
      `${capitalize(groupName)}Api`,
      groupName,
    ]),
  );

  const indexOutput = await maybePretty(writeIndexFile(groupNames), prettierConfig);

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
  willWriteToFile: boolean,
): Promise<string | null> {
  const commonSchemaNames = [...(data.commonSchemaNames ?? [])];
  if (commonSchemaNames.length === 0) {
    return null;
  }

  const commonOutput = await maybePretty(
    writeCommonFile(pick(data.schemas, commonSchemaNames), pick(data.types, commonSchemaNames)),
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
  effectiveOptions: TemplateContextOptions,
  withValidationHelpers: boolean | undefined,
  withSchemaRegistry: boolean | undefined,
  distPath: string | undefined,
  prettierConfig: Options | null | undefined,
  willWriteToFile: boolean,
): Promise<Record<string, string>> {
  const outputByGroupName: Record<string, string> = {};

  for (const groupName in data.endpointsGroups) {
    const groupContext: TemplateContext = {
      ...data,
      ...data.endpointsGroups[groupName],
      options: {
        ...effectiveOptions,
        groupStrategy: 'none',
        apiClientName: `${capitalize(groupName)}Api`,
        withValidationHelpers: withValidationHelpers ?? false,
        withSchemaRegistry: withSchemaRegistry ?? false,
      },
    };

    const groupOutput = writeTypeScript(groupContext);
    const prettyGroupOutput = await maybePretty(groupOutput, prettierConfig);
    outputByGroupName[groupName] = prettyGroupOutput;

    if (willWriteToFile && distPath) {
      logger.info('Writing to', path.join(distPath, `${groupName}.ts`));
      await fs.writeFile(path.join(distPath, `${groupName}.ts`), prettyGroupOutput);
    }
  }

  return outputByGroupName;
}
