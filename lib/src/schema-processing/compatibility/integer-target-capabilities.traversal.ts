import type {
  CastrAdditionalOperation,
  CastrDocument,
  IRComponent,
  CastrOperation,
  CastrResponse,
  CastrSchema,
  IRMediaTypeEntry,
  IRRequestBody,
} from '../ir/index.js';
import { isReferenceObject } from '../../shared/openapi-types.js';
import { allOperations } from '../ir/index.js';

export type SchemaVisitor = (schema: CastrSchema, seen: Set<CastrSchema>) => void;

function visitSchemaCollection(
  schemas: Iterable<CastrSchema> | undefined,
  seen: Set<CastrSchema>,
  visitSchema: SchemaVisitor,
): void {
  if (schemas === undefined) {
    return;
  }

  for (const schema of schemas) {
    visitSchema(schema, seen);
  }
}

function visitSchemaValue(
  schema: CastrSchema | undefined,
  seen: Set<CastrSchema>,
  visitSchema: SchemaVisitor,
): void {
  if (schema === undefined) {
    return;
  }

  visitSchema(schema, seen);
}

function visitSchemaVariant(
  schema: boolean | CastrSchema | undefined,
  seen: Set<CastrSchema>,
  visitSchema: SchemaVisitor,
): void {
  if (schema === undefined || typeof schema === 'boolean') {
    return;
  }

  visitSchema(schema, seen);
}

function visitMediaTypeSchemas(
  mediaType: IRMediaTypeEntry | undefined,
  seen: Set<CastrSchema>,
  visitSchema: SchemaVisitor,
): void {
  if (mediaType === undefined || isReferenceObject(mediaType)) {
    return;
  }

  visitSchemaValue(mediaType.schema, seen, visitSchema);
  visitSchemaValue(mediaType.itemSchema, seen, visitSchema);
}

export function visitSchemaChildren(
  schema: CastrSchema,
  seen: Set<CastrSchema>,
  visitSchema: SchemaVisitor,
): void {
  visitSchemaCollection(schema.properties?.values(), seen, visitSchema);
  visitSchemaVariant(schema.additionalProperties, seen, visitSchema);

  if (Array.isArray(schema.items)) {
    visitSchemaCollection(schema.items, seen, visitSchema);
  } else {
    visitSchemaValue(schema.items, seen, visitSchema);
  }

  visitSchemaCollection(schema.prefixItems, seen, visitSchema);
  visitSchemaCollection(schema.allOf, seen, visitSchema);
  visitSchemaCollection(schema.oneOf, seen, visitSchema);
  visitSchemaCollection(schema.anyOf, seen, visitSchema);
  visitSchemaValue(schema.not, seen, visitSchema);
  visitSchemaVariant(schema.unevaluatedProperties, seen, visitSchema);
  visitSchemaVariant(schema.unevaluatedItems, seen, visitSchema);
  visitSchemaCollection(Object.values(schema.dependentSchemas ?? {}), seen, visitSchema);
}

function visitContentSchemas(
  content: Record<string, IRMediaTypeEntry> | undefined,
  seen: Set<CastrSchema>,
  visitSchema: SchemaVisitor,
): void {
  if (content === undefined) {
    return;
  }

  for (const mediaType of Object.values(content)) {
    visitMediaTypeSchemas(mediaType, seen, visitSchema);
  }
}

function visitResponseHeaders(
  headers: CastrResponse['headers'],
  seen: Set<CastrSchema>,
  visitSchema: SchemaVisitor,
): void {
  if (headers === undefined) {
    return;
  }

  for (const header of Object.values(headers)) {
    visitSchema(header.schema, seen);
    visitContentSchemas(header.content, seen, visitSchema);
  }
}

function visitRequestBody(
  requestBody: IRRequestBody | undefined,
  seen: Set<CastrSchema>,
  visitSchema: SchemaVisitor,
): void {
  if (requestBody === undefined) {
    return;
  }

  visitContentSchemas(requestBody.content, seen, visitSchema);
}

function visitResponse(
  response: CastrResponse,
  seen: Set<CastrSchema>,
  visitSchema: SchemaVisitor,
): void {
  visitSchemaValue(response.schema, seen, visitSchema);
  visitContentSchemas(response.content, seen, visitSchema);
  visitResponseHeaders(response.headers, seen, visitSchema);
}

function visitOperation(
  operation: CastrOperation | CastrAdditionalOperation,
  seen: Set<CastrSchema>,
  visitSchema: SchemaVisitor,
): void {
  for (const parameter of operation.parameters) {
    visitSchema(parameter.schema, seen);
    visitContentSchemas(parameter.content, seen, visitSchema);
  }

  visitRequestBody(operation.requestBody, seen, visitSchema);

  for (const response of operation.responses) {
    visitResponse(response, seen, visitSchema);
  }
}

export function visitComponentSchemas(
  component: IRComponent,
  seen: Set<CastrSchema>,
  visitSchema: SchemaVisitor,
): void {
  switch (component.type) {
    case 'schema':
      visitSchema(component.schema, seen);
      return;
    case 'parameter':
      visitSchema(component.parameter.schema, seen);
      visitContentSchemas(component.parameter.content, seen, visitSchema);
      return;
    case 'response':
      visitResponse(component.response, seen, visitSchema);
      return;
    case 'requestBody':
      visitRequestBody(component.requestBody, seen, visitSchema);
      return;
    case 'mediaType':
      visitMediaTypeSchemas(component.mediaType, seen, visitSchema);
      return;
    default:
      return;
  }
}

export function visitDocumentSchemas(
  document: CastrDocument,
  seen: Set<CastrSchema>,
  visitSchema: SchemaVisitor,
): void {
  for (const component of document.components) {
    visitComponentSchemas(component, seen, visitSchema);
  }

  for (const operation of allOperations(document)) {
    visitOperation(operation, seen, visitSchema);
  }
}
