/**
 * What a writer reads from the boundary half that no one part states by itself.
 *
 * A description says some things once for many places: a path's parameters for each of
 * its operations, an API's servers and security for every operation that names none. A
 * writer needs the answer at one boundary. These functions give it from the model alone,
 * with no fact about the format the model was read from.
 */

import { isDeepStrictEqual } from 'node:util';

import type {
  Boundaries,
  Operation,
  Parameter,
  Part,
  PathItem,
  Security,
  Server,
  Use,
} from './boundary.js';
import type { DefinitionId, Method, TemplatePart } from './model.js';

/** One operation at one path: where a request and its responses cross. */
export interface Boundary {
  readonly path: readonly TemplatePart[];
  readonly method: Method;
  readonly item: DefinitionId;
  readonly operation: DefinitionId;
}

function targetOf(use: Use): DefinitionId {
  if (use.edge.target.state !== 'resolved') {
    throw new Error('a part is used through a reference with no one target');
  }
  return use.edge.target.to;
}

function partAt(model: Boundaries, id: DefinitionId): Part {
  const found = model.parts.find((one) => isDeepStrictEqual(one.id, id));
  if (found === undefined) {
    throw new Error(`no part at ${JSON.stringify(id)}`);
  }
  return found.part;
}

function itemAt(model: Boundaries, id: DefinitionId): PathItem {
  const part = partAt(model, id);
  if (part.part !== 'path-item') {
    throw new Error(`a ${part.part} stands where what is said of a path was looked for`);
  }
  return part.is;
}

function operationAt(model: Boundaries, id: DefinitionId): Operation {
  const part = partAt(model, id);
  if (part.part !== 'operation') {
    throw new Error(`a ${part.part} stands where an operation was looked for`);
  }
  return part.is;
}

function parameterAt(model: Boundaries, id: DefinitionId): Parameter {
  const part = partAt(model, id);
  if (part.part !== 'parameter') {
    throw new Error(`a ${part.part} stands where a parameter was looked for`);
  }
  return part.is;
}

/**
 * The boundaries of an API: one for each operation of each path's item. One item used at
 * two paths gives two boundaries with one operation; a path whose item has no operation
 * gives none.
 */
export function boundariesOf(model: Boundaries): readonly Boundary[] {
  return model.api.paths.flatMap(({ path, item }) => {
    const at = targetOf(item);
    return itemAt(model, at).operations.map(({ method, operation }) => ({
      path,
      method,
      item: at,
      operation: targetOf(operation),
    }));
  });
}

/**
 * The parameters in force at a boundary: those of the path's item, each replaced by the
 * operation's parameter of the same name and location where there is one, then the rest
 * of the operation's.
 */
export function parametersInForce(model: Boundaries, boundary: Boundary): readonly Parameter[] {
  const read = (uses: readonly Use[]): Parameter[] =>
    uses.map((use) => parameterAt(model, targetOf(use)));
  const own = read(operationAt(model, boundary.operation).parameters);
  const same = (a: Parameter, b: Parameter): boolean =>
    a.name === b.name && a.location === b.location;
  const inherited = read(itemAt(model, boundary.item).parameters).filter(
    (one) => !own.some((other) => same(one, other)),
  );
  return [...inherited, ...own];
}

/** The security in force at a boundary: the operation's where it states any, else the API's. */
export function securityInForce(model: Boundaries, boundary: Boundary): Security {
  return operationAt(model, boundary.operation).security ?? model.api.security;
}

/** The servers in force at a boundary: the operation's, else its path's, else the API's. */
export function serversInForce(model: Boundaries, boundary: Boundary): readonly Server[] {
  return (
    operationAt(model, boundary.operation).servers ??
    itemAt(model, boundary.item).servers ??
    model.api.servers
  );
}
