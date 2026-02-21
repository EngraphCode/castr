import path from 'node:path';
import fs from 'node:fs/promises';

import type { Options } from 'prettier';
import { maybePretty } from '../shared/maybe-pretty.js';
import type {
  TemplateContext,
  TemplateContextOptions,
} from '../schema-processing/context/index.js';
import type { GenerationResult } from './generation-result.js';
import { serializeIR } from '../schema-processing/ir/index.js';
import { generateIndexFile, generateCommonFile, generateGroupFiles } from './templating-groups.js';
import { writeTypeScript } from '../schema-processing/writers/typescript/index.js';

const GROUP_STRATEGY_TAG_FILE = 'tag-file' as const;
const GROUP_STRATEGY_METHOD_FILE = 'method-file' as const;
const TYPESCRIPT_FILE_EXTENSION = '.ts' as const;
const IR_JSON_FILE_SUFFIX = '.ir.json' as const;

function getSortedFilePaths(files: Record<string, string>): string[] {
  return Object.keys(files).sort((left, right) => left.localeCompare(right));
}

function isFileGroupingStrategy(
  strategy: TemplateContextOptions['groupStrategy'] | undefined,
): strategy is typeof GROUP_STRATEGY_TAG_FILE | typeof GROUP_STRATEGY_METHOD_FILE {
  return strategy === GROUP_STRATEGY_TAG_FILE || strategy === GROUP_STRATEGY_METHOD_FILE;
}

/**
 * Handle file grouping output strategy
 *
 * @internal
 */
export async function handleFileGrouping(
  data: TemplateContext,
  effectiveOptions: TemplateContextOptions,
  withValidationHelpers: boolean | undefined,
  withSchemaRegistry: boolean | undefined,
  distPath: string | undefined,
  prettierConfig: Options | null | undefined,
  willWriteToFile: boolean,
): Promise<GenerationResult> {
  const outputByGroupName: Record<string, string> = {};

  if (willWriteToFile && distPath) {
    await fs.mkdir(path.dirname(distPath), { recursive: true });
  }

  const indexOutput = await generateIndexFile(data, distPath, prettierConfig, willWriteToFile);
  outputByGroupName['__index'] = indexOutput;

  const commonOutput = await generateCommonFile(data, distPath, prettierConfig, willWriteToFile);
  if (commonOutput !== null) {
    outputByGroupName['__common'] = commonOutput;
  }

  const groupFiles = await generateGroupFiles(
    data,
    effectiveOptions,
    withValidationHelpers,
    withSchemaRegistry,
    distPath,
    prettierConfig,
    willWriteToFile,
  );

  const files = { ...outputByGroupName, ...groupFiles };
  return {
    type: 'grouped',
    files,
    paths: getSortedFilePaths(files),
  };
}

/**
 * Handle single file output strategy
 *
 * @internal
 */
export async function handleSingleFileOutput(
  data: TemplateContext,
  effectiveOptions: TemplateContextOptions,
  withValidationHelpers: boolean | undefined,
  withSchemaRegistry: boolean | undefined,
  distPath: string | undefined,
  prettierConfig: Options | null | undefined,
  willWriteToFile: boolean,
): Promise<GenerationResult> {
  const output = writeTypeScript({
    ...data,
    options: {
      ...effectiveOptions,
      apiClientName: effectiveOptions?.apiClientName ?? 'api',
      withValidationHelpers: withValidationHelpers ?? false,
      withSchemaRegistry: withSchemaRegistry ?? false,
    },
  });
  const prettyOutput = await maybePretty(output, prettierConfig);

  if (willWriteToFile && distPath) {
    await fs.writeFile(distPath, prettyOutput);
  }

  return {
    type: 'single',
    content: prettyOutput,
    path: distPath,
  };
}

/**
 * Render the final output based on group strategy
 *
 * @internal
 */
export function renderOutput(
  data: TemplateContext,
  effectiveOptions: TemplateContextOptions,
  withValidationHelpers: boolean | undefined,
  withSchemaRegistry: boolean | undefined,
  distPath: string | undefined,
  prettierConfig: Options | null | undefined,
  willWriteToFile: boolean,
): Promise<GenerationResult> {
  const groupStrategy = effectiveOptions.groupStrategy;
  if (isFileGroupingStrategy(groupStrategy)) {
    return handleFileGrouping(
      data,
      effectiveOptions,
      withValidationHelpers,
      withSchemaRegistry,
      distPath,
      prettierConfig,
      willWriteToFile,
    );
  }

  return handleSingleFileOutput(
    data,
    effectiveOptions,
    withValidationHelpers,
    withSchemaRegistry,
    distPath,
    prettierConfig,
    willWriteToFile,
  );
}

/**
 * Handle IR debug output
 * @internal
 */
export async function handleDebugIR(
  data: TemplateContext,
  distPath: string | undefined,
  disableWriteToFile: boolean | undefined,
  debugIR: boolean | undefined,
): Promise<void> {
  if (debugIR && data._ir && distPath && !disableWriteToFile) {
    const irJson = serializeIR(data._ir);
    const parsedPath = path.parse(distPath);
    const irPath =
      parsedPath.ext === TYPESCRIPT_FILE_EXTENSION
        ? path.join(parsedPath.dir, `${parsedPath.name}${IR_JSON_FILE_SUFFIX}`)
        : `${distPath}${IR_JSON_FILE_SUFFIX}`;
    await fs.writeFile(irPath, irJson, 'utf-8');
  }
}
