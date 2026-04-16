import { describe, it, expect } from 'vitest';
import { join } from 'node:path';

import { generateZodClientFromOpenAPI } from './test-utils.js';

const EPERUSTEET_EXT_FIXTURE = 'tests-fixtures/openapi-samples/real-world/eperusteet-ext.json';

describe('Generated Code - Real-World Rejection Validation', () => {
  it('rejects the ePerusteet real-world fixture with the strict-object error', async () => {
    await expect(
      generateZodClientFromOpenAPI({
        input: join(process.cwd(), EPERUSTEET_EXT_FIXTURE),
        disableWriteToFile: true,
        options: {
          withAlias: true,
        },
      }),
    ).rejects.toThrow(/schema-valued additionalProperties|closed-world object semantics/i);
  });
});
