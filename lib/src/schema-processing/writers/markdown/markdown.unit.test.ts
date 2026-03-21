import { describe, it, expect } from 'vitest';
import { prepareOpenApiDocument } from '../../../shared/prepare-openapi-document.js';
import { getZodClientTemplateContext } from '../../context/index.js';
import { writeMarkdown } from './index.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('Markdown Writer', () => {
  it('should generate markdown from tictactoe spec', async () => {
    const specPath = path.resolve(__dirname, '../../../../examples/openapi/v3.1/tictactoe.yaml');
    const doc = await prepareOpenApiDocument(specPath);
    const context = getZodClientTemplateContext(doc);
    const ir = context._ir;

    if (!ir) {
      throw new Error('IR not generated');
    }

    const markdown = writeMarkdown(ir);

    expect(markdown).toContain('# Tic Tac Toe');
    expect(markdown).toContain('## Operations');
    expect(markdown).toContain('### Get the whole board');
    expect(markdown).toContain('`GET /board`');
    expect(markdown).toContain('## Enums');
    expect(markdown).toContain('### mark');
    expect(markdown).toContain('- `X`');
    expect(markdown).toContain('- `O`');
    expect(markdown).toContain('- `.`');
  });
});
