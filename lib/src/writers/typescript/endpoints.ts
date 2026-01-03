import { Writers, type CodeBlockWriter, type WriterFunction } from 'ts-morph';
import type { EndpointDefinition, EndpointParameter } from '../../endpoints/definition.types.js';
import { writeZodSchema } from '../zod-writer.js';
import type { TemplateContextOptions } from '../../context/template-context.js';
import type { CastrSchemaContext, IRPropertySchemaContext } from '../../context/ir-context.js';

export function createEndpointWriter(
  endpoint: EndpointDefinition,
  options?: TemplateContextOptions,
): WriterFunction {
  // Wrap response in component context
  const responseContext: CastrSchemaContext = {
    contextType: 'component',
    name: 'Response',
    schema: endpoint.response,
    metadata: endpoint.response.metadata,
  };

  const props: Record<string, string | WriterFunction | undefined> = {
    method: `"${endpoint.method}"`,
    path: `"${endpoint.path}"`,
    requestFormat: `"${endpoint.requestFormat}"`,
    parameters: createParametersArrayWriter(endpoint, options),
    response: writeZodSchema(responseContext, options),
    errors: createErrorsArrayWriter(endpoint, options),
    responses: createResponsesObject(endpoint, options),
    request: createRequestObjectWriter(endpoint.parameters, options),
  };

  if (endpoint.alias) {
    props['alias'] = `"${endpoint.alias}"`;
  }
  if (endpoint.description) {
    props['description'] = JSON.stringify(endpoint.description);
  }

  return Writers.object(props);
}

function createParametersArrayWriter(
  endpoint: EndpointDefinition,
  options?: TemplateContextOptions,
): WriterFunction {
  return (writer: CodeBlockWriter) => {
    writer
      .write('[')
      .indent(() => {
        endpoint.parameters.forEach((param, index) => {
          // Determine context based on parameter type
          let context: CastrSchemaContext;

          if (param.type === 'Body') {
            // Body is treated as a component/property (value schema)
            context = {
              contextType: 'component',
              name: 'Body',
              schema: param.schema,
              metadata: param.schema.metadata,
            };
          } else {
            // Path, Query, Header are parameters
            context = {
              contextType: 'parameter',
              name: param.name,
              location: getParamLocation(param.type),
              schema: param.schema,
              required: param.schema.metadata.required,
            };
          }

          const props: Record<string, string | WriterFunction> = {
            name: `"${param.name}"`,
            type: `"${param.type}"`,
            schema: writeZodSchema(context, options),
          };
          if (param.description) {
            props['description'] = JSON.stringify(param.description);
          }
          Writers.object(props)(writer);
          if (index < endpoint.parameters.length - 1) {
            writer.write(',').newLine();
          }
        });
      })
      .write(']');
  };
}

function createErrorsArrayWriter(
  endpoint: EndpointDefinition,
  options?: TemplateContextOptions,
): WriterFunction {
  return (writer: CodeBlockWriter) => {
    writer
      .write('[')
      .indent(() => {
        endpoint.errors.forEach((error, index) => {
          const context: CastrSchemaContext = {
            contextType: 'component',
            name: 'Error',
            schema: error.schema,
            metadata: error.schema.metadata,
          };

          const props: Record<string, string | WriterFunction> = {
            status: typeof error.status === 'string' ? `"${error.status}"` : String(error.status),
            schema: writeZodSchema(context, options),
          };
          if (error.description) {
            props['description'] = JSON.stringify(error.description);
          }
          Writers.object(props)(writer);
          if (index < endpoint.errors.length - 1) {
            writer.write(',').newLine();
          }
        });
      })
      .write(']');
  };
}

function createResponsesObject(
  endpoint: EndpointDefinition,
  options?: TemplateContextOptions,
): WriterFunction | undefined {
  if (!endpoint.responses) {
    return undefined;
  }

  return Writers.object(
    endpoint.responses.reduce((acc, resp) => {
      const context: CastrSchemaContext = {
        contextType: 'component',
        name: 'Response',
        schema: resp.schema,
        metadata: resp.schema.metadata,
      };

      const respProps: Record<string, string | WriterFunction> = {
        schema: writeZodSchema(context, options),
      };
      if (resp.description) {
        respProps['description'] = JSON.stringify(resp.description);
      }
      return {
        ...acc,
        [resp.statusCode]: Writers.object(respProps),
      };
    }, {}),
  );
}

function createRequestObjectWriter(
  parameters: EndpointParameter[],
  options?: TemplateContextOptions,
): WriterFunction {
  const pathParams = parameters.filter((p) => p.type === 'Path');
  const queryParams = parameters.filter((p) => p.type === 'Query');
  const headers = parameters.filter((p) => p.type === 'Header');
  const body = parameters.find((p) => p.type === 'Body');

  const requestProps: Record<string, string | WriterFunction> = {};

  if (pathParams.length > 0) {
    requestProps['pathParams'] = createZodObjectWriter(pathParams, options);
  }
  if (queryParams.length > 0) {
    requestProps['queryParams'] = createZodObjectWriter(queryParams, options);
  }
  if (headers.length > 0) {
    requestProps['headers'] = createZodObjectWriter(headers, options);
  }
  if (body) {
    const context: CastrSchemaContext = {
      contextType: 'component',
      name: 'Body',
      schema: body.schema,
      metadata: body.schema.metadata,
    };
    requestProps['body'] = writeZodSchema(context, options);
  }

  return Writers.object(requestProps);
}

function createZodObjectWriter(
  params: EndpointParameter[],
  options?: TemplateContextOptions,
): WriterFunction {
  return (writer: CodeBlockWriter) => {
    writer
      .write('z.object(')
      .inlineBlock(() => {
        params.forEach((p) => {
          writer.write(`"${p.name}": `);

          const context: IRPropertySchemaContext = {
            contextType: 'property',
            name: p.name,
            schema: p.schema,
            optional: !p.schema.metadata.required,
          };

          writeZodSchema(context, options)(writer);
          writer.write(',').newLine();
        });
      })
      .write(')');
  };
}

function getParamLocation(type: string): 'path' | 'query' | 'header' {
  const lower = type.toLowerCase();
  if (lower === 'path' || lower === 'query' || lower === 'header') {
    return lower;
  }
  throw new Error(`Invalid parameter type: ${type}`);
}
