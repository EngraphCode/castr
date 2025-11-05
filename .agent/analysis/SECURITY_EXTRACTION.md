# Upstream API Security Extraction

**Created:** November 5, 2025  
**Purpose:** Document how to extract and communicate upstream API authentication requirements from OpenAPI specifications

---

## Overview

This document defines the strategy for extracting security metadata from OpenAPI specifications to inform MCP server implementers about upstream API authentication requirements.

**Critical Distinction:** This document addresses **upstream API security** (defined in OpenAPI specs), NOT MCP protocol security (OAuth 2.1 between MCP client and server).

---

## Authentication Architecture

### Two-Layer Authentication Model

```
┌─────────────┐                    ┌─────────────┐                    ┌─────────────┐
│             │   MCP OAuth 2.1    │             │  Upstream API Auth │             │
│ MCP Client  │ ═══════════════>   │ MCP Server  │ ═══════════════>   │ Upstream    │
│ (e.g. IDE)  │   (Layer 1)        │ (Generated) │  (Layer 2)         │ API         │
└─────────────┘                    └─────────────┘                    └─────────────┘
       │                                  │                                   │
       │                                  │                                   │
   User auth                         Backend                            API defined
   with MCP                          authentication                     by OpenAPI
   server                            to upstream API                    spec
```

### Layer 1: MCP Protocol Security (NOT in OpenAPI Spec)

**Defined by:** [MCP Specification 2025-06-18](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization)

**Characteristics:**

- OAuth 2.1 between MCP client and MCP server
- Authorization Code flow with PKCE
- Dynamic client registration (RFC 7591)
- Resource indicators (RFC 8707)
- Bearer token in Authorization header

**Not our concern:** The MCP SDK and server runtime handle this layer.

### Layer 2: Upstream API Security (IN OpenAPI Spec)

**Defined by:** OpenAPI `securitySchemes` and operation `security` fields

**Characteristics:**

- OAuth 2.0/OAuth 1.0
- Bearer tokens
- API keys
- HTTP Basic/Digest auth
- OpenID Connect
- Custom authentication schemes

**Our concern:** Extract and document this layer for MCP server implementers.

---

## Purpose and Scope

### Why Extract Security Metadata?

When generating MCP tools from OpenAPI operations, server implementers need to know:

1. **What credentials are required** to call the upstream API
2. **How to configure** those credentials in the MCP server
3. **What scopes/permissions** each tool operation requires
4. **Where to place** authentication tokens/keys in requests

### What Gets Extracted

From OpenAPI specifications:

1. **Security Schemes** (`components.securitySchemes`)
   - Authentication methods (OAuth, Bearer, API Key, etc.)
   - OAuth flows and endpoints
   - Scope definitions
   - Token/key placement (header, query, cookie)

2. **Operation Security** (`paths[path][method].security`)
   - Which schemes apply to each operation
   - Required scopes per operation
   - Override of global security

3. **Global Security** (root-level `security`)
   - Default authentication for all operations
   - Fallback when operation doesn't specify security

### What Gets Generated

1. **Tool-level documentation comments**
   - Human-readable explanation of authentication requirements
   - Configuration guidance for server implementers
   - Required scopes and credentials

2. **Server implementation guide**
   - Credential configuration requirements
   - Environment variable suggestions
   - Secrets management recommendations

3. **Type definitions** (TypeScript SDK)
   - Security configuration interfaces
   - Credential provider types

---

## OpenAPI Security Schemes

### Security Scheme Types

#### 1. OAuth 2.0

**OpenAPI Definition:**

```yaml
components:
  securitySchemes:
    oauth2:
      type: oauth2
      description: OAuth 2.0 authorization
      flows:
        authorizationCode:
          authorizationUrl: https://api.example.com/oauth/authorize
          tokenUrl: https://api.example.com/oauth/token
          refreshUrl: https://api.example.com/oauth/refresh
          scopes:
            read:users: Read user information
            write:users: Modify user information
            admin: Administrator access
```

**Extracted Information:**

- Flow type (authorizationCode, clientCredentials, implicit, password)
- Authorization URL
- Token URL
- Refresh URL (if applicable)
- Available scopes with descriptions

**Generated Documentation:**

```typescript
/**
 * Upstream API Authentication: OAuth 2.0
 *
 * Flow: Authorization Code
 * Authorization URL: https://api.example.com/oauth/authorize
 * Token URL: https://api.example.com/oauth/token
 * Refresh URL: https://api.example.com/oauth/refresh
 *
 * Available Scopes:
 * - read:users: Read user information
 * - write:users: Modify user information
 * - admin: Administrator access
 *
 * Configuration:
 * Set environment variables:
 * - UPSTREAM_OAUTH_CLIENT_ID
 * - UPSTREAM_OAUTH_CLIENT_SECRET
 *
 * Server Implementation:
 * Your MCP server must obtain OAuth access tokens and include them
 * in upstream API requests as: Authorization: Bearer <token>
 */
```

#### 2. Bearer Token (HTTP)

**OpenAPI Definition:**

```yaml
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

**Extracted Information:**

- Scheme type (bearer)
- Bearer format (JWT, opaque, etc.)

**Generated Documentation:**

```typescript
/**
 * Upstream API Authentication: HTTP Bearer Token
 *
 * Format: JWT
 * Header: Authorization: Bearer <token>
 *
 * Configuration:
 * Set environment variable:
 * - UPSTREAM_BEARER_TOKEN
 *
 * Server Implementation:
 * Your MCP server must obtain and provide a valid bearer token
 * in the Authorization header for all upstream API requests.
 */
```

#### 3. API Key

**OpenAPI Definition:**

```yaml
components:
  securitySchemes:
    apiKey:
      type: apiKey
      name: X-API-Key
      in: header
    queryKey:
      type: apiKey
      name: api_key
      in: query
    cookieKey:
      type: apiKey
      name: session
      in: cookie
```

**Extracted Information:**

- Key name
- Location (header, query, cookie)

**Generated Documentation:**

```typescript
/**
 * Upstream API Authentication: API Key
 *
 * Location: Header
 * Header Name: X-API-Key
 *
 * Configuration:
 * Set environment variable:
 * - UPSTREAM_API_KEY
 *
 * Server Implementation:
 * Your MCP server must include the API key in every upstream request:
 * X-API-Key: <api_key_value>
 */
```

#### 4. HTTP Basic Authentication

**OpenAPI Definition:**

```yaml
components:
  securitySchemes:
    basicAuth:
      type: http
      scheme: basic
```

**Generated Documentation:**

```typescript
/**
 * Upstream API Authentication: HTTP Basic Auth
 *
 * Header: Authorization: Basic <base64(username:password)>
 *
 * Configuration:
 * Set environment variables:
 * - UPSTREAM_BASIC_AUTH_USERNAME
 * - UPSTREAM_BASIC_AUTH_PASSWORD
 *
 * Server Implementation:
 * Your MCP server must encode credentials and include in Authorization header.
 */
```

#### 5. OpenID Connect

**OpenAPI Definition:**

```yaml
components:
  securitySchemes:
    openId:
      type: openIdConnect
      openIdConnectUrl: https://example.com/.well-known/openid-configuration
```

**Generated Documentation:**

```typescript
/**
 * Upstream API Authentication: OpenID Connect
 *
 * Discovery URL: https://example.com/.well-known/openid-configuration
 *
 * Configuration:
 * Configure OpenID Connect client with discovery URL
 *
 * Server Implementation:
 * Your MCP server must implement OpenID Connect flow and include
 * obtained tokens in upstream API requests.
 */
```

---

## Operation-Level Security

### Security Application

Operations can specify security requirements in three ways:

#### 1. Use Global Security (Default)

**OpenAPI:**

```yaml
security:
  - oauth2: [read:users]

paths:
  /users/{id}:
    get:
      operationId: getUser
      # No security specified → uses global security
```

**Extracted:** Uses global `oauth2` scheme with `read:users` scope

#### 2. Override Global Security

**OpenAPI:**

```yaml
security:
  - oauth2: [read:users]

paths:
  /users/{id}:
    delete:
      operationId: deleteUser
      security:
        - oauth2: [write:users, admin] # Override
```

**Extracted:** Requires `write:users` and `admin` scopes (not just `read:users`)

#### 3. No Authentication Required

**OpenAPI:**

```yaml
security:
  - oauth2: [read:users]

paths:
  /health:
    get:
      operationId: healthCheck
      security: [] # Empty array = no auth
```

**Extracted:** No authentication required (public endpoint)

---

## Extraction Algorithm

### Step 1: Parse Security Schemes

```typescript
interface SecurityScheme {
  type: 'oauth2' | 'http' | 'apiKey' | 'openIdConnect';
  description?: string;
  // Type-specific fields...
}

function extractSecuritySchemes(spec: OpenAPIObject): Map<string, SecurityScheme> {
  const schemes = new Map();

  for (const [name, scheme] of Object.entries(spec.components?.securitySchemes ?? {})) {
    schemes.set(name, {
      name,
      ...scheme,
    });
  }

  return schemes;
}
```

### Step 2: Resolve Operation Security

```typescript
interface OperationSecurity {
  schemes: Array<{
    schemeName: string;
    scheme: SecurityScheme;
    scopes: string[];
  }>;
  isPublic: boolean;
  usesGlobalSecurity: boolean;
}

function resolveOperationSecurity(
  operation: OperationObject,
  globalSecurity: SecurityRequirementObject[],
  schemes: Map<string, SecurityScheme>,
): OperationSecurity {
  // 1. Check if operation has explicit security
  const opSecurity = operation.security;

  // 2. Empty array = public endpoint
  if (opSecurity && opSecurity.length === 0) {
    return { schemes: [], isPublic: true, usesGlobalSecurity: false };
  }

  // 3. Use operation security or fallback to global
  const securityToUse = opSecurity ?? globalSecurity;

  // 4. Resolve scheme details and scopes
  const resolvedSchemes = securityToUse.flatMap((requirement) => {
    return Object.entries(requirement).map(([schemeName, scopes]) => ({
      schemeName,
      scheme: schemes.get(schemeName)!,
      scopes: Array.isArray(scopes) ? scopes : [],
    }));
  });

  return {
    schemes: resolvedSchemes,
    isPublic: false,
    usesGlobalSecurity: opSecurity === undefined,
  };
}
```

### Step 3: Generate Documentation

```typescript
function generateSecurityDocumentation(operationId: string, security: OperationSecurity): string {
  if (security.isPublic) {
    return `/**
 * Upstream API Authentication: None (Public Endpoint)
 * 
 * This operation does not require authentication.
 */`;
  }

  const docs = security.schemes.map(({ scheme, scopes }) => {
    let doc = `/**\n * Upstream API Authentication: ${formatSchemeName(scheme)}\n *\n`;

    // Add scheme-specific details
    doc += formatSchemeDetails(scheme);

    // Add required scopes
    if (scopes.length > 0) {
      doc += ` * Required Scopes:\n`;
      for (const scope of scopes) {
        doc += ` *   - ${scope}\n`;
      }
      doc += ` *\n`;
    }

    // Add configuration guidance
    doc += formatConfigurationGuidance(scheme);

    doc += ` */`;
    return doc;
  });

  return docs.join('\n\n');
}
```

---

## Generated Artifacts

### 1. Tool Documentation Comments

Each MCP tool gets comprehensive security documentation:

```typescript
/**
 * MCP Tool: get_user
 *
 * OpenAPI Operation: GET /users/{id}
 *
 * ============================================================
 * UPSTREAM API AUTHENTICATION (for MCP server implementers)
 * ============================================================
 *
 * Method: OAuth 2.0 Authorization Code Flow
 * Required Scopes: read:users
 *
 * Authorization URL: https://api.example.com/oauth/authorize
 * Token URL: https://api.example.com/oauth/token
 *
 * Configuration Required:
 * Set the following environment variables in your MCP server:
 * - EXAMPLE_API_CLIENT_ID
 * - EXAMPLE_API_CLIENT_SECRET
 *
 * Implementation Notes:
 * 1. Your MCP server must obtain OAuth credentials for the upstream API
 * 2. Include access token in Authorization: Bearer <token> header
 * 3. Ensure token has 'read:users' scope before making requests
 * 4. Implement token refresh logic for long-running operations
 *
 * This authentication is SEPARATE from MCP protocol authentication
 * (OAuth 2.1 between MCP client and your MCP server).
 */
export const getUserInputSchema = z.object({
  id: z.string().describe('User ID'),
});
```

### 2. Server Configuration Guide

Generate a configuration documentation file:

````markdown
# Upstream API Authentication Configuration

## Overview

This MCP server connects to the Example API which requires authentication.
The security requirements below are for the **upstream API** (Layer 2),
separate from MCP protocol security (Layer 1).

## Required Credentials

### OAuth 2.0 Configuration

The Example API uses OAuth 2.0 Authorization Code flow.

**Environment Variables:**

```bash
EXAMPLE_API_CLIENT_ID=<your_client_id>
EXAMPLE_API_CLIENT_SECRET=<your_client_secret>
```
````

**OAuth Endpoints:**

- Authorization: https://api.example.com/oauth/authorize
- Token: https://api.example.com/oauth/token
- Refresh: https://api.example.com/oauth/refresh

## Tools and Required Scopes

| Tool Name   | Operation          | Required Scopes         |
| ----------- | ------------------ | ----------------------- |
| get_user    | GET /users/{id}    | read:users              |
| update_user | PUT /users/{id}    | read:users, write:users |
| delete_user | DELETE /users/{id} | admin                   |
| list_users  | GET /users         | read:users              |

## Implementation Checklist

- [ ] Register OAuth client with Example API
- [ ] Configure client credentials in environment
- [ ] Implement OAuth token acquisition
- [ ] Implement token refresh logic
- [ ] Add Authorization header to upstream requests
- [ ] Handle authentication errors (401, 403)
- [ ] Log authentication events for audit

## Security Best Practices

1. **Credential Storage:** Store client secrets securely (secrets manager, not .env files)
2. **Token Caching:** Cache access tokens, refresh before expiry
3. **Scope Minimization:** Request only required scopes for each operation
4. **Error Handling:** Gracefully handle authentication failures
5. **Audit Logging:** Log all credential usage for compliance

````

### 3. TypeScript Configuration Types

For SDK generation:

```typescript
/**
 * Configuration for upstream API authentication.
 *
 * This is separate from MCP protocol authentication.
 */
export interface UpstreamApiConfig {
  /**
   * OAuth 2.0 configuration for Example API
   */
  oauth2?: {
    clientId: string;
    clientSecret: string;
    authorizationUrl?: string;  // Default: from spec
    tokenUrl?: string;          // Default: from spec
    refreshUrl?: string;        // Default: from spec
  };

  /**
   * Optional: Provide a custom token provider
   */
  tokenProvider?: () => Promise<string>;
}

/**
 * Create an MCP server with upstream API authentication
 */
export function createMcpServer(config: UpstreamApiConfig): McpServer {
  // Implementation...
}
````

---

## Special Cases

### Multiple Security Schemes (OR Logic)

**OpenAPI:**

```yaml
paths:
  /users:
    get:
      security:
        - oauth2: [read:users]
        - apiKey: []
```

**Meaning:** Can use **either** OAuth 2.0 **or** API key

**Generated Documentation:**

```typescript
/**
 * Upstream API Authentication: Multiple Options
 *
 * This operation accepts EITHER of the following:
 *
 * Option 1: OAuth 2.0
 *   - Scopes: read:users
 *   - Header: Authorization: Bearer <token>
 *
 * Option 2: API Key
 *   - Header: X-API-Key: <key>
 *
 * Configuration:
 * Configure at least one authentication method.
 */
```

### No Security Schemes Defined

**OpenAPI:**

```yaml
# No components.securitySchemes
# No security at root or operation level
```

**Generated Documentation:**

```typescript
/**
 * Upstream API Authentication: None Specified
 *
 * WARNING: No authentication requirements found in OpenAPI spec.
 * The upstream API may be public, or authentication requirements
 * may not be documented.
 *
 * Verify with API provider before deploying to production.
 */
```

### Legacy OpenAPI 2.0 Security

**Swagger 2.0:**

```yaml
securityDefinitions: # Old name
  oauth2:
    type: oauth2
    flow: accessCode # Old name for authorizationCode
```

**Strategy:** Convert Swagger 2.0 security to OpenAPI 3.x format before extraction.

---

## Documentation Templates

### Template: OAuth 2.0

```typescript
/**
 * Upstream API Authentication: OAuth 2.0 {flow}
 *
 * Flow: {flowType}
 * Authorization URL: {authUrl}
 * Token URL: {tokenUrl}
 * {if refreshUrl}Refresh URL: {refreshUrl}{/if}
 *
 * {if scopes}
 * Required Scopes:
 * {#each scopes}
 *   - {name}: {description}
 * {/each}
 * {/if}
 *
 * Configuration:
 * Set environment variables:
 * - {SCHEME_NAME_UPPER}_CLIENT_ID
 * - {SCHEME_NAME_UPPER}_CLIENT_SECRET
 *
 * Server Implementation:
 * Your MCP server must implement the OAuth 2.0 {flowType} flow
 * and include obtained tokens in upstream requests as:
 * Authorization: Bearer <token>
 */
```

### Template: API Key

```typescript
/**
 * Upstream API Authentication: API Key
 *
 * Location: {in} ({header|query|cookie})
 * {if in === 'header'}Header Name: {name}{/if}
 * {if in === 'query'}Query Parameter: {name}{/if}
 * {if in === 'cookie'}Cookie Name: {name}{/if}
 *
 * Configuration:
 * Set environment variable:
 * - {SCHEME_NAME_UPPER}_API_KEY
 *
 * Server Implementation:
 * Your MCP server must include the API key in every upstream request.
 */
```

### Template: HTTP Bearer

```typescript
/**
 * Upstream API Authentication: HTTP Bearer Token
 *
 * {if bearerFormat}Format: {bearerFormat}{/if}
 * Header: Authorization: Bearer <token>
 *
 * Configuration:
 * Set environment variable:
 * - {SCHEME_NAME_UPPER}_BEARER_TOKEN
 *
 * Server Implementation:
 * Your MCP server must obtain and provide a valid bearer token
 * in the Authorization header for all upstream API requests.
 */
```

---

## Implementation Checklist

- [ ] Parse `components.securitySchemes` from OpenAPI spec
- [ ] Parse root-level `security` (global default)
- [ ] Parse operation-level `security` (per-operation override)
- [ ] Implement security resolution algorithm
- [ ] Handle empty security array (public endpoints)
- [ ] Handle missing security (undefined vs empty array)
- [ ] Extract OAuth flows and scopes
- [ ] Extract API key location and name
- [ ] Generate tool documentation comments
- [ ] Generate server configuration guide
- [ ] Generate TypeScript configuration types
- [ ] Add tests for all security scheme types
- [ ] Add tests for security resolution logic
- [ ] Document security architecture (two layers)

---

## References

- [OpenAPI 3.1 Security Scheme Object](https://spec.openapis.org/oas/v3.1.0#security-scheme-object)
- [OpenAPI 3.1 Security Requirement Object](https://spec.openapis.org/oas/v3.1.0#security-requirement-object)
- [MCP Authorization Specification](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization)
- [OAuth 2.1 Draft](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-12)
- [RFC 7591 - OAuth Dynamic Client Registration](https://datatracker.ietf.org/doc/html/rfc7591)

---

**Last Updated:** November 5, 2025  
**Status:** Complete - Ready for implementation
