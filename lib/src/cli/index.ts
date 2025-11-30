/**
 * CLI Entry Point for openapi-zod-client
 *
 * Architecture Note:
 * The CLI uses prepareOpenApiDocument() for input processing, which ensures
 * consistent behavior with the programmatic API. All specs are:
 * 1. Bundled via Scalar (external $refs resolved, internal $refs preserved)
 * 2. Auto-upgraded to OpenAPI 3.1 (2.0 and 3.0.x specs are transparently upgraded)
 * 3. Type-validated at boundaries (no casting)
 *
 * This provides a unified pipeline for all input sources (file, URL, object).
 *
 * See: .agent/architecture/SCALAR-PIPELINE.md
 */

import { Command } from 'commander';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { resolveConfig } from 'prettier';

import { generateZodClientFromOpenAPI } from '../rendering/index.js';
import { getZodClientTemplateContext } from '../context/index.js';
import { prepareOpenApiDocument } from '../shared/prepare-openapi-document.js';
import type { CliOptions } from './helpers.js';
import {
  getPackageVersion,
  parseCliOptions,
  buildGenerationOptions,
  buildGenerationArgs,
} from './helpers.js';
import {
  determineEffectiveTemplate,
  buildEffectiveOptions,
} from '../rendering/generate-from-context.js';

const program = new Command();

program
  .name('openapi-zod-client')
  .description('Generate a type-safe API client with Zod validation from an OpenAPI specification')
  .version(getPackageVersion())
  .argument('<input>', 'path/url to OpenAPI/Swagger document as json/yaml')
  .option(
    '-o, --output <path>',
    'Output path for the generated client ts file (defaults to `<input>.client.ts`)',
  )
  .option(
    '-t, --template <name|path>',
    'Template to use: "schemas-only", "schemas-with-metadata" (default), or path to custom .hbs file',
  )
  .option(
    '-p, --prettier <path>',
    'Prettier config path that will be used to format the output client file',
  )
  .option('-b, --base-url <url>', 'Base url for the api')
  .option('--no-with-alias', 'Disable alias as api client methods')
  .option('-a, --with-alias', 'With alias as api client methods', true)
  .option(
    '--api-client-name <name>',
    'when using the default `template.hbs`, allow customizing the `export const {apiClientName}`',
  )
  .option('--error-expr <expr>', 'Pass an expression to determine if a response status is an error')
  .option(
    '--success-expr <expr>',
    'Pass an expression to determine which response status is the main success status',
  )
  .option(
    '--media-type-expr <expr>',
    'Pass an expression to determine which response content should be allowed',
  )
  .option('--export-schemas', 'When true, will export all `#/components/schemas`')
  .option(
    '--implicit-required',
    'When true, will make all properties of an object required by default (rather than the current opposite), unless an explicitly `required` array is set',
  )
  .option('--with-deprecated', 'when true, will keep deprecated endpoints in the api output')
  .option('--with-description', 'when true, will add z.describe(xxx)')
  .option('--with-docs', 'when true, will add jsdoc comments to generated types')
  .option(
    '--group-strategy <strategy>',
    "groups endpoints by a given strategy, possible values are: 'none' | 'tag' | 'method' | 'tag-file' | 'method-file'",
  )
  .option(
    '--complexity-threshold <number>',
    'schema complexity threshold to determine which one (using less than `<` operator) should be assigned to a variable',
  )
  .option(
    '--default-status <behavior>',
    'when defined as `auto-correct`, will automatically use `default` as fallback for `response` when no status code was declared',
  )
  .option('--all-readonly', 'when true, all generated objects and arrays will be readonly')
  .option(
    '--export-types',
    'When true, will defined types for all object schemas in `#/components/schemas`',
  )
  .option(
    '--additional-props-default-value [value]',
    'Set default value when additionalProperties is not provided. Default to true.',
    true,
  )
  .option(
    '--strict-objects [value]',
    "Use strict validation for objects so we don't allow unknown keys. Defaults to false.",
    false,
  )
  .option(
    '--no-client',
    'Generate schemas and metadata without HTTP client (auto-switches to schemas-with-metadata template). Perfect for using your own HTTP client (fetch, axios, etc.) while maintaining full Zod validation.',
  )
  .option(
    '--with-validation-helpers',
    'Generate validation helper functions (validateRequest, validateResponse) for manual request/response validation. Only applicable when using --no-client or schemas-with-metadata template.',
  )
  .option(
    '--with-schema-registry',
    'Generate schema registry builder function for dynamic schema access with optional key sanitization. Useful for SDK generation or runtime schema lookup. Only applicable when using --no-client or schemas-with-metadata template.',
  )
  .option(
    '--emit-mcp-manifest <path>',
    'Emit MCP tool manifest JSON to the specified path (relative to current working directory).',
  )
  .action(async (input: string, options: CliOptions) => {
    // eslint-disable-next-line no-console -- CLI output: inform user of operation start
    console.log('Retrieving OpenAPI document from', input);
    const openApiDoc = await prepareOpenApiDocument(input);
    const prettierConfig = await resolveConfig(options.prettier ?? './');
    const distPath = options.output ?? input + '.client.ts';

    const parsedOptions = parseCliOptions(options);
    const generationOptions = buildGenerationOptions(options, parsedOptions);
    const generationArgs = buildGenerationArgs(
      openApiDoc,
      distPath,
      prettierConfig,
      options,
      generationOptions,
    );

    const effectiveTemplate = determineEffectiveTemplate(
      generationArgs.noClient,
      generationArgs.template,
      generationOptions.template,
    );
    const effectiveOptions = buildEffectiveOptions(effectiveTemplate, generationOptions);

    if (options.emitMcpManifest) {
      const manifestPath = options.emitMcpManifest;
      const manifestDir = dirname(manifestPath);
      if (manifestDir && manifestDir !== '.') {
        await mkdir(manifestDir, { recursive: true });
      }

      const context = getZodClientTemplateContext(openApiDoc, effectiveOptions);
      const manifestEntries = context.mcpTools.map(({ tool, httpOperation, security }) => ({
        tool,
        httpOperation,
        security,
      }));

      await writeFile(manifestPath, `${JSON.stringify(manifestEntries, null, 2)}\n`, 'utf8');
      // eslint-disable-next-line no-console -- CLI output
      console.log(`Wrote MCP manifest to ${manifestPath}`);
    }

    await generateZodClientFromOpenAPI(generationArgs);
    // eslint-disable-next-line no-console -- CLI output: inform user of successful completion
    console.log(`Done generating <${distPath}> !`);
  });

program.parse();
