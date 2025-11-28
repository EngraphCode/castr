import path, { dirname, resolve } from 'node:path';
import fs from 'node:fs/promises';

import type { Options } from 'prettier';
import type { getHandlebars } from './handlebars.js';
import { maybePretty } from '../shared/maybe-pretty.js';
import type { TemplateContext, TemplateContextOptions } from '../context/index.js';
import type { GenerationResult } from './generation-result.js';
import { fileURLToPath } from 'node:url';
import { serializeIR } from '../context/ir-serialization.js';
import { generateIndexFile, generateCommonFile, generateGroupFiles } from './templating-groups.js';

const templatesDir = resolve(dirname(fileURLToPath(import.meta.url)), './templates');

/**
 * Generate index file for grouped output
 *
 * @internal
 */

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
): Promise<GenerationResult> {
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

  const files = { ...outputByGroupName, ...groupFiles };
  return {
    type: 'grouped',
    files,
    paths: Object.keys(files),
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
  compiledTemplate: ReturnType<ReturnType<typeof getHandlebars>['compile']>,
  withValidationHelpers: boolean | undefined,
  withSchemaRegistry: boolean | undefined,
  distPath: string | undefined,
  prettierConfig: Options | null | undefined,
  willWriteToFile: boolean,
): Promise<GenerationResult> {
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
  compiledTemplate: ReturnType<ReturnType<typeof getHandlebars>['compile']>,
  withValidationHelpers: boolean | undefined,
  withSchemaRegistry: boolean | undefined,
  distPath: string | undefined,
  prettierConfig: Options | null | undefined,
  handlebars: ReturnType<typeof getHandlebars>,
  willWriteToFile: boolean,
): Promise<GenerationResult> {
  if (effectiveOptions.groupStrategy?.includes('file')) {
    return handleFileGrouping(
      data,
      effectiveOptions,
      compiledTemplate,
      withValidationHelpers,
      withSchemaRegistry,
      distPath,
      prettierConfig,
      handlebars,
      willWriteToFile,
    );
  }

  return handleSingleFileOutput(
    data,
    effectiveOptions,
    compiledTemplate,
    withValidationHelpers,
    withSchemaRegistry,
    distPath,
    prettierConfig,
    willWriteToFile,
  );
}

/**
 * Resolve template path from template name or custom path
 * @internal
 */
export function resolveTemplatePath(
  templatePath: string | undefined,
  effectiveTemplate: string,
): string {
  if (templatePath) {
    return templatePath;
  }
  return path.join(templatesDir, `${effectiveTemplate}.hbs`);
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
    const irPath = distPath.endsWith('.ts')
      ? distPath.replace(/\.ts$/, '.ir.json')
      : `${distPath}.ir.json`;
    await fs.writeFile(irPath, irJson, 'utf-8');
  }
}

/**
 * Compile Handlebars template
 * @internal
 */
export async function compileTemplate(
  templatePath: string | undefined,
  effectiveTemplate: string,
  handlebars: ReturnType<typeof getHandlebars>,
): Promise<ReturnType<ReturnType<typeof getHandlebars>['compile']>> {
  const resolvedTemplatePath = resolveTemplatePath(templatePath, effectiveTemplate);
  const source = await fs.readFile(resolvedTemplatePath, 'utf8');
  return handlebars.compile(source);
}
