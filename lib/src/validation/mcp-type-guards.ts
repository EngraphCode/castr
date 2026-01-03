import { ToolSchema, type Tool } from '@modelcontextprotocol/sdk/types.js';
import AjvFactory, { type Schema as JsonSchema, type ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats/dist/index.js';
import draft07MetaSchema from 'ajv/dist/refs/json-schema-draft-07.json' with { type: 'json' };

type AjvConstructor = typeof AjvFactory.default;
type AjvInstance = InstanceType<AjvConstructor>;

interface ToolValidators {
  readonly input: ValidateFunction;
  readonly output?: ValidateFunction;
}

/**
 * Create an AJV validator instance configured for JSON Schema Draft 07.
 *
 * @returns Configured AJV instance with Draft 07 meta-schema and format validators
 *
 * @remarks
 * - Disables default meta-schema to ensure only Draft 07 is used
 * - Enables strict schema validation to catch invalid schemas early
 * - Collects all errors for comprehensive validation reporting
 * - Adds standard format validators (email, uri, date-time, etc.)
 *
 * @internal
 */
const createDraft07Validator = (): AjvInstance => {
  const ajv = new AjvFactory.default({
    meta: false,
    strictSchema: true,
    validateSchema: true,
    allErrors: true,
  });

  ajv.addMetaSchema(draft07MetaSchema);
  addFormats.default(ajv);

  return ajv;
};

const draft07Validator = createDraft07Validator();

const schemaValidatorCache = new WeakMap<object, ValidateFunction>();
const toolValidatorCache = new WeakMap<Tool, ToolValidators>();

/**
 * Get or create a cached AJV validator for a JSON Schema.
 *
 * @param schema - JSON Schema Draft 07 schema (object or boolean)
 * @returns Compiled AJV validator function
 *
 * @remarks
 * - Object schemas are cached using WeakMap for automatic garbage collection
 * - Boolean schemas (true/false) are not cached as they're rare in MCP tools
 * - Cache lookup is O(1) for previously validated schemas
 *
 * @internal
 */
const getSchemaValidator = (schema: JsonSchema): ValidateFunction => {
  // Only cache object schemas (WeakMap requires object keys)
  // Note: typeof null === 'object' in JavaScript, but JsonSchema types exclude null
  const isObjectSchema = typeof schema === 'object' && schema != null;

  if (isObjectSchema) {
    const cached = schemaValidatorCache.get(schema);
    if (cached) {
      return cached;
    }
  }

  const validator = draft07Validator.compile(schema);

  // Only cache object schemas
  if (isObjectSchema) {
    schemaValidatorCache.set(schema, validator);
  }

  return validator;
};

/**
 * Get or create cached validators for an MCP tool's input and output schemas.
 *
 * @param tool - MCP tool definition
 * @returns Object containing compiled input validator and optional output validator
 *
 * @remarks
 * - Validators are cached per tool instance using WeakMap
 * - Input validator is always present (required by MCP specification)
 * - Output validator is optional and only created if outputSchema is defined
 * - Cache is keyed by tool object identity, not by schema content
 *
 * @internal
 */
const ensureToolValidators = (tool: Tool): ToolValidators => {
  const cached = toolValidatorCache.get(tool);
  if (cached) {
    return cached;
  }

  const input = getSchemaValidator(tool.inputSchema);
  const output = tool.outputSchema ? getSchemaValidator(tool.outputSchema) : undefined;
  const validators: ToolValidators = {
    input,
    ...(output ? { output } : {}),
  };
  toolValidatorCache.set(tool, validators);
  return validators;
};

/**
 * Ensure validation result is synchronous and throw if async validation is detected.
 *
 * @param result - Validation result from AJV (should always be synchronous boolean)
 * @returns The validation result as a boolean
 *
 * @throws {Error} If validation result is a Promise (indicates async validation)
 *
 * @remarks
 * AJV can perform async validation when schemas use async format validators or
 * custom async keywords. This should never occur with JSON Schema Draft 07 in
 * MCP tools, but we guard against it to ensure predictable behavior.
 *
 * @internal
 */
const ensureSynchronousResult = (result: boolean | Promise<boolean>): boolean => {
  if (typeof result === 'boolean') {
    return result;
  }

  throw new Error('Expected synchronous JSON Schema validation');
};

/**
 * Determine whether an unknown value conforms to the MCP Tool definition.
 *
 * Validates tool structure against MCP 2025-06-18 specification using Zod schema
 * validation. This is a lightweight check suitable for runtime validation of tool
 * manifests loaded from JSON or constructed programmatically.
 *
 * @param value - Value to validate against MCP Tool schema
 * @returns `true` when the value conforms to the MCP Tool schema, `false` otherwise
 *
 * @example Validate a generated tool definition
 * ```typescript
 * import { isMcpTool } from '@engraph/castr';
 *
 * const tool = {
 *   name: 'get_user',
 *   description: 'Fetch user by ID',
 *   inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
 *   outputSchema: { type: 'object', properties: { name: { type: 'string' } } },
 * };
 *
 * if (isMcpTool(tool)) {
 *   console.log('Valid MCP tool');
 * } else {
 *   console.error('Invalid tool structure');
 * }
 * ```
 *
 * @example Validate loaded manifest
 * ```typescript
 * const manifest = JSON.parse(manifestContent);
 * if (!isMcpTool(manifest.tools[0])) {
 *   throw new Error('Invalid tool in manifest');
 * }
 * // TypeScript now knows manifest.tools[0] is a Tool
 * ```
 *
 * @see {@link Tool} from @modelcontextprotocol/sdk/types.js
 * @see {@link isMcpToolInput} for validating tool inputs
 * @see {@link isMcpToolOutput} for validating tool outputs
 *
 * @remarks
 * Uses Zod's safeParse for validation which never throws. This makes it safe
 * for use in defensive programming scenarios where data integrity is uncertain.
 *
 * @public
 */
export function isMcpTool(value: unknown): value is Tool {
  return ToolSchema.safeParse(value).success;
}

/**
 * Validate a payload intended for an MCP tool input.
 *
 * Validates that a payload matches the tool's input schema using JSON Schema Draft 07
 * validation. This function uses cached AJV validators for performance and ensures
 * synchronous validation for predictable error handling.
 *
 * @param payload - Payload to validate against the tool's input schema
 * @param tool - MCP tool definition containing the input schema
 * @returns `true` when the payload matches the tool input schema, `false` otherwise
 *
 * @throws {Error} If async validation is detected (should never occur with Draft 07)
 *
 * @example Validate user input before tool execution
 * ```typescript
 * import { isMcpToolInput } from '@engraph/castr';
 *
 * const tool = loadToolDefinition('get_user');
 * const userInput = { id: '123' };
 *
 * if (!isMcpToolInput(userInput, tool)) {
 *   throw new Error('Invalid input for get_user tool');
 * }
 *
 * // Safe to execute tool with validated input
 * const result = await executeTool(tool, userInput);
 * ```
 *
 * @example Defensive validation in API endpoint
 * ```typescript
 * app.post('/api/tool/:name', async (req, res) => {
 *   const tool = findTool(req.params.name);
 *   if (!tool || !isMcpTool(tool)) {
 *     return res.status(404).json({ error: 'Tool not found' });
 *   }
 *
 *   if (!isMcpToolInput(req.body, tool)) {
 *     return res.status(400).json({ error: 'Invalid input payload' });
 *   }
 *
 *   const result = await executeTool(tool, req.body);
 *   res.json(result);
 * });
 * ```
 *
 * @see {@link Tool} from @modelcontextprotocol/sdk/types.js
 * @see {@link isMcpTool} for validating tool definitions
 * @see {@link isMcpToolOutput} for validating tool outputs
 *
 * @remarks
 * - Validators are cached per tool using WeakMap for optimal performance
 * - Validation is always synchronous for JSON Schema Draft 07
 * - Input validation is mandatory; all MCP tools must define inputSchema
 *
 * @public
 */
export function isMcpToolInput(payload: unknown, tool: Tool): boolean {
  const { input } = ensureToolValidators(tool);
  const validationResult = ensureSynchronousResult(input(payload));
  return validationResult;
}

/**
 * Validate a payload produced by an MCP tool execution.
 *
 * Validates that a tool's output payload matches the tool's output schema using JSON
 * Schema Draft 07 validation. When a tool does not define an output schema, validation
 * always succeeds. This function uses cached AJV validators for performance.
 *
 * @param payload - Payload to validate against the tool's output schema
 * @param tool - MCP tool definition containing the optional output schema
 * @returns `true` when the payload matches the tool output schema, or when no output
 * schema is defined. Returns `false` when validation fails.
 *
 * @throws {Error} If async validation is detected (should never occur with Draft 07)
 *
 * @example Validate tool execution result
 * ```typescript
 * import { isMcpToolOutput } from '@engraph/castr';
 *
 * const tool = loadToolDefinition('get_user');
 * const result = await executeTool(tool, { id: '123' });
 *
 * if (!isMcpToolOutput(result, tool)) {
 *   throw new Error('Tool produced invalid output');
 * }
 *
 * // Safe to return validated result to client
 * return result;
 * ```
 *
 * @example Validate in middleware for consistent error handling
 * ```typescript
 * async function executeWithValidation(tool: Tool, input: unknown) {
 *   if (!isMcpToolInput(input, tool)) {
 *     throw new ValidationError('Invalid input', { tool: tool.name });
 *   }
 *
 *   const output = await executeTool(tool, input);
 *
 *   if (!isMcpToolOutput(output, tool)) {
 *     throw new ValidationError('Invalid output', { tool: tool.name });
 *   }
 *
 *   return output;
 * }
 * ```
 *
 * @see {@link Tool} from @modelcontextprotocol/sdk/types.js
 * @see {@link isMcpTool} for validating tool definitions
 * @see {@link isMcpToolInput} for validating tool inputs
 *
 * @remarks
 * - Validators are cached per tool using WeakMap for optimal performance
 * - Validation is always synchronous for JSON Schema Draft 07
 * - Output validation is optional; tools without outputSchema always pass validation
 * - Useful for detecting bugs in tool implementations during development
 *
 * @public
 */
export function isMcpToolOutput(payload: unknown, tool: Tool): boolean {
  const { output } = ensureToolValidators(tool);
  if (!output) {
    return true;
  }

  const validationResult = ensureSynchronousResult(output(payload));
  return validationResult;
}
