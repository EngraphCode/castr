/**
 * Enum extraction from IR structures.
 *
 * Traverses the IR to find all enum definitions and collects them
 * into a centralized catalog.
 *
 * @module parsers/openapi/builder.enums
 */

import type {
  IRComponent,
  IREnum,
  CastrOperation,
  IRRequestBody,
  CastrResponse,
  CastrResponseComponent,
  CastrSchema,
} from '../../ir/schema.js';

const COMPONENT_TYPE_SCHEMA = 'schema' as const;
const COMPONENT_TYPE_PARAMETER = 'parameter' as const;
const COMPONENT_TYPE_RESPONSE = 'response' as const;
const COMPONENT_TYPE_REQUEST_BODY = 'requestBody' as const;

/**
 * Extract all enums from components and operations.
 * @internal
 */
export function extractEnums(
  components: IRComponent[],
  operations: CastrOperation[],
): Map<string, IREnum> {
  return new EnumExtractor().extract(components, operations);
}

class EnumExtractor {
  private enums = new Map<string, IREnum>();
  private visited = new Set<CastrSchema>();

  extract(components: IRComponent[], operations: CastrOperation[]): Map<string, IREnum> {
    this.traverseComponents(components);
    this.traverseOperations(operations);
    return this.enums;
  }

  private traverseComponents(components: IRComponent[]): void {
    for (const component of components) {
      this.visitComponent(component);
    }
  }

  private visitComponent(component: IRComponent): void {
    if (component.type === COMPONENT_TYPE_SCHEMA) {
      this.visitSchema(component.schema, component.name);
    } else if (component.type === COMPONENT_TYPE_PARAMETER) {
      this.visitSchema(component.parameter.schema, component.parameter.name);
    } else if (component.type === COMPONENT_TYPE_RESPONSE) {
      this.visitResponseComponent(component);
    } else if (component.type === COMPONENT_TYPE_REQUEST_BODY) {
      this.visitRequestBody(component.requestBody);
    }
  }

  private visitResponseComponent(component: CastrResponseComponent): void {
    if (component.response.schema) {
      this.visitSchema(component.response.schema, component.name);
    }
    this.visitResponse(component.response);
  }

  private traverseOperations(operations: CastrOperation[]): void {
    for (const operation of operations) {
      this.visitOperation(operation);
    }
  }

  private visitOperation(operation: CastrOperation): void {
    for (const param of operation.parameters) {
      this.visitSchema(param.schema, param.name);
    }
    if (operation.requestBody) {
      this.visitRequestBody(operation.requestBody);
    }
    for (const response of operation.responses) {
      this.visitResponse(response);
    }
  }

  private visitRequestBody(requestBody: IRRequestBody): void {
    for (const key of Object.keys(requestBody.content)) {
      const media = requestBody.content[key];
      if (media) {
        this.visitSchema(media.schema);
      }
    }
  }

  private visitResponse(response: CastrResponse): void {
    if (response.schema) {
      this.visitSchema(response.schema);
    }
    this.visitResponseContent(response);
    this.visitResponseHeaders(response);
  }

  private visitResponseContent(response: CastrResponse): void {
    if (response.content) {
      for (const key of Object.keys(response.content)) {
        const media = response.content[key];
        if (media) {
          this.visitSchema(media.schema);
        }
      }
    }
  }

  private visitResponseHeaders(response: CastrResponse): void {
    if (response.headers) {
      for (const key of Object.keys(response.headers)) {
        const header = response.headers[key];
        if (header) {
          this.visitSchema(header.schema);
        }
      }
    }
  }

  private visitSchema(schema: CastrSchema, nameHint?: string): void {
    if (this.visited.has(schema)) {
      return;
    }
    this.visited.add(schema);

    if (schema.enum && schema.enum.length > 0) {
      this.registerEnum(schema, nameHint);
    }

    this.traverseSchemaChildren(schema);
  }

  private registerEnum(schema: CastrSchema, nameHint?: string): void {
    const name = nameHint || `Enum_${this.enums.size + 1}`;
    const enumDef: IREnum = {
      name,
      values: schema.enum ?? [],
      schema,
    };
    if (schema.description) {
      enumDef.description = schema.description;
    }
    this.enums.set(name, enumDef);
  }

  private traverseSchemaChildren(schema: CastrSchema): void {
    this.visitSchemaProperties(schema);
    this.visitSchemaItems(schema);
    this.traverseComposition(schema);
  }

  private visitSchemaProperties(schema: CastrSchema): void {
    if (schema.properties) {
      for (const [propName, propSchema] of schema.properties.entries()) {
        this.visitSchema(propSchema, propName);
      }
    }
    if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
      this.visitSchema(schema.additionalProperties);
    }
  }

  private visitSchemaItems(schema: CastrSchema): void {
    if (schema.items) {
      if (Array.isArray(schema.items)) {
        schema.items.forEach((item: CastrSchema) => this.visitSchema(item));
      } else {
        this.visitSchema(schema.items);
      }
    }
  }

  private traverseComposition(schema: CastrSchema): void {
    if (schema.allOf) {
      schema.allOf.forEach((s: CastrSchema) => this.visitSchema(s));
    }
    if (schema.oneOf) {
      schema.oneOf.forEach((s: CastrSchema) => this.visitSchema(s));
    }
    if (schema.anyOf) {
      schema.anyOf.forEach((s: CastrSchema) => this.visitSchema(s));
    }
    if (schema.not) {
      this.visitSchema(schema.not);
    }
  }
}
