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

describe('Real-World Fixture Rejection', () => {
  it('rejects the ePerusteet fixture when OpenAPI content is projected into strict IR semantics', async () => {
    const loaded = await loadOpenApiDocument(EPERUSTEET_EXT_FIXTURE);

    expect(() => buildIR(loaded.document)).toThrow(
      /schema-valued additionalProperties|closed-world object semantics/i,
    );
  });
});
