/**
 * Short ways to write values of the prototype's boundary half by hand.
 */

import type {
  Api,
  Boundaries,
  Body,
  Carried,
  Media,
  Operation,
  Parameter,
  Part,
  PathItem,
  Response,
  Use,
} from './boundary.js';
import type {
  DefinitionId,
  MediaRange,
  Method,
  ParameterLocation,
  Shape,
  Status,
  Step,
  TemplatePart,
} from './model.js';

export const NOTHING = new Map<string, never>();

/** The identity of a part, by where it is in the description. */
export function placed(...place: Step[]): DefinitionId {
  return { resource: { resource: 'the description' }, place };
}

export function use(to: DefinitionId): Use {
  return { edge: { target: { state: 'resolved', to } } };
}

/** A templated address: text, and `{ variable }` for each variable. */
export function address(
  ...parts: (string | { readonly variable: string })[]
): readonly TemplatePart[] {
  return parts.map((part) =>
    typeof part === 'string'
      ? { part: 'text', text: part }
      : { part: 'variable', name: part.variable },
  );
}

export function range(type: string, subtype: string): MediaRange {
  return { type, subtype, parameters: NOTHING };
}

export function operation(more: Partial<Operation> = {}): Part {
  return {
    part: 'operation',
    is: {
      tags: [],
      parameters: [],
      responses: [],
      callbacks: NOTHING,
      deprecated: false,
      extensions: NOTHING,
      ...more,
    },
  };
}

export function item(more: Partial<PathItem> = {}): Part {
  return {
    part: 'path-item',
    is: { parameters: [], operations: [], extensions: NOTHING, ...more },
  };
}

/** What carries a value by a shape, with the style its place gives where none is stated. */
export function byShape(
  shape: Shape,
  location: ParameterLocation,
  stated: Partial<Carried & { by: 'shape' }>['styled'] = undefined,
): Carried {
  const form = location === 'query' || location === 'cookie';
  return {
    by: 'shape',
    shape,
    styled: stated ?? { style: form ? 'form' : 'simple', explode: form, reserved: false },
  };
}

export function parameter(
  name: string,
  location: ParameterLocation,
  carried: Carried,
  more: Partial<Parameter> = {},
): Part {
  return {
    part: 'parameter',
    is: {
      name,
      location,
      required: location === 'path',
      deprecated: false,
      mayBeEmpty: false,
      carried,
      examples: NOTHING,
      extensions: NOTHING,
      ...more,
    },
  };
}

export function media(more: Partial<Media> = {}): Part {
  return { part: 'media', is: { examples: NOTHING, extensions: NOTHING, ...more } };
}

export function response(description: string, more: Partial<Response> = {}): Part {
  return {
    part: 'response',
    is: {
      description,
      headers: NOTHING,
      content: [],
      follows: NOTHING,
      extensions: NOTHING,
      ...more,
    },
  };
}

export function body(more: Partial<Body> = {}): Part {
  return { part: 'body', is: { required: false, content: [], extensions: NOTHING, ...more } };
}

export function described(
  api: Partial<Api>,
  parts: readonly (readonly [DefinitionId, Part])[],
): Boundaries {
  return {
    api: {
      title: 'An API',
      version: '1',
      servers: [{ address: address('/'), variables: NOTHING, extensions: NOTHING }],
      security: [],
      tags: [],
      paths: [],
      webhooks: NOTHING,
      extensions: NOTHING,
      ...api,
    },
    parts: parts.map(([id, part]) => ({ id, aliases: [], part })),
  };
}

export function on(code: number): Status {
  return { status: 'code', code };
}

export function method(name: Exclude<Method['method'], 'other'>): Method {
  return { method: name };
}
