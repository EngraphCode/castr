/**
 * A prototype of the `paths` module that SPEC-C-1 names: `paths`, `operations`,
 * `components`, `webhooks` and `$defs`. It is here to find out, by compiling a client of
 * `openapi-fetch` against it, what each row of the scope-and-fidelity tables for the
 * document's structure has to say. No template writes it and nothing in `src` reads it:
 * its rows are not approved (SPEC-N-5), and section 12 allows no code that assumes them.
 *
 * It is written from the model alone. Every schema position is written by the type
 * writer that writes the exported component types, so `components["schemas"]["X"]` is
 * the type `X` and never a second reading of the schema.
 */

import { CodeBlockWriter } from 'ts-morph';

import type {
  CastrDocument,
  CastrOperation,
  CastrParameter,
  CastrResponse,
  CastrSchema,
  IRMediaTypeEntry,
} from '../../src/schema-processing/ir/index.js';
import { writeTypeDefinition } from '../../src/schema-processing/writers/typescript/type-writer/index.js';

const METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'] as const;
const LOCATIONS = ['query', 'header', 'path', 'cookie'] as const;
const NEVER = 'never';

function typeOf(schema: CastrSchema): string {
  const writer = new CodeBlockWriter();
  writeTypeDefinition(schema)(writer);
  return writer.toString();
}

function key(name: string): string {
  return JSON.stringify(name);
}

function block(members: readonly string[]): string {
  return members.length === 0 ? '{}' : `{ ${members.join('; ')} }`;
}

/** What the model cannot supply is refused here and listed in the prototype's findings. */
function schemaOfMediaType(entry: IRMediaTypeEntry, where: string): CastrSchema {
  if ('$ref' in entry) {
    throw new Error(`the prototype does not follow a media type component, at ${where}`);
  }
  if (entry.schema === undefined) {
    throw new Error(`the prototype needs a schema for a media type, at ${where}`);
  }
  return entry.schema;
}

function contentOf(content: Record<string, IRMediaTypeEntry> | undefined, where: string): string {
  const entries = Object.entries(content ?? {});
  if (entries.length === 0) {
    return `content?: ${NEVER}`;
  }
  const members = entries.map(
    ([mediaType, entry]) => `${key(mediaType)}: ${typeOf(schemaOfMediaType(entry, where))}`,
  );
  return `content: ${block(members)}`;
}

function parametersAt(parameters: readonly CastrParameter[], location: string): string {
  if (parameters.length === 0) {
    return `${location}?: ${NEVER}`;
  }
  const members = parameters.map(
    (parameter) =>
      `${key(parameter.name)}${parameter.required ? '' : '?'}: ${typeOf(parameter.schema)}`,
  );
  const optional = parameters.some((parameter) => parameter.required) ? '' : '?';
  return `${location}${optional}: ${block(members)}`;
}

function parametersOf(operation: CastrOperation): string {
  return block(
    LOCATIONS.map((location) => parametersAt(operation.parametersByLocation[location], location)),
  );
}

function requestBodyOf(operation: CastrOperation, where: string): string {
  const body = operation.requestBody;
  if (body === undefined) {
    return `requestBody?: ${NEVER}`;
  }
  return `requestBody${body.required ? '' : '?'}: ${block([contentOf(body.content, where)])}`;
}

/** An exact code is a number key; a range and `default` keep their own text. */
function statusKey(statusCode: string): string {
  return String(Number(statusCode)) === statusCode ? statusCode : key(statusCode);
}

function headersOf(response: CastrResponse): string {
  const entries = Object.entries(response.headers ?? {});
  if (entries.length === 0) {
    return `headers?: ${NEVER}`;
  }
  const members = entries.map(
    ([name, header]) =>
      `${key(name)}${header.required === true ? '' : '?'}: ${typeOf(header.schema)}`,
  );
  return `headers: ${block(members)}`;
}

function responsesOf(operation: CastrOperation, where: string): string {
  return block(
    operation.responses.map(
      (response) =>
        `${statusKey(response.statusCode)}: ${block([
          headersOf(response),
          contentOf(response.content, `${where} ${response.statusCode}`),
        ])}`,
    ),
  );
}

function operationOf(operation: CastrOperation): string {
  const where = `${operation.method} ${operation.path}`;
  return block([
    `parameters: ${parametersOf(operation)}`,
    requestBodyOf(operation, where),
    `responses: ${responsesOf(operation, where)}`,
  ]);
}

function pathItemOf(operations: readonly CastrOperation[]): string {
  const methods = METHODS.map((method) => {
    const operation = operations.find((candidate) => candidate.method === method);
    if (operation === undefined) {
      return `${method}?: ${NEVER}`;
    }
    return operation.operationId === undefined
      ? `${method}: ${operationOf(operation)}`
      : `${method}: operations[${key(operation.operationId)}]`;
  });
  const noParameters = block(LOCATIONS.map((location) => `${location}?: ${NEVER}`));
  return block([`parameters: ${noParameters}`, ...methods]);
}

/** The text of the five exported types, to stand in a module that exports the components. */
export function writePathsModule(document: CastrDocument): string {
  const byPath = new Map<string, CastrOperation[]>();
  for (const operation of document.operations) {
    byPath.set(operation.path, [...(byPath.get(operation.path) ?? []), operation]);
  }
  const named = document.operations.filter((operation) => operation.operationId !== undefined);
  const schemas = document.components
    .filter((component) => component.type === 'schema')
    .map((component) => {
      // Written as a reference, so that it is the exported type of that name and no other.
      const reference: CastrSchema = {
        $ref: `#/components/schemas/${component.name}`,
        metadata: component.schema.metadata,
      };
      return `${key(component.name)}: ${typeOf(reference)}`;
    });
  const pathItems = [...byPath].map(
    ([path, operations]) => `${key(path)}: ${pathItemOf(operations)}`,
  );
  const namedOperations = named.map(
    (operation) => `${key(operation.operationId ?? '')}: ${operationOf(operation)}`,
  );
  const components = block([`schemas: ${block(schemas)}`]);
  return [
    `export interface paths ${block(pathItems)}`,
    `export interface operations ${block(namedOperations)}`,
    `export interface components ${components}`,
    `export type webhooks = Record<string, ${NEVER}>;`,
    `export type $defs = Record<string, ${NEVER}>;`,
    '',
  ].join('\n');
}
