import { existsSync } from 'node:fs';
import { readdir, rename, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import degit from 'degit';

// Get the directory where this script is located
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Configuration for fetching OpenAPI examples from official sources.
 */
const EXAMPLES_CONFIG = {
  /** GitHub repository containing official OpenAPI examples */
  sourceRepo: 'OAI/learn.openapis.org/examples',
  /** Local directory where OpenAPI v3.x examples will be stored (relative to script location) */
  targetDir: resolve(__dirname, './examples/openapi'),
  /** Temporary clone directory (relative to script location) */
  tempDir: resolve(__dirname, './.temp-examples'),
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

    // Step 4: Move from temp to final location
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

  // Clone full repo to a temp location, then move just the examples subdirectory
  const fullRepoTemp = resolve(__dirname, './.temp-full-repo');

  const emitter = degit('OAI/learn.openapis.org', {
    cache: false, // Disable cache to avoid corruption issues
    force: true,
    verbose: false,
  });

  emitter.on('info', (info) => {
    console.log(`   ${info.message}`);
  });

  await emitter.clone(fullRepoTemp);
  console.log(`   Cloned full repo to: ${fullRepoTemp}`);

  // Move just the examples subdirectory to our temp location
  await rename(join(fullRepoTemp, 'examples'), EXAMPLES_CONFIG.tempDir);

  // Clean up the rest of the repo
  await rm(fullRepoTemp, { recursive: true, force: true });
  console.log(`   Extracted examples to: ${EXAMPLES_CONFIG.tempDir}`);
}

/**
 * Removes Swagger v2.0 examples, keeping only OpenAPI 3.0+ specs.
 */
async function removeSwaggerV2Examples(): Promise<void> {
  console.log('🗑️  Removing Swagger v2.0 examples (keeping OpenAPI 3.x only)...');

  const v2Path = join(EXAMPLES_CONFIG.tempDir, 'v2.0');

  if (existsSync(v2Path)) {
    await rm(v2Path, { recursive: true, force: true });
    console.log('   Removed: v2.0 directory');
  } else {
    console.log('   No v2.0 directory found (already clean)');
  }
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
  await rename(EXAMPLES_CONFIG.tempDir, EXAMPLES_CONFIG.targetDir);

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
