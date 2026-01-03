import { describe, it, expect, afterEach } from 'vitest';
import { generateZodClientFromOpenAPI } from '../src/index.js';
import fs from 'node:fs/promises';
import path from 'node:path';

import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('IR Persistence', () => {
  const outputDir = path.resolve(__dirname, 'temp-ir-test');
  const outputFile = path.join(outputDir, 'output.ts');
  const irFile = path.join(outputDir, 'output.ir.json');

  afterEach(async () => {
    await fs.rm(outputDir, { recursive: true, force: true });
  });

  it('should generate ir.json when debugIR is true', async () => {
    await fs.mkdir(outputDir, { recursive: true });

    await generateZodClientFromOpenAPI({
      openApiDoc: {
        openapi: '3.1.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {},
      },
      distPath: outputFile,
      disableWriteToFile: false,
      debugIR: true,
    });

    const irExists = await fs
      .stat(irFile)
      .then(() => true)
      .catch(() => false);
    expect(irExists).toBe(true);

    const irContent = await fs.readFile(irFile, 'utf-8');
    const ir = JSON.parse(irContent);
    expect(ir.info.title).toBe('Test');
  });
});
