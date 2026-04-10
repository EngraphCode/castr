import type {
  CastrSchema,
  CastrDocument,
  CastrOperation,
  CastrParameter,
  CastrResponse,
} from '../../ir/index.js';
import type {
  EndpointDefinition,
  EndpointParameter,
  EndpointError,
  EndpointResponse,
  ParameterType,
} from '../../../endpoints/definition.types.js';
import { extractConstraintsFromIR } from '../constraints/index.js';
import { isSuccessStatusCode, STATUS_DEFAULT } from './template-context.status-codes.js';
import {
  createBodyParameter,
  createEmptySchema,
  determineRequestFormat,
  getSchemaFromContent,
} from './content/index.js';

export function getEndpointDefinitionsFromIR(ir: CastrDocument): EndpointDefinition[] {
  return ir.operations.map((operation) => mapOperationToEndpointDefinition(ir, operation));
}

function mapOperationToEndpointDefinition(
  ir: Pick<CastrDocument, 'components'>,
  operation: CastrOperation,
): EndpointDefinition {
  const parameters = mapParameters(operation.parameters);
  const errors = mapErrors(ir, operation.responses);
  const response = mapSuccessResponse(ir, operation.responses);
  const responses = mapAllResponses(ir, operation.responses);

  const requestFormat = determineRequestFormat(operation.requestBody);

  // Add body parameter if present
  const bodyParam = createBodyParameter(ir, operation.requestBody);
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
    }
    if (p.examples !== undefined) {
      param.examples = p.examples;
    }
    if (p.schema.examples !== undefined) {
      param.schemaExamples = p.schema.examples;
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
 * Maps 'path' | 'query' | 'querystring' | 'header' | 'cookie' to endpoint parameter types.
 * Note: cookie parameters are treated as Header since EndpointParameter doesn't distinguish them
 */
function toParameterType(
  location: 'path' | 'query' | 'header' | 'cookie' | 'querystring',
): ParameterType {
  const mapping: Record<string, ParameterType> = {
    path: 'Path',
    query: 'Query',
    querystring: 'QueryString',
    header: 'Header',
    cookie: 'Header', // Cookie parameters are sent as headers
  };
  return mapping[location] || 'Query';
}

function mapErrors(
  ir: Pick<CastrDocument, 'components'>,
  responses: CastrResponse[],
): EndpointError[] {
  return responses
    .filter((r) => !isSuccessStatusCode(r.statusCode))
    .map((r) => {
      const schema = r.schema || getSchemaFromContent(ir, r.content, `responses/${r.statusCode}`);
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

function mapSuccessResponse(
  ir: Pick<CastrDocument, 'components'>,
  responses: CastrResponse[],
): CastrSchema {
  // Should be CastrSchema
  // Find primary success response using centralized status-code semantics.
  const success = responses.find((r) => isSuccessStatusCode(r.statusCode));
  if (success) {
    return (
      success.schema ||
      getSchemaFromContent(ir, success.content, `responses/${success.statusCode}`) ||
      createEmptySchema()
    );
  }
  return createEmptySchema();
}

function mapAllResponses(
  ir: Pick<CastrDocument, 'components'>,
  responses: CastrResponse[],
): EndpointResponse[] {
  return responses.map((r) => {
    const schema = r.schema || getSchemaFromContent(ir, r.content, `responses/${r.statusCode}`);
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
