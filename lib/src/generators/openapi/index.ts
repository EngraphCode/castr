import type {
  OpenAPIObject,
  SchemaObject,
  ComponentsObject,
  PathsObject,
  OperationObject,
  ResponseObject,
  RequestBodyObject,
  ParameterObject,
} from 'openapi3-ts/oas31';
import type {
  CastrDocument,
  CastrSchema,
  IRComponent,
  CastrOperation,
  CastrResponse,
  IRRequestBody,
  CastrParameter,
} from '../../context/ir-schema.js';

export function generateOpenAPI(ir: CastrDocument): OpenAPIObject {
  return {
    openapi: ir.openApiVersion,
    info: ir.info,
    servers: ir.servers,
    paths: generatePaths(ir.operations),
    components: generateComponents(ir.components),
  };
}

function generatePaths(operations: CastrOperation[]): PathsObject {
  const paths: PathsObject = {};

  for (const op of operations) {
    const path = op.path;
    const method = op.method;

    if (!paths[path]) {
      paths[path] = {};
    }

    const pathItem = paths[path];
    if (pathItem) {
      pathItem[method] = generateOperation(op);
    }
  }

  return paths;
}

function generateOperation(op: CastrOperation): OperationObject {
  const operation: OperationObject = {
    ...(op.operationId ? { operationId: op.operationId } : {}),
    responses: {},
  };

  assignOperationMetadata(op, operation);

  if (op.parameters && op.parameters.length > 0) {
    operation.parameters = op.parameters.map(generateParameter);
  }

  if (op.requestBody) {
    operation.requestBody = generateRequestBody(op.requestBody);
  }

  for (const response of op.responses) {
    if (operation.responses) {
      operation.responses[response.statusCode] = generateResponse(response);
    }
  }

  return operation;
}

function assignOperationMetadata(op: CastrOperation, operation: OperationObject): void {
  if (op.summary) {
    operation.summary = op.summary;
  }
  if (op.description) {
    operation.description = op.description;
  }
  if (op.deprecated) {
    operation.deprecated = op.deprecated;
  }
  if (op.tags) {
    operation.tags = op.tags;
  }
}

function generateParameter(param: CastrParameter): ParameterObject {
  const parameter: ParameterObject = {
    name: param.name,
    in: param.in,
    required: param.required,
    schema: generateSchema(param.schema),
  };

  if (param.description) {
    parameter.description = param.description;
  }
  if (param.deprecated) {
    parameter.deprecated = param.deprecated;
  }

  return parameter;
}

function generateRequestBody(body: IRRequestBody): RequestBodyObject {
  const requestBody: RequestBodyObject = {
    content: {},
  };

  if (body.required) {
    requestBody.required = body.required;
  }
  if (body.description) {
    requestBody.description = body.description;
  }

  for (const [mediaType, media] of Object.entries(body.content)) {
    requestBody.content[mediaType] = {
      schema: generateSchema(media.schema),
    };
  }

  return requestBody;
}

function generateResponse(response: CastrResponse): ResponseObject {
  const res: ResponseObject = {
    description: response.description || '',
  };

  if (response.content) {
    res.content = {};
    for (const [mediaType, media] of Object.entries(response.content)) {
      res.content[mediaType] = {
        schema: generateSchema(media.schema),
      };
    }
  }

  return res;
}

function generateComponents(components: IRComponent[]): ComponentsObject {
  const schemas: Record<string, SchemaObject> = {};

  for (const component of components) {
    if (component.type === 'schema') {
      schemas[component.name] = generateSchema(component.schema);
    }
  }

  return {
    schemas,
  };
}

function generateSchema(irSchema: CastrSchema): SchemaObject {
  if (irSchema.$ref) {
    return { $ref: irSchema.$ref };
  }

  const schema: SchemaObject = {};

  if (irSchema.type) {
    schema.type = irSchema.type;
  }

  if (irSchema.required) {
    schema.required = irSchema.required;
  }

  assignSchemaProperties(irSchema, schema);
  assignSchemaComposition(irSchema, schema);
  assignSchemaItems(irSchema, schema);

  return schema;
}

function assignSchemaProperties(irSchema: CastrSchema, schema: SchemaObject): void {
  if (irSchema.properties) {
    const props = irSchema.properties;
    schema.properties = {};
    for (const [name, propSchema] of props.entries()) {
      schema.properties[name] = generateSchema(propSchema);
    }
  }
}

function assignSchemaComposition(irSchema: CastrSchema, schema: SchemaObject): void {
  if (irSchema.allOf) {
    schema.allOf = irSchema.allOf.map(generateSchema);
  }
  if (irSchema.oneOf) {
    schema.oneOf = irSchema.oneOf.map(generateSchema);
  }
  if (irSchema.anyOf) {
    schema.anyOf = irSchema.anyOf.map(generateSchema);
  }
  if (irSchema.not) {
    schema.not = generateSchema(irSchema.not);
  }
}

function assignSchemaItems(irSchema: CastrSchema, schema: SchemaObject): void {
  if (irSchema.items) {
    if (Array.isArray(irSchema.items)) {
      // OAS 3.1 supports array of schemas for prefixItems (tuples)
      // For now, we don't handle prefixItems in this generator as it's not in the requirements explicitly
      // and adds complexity.
    } else {
      schema.items = generateSchema(irSchema.items);
    }
  }
}
