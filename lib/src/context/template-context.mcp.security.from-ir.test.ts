/**
 * Tests for IR-based security resolution.
 *
 * These tests verify that `resolveOperationSecurityFromIR` produces equivalent
 * output to `resolveOperationSecurity`, but reads from IR types instead of
 * raw OpenAPI.
 *
 * @module template-context.mcp.security.from-ir.test
 */

import { describe, expect, test } from 'vitest';
import type {
  CastrDocument,
  CastrOperation,
  IRSecurityRequirement,
  IRSecuritySchemeComponent,
} from './ir-schema.js';
import { createMockCastrDocument } from './ir-test-helpers.js';
import { resolveOperationSecurityFromIR } from './template-context.mcp.security.from-ir.js';

/**
 * Create a mock operation with security (omit property entirely when not defined).
 */
function createMockOperationWithSecurity(
  security: IRSecurityRequirement[] | 'omit',
): Pick<CastrOperation, 'security'> {
  if (security === 'omit') {
    // Use object without security property to simulate undefined
    return {} as Pick<CastrOperation, 'security'>;
  }
  return { security };
}

/**
 * Create a security scheme component for the IR.
 */
function createSecuritySchemeComponent(
  name: string,
  type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect' = 'http',
): IRSecuritySchemeComponent {
  if (type === 'apiKey') {
    return {
      type: 'securityScheme',
      name,
      scheme: { type: 'apiKey', name: 'X-API-Key', in: 'header' },
    };
  }
  if (type === 'oauth2') {
    return {
      type: 'securityScheme',
      name,
      scheme: {
        type: 'oauth2',
        flows: {
          authorizationCode: {
            authorizationUrl: 'https://example.com/oauth/authorize',
            tokenUrl: 'https://example.com/oauth/token',
            scopes: { 'read:users': 'Read users', 'write:users': 'Write users' },
          },
        },
      },
    };
  }
  return {
    type: 'securityScheme',
    name,
    scheme: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
  };
}

/**
 * Create a mock IR with security schemes and optional global security.
 */
function createMockIRWithSecurity(
  schemeNames: string[],
  globalSecurity?: IRSecurityRequirement[],
): CastrDocument {
  const components: IRSecuritySchemeComponent[] = schemeNames.map((name) =>
    createSecuritySchemeComponent(name),
  );

  const baseDoc = createMockCastrDocument();

  return {
    ...baseDoc,
    components,
    ...(globalSecurity ? { security: globalSecurity } : {}),
  };
}

describe('resolveOperationSecurityFromIR', () => {
  describe('public endpoints', () => {
    test('returns isPublic=true when operation has empty security array', () => {
      const ir = createMockIRWithSecurity(['bearerAuth']);
      const operation = createMockOperationWithSecurity([]);

      const result = resolveOperationSecurityFromIR(ir, operation);

      expect(result.isPublic).toBe(true);
      expect(result.usesGlobalSecurity).toBe(false);
      expect(result.requirementSets).toHaveLength(0);
    });

    test('returns isPublic=true when no operation security and no global security', () => {
      const ir = createMockIRWithSecurity(['bearerAuth']);
      const operation = createMockOperationWithSecurity('omit');

      const result = resolveOperationSecurityFromIR(ir, operation);

      expect(result.isPublic).toBe(true);
      expect(result.usesGlobalSecurity).toBe(false);
      expect(result.requirementSets).toHaveLength(0);
    });
  });

  describe('operation-level security', () => {
    test('resolves single security scheme from operation', () => {
      const ir = createMockIRWithSecurity(['bearerAuth']);
      const operation = createMockOperationWithSecurity([{ schemeName: 'bearerAuth', scopes: [] }]);

      const result = resolveOperationSecurityFromIR(ir, operation);

      expect(result.isPublic).toBe(false);
      expect(result.usesGlobalSecurity).toBe(false);
      expect(result.requirementSets).toHaveLength(1);
      expect(result.requirementSets[0]?.schemes).toHaveLength(1);
      expect(result.requirementSets[0]?.schemes[0]?.schemeName).toBe('bearerAuth');
    });

    test('resolves OAuth2 scheme with scopes', () => {
      const components: IRSecuritySchemeComponent[] = [
        createSecuritySchemeComponent('oauth2', 'oauth2'),
      ];
      const baseDoc = createMockCastrDocument();
      const ir: CastrDocument = {
        ...baseDoc,
        components,
      };
      const operation = createMockOperationWithSecurity([
        { schemeName: 'oauth2', scopes: ['read:users', 'write:users'] },
      ]);

      const result = resolveOperationSecurityFromIR(ir, operation);

      expect(result.isPublic).toBe(false);
      expect(result.requirementSets[0]?.schemes[0]?.scopes).toEqual(['read:users', 'write:users']);
    });

    test('resolves multiple OR security requirements', () => {
      const ir = createMockIRWithSecurity(['bearerAuth', 'apiKey']);
      const operation = createMockOperationWithSecurity([
        { schemeName: 'bearerAuth', scopes: [] },
        { schemeName: 'apiKey', scopes: [] },
      ]);

      const result = resolveOperationSecurityFromIR(ir, operation);

      expect(result.requirementSets).toHaveLength(2);
      expect(result.requirementSets[0]?.schemes[0]?.schemeName).toBe('bearerAuth');
      expect(result.requirementSets[1]?.schemes[0]?.schemeName).toBe('apiKey');
    });
  });

  describe('global security fallback', () => {
    test('uses global security when operation has no security defined', () => {
      const globalSecurity: IRSecurityRequirement[] = [{ schemeName: 'bearerAuth', scopes: [] }];
      const ir = createMockIRWithSecurity(['bearerAuth'], globalSecurity);
      const operation = createMockOperationWithSecurity('omit');

      const result = resolveOperationSecurityFromIR(ir, operation);

      expect(result.isPublic).toBe(false);
      expect(result.usesGlobalSecurity).toBe(true);
      expect(result.requirementSets).toHaveLength(1);
      expect(result.requirementSets[0]?.schemes[0]?.schemeName).toBe('bearerAuth');
    });

    test('operation security overrides global security', () => {
      const globalSecurity: IRSecurityRequirement[] = [{ schemeName: 'bearerAuth', scopes: [] }];
      const ir = createMockIRWithSecurity(['bearerAuth', 'apiKey'], globalSecurity);
      const operation = createMockOperationWithSecurity([{ schemeName: 'apiKey', scopes: [] }]);

      const result = resolveOperationSecurityFromIR(ir, operation);

      expect(result.usesGlobalSecurity).toBe(false);
      expect(result.requirementSets[0]?.schemes[0]?.schemeName).toBe('apiKey');
    });
  });

  describe('error handling', () => {
    test('throws when security scheme is not found in IR', () => {
      const ir = createMockIRWithSecurity(['bearerAuth']);
      const operation = createMockOperationWithSecurity([
        { schemeName: 'unknownScheme', scopes: [] },
      ]);

      expect(() => resolveOperationSecurityFromIR(ir, operation)).toThrow(
        /Missing security scheme "unknownScheme"/,
      );
    });
  });
});
