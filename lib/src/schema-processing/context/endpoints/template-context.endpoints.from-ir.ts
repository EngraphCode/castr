import type {
  CastrAdditionalOperation,
  CastrSchema,
  CastrDocument,
  CastrOperation,
  CastrParameter,
  CastrResponse,
} from '../../ir/index.js';
import { allOperations } from '../../ir/index.js';
import type {
  EndpointDefinition,
  EndpointParameter,
  EndpointError,
  EndpointResponse,
  ParameterType,
} from '../../../endpoints/definition.types.js';
import { assertDocumentSupportsItemSchemaTargetCapabilities } from '../../compatibility/item-schema-target-capabilities.js';
import { extractConstraintsFromIR } from '../constraints/index.js';
import {
  DEFAULT_STATUS_AUTO_CORRECT,
  DEFAULT_STATUS_SPEC_COMPLIANT,
  isConcreteStatusToken,
  isStatusRangeToken,
  isSuccessStatusCode,
  STATUS_DEFAULT,
  type DefaultStatusBehavior,
} from './template-context.status-codes.js';
import {
  createBodyParameter,
  createEmptySchema,
  determineRequestFormat,
  getSchemaFromContent,
} from './content/index.js';
import { logger } from '../../../shared/utils/logger.js';

function hasOnlyDefaultResponses(operation: CastrOperation | CastrAdditionalOperation): boolean {
  return (
    operation.responses.length > 0 &&
    operation.responses.every((r) => r.statusCode === STATUS_DEFAULT)
  );
}

function warnIgnoredDefaultOnlyOperations(
  operations: readonly (CastrOperation | CastrAdditionalOperation)[],
): void {
  const identifiers = operations.map((op) => op.operationId ?? `${op.method} ${op.path}`);
  logger.warn(
    'The following endpoints have no status code other than `default` and were ignored as the ' +
      'OpenAPI spec recommends. However they could be added by setting `defaultStatusBehavior` ' +
      `to \`${DEFAULT_STATUS_AUTO_CORRECT}\`:`,
    identifiers.join(', '),
  );
}

/**
 * Build endpoint definitions from the IR.
 *
 * @param ir - The IR document
 * @param defaultStatusBehavior - How operations whose only response is
 *   `default` are handled: `'spec-compliant'` (the default) ignores them with
 *   a warning; `'auto-correct'` includes them, treating `default` as the
 *   success response. See docs/DEFAULT-RESPONSE-BEHAVIOR.md.
 */
export function getEndpointDefinitionsFromIR(
  ir: CastrDocument,
  defaultStatusBehavior: DefaultStatusBehavior = DEFAULT_STATUS_SPEC_COMPLIANT,
): EndpointDefinition[] {
  assertDocumentSupportsItemSchemaTargetCapabilities(ir, 'Endpoints');
  const operations = allOperations(ir);

  if (defaultStatusBehavior === DEFAULT_STATUS_SPEC_COMPLIANT) {
    const ignored = operations.filter(hasOnlyDefaultResponses);
    if (ignored.length > 0) {
      warnIgnoredDefaultOnlyOperations(ignored);
    }
    return operations
      .filter((operation) => !hasOnlyDefaultResponses(operation))
      .map((operation) => mapOperationToEndpointDefinition(ir, operation, false));
  }

  return operations.map((operation) =>
    mapOperationToEndpointDefinition(ir, operation, hasOnlyDefaultResponses(operation)),
  );
}

function mapOperationToEndpointDefinition(
  ir: Pick<CastrDocument, 'components'>,
  operation: CastrOperation | CastrAdditionalOperation,
  promoteDefaultToSuccess: boolean,
): EndpointDefinition {
  const parameters = mapParameters(operation.parameters);
  const errors = mapErrors(ir, operation.responses, promoteDefaultToSuccess);
  const response = mapSuccessResponse(ir, operation.responses, promoteDefaultToSuccess);
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

/**
 * Reject IR status tokens that endpoint error mapping cannot represent.
 *
 * `'default'`, wildcard range tokens (`'1XX'`-`'5XX'`), and concrete
 * three-digit codes are supported. Any other token is rejected fail-fast —
 * silently collapsing it (e.g. `parseInt('4XX') === 4`) would corrupt
 * generated error metadata.
 */
function assertSupportedErrorStatusToken(statusCode: string): void {
  if (
    statusCode === STATUS_DEFAULT ||
    isStatusRangeToken(statusCode) ||
    isConcreteStatusToken(statusCode)
  ) {
    return;
  }
  throw new Error(
    `Unsupported response status token '${statusCode}'. Expected a concrete HTTP status code ` +
      `('100'-'599'), an uppercase status range ('1XX'-'5XX'), or 'default'.`,
  );
}

function mapErrors(
  ir: Pick<CastrDocument, 'components'>,
  responses: CastrResponse[],
  promoteDefaultToSuccess: boolean,
): EndpointError[] {
  return responses
    .filter((r) => !isSuccessStatusCode(r.statusCode))
    .filter((r) => !(promoteDefaultToSuccess && r.statusCode === STATUS_DEFAULT))
    .map((r) => {
      assertSupportedErrorStatusToken(r.statusCode);
      const schema = r.schema || getSchemaFromContent(ir, r.content, `responses/${r.statusCode}`);
      const error: EndpointError = {
        status:
          r.statusCode === STATUS_DEFAULT || isStatusRangeToken(r.statusCode)
            ? r.statusCode
            : Number(r.statusCode),
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
  promoteDefaultToSuccess: boolean,
): CastrSchema {
  // Find primary success response using centralized status-code semantics.
  // Under auto-correct, a default-only operation's `default` response is
  // promoted to the success position (see docs/DEFAULT-RESPONSE-BEHAVIOR.md).
  const success =
    responses.find((r) => isSuccessStatusCode(r.statusCode)) ??
    (promoteDefaultToSuccess ? responses.find((r) => r.statusCode === STATUS_DEFAULT) : undefined);
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
