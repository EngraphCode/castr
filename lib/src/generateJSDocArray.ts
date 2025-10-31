import type { SchemaObject } from 'openapi3-ts/oas30';

type CommentValue = string | string[] | undefined;
type CommentFormatter = (value: unknown) => CommentValue;

/**
 * Adds a formatted comment to the array if the schema property exists.
 */
function addCommentIfExists(
  comments: string[],
  schema: SchemaObject,
  key: keyof SchemaObject,
  formatter: CommentFormatter,
): void {
  const value: unknown = schema[key];
  if (value === undefined) {
    return;
  }

  const result = formatter(value);
  if (Array.isArray(result)) {
    comments.push(...result);
  } else if (result) {
    comments.push(result);
  }
}

/**
 * Generates basic documentation comments (description, examples, etc.).
 */
function addBasicDocComments(comments: string[], schema: SchemaObject): void {
  addCommentIfExists(comments, schema, 'description', (value) => String(value));
  addCommentIfExists(comments, schema, 'example', (value) => `@example ${JSON.stringify(value)}`);
  addCommentIfExists(comments, schema, 'examples', (value) =>
    Array.isArray(value)
      ? value.map((ex, i) => `@example Example ${i + 1}: ${JSON.stringify(ex)}`)
      : undefined,
  );
  addCommentIfExists(comments, schema, 'deprecated', (value) => (value ? '@deprecated' : ''));
  addCommentIfExists(comments, schema, 'default', (value) => `@default ${JSON.stringify(value)}`);
  addCommentIfExists(comments, schema, 'externalDocs', (value) => {
    if (value && typeof value === 'object' && 'url' in value && typeof value.url === 'string') {
      return `@see ${value.url}`;
    }
    return undefined;
  });
}

/**
 * Generates type and format comments if enabled.
 */
function addTypeComments(comments: string[], schema: SchemaObject): void {
  addCommentIfExists(comments, schema, 'type', (value) => {
    if (typeof value === 'string') {
      return `@type {${value}}`;
    }
    if (Array.isArray(value)) {
      return `@type {${value.join('|')}}`;
    }
    return undefined;
  });
  addCommentIfExists(comments, schema, 'format', (value) =>
    typeof value === 'string' ? `@format ${value}` : undefined,
  );
}

/**
 * Generates validation constraint comments.
 */
function addValidationComments(comments: string[], schema: SchemaObject): void {
  addCommentIfExists(comments, schema, 'minimum', (value) => `@minimum ${String(value)}`);
  addCommentIfExists(comments, schema, 'maximum', (value) => `@maximum ${String(value)}`);
  addCommentIfExists(comments, schema, 'minLength', (value) => `@minLength ${String(value)}`);
  addCommentIfExists(comments, schema, 'maxLength', (value) => `@maxLength ${String(value)}`);
  addCommentIfExists(comments, schema, 'pattern', (value) => `@pattern ${String(value)}`);
  addCommentIfExists(comments, schema, 'enum', (value) =>
    Array.isArray(value) ? `@enum ${value.join(', ')}` : undefined,
  );
}

/**
 * Generates JSDoc comment array from OpenAPI schema.
 */
export default function generateJSDocArray(
  schema: SchemaObject,
  withTypesAndFormat = false,
): string[] {
  const comments: string[] = [];

  addBasicDocComments(comments, schema);
  if (withTypesAndFormat) {
    addTypeComments(comments, schema);
  }
  addValidationComments(comments, schema);

  // Add spacing after description if other comments exist
  if (comments.length > 1 && schema.description !== undefined) {
    comments.splice(1, 0, '');
  }

  return comments;
}
