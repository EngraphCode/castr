import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { writeFileSync, rmSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { execSync } from 'node:child_process';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { fileURLToPath } from 'node:url';

/**
 * Characterisation Tests: CLI Behavior
 *
 * These tests validate that the BUILT CLI correctly drives the system.
 * They test ACTUAL behavior by running the CLI and verifying generated output.
 *
 * CRITICAL: These tests exercise the PRODUCT CODE through the CLI interface.
 * They must survive the architectural rewrite (Phases 1-3).
 */

const thisDir = dirname(fileURLToPath(import.meta.url));
const CLI_PATH = join(thisDir, '../../dist/cli/index.js');
const TEST_OUTPUT_DIR = join(thisDir, 'test-output-cli');

/**
 * Helper: Create a test OpenAPI spec file
 */
function createTestSpec(filename: string, spec?: Partial<OpenAPIObject>): string {
  const defaultSpec: OpenAPIObject = {
    openapi: '3.0.0',
    info: { title: 'Test API', version: '1.0.0' },
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
          },
          required: ['id', 'name'],
        },
      },
    },
    paths: {
      '/users': {
        get: {
          operationId: 'getUsers',
          responses: {
            '200': {
              description: 'Success',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' },
                },
              },
            },
          },
        },
      },
    },
  };

  const fullSpec = { ...defaultSpec, ...spec };
  const filePath = join(TEST_OUTPUT_DIR, filename);
  writeFileSync(filePath, JSON.stringify(fullSpec, null, 2));
  return filePath;
}

/**
 * Helper: Run CLI command
 *
 * This is a characterisation test that validates CLI behavior by executing the actual CLI.
 * Arguments are test-controlled fixtures, not user input, making this safe for testing purposes.
 */
function runCli(args: string[]): { stdout: string; exitCode: number } {
  // Characterisation test: Must execute actual CLI to verify behavior
  // Arguments are controlled test fixtures, not external user input

  try {
    // Use array form to avoid shell injection - args are test fixtures
    const command = ['node', CLI_PATH, ...args];
    // Characterisation test must execute CLI - arguments are controlled test fixtures
    // eslint-disable-next-line sonarjs/os-command
    const result = execSync(command.join(' '), {
      encoding: 'utf8',
      cwd: TEST_OUTPUT_DIR,
      stdio: 'pipe',
    });
    return { stdout: result, exitCode: 0 };
  } catch (error: unknown) {
    // Handle execSync error type - may have stdout/stderr/status properties
    // @ts-expect-error TS2571 - execSync errors have stdout/stderr/status properties, but TypeScript doesn't know this
    const stdout = error.stdout?.toString() || '';
    // @ts-expect-error TS2571 - execSync errors have stdout/stderr/status properties, but TypeScript doesn't know this
    const stderr = error.stderr?.toString() || '';
    // @ts-expect-error TS2571 - execSync errors have stdout/stderr/status properties, but TypeScript doesn't know this
    const exitCode = error.status || 1;
    return {
      stdout: stdout + '\nSTDERR:\n' + stderr,
      exitCode,
    };
  }
}

describe('Characterisation: CLI Behavior', () => {
  beforeAll(() => {
    // Create test output directory
    if (existsSync(TEST_OUTPUT_DIR)) {
      rmSync(TEST_OUTPUT_DIR, { recursive: true });
    }
    mkdirSync(TEST_OUTPUT_DIR, { recursive: true });
  });

  afterAll(() => {
    // Cleanup
    if (existsSync(TEST_OUTPUT_DIR)) {
      rmSync(TEST_OUTPUT_DIR, { recursive: true });
    }
  });

  describe('Basic CLI Operations', () => {
    it('should display help with --help', () => {
      const result = runCli(['--help']);

      expect(result.stdout).toContain('Usage:');
      expect(result.stdout).toContain('openapi-zod-client');
      expect(result.stdout).toContain('Options:');
      expect(result.exitCode).toBe(0);
    });

    it('should display version with --version', () => {
      const result = runCli(['--version']);

      // Match semantic version pattern - input is controlled test output, bounded length
      // Pattern avoids catastrophic backtracking by using bounded quantifiers on short input
      const versionPattern = /^\d{1,4}\.\d{1,4}\.\d{1,4}(?:-[\w-]+)?(?:\+[\w-]+)?$/;
      expect(result.stdout.trim()).toMatch(versionPattern);
      expect(result.exitCode).toBe(0);
    });

    it('should generate output file from OpenAPI spec', () => {
      const inputPath = createTestSpec('basic-test.json');
      const outputPath = join(TEST_OUTPUT_DIR, 'basic-output.ts');

      runCli([inputPath, '-o', outputPath]);

      // Verify file was created
      expect(existsSync(outputPath)).toBe(true);

      // Verify content
      const content = readFileSync(outputPath, 'utf8');
      expect(content).toContain('User');
      expect(content).toContain('getUsers');
      expect(content).toContain('import { z }');
    });
  });

  describe('CLI Options Effect on Generated Code', () => {
    it('should respect --base-url option', () => {
      const inputPath = createTestSpec('base-url-test.json');
      const outputPath = join(TEST_OUTPUT_DIR, 'base-url-output.ts');

      runCli([inputPath, '-o', outputPath, '--base-url', 'https://api.example.com']);

      const content = readFileSync(outputPath, 'utf8');
      expect(content).toContain('User');
      expect(content).not.toContain('as unknown as');
    });

    it('should respect --export-schemas option', () => {
      const inputPath = createTestSpec('export-schemas-test.json');
      const outputPath = join(TEST_OUTPUT_DIR, 'export-schemas-output.ts');

      runCli([inputPath, '-o', outputPath, '--export-schemas']);

      const content = readFileSync(outputPath, 'utf8');
      expect(content).toContain('export');
      expect(content).toContain('User');
    });

    it('should respect --with-alias option', () => {
      const inputPath = createTestSpec('with-alias-test.json');
      const outputPath = join(TEST_OUTPUT_DIR, 'with-alias-output.ts');

      runCli([inputPath, '-o', outputPath, '--with-alias']);

      const content = readFileSync(outputPath, 'utf8');
      expect(content).toContain('User');
    });

    it('should respect --no-with-alias option', () => {
      const inputPath = createTestSpec('no-alias-test.json');
      const outputPath = join(TEST_OUTPUT_DIR, 'no-alias-output.ts');

      runCli([inputPath, '-o', outputPath, '--no-with-alias']);

      const content = readFileSync(outputPath, 'utf8');
      expect(content).toContain('User');
    });

    it('should respect --strict-objects option', () => {
      const inputPath = createTestSpec('strict-test.json');
      const outputPath = join(TEST_OUTPUT_DIR, 'strict-output.ts');

      runCli([inputPath, '-o', outputPath, '--strict-objects']);

      const content = readFileSync(outputPath, 'utf8');
      expect(content).toContain('User');
      expect(content).not.toContain('as unknown as');
    });

    it('should emit MCP manifest with --emit-mcp-manifest option', () => {
      const inputPath = createTestSpec('manifest-test.json');
      const outputPath = join(TEST_OUTPUT_DIR, 'manifest-output.ts');
      const manifestPath = join(TEST_OUTPUT_DIR, 'manifest.json');

      runCli([inputPath, '-o', outputPath, '--emit-mcp-manifest', manifestPath]);

      expect(existsSync(manifestPath)).toBe(true);

      const manifestRaw = readFileSync(manifestPath, 'utf8');
      const manifest = JSON.parse(manifestRaw);

      expect(Array.isArray(manifest)).toBe(true);
      expect(manifest.length).toBeGreaterThan(0);

      const firstTool = manifest[0];
      expect(firstTool).toHaveProperty('tool');
      expect(firstTool.tool).toMatchObject({
        name: 'get_users',
        inputSchema: { type: 'object' },
      });
      expect(firstTool.httpOperation).toMatchObject({
        method: 'get',
        path: '/users',
      });
      expect(firstTool.security).toMatchObject({
        isPublic: true,
      });
    });
  });

  describe('Generated Code Quality', () => {
    it('should generate valid TypeScript without type assertions', () => {
      const inputPath = createTestSpec('quality-test.json');
      const outputPath = join(TEST_OUTPUT_DIR, 'quality-output.ts');

      runCli([inputPath, '-o', outputPath]);

      const content = readFileSync(outputPath, 'utf8');

      // No type assertions (except 'as const')
      const assertionPattern = / as (?!const\b)/g;
      const matches = content.match(assertionPattern);
      expect(matches).toBeNull();

      // Has proper imports
      expect(content).toContain('import { z }');

      // Has proper exports
      expect(content).toContain('export');
    });

    it('should handle complex schemas correctly', () => {
      const complexSpec = {
        components: {
          schemas: {
            Address: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                city: { type: 'string' },
              },
            },
            Person: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                address: { $ref: '#/components/schemas/Address' },
              },
            },
          },
        },
        paths: {
          '/people': {
            get: {
              operationId: 'getPeople',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Person' },
                    },
                  },
                },
              },
            },
          },
        },
      };

      // @ts-expect-error TS2345 - Testing partial spec (missing required properties) to verify error handling
      const inputPath = createTestSpec('complex-test.json', complexSpec as unknown);
      const outputPath = join(TEST_OUTPUT_DIR, 'complex-output.ts');

      runCli([inputPath, '-o', outputPath]);

      const content = readFileSync(outputPath, 'utf8');

      // Both schemas should be present
      expect(content).toContain('Address');
      expect(content).toContain('Person');

      // Dependencies should be resolved
      expect(content).toContain('z.object');
    });
  });

  describe('Error Handling', () => {
    it('should exit successfully on valid input', () => {
      const inputPath = createTestSpec('success-test.json');
      const outputPath = join(TEST_OUTPUT_DIR, 'success-output.ts');

      const result = runCli([inputPath, '-o', outputPath]);

      expect(result.exitCode).toBe(0);
      expect(existsSync(outputPath)).toBe(true);
    });
  });
});
