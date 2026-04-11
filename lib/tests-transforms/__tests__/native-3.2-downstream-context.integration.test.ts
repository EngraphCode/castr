import { beforeAll, describe, expect, it } from 'vitest';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadOpenApiDocument } from '../../src/shared/load-openapi-document/index.js';
import { getZodClientTemplateContext } from '../../src/schema-processing/context/template-context.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = resolve(__dirname, '../__fixtures__');
const NATIVE_OPENAPI_32_FIXTURE = resolve(FIXTURES_DIR, 'phase-b-native-3.2.yaml');

describe('Native OpenAPI 3.2 downstream context proof', () => {
  let context: ReturnType<typeof getZodClientTemplateContext>;

  beforeAll(async () => {
    const result = await loadOpenApiDocument(NATIVE_OPENAPI_32_FIXTURE);
    context = getZodClientTemplateContext(result.document);
  });

  it('preserves templated paths in endpoint definitions', () => {
    const endpoint = context.endpoints.find((item) => item.alias === 'phaseCGetDeviceToken');

    expect(endpoint).toBeDefined();
    expect(endpoint?.path).toBe('/devices/{device-id}/tokens/{token.id}');
    expect(
      endpoint?.parameters
        .filter((parameter) => parameter.type === 'Path')
        .map((parameter) => parameter.name),
    ).toEqual(['device-id', 'token.id']);
  });

  it('preserves templated MCP paths and carries device authorization security metadata', () => {
    const tool = context.mcpTools.find((item) => item.operationId === 'phaseCGetDeviceToken');

    expect(tool).toBeDefined();
    expect(tool?.httpOperation.path).toBe('/devices/{device-id}/tokens/{token.id}');
    expect(tool?.httpOperation.originalPath).toBe('/devices/{device-id}/tokens/{token.id}');
    expect(tool?.security.usesGlobalSecurity).toBe(true);

    const deviceAuthorization =
      tool?.security.requirementSets[0]?.schemes[0]?.scheme.type === 'oauth2'
        ? tool.security.requirementSets[0]?.schemes[0]?.scheme.flows?.deviceAuthorization
        : undefined;

    expect(deviceAuthorization?.deviceAuthorizationUrl).toBe('https://auth.example.com/device');
    expect(deviceAuthorization?.tokenUrl).toBe('https://auth.example.com/token');
    expect(deviceAuthorization?.refreshUrl).toBe('https://auth.example.com/refresh');
    expect(deviceAuthorization?.scopes).toEqual({
      'read:devices': 'Read device tokens',
    });
  });

  it('normalizes MCP path input keys while preserving the original templated path', () => {
    const tool = context.mcpTools.find((item) => item.operationId === 'phaseCGetDeviceToken');
    const inputSchema = tool?.tool.inputSchema;
    const pathSchema =
      inputSchema && 'properties' in inputSchema ? inputSchema.properties?.['path'] : undefined;

    expect(inputSchema).toBeDefined();
    if (!inputSchema || !pathSchema || !('properties' in pathSchema)) {
      throw new Error('Expected MCP input schema to expose a path section');
    }

    expect(Object.keys(pathSchema.properties ?? {}).sort()).toEqual(['deviceId', 'tokenId']);
  });
});
