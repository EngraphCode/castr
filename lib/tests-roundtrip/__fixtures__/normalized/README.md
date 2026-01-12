# Normalized Fixtures

Castr-normalized OpenAPI specs for byte-for-byte idempotency testing.

These are created by processing arbitrary specs through Castr once and saving the output.
Re-processing these specs should produce identical output.

## How to Create

```typescript
import { buildIR } from '../../../src/context/ir-builder.js';
import { writeOpenApi } from '../../../src/writers/openapi/openapi-writer.js';
import { prepareOpenApiDocument } from '../../../src/shared/prepare-openapi-document.js';

const doc = await prepareOpenApiDocument('./arbitrary/petstore.yaml');
const ir = buildIR(doc);
const normalized = writeOpenApi(ir);
// Save normalized to this directory
```
