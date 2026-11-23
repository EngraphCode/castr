import { describe, it, expect } from 'vitest';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildIR } from '../../src/schema-processing/parsers/openapi/index.js';
import { loadOpenApiDocument } from '../../src/shared/load-openapi-document/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EPERUSTEET_EXT_FIXTURE = resolve(
  __dirname,
  '../../tests-fixtures/openapi-samples/real-world/eperusteet-ext.json',
);

describe('A real-world fixture once refused for its constrained maps', () => {
  it('is read into the model, which holds the schema its maps constrain their values by', async () => {
    const loaded = await loadOpenApiDocument(EPERUSTEET_EXT_FIXTURE);

    const ir = buildIR(loaded.document);

    expect(JSON.stringify(ir)).toContain('"additionalProperties":{');
  });
});
