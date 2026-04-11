/**
 * Enum extraction from IR structures.
 *
 * Traverses the IR to find all enum definitions and collects them
 * into a centralized catalog.
 *
 * @module parsers/openapi/builder.enums
 */

import type {
  CastrAdditionalOperation,
  CastrParameter,
  CastrSchema,
  IREnum,
  IRComponent,
  CastrResponseComponent,
  CastrOperation,
  IRRequestBody,
  CastrResponse,
  IRMediaTypeEntry,
} from '../../../ir/index.js';
import { isReferenceObject } from '../../../../shared/openapi-types.js';

const COMPONENT_TYPE_SCHEMA = 'schema';
const COMPONENT_TYPE_PARAMETER = 'parameter';
const COMPONENT_TYPE_RESPONSE = 'response';
const COMPONENT_TYPE_REQUEST_BODY = 'requestBody';
const COMPONENT_TYPE_MEDIA_TYPE = 'mediaType';

/**
 * Extract all enums from components and operations.
 * @internal
 */
export function extractEnums(
  components: IRComponent[],
  operations: (CastrOperation | CastrAdditionalOperation)[],
): Map<string, IREnum> {
  return new EnumExtractor().extract(components, operations);
}

class EnumExtractor {
  private enums = new Map<string, IREnum>();
  private visited = new Set<CastrSchema>();

  extract(
    components: IRComponent[],
    operations: (CastrOperation | CastrAdditionalOperation)[],
  ): Map<string, IREnum> {
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
      this.visitParameter(component.parameter);
    } else if (component.type === COMPONENT_TYPE_RESPONSE) {
      this.visitResponseComponent(component);
    } else if (component.type === COMPONENT_TYPE_REQUEST_BODY) {
      this.visitRequestBody(component.requestBody);
    } else if (component.type === COMPONENT_TYPE_MEDIA_TYPE) {
      this.visitMediaTypeEntry(component.mediaType, component.name);
    }
  }

  private visitResponseComponent(component: CastrResponseComponent): void {
    this.visitOptionalSchema(component.response.schema, component.name);
    this.visitResponse(component.response);
  }

  private traverseOperations(operations: (CastrOperation | CastrAdditionalOperation)[]): void {
    for (const operation of operations) {
      this.visitOperation(operation);
    }
  }

  private visitOperation(operation: CastrOperation | CastrAdditionalOperation): void {
    for (const param of operation.parameters) {
      this.visitParameter(param);
    }
    if (operation.requestBody) {
      this.visitRequestBody(operation.requestBody);
    }
    for (const response of operation.responses) {
      this.visitResponse(response);
    }
  }

  private visitRequestBody(requestBody: IRRequestBody): void {
    this.visitMediaTypeEntries(requestBody.content);
  }

  private visitParameter(parameter: CastrParameter): void {
    this.visitSchema(parameter.schema, parameter.name);
    this.visitMediaTypeEntries(parameter.content, parameter.name);
  }

  private visitResponse(response: CastrResponse): void {
    this.visitOptionalSchema(response.schema);
    this.visitMediaTypeEntries(response.content);
    this.visitResponseHeaders(response);
  }

  private visitOptionalSchema(schema: CastrSchema | undefined, nameHint?: string): void {
    if (schema === undefined) {
      return;
    }

    this.visitSchema(schema, nameHint);
  }

  private visitMediaTypeEntries(
    content: Record<string, IRMediaTypeEntry> | undefined,
    nameHint?: string,
  ): void {
    if (content === undefined) {
      return;
    }

    for (const mediaType of Object.values(content)) {
      this.visitMediaTypeEntry(mediaType, nameHint);
    }
  }

  private visitMediaTypeEntry(mediaType: IRMediaTypeEntry | undefined, nameHint?: string): void {
    if (mediaType === undefined || isReferenceObject(mediaType)) {
      return;
    }

    this.visitOptionalSchema(mediaType.schema, nameHint);
    this.visitOptionalSchema(mediaType.itemSchema, nameHint);
  }

  private visitResponseHeaders(response: CastrResponse): void {
    if (response.headers) {
      for (const header of Object.values(response.headers)) {
        this.visitSchema(header.schema);
        this.visitMediaTypeEntries(header.content);
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
