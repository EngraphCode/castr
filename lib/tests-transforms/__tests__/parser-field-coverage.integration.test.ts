/**
 * Complete Field Coverage Tests - Parser (Input)
 *
 * PROVES that the parser correctly extracts ALL OpenAPI fields into the IR.
 * Tests all fields from openapi-acceptance-criteria.md.
 *
 * @module
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildIR } from '../../src/schema-processing/parsers/openapi/index.js';
import { loadOpenApiDocument } from '../../src/shared/load-openapi-document/index.js';
import { CANONICAL_OPENAPI_VERSION } from '../../src/shared/openapi/version.js';
import type { CastrDocument } from '../../src/schema-processing/ir/models/schema-document.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const FIXTURES_DIR = resolve(__dirname, '../__fixtures__');
const NATIVE_OPENAPI_32_FIXTURE = resolve(FIXTURES_DIR, 'phase-b-native-3.2.yaml');
const NATIVE_OPENAPI_32_PHASE_E_FIXTURE = resolve(FIXTURES_DIR, 'phase-e-native-3.2.yaml');
const NATIVE_OPENAPI_32_PHASE_D_FIXTURE = resolve(FIXTURES_DIR, 'phase-d-native-3.2-examples.yaml');

describe('Parser Field Coverage - OpenAPI 3.1.x', () => {
  let ir: CastrDocument;

  beforeAll(async () => {
    const result = await loadOpenApiDocument(`${FIXTURES_DIR}/complete-fields-3.1.yaml`);
    ir = buildIR(result.document);
  });

  // ==========================================================================
  // Root Object Fields
  // ==========================================================================

  describe('Root Object', () => {
    it('extracts openapi version', () => {
      expect(ir.openApiVersion).toBe(CANONICAL_OPENAPI_VERSION);
    });

    it('extracts info object', () => {
      expect(ir.info).toBeDefined();
      expect(ir.info.title).toBe('Complete Field Coverage Test');
      expect(ir.info.description).toBe('Tests ALL OpenAPI 3.1.x fields for parser/writer coverage');
      expect(ir.info.version).toBe('1.0.0');
      expect(ir.info.termsOfService).toBe('https://example.com/terms');
    });

    it('extracts info.contact', () => {
      expect(ir.info.contact).toBeDefined();
      expect(ir.info.contact?.name).toBe('API Support');
      expect(ir.info.contact?.url).toBe('https://example.com/support');
      expect(ir.info.contact?.email).toBe('support@example.com');
    });

    it('extracts info.license', () => {
      expect(ir.info.license).toBeDefined();
      expect(ir.info.license?.name).toBe('Apache 2.0');
      expect(ir.info.license?.identifier).toBe('Apache-2.0');
    });

    it('extracts jsonSchemaDialect (3.1.x only)', () => {
      expect(ir.jsonSchemaDialect).toBe('https://json-schema.org/draft/2020-12/schema');
    });

    it('extracts servers', () => {
      expect(ir.servers).toHaveLength(1);
      expect(ir.servers[0]?.url).toBe('https://api.example.com/v1');
      expect(ir.servers[0]?.description).toBe('Production server');
      expect(ir.servers[0]?.variables?.['port']).toBeDefined();
      expect(ir.servers[0]?.variables?.['port']?.default).toBe('443');
    });

    it('extracts tags', () => {
      expect(ir.tags).toBeDefined();
      expect(ir.tags).toHaveLength(1);
      expect(ir.tags?.[0]?.name).toBe('users');
      expect(ir.tags?.[0]?.externalDocs?.url).toBe('https://example.com/docs/users');
    });

    it('extracts externalDocs', () => {
      expect(ir.externalDocs).toBeDefined();
      expect(ir.externalDocs?.url).toBe('https://example.com/docs');
      expect(ir.externalDocs?.description).toBe('API documentation');
    });

    it('extracts security (document-level)', () => {
      expect(ir.security).toBeDefined();
      expect(ir.security).toHaveLength(1);
      expect(ir.security?.[0]?.schemeName).toBe('bearerAuth');
    });

    it('extracts webhooks (3.1.x only)', () => {
      expect(ir.webhooks).toBeDefined();
      expect(ir.webhooks?.size).toBeGreaterThan(0);
      expect(ir.webhooks?.has('newUserWebhook')).toBe(true);
    });
  });

  // ==========================================================================
  // Components
  // ==========================================================================

  describe('Components', () => {
    it('extracts schemas', () => {
      const schemaComponent = ir.components.find((c) => c.type === 'schema' && c.name === 'User');
      expect(schemaComponent).toBeDefined();
    });

    it('extracts parameters', () => {
      const paramComponent = ir.components.find(
        (c) => c.type === 'parameter' && c.name === 'UserId',
      );
      expect(paramComponent).toBeDefined();
    });

    it('extracts responses', () => {
      const responseComponent = ir.components.find(
        (c) => c.type === 'response' && c.name === 'NotFound',
      );
      expect(responseComponent).toBeDefined();
    });

    it('extracts requestBodies', () => {
      const rbComponent = ir.components.find(
        (c) => c.type === 'requestBody' && c.name === 'UserBody',
      );
      expect(rbComponent).toBeDefined();
    });

    it('extracts headers', () => {
      const headerComponent = ir.components.find(
        (c) => c.type === 'header' && c.name === 'X-Rate-Limit',
      );
      expect(headerComponent).toBeDefined();
    });

    it('extracts securitySchemes', () => {
      const securityComponent = ir.components.find(
        (c) => c.type === 'securityScheme' && c.name === 'bearerAuth',
      );
      expect(securityComponent).toBeDefined();
    });

    it('extracts links', () => {
      const linkComponent = ir.components.find((c) => c.type === 'link' && c.name === 'GetUser');
      expect(linkComponent).toBeDefined();
    });

    it('extracts callbacks', () => {
      const callbackComponent = ir.components.find(
        (c) => c.type === 'callback' && c.name === 'UserCallback',
      );
      expect(callbackComponent).toBeDefined();
    });

    it('extracts pathItems (3.1.x only)', () => {
      const pathItemComponent = ir.components.find(
        (c) => c.type === 'pathItem' && c.name === 'SharedPath',
      );
      expect(pathItemComponent).toBeDefined();
    });

    it('extracts examples', () => {
      const exampleComponent = ir.components.find(
        (c) => c.type === 'example' && c.name === 'UserExample',
      );
      expect(exampleComponent).toBeDefined();
    });
  });

  // ==========================================================================
  // Operations
  // ==========================================================================

  describe('Operations', () => {
    it('extracts all HTTP methods including trace', () => {
      const traceOp = ir.operations.find((op) => op.method === 'trace');
      expect(traceOp).toBeDefined();
      expect(traceOp?.operationId).toBe('traceUser');
    });

    it('extracts operation metadata', () => {
      const listUsersOp = ir.operations.find((op) => op.operationId === 'listUsers');
      expect(listUsersOp).toBeDefined();
      expect(listUsersOp?.summary).toBe('List all users');
      expect(listUsersOp?.description).toBe('Get a list of all users');
      expect(listUsersOp?.tags).toContain('users');
      expect(listUsersOp?.deprecated).not.toBe(true);
    });

    it('extracts operation externalDocs', () => {
      const listUsersOp = ir.operations.find((op) => op.operationId === 'listUsers');
      expect(listUsersOp?.externalDocs).toBeDefined();
      expect(listUsersOp?.externalDocs?.url).toBe('https://example.com/docs/list-users');
    });

    it('extracts operation security', () => {
      const listUsersOp = ir.operations.find((op) => op.operationId === 'listUsers');
      expect(listUsersOp?.security).toBeDefined();
      expect(listUsersOp?.security?.[0]?.schemeName).toBe('bearerAuth');
    });

    it('extracts operation servers', () => {
      const listUsersOp = ir.operations.find((op) => op.operationId === 'listUsers');
      expect(listUsersOp?.servers).toBeDefined();
      expect(listUsersOp?.servers?.[0]?.url).toBe('https://read.example.com');
    });

    it('extracts operation callbacks', () => {
      const createUserOp = ir.operations.find((op) => op.operationId === 'createUser');
      expect(createUserOp?.callbacks).toBeDefined();
      expect(createUserOp?.callbacks?.['onUserCreated']).toBeDefined();
    });

    it('extracts operation parameters', () => {
      const listUsersOp = ir.operations.find((op) => op.operationId === 'listUsers');
      expect(listUsersOp?.parameters.length).toBeGreaterThan(0);
      const limitParam = listUsersOp?.parameters.find((p) => p.name === 'limit');
      expect(limitParam).toBeDefined();
      expect(limitParam?.description).toBe('Maximum number of results');
    });

    it('extracts operation requestBody', () => {
      const createUserOp = ir.operations.find((op) => op.operationId === 'createUser');
      expect(createUserOp?.requestBody).toBeDefined();
      expect(createUserOp?.requestBody?.required).toBe(true);
      expect(createUserOp?.requestBody?.description).toBe('User to create');
    });
  });

  // ==========================================================================
  // PathItem-Level Fields
  // ==========================================================================

  describe('PathItem-Level Fields', () => {
    it('extracts pathItemSummary', () => {
      const listUsersOp = ir.operations.find((op) => op.operationId === 'listUsers');
      expect(listUsersOp?.pathItemSummary).toBe('User collection operations');
    });

    it('extracts pathItemDescription', () => {
      const listUsersOp = ir.operations.find((op) => op.operationId === 'listUsers');
      expect(listUsersOp?.pathItemDescription).toBe('Operations for managing users');
    });

    it('extracts pathItemServers', () => {
      const listUsersOp = ir.operations.find((op) => op.operationId === 'listUsers');
      expect(listUsersOp?.pathItemServers).toBeDefined();
      expect(listUsersOp?.pathItemServers?.[0]?.url).toBe('https://users.example.com');
    });

    it('merges path-level parameters', () => {
      const listUsersOp = ir.operations.find((op) => op.operationId === 'listUsers');
      const headerParam = listUsersOp?.parameters.find((p) => p.name === 'X-Request-ID');
      expect(headerParam).toBeDefined();
    });
  });

  // ==========================================================================
  // Response Fields
  // ==========================================================================

  describe('Response Fields', () => {
    it('extracts response description', () => {
      const listUsersOp = ir.operations.find((op) => op.operationId === 'listUsers');
      const response200 = listUsersOp?.responses.find((r) => r.statusCode === '200');
      expect(response200?.description).toBe('User list');
    });

    it('extracts response content', () => {
      const listUsersOp = ir.operations.find((op) => op.operationId === 'listUsers');
      const response200 = listUsersOp?.responses.find((r) => r.statusCode === '200');
      expect(response200?.content).toBeDefined();
      expect(response200?.content?.['application/json']).toBeDefined();
    });

    it('extracts response headers', () => {
      const listUsersOp = ir.operations.find((op) => op.operationId === 'listUsers');
      const response200 = listUsersOp?.responses.find((r) => r.statusCode === '200');
      expect(response200?.headers).toBeDefined();
      expect(response200?.headers?.['X-Total-Count']).toBeDefined();
    });

    it('extracts response links', () => {
      const listUsersOp = ir.operations.find((op) => op.operationId === 'listUsers');
      const response200 = listUsersOp?.responses.find((r) => r.statusCode === '200');
      expect(response200?.links).toBeDefined();
      expect(response200?.links?.['GetUserById']).toBeDefined();
    });
  });
});

describe('Parser Field Coverage - OpenAPI 3.0.x', () => {
  let ir: CastrDocument;

  beforeAll(async () => {
    const result = await loadOpenApiDocument(`${FIXTURES_DIR}/complete-fields-3.0.yaml`);
    ir = buildIR(result.document);
  });

  describe('3.0.x Specific Behavior', () => {
    it('does NOT have jsonSchemaDialect (3.1.x only)', () => {
      expect(ir.jsonSchemaDialect).toBeUndefined();
    });

    it('does NOT have webhooks (3.1.x only)', () => {
      expect(ir.webhooks).toBeUndefined();
    });

    it('does NOT have pathItems in components (3.1.x only)', () => {
      const pathItemComponent = ir.components.find((c) => c.type === 'pathItem');
      expect(pathItemComponent).toBeUndefined();
    });

    it('extracts info.license.url (not identifier)', () => {
      expect(ir.info.license?.url).toBe('https://www.apache.org/licenses/LICENSE-2.0.html');
      expect(ir.info.license?.identifier).toBeUndefined();
    });
  });

  describe('All Other Fields Work Same as 3.1.x', () => {
    it('extracts trace method', () => {
      const traceOp = ir.operations.find((op) => op.method === 'trace');
      expect(traceOp).toBeDefined();
    });

    it('extracts operation callbacks', () => {
      const createUserOp = ir.operations.find((op) => op.operationId === 'createUser');
      expect(createUserOp?.callbacks).toBeDefined();
    });

    it('extracts operation externalDocs', () => {
      const listUsersOp = ir.operations.find((op) => op.operationId === 'listUsers');
      expect(listUsersOp?.externalDocs).toBeDefined();
    });

    it('extracts response links', () => {
      const listUsersOp = ir.operations.find((op) => op.operationId === 'listUsers');
      const response200 = listUsersOp?.responses.find((r) => r.statusCode === '200');
      expect(response200?.links).toBeDefined();
    });

    it('extracts pathItem-level fields', () => {
      const listUsersOp = ir.operations.find((op) => op.operationId === 'listUsers');
      expect(listUsersOp?.pathItemSummary).toBe('User collection operations');
      expect(listUsersOp?.pathItemDescription).toBe('Operations for managing users');
    });
  });
});

describe('Parser Field Coverage - Native OpenAPI 3.2', () => {
  let native32Ir: CastrDocument;

  beforeAll(async () => {
    const result = await loadOpenApiDocument(NATIVE_OPENAPI_32_FIXTURE);
    native32Ir = buildIR(result.document);
  });

  it('extracts the native query operation', () => {
    const queryOp = native32Ir.operations.find((op) => op.method === 'query');
    expect(queryOp).toBeDefined();
    expect(queryOp?.operationId).toBe('phaseBQuery');
    expect(queryOp?.path).toBe('/phase-b');
  });

  it('preserves hierarchical tag metadata', () => {
    const hierarchicalTag = native32Ir.tags?.find((tag) => tag.name === 'hierarchical');
    const metaTag = native32Ir.tags?.find((tag) => tag.name === 'meta');

    expect(hierarchicalTag).toBeDefined();
    expect(hierarchicalTag?.summary).toBe('Hierarchical tag with parent metadata');
    expect(hierarchicalTag?.parent).toBe('meta');
    expect(hierarchicalTag?.kind).toBe('feature');

    expect(metaTag).toBeDefined();
    expect(metaTag?.summary).toBe('Meta tag for Phase B groupings');
    expect(metaTag?.kind).toBe('group');
  });

  it('preserves oauth2 device authorization flow metadata', () => {
    const securityScheme = native32Ir.components.find(
      (component) => component.type === 'securityScheme' && component.name === 'deviceFlow',
    );

    expect(securityScheme).toBeDefined();
    if (
      !securityScheme ||
      securityScheme.type !== 'securityScheme' ||
      '$ref' in securityScheme.scheme ||
      securityScheme.scheme.type !== 'oauth2'
    ) {
      throw new Error('Expected deviceFlow to be an inline oauth2 security scheme');
    }

    expect(native32Ir.security).toEqual([{ schemeName: 'deviceFlow', scopes: ['read:devices'] }]);
    expect(securityScheme.scheme.flows?.deviceAuthorization?.deviceAuthorizationUrl).toBe(
      'https://auth.example.com/device',
    );
    expect(securityScheme.scheme.flows?.deviceAuthorization?.tokenUrl).toBe(
      'https://auth.example.com/token',
    );
    expect(securityScheme.scheme.flows?.deviceAuthorization?.refreshUrl).toBe(
      'https://auth.example.com/refresh',
    );
    expect(securityScheme.scheme.flows?.deviceAuthorization?.scopes).toEqual({
      'read:devices': 'Read device tokens',
    });
  });

  it('preserves xml nodeType metadata on schemas and properties', () => {
    const schemaComponent = native32Ir.components.find(
      (component) => component.type === 'schema' && component.name === 'DeviceToken',
    );

    expect(schemaComponent).toBeDefined();
    if (!schemaComponent || schemaComponent.type !== 'schema') {
      throw new Error('Expected DeviceToken to be a schema component');
    }

    expect(schemaComponent.schema.xml?.name).toBe('deviceToken');
    expect(schemaComponent.schema.xml?.nodeType).toBe('element');
    expect(schemaComponent.schema.properties?.get('id')?.xml?.nodeType).toBe('attribute');
    expect(schemaComponent.schema.properties?.get('payload')?.xml?.nodeType).toBe('text');
  });

  it('preserves valid templated paths and parameter names', () => {
    const deviceTokenOp = native32Ir.operations.find(
      (op) => op.operationId === 'phaseCGetDeviceToken',
    );

    expect(deviceTokenOp).toBeDefined();
    expect(deviceTokenOp?.path).toBe('/devices/{device-id}/tokens/{token.id}');
    expect(deviceTokenOp?.parametersByLocation.path.map((parameter) => parameter.name)).toEqual([
      'device-id',
      'token.id',
    ]);
  });
});

describe('Parser Field Coverage - Native OpenAPI 3.2 Phase E', () => {
  let native32PhaseEIr: CastrDocument;

  beforeAll(async () => {
    const result = await loadOpenApiDocument(NATIVE_OPENAPI_32_PHASE_E_FIXTURE);
    native32PhaseEIr = buildIR(result.document);
  });

  it('extracts additionalOperations into separate IR storage', () => {
    expect(
      native32PhaseEIr.operations.find((op) => op.operationId === 'phaseEPurge'),
    ).toBeUndefined();
    expect(native32PhaseEIr.additionalOperations).toHaveLength(1);
    expect(native32PhaseEIr.additionalOperations[0]).toMatchObject({
      operationId: 'phaseEPurge',
      method: 'PuRgE',
      path: '/phase-e',
      pathItemSummary: 'Phase E streaming operations',
      pathItemDescription: 'Exercises itemSchema and custom additionalOperations handling.',
    });
  });

  it('preserves itemSchema on reusable, request, and response media types', () => {
    const mediaTypeComponent = native32PhaseEIr.components.find(
      (component) => component.type === 'mediaType' && component.name === 'PhaseEEventStream',
    );

    expect(mediaTypeComponent).toBeDefined();
    if (
      !mediaTypeComponent ||
      mediaTypeComponent.type !== 'mediaType' ||
      '$ref' in mediaTypeComponent.mediaType
    ) {
      throw new Error('Expected PhaseEEventStream to be an inline media type component');
    }

    expect(mediaTypeComponent.mediaType.itemSchema?.$ref).toBe('#/components/schemas/PhaseEEvent');

    const purgeOperation = native32PhaseEIr.additionalOperations[0];
    const requestMediaType = purgeOperation?.requestBody?.content['application/x-ndjson'];
    if (!requestMediaType || '$ref' in requestMediaType) {
      throw new Error('Expected the Phase E PuRgE request media type to be inline');
    }

    expect(requestMediaType.itemSchema?.$ref).toBe('#/components/schemas/PhaseEEvent');

    const responseMediaType = purgeOperation?.responses.find(
      (response) => response.statusCode === '202',
    )?.content?.['application/x-ndjson'];
    if (!responseMediaType || '$ref' in responseMediaType) {
      throw new Error('Expected the Phase E PuRgE response media type to be inline');
    }

    expect(responseMediaType.itemSchema?.$ref).toBe('#/components/schemas/PhaseEAck');
  });

  it('derives parameter schema from itemSchema-only content without losing the media type entry', () => {
    const queryOperation = native32PhaseEIr.operations.find(
      (op) => op.operationId === 'phaseEQuery',
    );
    const filterParameter = queryOperation?.parameters.find(
      (parameter) => parameter.name === 'phase-e-filter',
    );
    const filterMediaType = filterParameter?.content?.['application/x-ndjson'];

    expect(filterParameter).toBeDefined();
    expect(filterParameter?.schema.$ref).toBe('#/components/schemas/PhaseEFilter');
    if (!filterMediaType || '$ref' in filterMediaType) {
      throw new Error('Expected the Phase E query parameter media type to be inline');
    }

    expect(filterMediaType.itemSchema?.$ref).toBe('#/components/schemas/PhaseEFilter');
  });

  it('derives response-header schema from itemSchema-only content without losing the media type entry', () => {
    const purgeOperation = native32PhaseEIr.additionalOperations[0];
    const ackHeader = purgeOperation?.responses.find((response) => response.statusCode === '202')
      ?.headers?.['X-Phase-E-Acks'];
    const headerMediaType = ackHeader?.content?.['application/x-ndjson'];

    expect(ackHeader).toBeDefined();
    expect(ackHeader?.schema.$ref).toBe('#/components/schemas/PhaseEAck');
    if (!headerMediaType || '$ref' in headerMediaType) {
      throw new Error('Expected the Phase E response header media type to be inline');
    }

    expect(headerMediaType.itemSchema?.$ref).toBe('#/components/schemas/PhaseEAck');
  });
});

describe('Parser Field Coverage - Native OpenAPI 3.2 Example Objects', () => {
  let phaseDIr: CastrDocument;

  beforeAll(async () => {
    const result = await loadOpenApiDocument(NATIVE_OPENAPI_32_PHASE_D_FIXTURE);
    phaseDIr = buildIR(result.document);
  });

  it('preserves component example dataValue and serializedValue fields', () => {
    const component = phaseDIr.components.find(
      (entry) => entry.type === 'example' && entry.name === 'PhaseDDeviceTokenExample',
    );

    expect(component).toBeDefined();
    if (!component || component.type !== 'example' || '$ref' in component.example) {
      throw new Error('Expected PhaseDDeviceTokenExample to be an inline example component');
    }

    expect(component.example.dataValue).toEqual({
      id: 'device-token-123',
      payload: 'opaque',
    });
    expect(component.example.serializedValue).toBe('{"id":"device-token-123","payload":"opaque"}');
  });

  it('preserves parameter example objects and derives the singular example from dataValue', () => {
    const operation = phaseDIr.operations.find((entry) => entry.operationId === 'phaseDQuery');
    const filterParameter = operation?.parameters.find((parameter) => parameter.name === 'filter');
    const defaultExample = filterParameter?.examples?.['default'];

    expect(filterParameter).toBeDefined();
    expect(filterParameter?.example).toBe('active devices');
    expect(defaultExample).toBeDefined();
    if (!defaultExample || '$ref' in defaultExample) {
      throw new Error('Expected the Phase D parameter example to be inline');
    }

    expect(defaultExample.dataValue).toBe('active devices');
    expect(defaultExample.serializedValue).toBe('active%20devices');
  });

  it('preserves response header example objects', () => {
    const operation = phaseDIr.operations.find((entry) => entry.operationId === 'phaseDQuery');
    const response = operation?.responses.find((entry) => entry.statusCode === '200');
    const headerExample = response?.headers?.['X-Phase-D-Filter']?.examples?.['default'];

    expect(headerExample).toBeDefined();
    if (!headerExample || '$ref' in headerExample) {
      throw new Error('Expected the Phase D response header example to be inline');
    }

    expect(headerExample.dataValue).toBe('active devices');
    expect(headerExample.serializedValue).toBe('active%20devices');
  });

  it('preserves media type example objects', () => {
    const operation = phaseDIr.operations.find((entry) => entry.operationId === 'phaseDQuery');
    const response = operation?.responses.find((entry) => entry.statusCode === '200');
    const mediaType = response?.content?.['application/json'];
    const example = mediaType && '$ref' in mediaType ? undefined : mediaType?.examples?.['default'];

    expect(example).toBeDefined();
    if (!example || '$ref' in example) {
      throw new Error('Expected the Phase D media type example to be inline');
    }

    expect(example.dataValue).toEqual({
      id: 'device-token-123',
      payload: 'opaque',
    });
    expect(example.serializedValue).toBe('{"id":"device-token-123","payload":"opaque"}');
  });
});
