import { describe, expect, it } from 'vitest';
import type {
  ComponentsObject,
  OpenAPIDocument,
  OperationObject,
  SecurityRequirementObject,
  SecuritySchemeObject,
} from '../../../../shared/openapi-types.js';

import { resolveOperationSecurity } from './extract-operation-security.js';

function buildDocument({
  components,
  security,
}: {
  components?: ComponentsObject;
  security?: SecurityRequirementObject[];
} = {}): OpenAPIDocument {
  const document: OpenAPIDocument = {
    openapi: '3.1.0',
    info: {
      title: 'Test API',
      version: '1.0.0',
    },
    paths: {},
  };

  if (components) {
    document.components = components;
  }

  if (security) {
    document.security = security;
  }

  return document;
}

describe('resolveOperationSecurity', () => {
  it('uses global security definitions when operation does not override', () => {
    const oauthScheme: SecuritySchemeObject = {
      type: 'oauth2',
      flows: {
        authorizationCode: {
          authorizationUrl: 'https://auth.example.com/authorize',
          tokenUrl: 'https://auth.example.com/token',
          scopes: {
            'read:users': 'Read user information',
          },
        },
      },
    };

    const document = buildDocument({
      components: {
        securitySchemes: {
          oauth: oauthScheme,
        },
      },
      security: [{ oauth: ['read:users'] }],
    });

    const operation: OperationObject = {};

    const result = resolveOperationSecurity({
      document,
      operationSecurity: operation.security,
    });

    expect(result).toEqual({
      isPublic: false,
      usesGlobalSecurity: true,
      requirementSets: [
        {
          schemes: [
            {
              schemeName: 'oauth',
              scheme: oauthScheme,
              scopes: ['read:users'],
            },
          ],
        },
      ],
    });
  });

  it('honours operation level overrides with multiple requirements', () => {
    const bearerScheme: SecuritySchemeObject = {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    };

    const apiKeyScheme: SecuritySchemeObject = {
      type: 'apiKey',
      in: 'header',
      name: 'X-API-Key',
    };

    const document = buildDocument({
      components: {
        securitySchemes: {
          bearerAuth: bearerScheme,
          apiKeyAuth: apiKeyScheme,
        },
      },
      security: [{ bearerAuth: [] }],
    });

    const operation: OperationObject = {
      security: [{ apiKeyAuth: [] }, { bearerAuth: [], apiKeyAuth: [] }],
    };

    const result = resolveOperationSecurity({
      document,
      operationSecurity: operation.security,
    });

    expect(result).toEqual({
      isPublic: false,
      usesGlobalSecurity: false,
      requirementSets: [
        {
          schemes: [
            {
              schemeName: 'apiKeyAuth',
              scheme: apiKeyScheme,
              scopes: [],
            },
          ],
        },
        {
          schemes: [
            {
              schemeName: 'bearerAuth',
              scheme: bearerScheme,
              scopes: [],
            },
            {
              schemeName: 'apiKeyAuth',
              scheme: apiKeyScheme,
              scopes: [],
            },
          ],
        },
      ],
    });
  });

  it('marks operations as public when security array is explicitly empty', () => {
    const document = buildDocument();
    const operation: OperationObject = {
      security: [],
    };

    const result = resolveOperationSecurity({
      document,
      operationSecurity: operation.security,
    });

    expect(result).toEqual({
      isPublic: true,
      usesGlobalSecurity: false,
      requirementSets: [],
    });
  });

  it('throws when referenced security schemes are missing', () => {
    const document = buildDocument();
    const operation: OperationObject = {
      security: [{ missingScheme: [] }],
    };

    expect(() =>
      resolveOperationSecurity({
        document,
        operationSecurity: operation.security,
      }),
    ).toThrow(/missing security scheme/i);
  });

  it('marks an operation with an empty requirement ({}) public while keeping all sets', () => {
    const apiKeyScheme: SecuritySchemeObject = {
      type: 'apiKey',
      name: 'X-API-Key',
      in: 'header',
    };
    const document = buildDocument({
      components: { securitySchemes: { apiKey: apiKeyScheme } },
    });
    const operation: OperationObject = {
      security: [{}, { apiKey: [] }],
    };

    const result = resolveOperationSecurity({
      document,
      operationSecurity: operation.security,
    });

    expect(result).toStrictEqual({
      isPublic: true,
      usesGlobalSecurity: false,
      requirementSets: [
        { schemes: [] },
        { schemes: [{ schemeName: 'apiKey', scheme: apiKeyScheme, scopes: [] }] },
      ],
    });
  });

  it('throws when a scheme maps to a non-array scope value', () => {
    const apiKeyScheme: SecuritySchemeObject = {
      type: 'apiKey',
      name: 'X-API-Key',
      in: 'header',
    };
    const document = buildDocument({
      components: { securitySchemes: { apiKey: apiKeyScheme } },
    });
    // The type system correctly forbids this shape, so the malformed value is
    // produced the same way a real one would arrive: parsed from a document
    // (YAML `apiKey:` with no value parses to null).
    const malformedRequirement: SecurityRequirementObject[] = JSON.parse('[{ "apiKey": null }]');

    expect(() =>
      resolveOperationSecurity({
        document,
        operationSecurity: malformedRequirement,
      }),
    ).toThrow(/must map to an array of scope strings/);
  });
});
