import type {
  CastrDocument,
  CastrOperation,
  CastrParameter,
  CastrResponse,
  IRMediaType,
  CastrSchema,
} from '../ir/schema.js';
import type {
  EndpointDefinition,
  EndpointParameter,
  EndpointError,
  EndpointResponse,
  RequestFormat,
  ParameterType,
} from '../../endpoints/definition.types.js';
import { extractConstraintsFromIR } from './constraint-extraction.js';
import { isSuccessStatusCode, STATUS_DEFAULT } from './template-context.status-codes.js';

/**
 * Creates an empty CastrSchema object with default metadata.
 * Used as fallback when no schema is available.
 */
function createEmptySchema(): CastrSchema {
  return {
    type: 'object',
    metadata: {
      required: false,
      nullable: false,
      zodChain: { presence: '', validations: [], defaults: [] },
      dependencyGraph: { references: [], referencedBy: [], depth: 0 },
      circularReferences: [],
    },
  };
}

export function getEndpointDefinitionsFromIR(ir: CastrDocument): EndpointDefinition[] {
  return ir.operations.map((operation) => mapOperationToEndpointDefinition(operation));
}

/**
 * Determines the request format based on the content types in the request body.
 */
function determineRequestFormat(requestBody?: CastrOperation['requestBody']): RequestFormat {
  if (!requestBody) {
    return 'json';
  }

  if (requestBody.content['multipart/form-data']) {
    return 'form-data';
  }
  if (requestBody.content['application/x-www-form-urlencoded']) {
    return 'form-url';
  }
  if (requestBody.content['application/octet-stream']) {
    return 'binary';
  }
  if (requestBody.content['text/plain']) {
    return 'text';
  }

  return 'json';
}

/**
 * Creates a body parameter from the request body if present.
 */
function createBodyParameter(
  requestBody?: CastrOperation['requestBody'],
): EndpointParameter | null {
  if (!requestBody) {
    return null;
  }

  const contentType = Object.keys(requestBody.content)[0];
  if (!contentType) {
    return null;
  }

  const mediaType = requestBody.content[contentType];
  if (!mediaType) {
    return null;
  }

  const bodyParam: EndpointParameter = {
    name: 'body',
    type: 'Body',
    schema: mediaType.schema,
  };

  if (requestBody.description) {
    bodyParam.description = requestBody.description;
  }

  return bodyParam;
}

function mapOperationToEndpointDefinition(operation: CastrOperation): EndpointDefinition {
  const parameters = mapParameters(operation.parameters);
  const errors = mapErrors(operation.responses);
  const response = mapSuccessResponse(operation.responses);
  const responses = mapAllResponses(operation.responses);

  const requestFormat = determineRequestFormat(operation.requestBody);

  // Add body parameter if present
  const bodyParam = createBodyParameter(operation.requestBody);
  if (bodyParam) {
    parameters.push(bodyParam);
  }

  const def: EndpointDefinition = {
    method: operation.method,
    path: operation.path,
    ...(operation.operationId ? { alias: operation.operationId } : {}),
    requestFormat,
    parameters,
    errors,
    response,
    responses,
  };

  if (operation.description) {
    def.description = operation.description;
  }

  // Copy tags for grouping support (IR-2 cleanup)
  if (operation.tags && operation.tags.length > 0) {
    def.tags = operation.tags;
  }

  return def;
}

function mapParameters(irParams: CastrParameter[]): EndpointParameter[] {
  return irParams.map((p) => {
    const param: EndpointParameter = {
      name: p.name,
      type: toParameterType(p.in),
      schema: p.schema,
    };

    if (p.description) {
      param.description = p.description;
    }
    if (p.deprecated !== undefined) {
      param.deprecated = p.deprecated;
    }
    if (p.example !== undefined) {
      param.example = p.example;
    } else if (p.schema.example !== undefined) {
      param.example = p.schema.example;
    }
    if (p.examples !== undefined) {
      param.examples = p.examples;
    }
    if (p.schema.default !== undefined) {
      param.default = p.schema.default;
    }

    const constraints = extractConstraintsFromIR(p.schema);
    if (constraints) {
      param.constraints = constraints;
    }

    return param;
  });
}

/**
 * Converts IR parameter location to EndpointParameter type.
 * Maps 'path' | 'query' | 'header' | 'cookie' to 'Path' | 'Query' | 'Header' | 'Body'
 * Note: cookie parameters are treated as Header since EndpointParameter doesn't distinguish them
 */
function toParameterType(location: 'path' | 'query' | 'header' | 'cookie'): ParameterType {
  const mapping: Record<string, ParameterType> = {
    path: 'Path',
    query: 'Query',
    header: 'Header',
    cookie: 'Header', // Cookie parameters are sent as headers
  };
  return mapping[location] || 'Query';
}

function mapErrors(responses: CastrResponse[]): EndpointError[] {
  return responses
    .filter((r) => !isSuccessStatusCode(r.statusCode))
    .map((r) => {
      const schema = r.schema || getSchemaFromContent(r.content);
      const error: EndpointError = {
        status: r.statusCode === STATUS_DEFAULT ? STATUS_DEFAULT : parseInt(r.statusCode, 10),
        schema: schema || createEmptySchema(),
      };
      if (r.description) {
        error.description = r.description;
      }
      return error;
    });
}

function mapSuccessResponse(responses: CastrResponse[]): CastrSchema {
  // Should be CastrSchema
  // Find primary success response using centralized status-code semantics.
  const success = responses.find((r) => isSuccessStatusCode(r.statusCode));
  if (success) {
    return success.schema || getSchemaFromContent(success.content) || createEmptySchema();
  }
  return createEmptySchema();
}

function mapAllResponses(responses: CastrResponse[]): EndpointResponse[] {
  return responses.map((r) => {
    const schema = r.schema || getSchemaFromContent(r.content);
    const resp: EndpointResponse = {
      statusCode: r.statusCode,
      schema: schema || createEmptySchema(),
    };
    if (r.description) {
      resp.description = r.description;
    }
    return resp;
  });
}

function getSchemaFromContent(content?: Record<string, IRMediaType>): CastrSchema | undefined {
  if (!content) {
    return undefined;
  }
  if (content['application/json']) {
    return content['application/json'].schema;
  }
  const firstKey = Object.keys(content)[0];
  if (firstKey && content[firstKey]) {
    return content[firstKey].schema;
  }
  return undefined;
}
