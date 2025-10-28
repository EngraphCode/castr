import { spawnSync } from 'node:child_process';
import { existsSync, unlinkSync } from 'node:fs';
import { readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import degit from 'degit';
import fg from 'fast-glob';

/**
 * Configuration for fetching OpenAPI examples from official sources.
 */
const EXAMPLES_CONFIG = {
  /** GitHub repository containing official OpenAPI examples */
  sourceRepo: 'OAI/learn.openapis.org/examples',
  /** Local directory where OpenAPI v3.x examples will be stored */
  targetDir: './examples/openapi',
  /** Temporary clone directory */
  tempDir: './.temp-examples',
} as const;

/**
 * Fetches official OpenAPI specification examples from the OpenAPI Initiative.
 *
 * This script:
 * 1. Clones examples from https://github.com/OAI/learn.openapis.org
 * 2. Filters to only OpenAPI 3.0 and 3.1 examples (removes v2.0 Swagger)
 * 3. Keeps only YAML files (removes JSON variants)
 * 4. Organizes examples into lib/examples/openapi/
 *
 * @throws {Error} When cloning fails or directory operations fail
 *
 * @example
 * ```bash
 * # Run from package.json script
 * pnpm fetch:examples
 *
 * # Or run directly
 * tsx lib/examples-fetcher.ts
 * ```
 *
 * @remarks
 * The examples are used for integration testing in tests-snapshot/samples.test.ts
 * to validate the entire code generation pipeline against real-world OpenAPI specs.
 *
 * @public
 */
async function fetchOpenApiExamples(): Promise<void> {
  console.log('🔄 Fetching OpenAPI examples from official repository...\n');

  try {
    // Step 1: Clean up any existing examples
    await cleanExistingExamples();

    // Step 2: Clone examples from GitHub
    await cloneExamplesFromGitHub();

    // Step 3: Filter to OpenAPI 3.x only (remove Swagger v2.0)
    await removeSwaggerV2Examples();

    // Step 4: Remove JSON files (keep only YAML)
    await removeJsonExamples();

    // Step 5: Move from temp to final location
    await moveToFinalLocation();

    console.log('\n✅ Successfully fetched OpenAPI examples!');
    console.log(`📁 Examples available at: ${EXAMPLES_CONFIG.targetDir}`);
  } catch (error) {
    console.error('\n❌ Failed to fetch examples:', error);
    throw error;
  }
}

/**
 * Removes existing examples directory to ensure clean state.
 */
async function cleanExistingExamples(): Promise<void> {
  console.log('🧹 Cleaning existing examples...');

  if (existsSync(EXAMPLES_CONFIG.targetDir)) {
    await rm(EXAMPLES_CONFIG.targetDir, { recursive: true, force: true });
    console.log(`   Removed: ${EXAMPLES_CONFIG.targetDir}`);
  }

  if (existsSync(EXAMPLES_CONFIG.tempDir)) {
    await rm(EXAMPLES_CONFIG.tempDir, { recursive: true, force: true });
    console.log(`   Removed: ${EXAMPLES_CONFIG.tempDir}`);
  }
}

/**
 * Clones the examples repository from GitHub using degit.
 */
async function cloneExamplesFromGitHub(): Promise<void> {
  console.log(`📥 Cloning from: ${EXAMPLES_CONFIG.sourceRepo}...`);

  const emitter = degit(EXAMPLES_CONFIG.sourceRepo, {
    cache: true,
    force: true,
    verbose: false,
  });

  emitter.on('info', (info) => {
    console.log(`   ${info.message}`);
  });

  await emitter.clone(EXAMPLES_CONFIG.tempDir);
  console.log(`   Cloned to: ${EXAMPLES_CONFIG.tempDir}`);
}

/**
 * Removes Swagger v2.0 examples, keeping only OpenAPI 3.0+ specs.
 */
async function removeSwaggerV2Examples(): Promise<void> {
  console.log('🗑️  Removing Swagger v2.0 examples (keeping OpenAPI 3.x only)...');

  const v2Path = join(EXAMPLES_CONFIG.tempDir, 'v2.0');

  if (existsSync(v2Path)) {
    // Safe: PATH is hardcoded literal, not user input
    // eslint-disable-next-line sonarjs/no-os-command-from-path
    spawnSync('rm -rf ./v2.0', { shell: true, cwd: EXAMPLES_CONFIG.tempDir });
    console.log('   Removed: v2.0 directory');
  } else {
    console.log('   No v2.0 directory found (already clean)');
  }
}

/**
 * Removes JSON example files, keeping only YAML versions.
 *
 * @remarks
 * Many examples have both YAML and JSON variants. We keep only YAML
 * for consistency and to reduce test execution time.
 */
async function removeJsonExamples(): Promise<void> {
  console.log('🗑️  Removing JSON examples (keeping YAML only)...');

  const jsonFiles = fg.sync([`${EXAMPLES_CONFIG.tempDir}/v3.*/**/*.json`]);

  if (jsonFiles.length === 0) {
    console.log('   No JSON files found');
    return;
  }

  jsonFiles.forEach((jsonPath) => {
    unlinkSync(jsonPath);
  });

  console.log(`   Removed: ${jsonFiles.length} JSON file(s)`);
}

/**
 * Moves filtered examples from temp directory to final location.
 */
async function moveToFinalLocation(): Promise<void> {
  console.log('📦 Moving examples to final location...');

  // Read what's in the temp directory
  const entries = await readdir(EXAMPLES_CONFIG.tempDir, { withFileTypes: true });
  const v3Dirs = entries.filter(
    (entry) => entry.isDirectory() && (entry.name === 'v3.0' || entry.name === 'v3.1'),
  );

  console.log(`   Found ${v3Dirs.length} OpenAPI 3.x directories`);

  // Move temp to final location
  spawnSync('mv', [EXAMPLES_CONFIG.tempDir, EXAMPLES_CONFIG.targetDir], {
    stdio: 'inherit',
  });

  console.log(`   Moved to: ${EXAMPLES_CONFIG.targetDir}`);

  // Report what we got
  for (const dir of v3Dirs) {
    const files = await readdir(join(EXAMPLES_CONFIG.targetDir, dir.name));
    const yamlFiles = files.filter((f) => f.endsWith('.yaml'));
    console.log(`   ${dir.name}: ${yamlFiles.length} YAML file(s)`);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fetchOpenApiExamples().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
