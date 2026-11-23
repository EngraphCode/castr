import { describe, it, expect } from 'vitest';
import { join } from 'node:path';

import { generateZodClientFromOpenAPI } from './test-utils.js';

const EPERUSTEET_EXT_FIXTURE = 'tests-fixtures/openapi-samples/real-world/eperusteet-ext.json';

describe('Generated Code - a real-world fixture once refused for its constrained maps', () => {
  it('is no longer refused: its maps are written as catchalls', async () => {
    const result = await generateZodClientFromOpenAPI({
      input: join(process.cwd(), EPERUSTEET_EXT_FIXTURE),
      disableWriteToFile: true,
      options: {
        withAlias: true,
      },
    });

    expect(JSON.stringify(result)).toContain('.catchall(');
  });
});
