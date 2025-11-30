import type { SourceFile } from 'ts-morph';

const REQUEST_INPUT_TYPE = `{
    pathParams?: unknown;
    queryParams?: unknown;
    headers?: unknown;
    body?: unknown;
  }`;

const REQUEST_RETURN_TYPE = `{
  pathParams?: unknown;
  queryParams?: unknown;
  headers?: unknown;
  body?: unknown;
}`;

export function addValidationHelpers(sourceFile: SourceFile): void {
  addValidateRequestHelper(sourceFile);
  addValidateResponseHelper(sourceFile);
}

function addValidateRequestHelper(sourceFile: SourceFile): void {
  sourceFile.addFunction({
    name: 'validateRequest',
    isExported: true,
    typeParameters: [{ name: 'T', constraint: '(typeof endpoints)[number]' }],
    parameters: [
      { name: 'endpoint', type: 'T' },
      { name: 'input', type: REQUEST_INPUT_TYPE },
    ],
    returnType: REQUEST_RETURN_TYPE,
    statements: `
  const result: Record<string, unknown> = {};
  
  if (endpoint.request.pathParams && input.pathParams !== undefined) {
    result.pathParams = endpoint.request.pathParams.parse(input.pathParams);
  }
  if (endpoint.request.queryParams && input.queryParams !== undefined) {
    result.queryParams = endpoint.request.queryParams.parse(input.queryParams);
  }
  if (endpoint.request.headers && input.headers !== undefined) {
    result.headers = endpoint.request.headers.parse(input.headers);
  }
  if (endpoint.request.body && input.body !== undefined) {
    result.body = endpoint.request.body.parse(input.body);
  }
  
  return result;`,
    docs: [
      {
        description: `Validates request parameters against endpoint schema.
 * 
 * Uses \`.parse()\` for fail-fast validation (throws on error). Each parameter type
 * (path, query, headers, body) is validated individually against the endpoint's schema.
 * 
 * @throws {z.ZodError} When validation fails`,
      },
    ],
  });
}

function addValidateResponseHelper(sourceFile: SourceFile): void {
  sourceFile.addFunction({
    name: 'validateResponse',
    isExported: true,
    typeParameters: [
      { name: 'T', constraint: '(typeof endpoints)[number]' },
      { name: 'S', constraint: 'keyof T["responses"] & number' },
    ],
    parameters: [
      { name: 'endpoint', type: 'T' },
      { name: 'status', type: 'S' },
      { name: 'data', type: 'unknown' },
    ],
    returnType: 'unknown',
    statements: `
  const responseSchema = endpoint.responses[status];
  if (!responseSchema) {
    throw new Error(\`No schema defined for status \${status} on \${endpoint.method.toUpperCase()} \${endpoint.path}\`);
  }
  return responseSchema.schema.parse(data);`,
    docs: [
      {
        description: `Validates response data against endpoint schema for given status code.`,
      },
    ],
  });
}

export function addSchemaRegistryHelper(sourceFile: SourceFile): void {
  sourceFile.addFunction({
    name: 'buildSchemaRegistry',
    isExported: true,
    typeParameters: [{ name: 'T', constraint: 'Record<string, z.ZodSchema>' }],
    parameters: [
      { name: 'rawSchemas', type: 'T' },
      { name: 'options', type: '{ rename?: (key: string) => string }', hasQuestionToken: true },
    ],
    returnType: 'Record<string, z.ZodSchema>',
    statements: `
  const rename = options?.rename ?? ((key: string) => key.replace(/[^A-Za-z0-9_]/g, "_"));
  const result: Record<string, z.ZodSchema> = {};
  
  for (const [key, value] of Object.entries(rawSchemas)) {
    const sanitized = rename(key);
    result[sanitized] = value;
  }
  
  return result;`,
    docs: [
      {
        description: `Builds a schema registry with sanitized keys for runtime schema lookup.`,
      },
    ],
  });
}
