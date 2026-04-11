import type {
  CastrAdditionalOperation,
  CastrDocument,
  CastrOperation,
  IRMediaTypeEntry,
  IRResponseHeader,
} from '../ir/index.js';
import { allOperations, resolveIRMediaTypeEntry } from '../ir/index.js';

type ItemSchemaCapabilityTarget = 'Endpoints' | 'MCP' | 'TypeScript';
type OperationLike = CastrOperation | CastrAdditionalOperation;
const CHAR_CODE_LOWER_A = 0x61;
const CHAR_CODE_LOWER_Z = 0x7a;
const ASCII_CASE_OFFSET = 0x20;

function createUnsupportedItemSchemaMessage(
  target: ItemSchemaCapabilityTarget,
  location: string,
): string {
  return (
    `${target} does not yet support OpenAPI 3.2 itemSchema. ` +
    'itemSchema is currently supported only on the OpenAPI parser -> IR -> OpenAPI writer path. ' +
    `Found itemSchema at ${location}.`
  );
}

function assertMediaTypeEntryHasNoItemSchema(
  document: Pick<CastrDocument, 'components'>,
  mediaType: IRMediaTypeEntry,
  target: ItemSchemaCapabilityTarget,
  location: string,
): void {
  const resolved = resolveIRMediaTypeEntry(document, mediaType, location);
  if (resolved.itemSchema !== undefined) {
    throw new Error(createUnsupportedItemSchemaMessage(target, location));
  }
}

function assertContentHasNoItemSchema(
  document: Pick<CastrDocument, 'components'>,
  content: Record<string, IRMediaTypeEntry> | undefined,
  target: ItemSchemaCapabilityTarget,
  locationPrefix: string,
): void {
  if (!content) {
    return;
  }

  for (const [mediaTypeName, mediaType] of Object.entries(content).sort(([left], [right]) =>
    left.localeCompare(right),
  )) {
    assertMediaTypeEntryHasNoItemSchema(
      document,
      mediaType,
      target,
      `${locationPrefix}/${mediaTypeName}`,
    );
  }
}

function assertHeadersHaveNoItemSchema(
  document: Pick<CastrDocument, 'components'>,
  headers: Record<string, IRResponseHeader> | undefined,
  target: ItemSchemaCapabilityTarget,
  locationPrefix: string,
): void {
  if (!headers) {
    return;
  }

  for (const [headerName, header] of Object.entries(headers).sort(([left], [right]) =>
    left.localeCompare(right),
  )) {
    assertContentHasNoItemSchema(
      document,
      header.content,
      target,
      `${locationPrefix}/headers/${headerName}`,
    );
  }
}

function toAsciiUppercase(value: string): string {
  let result = '';

  for (let index = 0; index < value.length; index++) {
    const char = value[index];
    const code = value.charCodeAt(index);
    if (code >= CHAR_CODE_LOWER_A && code <= CHAR_CODE_LOWER_Z) {
      result += String.fromCharCode(code - ASCII_CASE_OFFSET);
      continue;
    }

    result += char;
  }

  return result;
}

function getOperationLocation(operation: OperationLike): string {
  return `${toAsciiUppercase(operation.method)} ${operation.path}`;
}

export function assertOperationSupportsItemSchemaTargetCapabilities(
  document: Pick<CastrDocument, 'components'>,
  operation: OperationLike,
  target: ItemSchemaCapabilityTarget,
): void {
  const operationLocation = getOperationLocation(operation);

  for (const parameter of operation.parameters) {
    assertContentHasNoItemSchema(
      document,
      parameter.content,
      target,
      `${operationLocation} parameters/${parameter.in}/${parameter.name}`,
    );
  }

  assertContentHasNoItemSchema(
    document,
    operation.requestBody?.content,
    target,
    `${operationLocation} requestBody`,
  );

  for (const response of operation.responses) {
    const responseLocation = `${operationLocation} responses/${response.statusCode}`;
    assertContentHasNoItemSchema(document, response.content, target, responseLocation);
    assertHeadersHaveNoItemSchema(document, response.headers, target, responseLocation);
  }
}

export function assertDocumentSupportsItemSchemaTargetCapabilities(
  document: Pick<CastrDocument, 'components' | 'operations' | 'additionalOperations'>,
  target: ItemSchemaCapabilityTarget,
): void {
  for (const operation of allOperations(document)) {
    assertOperationSupportsItemSchemaTargetCapabilities(document, operation, target);
  }
}
