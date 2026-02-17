import path from 'node:path';
import fs from 'node:fs/promises';
import type { Options } from 'prettier';
import { upperFirst } from 'lodash-es';
import { logger } from '../shared/utils/logger.js';
import { maybePretty } from '../shared/maybe-pretty.js';
import type {
  TemplateContext,
  TemplateContextOptions,
} from '../schema-processing/context/index.js';
import {
  writeIndexFile,
  writeCommonFile,
  writeTypeScript,
} from '../schema-processing/writers/typescript/index.js';

function getSortedGroupNames(endpointsGroups: TemplateContext['endpointsGroups']): string[] {
  return Object.keys(endpointsGroups).sort((left, right) => left.localeCompare(right));
}

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
  const sortedGroupNames = getSortedGroupNames(data.endpointsGroups);
  const groupNames = Object.fromEntries(
    sortedGroupNames.map((groupName) => [`${upperFirst(groupName)}Api`, groupName]),
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

  const commonOutput = await maybePretty(writeCommonFile(data, commonSchemaNames), prettierConfig);

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
  const sortedGroupNames = getSortedGroupNames(data.endpointsGroups);

  for (const groupName of sortedGroupNames) {
    const groupContext: TemplateContext = {
      ...data,
      ...data.endpointsGroups[groupName],
      options: {
        ...effectiveOptions,
        groupStrategy: 'none',
        apiClientName: `${upperFirst(groupName)}Api`,
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
