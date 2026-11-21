import {
  getCombinedModifierFlags,
  getJSDocCommentsAndTags,
  getTextOfJSDocComment,
  isFunctionDeclaration,
  isJSDoc,
  isVariableDeclaration,
  ModifierFlags,
  SignatureKind,
  SymbolFlags,
  TypeFlags,
  type Declaration,
  type Program,
  type SourceFile,
  type Symbol as TsSymbol,
  type Type,
  type TypeChecker,
  type TypeReference,
} from 'typescript';

import { canonical, type Projection } from './projection.js';
import type { ConvertedStructure } from './structure-verdict.js';
import { compiled } from './typescript-type.js';

type Fields = Record<string, Projection>;

/**
 * The declarations of a symbol that declare a type or a member of one. A module may
 * export a type and a value under one name, and what is written beside the value is not
 * the type's.
 */
function typeDeclarations(symbol: TsSymbol): readonly Declaration[] {
  return (symbol.declarations ?? []).filter(
    (declaration) => !isVariableDeclaration(declaration) && !isFunctionDeclaration(declaration),
  );
}

/**
 * What is written beside a declaration: its documentation comment and its tags. A
 * description and a deprecation are carried there and nowhere in the type itself. Every
 * tag is kept, in the order written, since two may have one name.
 */
function documented(symbol: TsSymbol): Fields {
  const comments: string[] = [];
  const tags: Projection[] = [];
  for (const node of typeDeclarations(symbol).flatMap((found) => getJSDocCommentsAndTags(found))) {
    if (!isJSDoc(node)) {
      continue;
    }
    const comment = getTextOfJSDocComment(node.comment);
    if (comment !== undefined && comment !== '') {
      comments.push(comment);
    }
    for (const tag of node.tags ?? []) {
      tags.push({ tag: tag.tagName.text, text: getTextOfJSDocComment(tag.comment) ?? '' });
    }
  }
  const fields: Fields = {};
  if (comments.length > 0) {
    fields['comment'] = comments.join('\n');
  }
  if (tags.length > 0) {
    fields['tags'] = tags;
  }
  return fields;
}

function isReadonly(symbol: TsSymbol): boolean {
  return (symbol.declarations ?? []).some(
    (declaration) => (getCombinedModifierFlags(declaration) & ModifierFlags.Readonly) !== 0,
  );
}

/** An array or a tuple is a reference to a generic type, and its elements its arguments. */
function isReference(type: Type): type is TypeReference {
  return 'target' in type;
}

function literalOf(type: Type, checker: TypeChecker): Projection | undefined {
  if (type.isStringLiteral() || type.isNumberLiteral()) {
    return { literal: type.value };
  }
  if ((type.flags & TypeFlags.BooleanLiteral) !== 0) {
    return { literal: checker.typeToString(type) === 'true' };
  }
  return undefined;
}

/**
 * How deep a type is read. A generic type that grows each time it contains itself is
 * never met twice, so it is cut off here; no type a document gives rise to is this deep.
 */
const DEEPEST = 40;

function byText(left: Projection, right: Projection): number {
  return canonical(left).localeCompare(canonical(right));
}

function isReadonlyTuple(target: Type): boolean {
  return 'readonly' in target && target.readonly === true;
}

/**
 * How each element of a tuple stands, as the compiler numbers it: required, optional,
 * or the rest. The elements' types alone do not say.
 */
function elementKinds(target: Type): readonly number[] {
  const kinds: unknown = 'elementFlags' in target ? target.elementFlags : [];
  return Array.isArray(kinds) ? kinds.filter((kind) => typeof kind === 'number') : [];
}

/**
 * A resolved type as a projection. The type is read from the checker and never from how
 * it is written: an alias and an interface of one type read the same, and a union reads
 * the same whatever order its members were written in. A type met again inside itself
 * is not entered twice.
 */
function projectionOfType(
  type: Type,
  checker: TypeChecker,
  entered: ReadonlySet<Type>,
): Projection {
  const literal = literalOf(type, checker);
  if (literal !== undefined) {
    return literal;
  }
  if (entered.has(type)) {
    return { again: checker.typeToString(type) };
  }
  if (entered.size >= DEEPEST) {
    return { deeper: true };
  }
  const inside = new Set([...entered, type]);
  const inner = (member: Type): Projection => projectionOfType(member, checker, inside);
  if (type.isUnion()) {
    return { anyOf: type.types.map(inner).sort(byText) };
  }
  if (type.isIntersection()) {
    return { allOf: type.types.map(inner) };
  }
  if (isReference(type) && checker.isTupleType(type)) {
    const kind = isReadonlyTuple(type.target) ? 'readonly tuple' : 'tuple';
    return {
      [kind]: checker.getTypeArguments(type).map(inner),
      elements: elementKinds(type.target),
    };
  }
  if (isReference(type) && checker.isArrayType(type)) {
    const kind = type.target.symbol.name === 'ReadonlyArray' ? 'readonly array' : 'array';
    return { [kind]: checker.getTypeArguments(type).map(inner) };
  }
  if ((type.flags & TypeFlags.Object) === 0) {
    return { keyword: checker.typeToString(type) };
  }
  return projectionOfObject(type, checker, inner);
}

function projectionOfObject(
  type: Type,
  checker: TypeChecker,
  inner: (member: Type) => Projection,
): Projection {
  // Built from entries, so that a property named as one every object has, `__proto__`
  // among them, is held as any other.
  const properties: Projection = Object.fromEntries(
    checker.getPropertiesOfType(type).map((property): [string, Projection] => [
      property.name,
      {
        ...documented(property),
        optional: (property.flags & SymbolFlags.Optional) !== 0,
        readonly: isReadonly(property),
        type: inner(checker.getTypeOfSymbol(property)),
      },
    ]),
  );
  const object: Fields = { properties };
  const indexed = checker.getIndexInfosOfType(type).map((info) => ({
    key: inner(info.keyType),
    type: inner(info.type),
  }));
  if (indexed.length > 0) {
    object['indexed'] = indexed;
  }
  // A function type is read as the compiler writes its signatures: what it takes and
  // gives is told apart, and no more is asked of it.
  const signatures = [SignatureKind.Call, SignatureKind.Construct].flatMap((kind) =>
    checker.getSignaturesOfType(type, kind).map((found) => checker.signatureToString(found)),
  );
  if (signatures.length > 0) {
    object['signatures'] = signatures;
  }
  return object;
}

/**
 * The types a module exports, each as the symbol that declares it: a type exported
 * after it is declared is followed to its declaration.
 */
function exportedTypes(
  program: Program,
  source: SourceFile,
): readonly (readonly [string, TsSymbol])[] {
  const checker = program.getTypeChecker();
  const moduleSymbol = checker.getSymbolAtLocation(source);
  if (moduleSymbol === undefined) {
    return [];
  }
  return checker
    .getExportsOfModule(moduleSymbol)
    .map(
      (symbol) =>
        [
          symbol.name,
          (symbol.flags & SymbolFlags.Alias) === 0 ? symbol : checker.getAliasedSymbol(symbol),
        ] as const,
    )
    .filter(([, symbol]) => (symbol.flags & SymbolFlags.Type) !== 0);
}

/**
 * Every type the generated module exports, as a projection: each under the name it is
 * exported by, with its documentation and the type the compiler resolves it to. A value
 * the module exports is not read, whatever type it has.
 */
export function typesIn(content: string): ConvertedStructure {
  const { program, generated, broken } = compiled(content);
  if (broken !== undefined) {
    return { kind: 'output unusable', reason: `does not compile: ${broken}` };
  }
  const checker = program.getTypeChecker();
  // A module that exports no type is still a set of types, with nothing in it: a
  // construct that adds the first type is then seen as a difference.
  const projection: Projection = Object.fromEntries(
    exportedTypes(program, generated).map(([name, symbol]): [string, Projection] => [
      name,
      {
        ...documented(symbol),
        type: projectionOfType(checker.getDeclaredTypeOfSymbol(symbol), checker, new Set()),
      },
    ]),
  );
  return { kind: 'held', projection };
}
