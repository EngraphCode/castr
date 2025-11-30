import { Writers, type CodeBlockWriter, type WriterFunction } from 'ts-morph';
import type { EndpointDefinition, EndpointParameter } from '../../endpoints/definition.types.js';

import { Project } from 'ts-morph';

export function writerToString(writerFunc: (writer: CodeBlockWriter) => void): string {
  const project = new Project({ useInMemoryFileSystem: true });
  const writer = project.createWriter();
  writerFunc(writer);
  return writer.toString();
}

export function createEndpointWriter(endpoint: EndpointDefinition): WriterFunction {
  const props: Record<string, string | WriterFunction | undefined> = {
    method: `"${endpoint.method}"`,
    path: `"${endpoint.path}"`,
    requestFormat: `"${endpoint.requestFormat}"`,
    parameters: createParametersArrayString(endpoint),
    response: endpoint.response,
    errors: createErrorsArrayString(endpoint),
    responses: createResponsesObject(endpoint),
    request: createRequestObjectWriter(endpoint.parameters),
  };

  if (endpoint.alias) {
    props['alias'] = `"${endpoint.alias}"`;
  }
  if (endpoint.description) {
    props['description'] = JSON.stringify(endpoint.description);
  }

  return Writers.object(props);
}

function createParametersArrayString(endpoint: EndpointDefinition): string {
  return `[
${endpoint.parameters
  .map((param) => {
    const props: Record<string, string> = {
      name: `"${param.name}"`,
      type: `"${param.type}"`,
      schema: param.schema,
    };
    if (param.description) {
      props['description'] = JSON.stringify(param.description);
    }
    return writerToString(Writers.object(props));
  })
  .join(',\n')}
]`;
}

function createErrorsArrayString(endpoint: EndpointDefinition): string {
  return `[
${endpoint.errors
  .map((error) => {
    const props: Record<string, string> = {
      status: typeof error.status === 'string' ? `"${error.status}"` : String(error.status),
      schema: error.schema,
    };
    if (error.description) {
      props['description'] = JSON.stringify(error.description);
    }
    return writerToString(Writers.object(props));
  })
  .join(',\n')}
]`;
}

function createResponsesObject(endpoint: EndpointDefinition): WriterFunction | undefined {
  if (!endpoint.responses) {
    return undefined;
  }

  return Writers.object(
    endpoint.responses.reduce((acc, resp) => {
      const respProps: Record<string, string> = {
        schema: resp.schema,
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

function createRequestObjectWriter(parameters: EndpointParameter[]): WriterFunction {
  const pathParams = parameters.filter((p) => p.type === 'Path');
  const queryParams = parameters.filter((p) => p.type === 'Query');
  const headers = parameters.filter((p) => p.type === 'Header');
  const body = parameters.find((p) => p.type === 'Body');

  const requestProps: Record<string, string> = {};

  if (pathParams.length > 0) {
    requestProps['pathParams'] = createZodObjectString(pathParams);
  }
  if (queryParams.length > 0) {
    requestProps['queryParams'] = createZodObjectString(queryParams);
  }
  if (headers.length > 0) {
    requestProps['headers'] = createZodObjectString(headers);
  }
  if (body) {
    requestProps['body'] = body.schema;
  }

  return Writers.object(requestProps);
}

function createZodObjectString(params: EndpointParameter[]): string {
  const props = params.map((p) => `"${p.name}": ${p.schema}`).join(', ');
  return `z.object({ ${props} })`;
}
