import { describe, expect, it } from 'vitest';
import type {
  ComponentsObject,
  OpenAPIObject,
  OperationObject,
  SecurityRequirementObject,
  SecuritySchemeObject,
} from 'openapi3-ts/oas31';

import { resolveOperationSecurity } from './extract-operation-security.js';

function buildDocument({
  components,
  security,
}: {
  components?: ComponentsObject;
  security?: SecurityRequirementObject[];
} = {}): OpenAPIObject {
  const document: OpenAPIObject = {
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
});
