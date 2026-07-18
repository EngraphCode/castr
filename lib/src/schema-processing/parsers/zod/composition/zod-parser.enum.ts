/**
 * Zod Enum Parser
 *
 * Handles parsing of z.enum([...]) literal enums and z.nativeEnum(Enum)
 * static resolution of TypeScript enum declarations.
 */

import type { CastrSchema } from '../../../ir/index.js';
import { Node, type EnumDeclaration } from 'ts-morph';
import {
  describeNodeLocation,
  describeZodExpression,
  extractLiteralValue,
  throwUnsupportedMemberSchema,
} from '../ast/zod-ast.js';
import {
  createDefaultMetadata,
  deriveHomogeneousLiteralType,
} from '../modifiers/zod-parser.defaults.js';
import { ZOD_METHOD_NATIVE_ENUM, ZOD_SCHEMA_TYPE_STRING } from '../zod-constants.js';

/**
 * Parse z.enum(['a', 'b'])
 *
 * Every member must be a string literal: z.enum() only accepts strings,
 * so a non-string member would otherwise produce an IR whose `type` and
 * `enum` contradict each other.
 */
export function parseEnum(args: Node[], baseMethod: string): CastrSchema | undefined {
  if (baseMethod === ZOD_METHOD_NATIVE_ENUM) {
    return parseNativeEnum(args);
  }

  if (args.length === 0) {
    return undefined;
  }
  const itemsArg = args[0];

  if (!itemsArg || !Node.isArrayLiteralExpression(itemsArg)) {
    return undefined;
  }

  const enumValues: unknown[] = [];
  for (const itemNode of itemsArg.getElements()) {
    const val = extractLiteralValue(itemNode);
    if (typeof val !== 'string') {
      throwUnsupportedMemberSchema('z.enum member', itemNode);
    }
    enumValues.push(val);
  }

  return {
    type: ZOD_SCHEMA_TYPE_STRING,
    enum: enumValues,
    metadata: createDefaultMetadata(),
  };
}

/**
 * Resolve a z.nativeEnum() argument to the TypeScript enum declaration
 * it references, following alias symbols (imports) when present.
 * Returns undefined when the symbol does not resolve to an enum
 * declaration available for static analysis.
 *
 * @internal
 */
function resolveEnumDeclaration(argNode: Node): EnumDeclaration | undefined {
  const symbol = argNode.getSymbol();
  if (!symbol) {
    return undefined;
  }
  const declarations = [
    ...symbol.getDeclarations(),
    ...(symbol.getAliasedSymbol()?.getDeclarations() ?? []),
  ];
  return declarations.find(Node.isEnumDeclaration);
}

/**
 * Extract the statically computed values of an enum declaration's
 * members (string and numeric values per TypeScript enum semantics,
 * including auto-increment). Fails fast on members whose values are
 * not statically computable.
 *
 * @internal
 */
function extractEnumMemberValues(enumDecl: EnumDeclaration): (string | number)[] {
  const enumValues: (string | number)[] = [];
  for (const member of enumDecl.getMembers()) {
    const value = member.getValue();
    if (value === undefined) {
      throw new Error(
        `Unsupported z.nativeEnum() member "${member.getName()}"` +
          `${describeNodeLocation(member)}: its value is not statically computable. ` +
          'The Zod parser fails fast on values it cannot capture statically ' +
          'instead of silently dropping them.',
      );
    }
    enumValues.push(value);
  }
  return enumValues;
}

/**
 * Parse z.nativeEnum(Enum) by statically resolving the enum symbol's
 * members.
 *
 * Fails fast only on genuinely unresolvable arguments: symbols that do
 * not resolve to an enum declaration, and members whose values are not
 * statically computable.
 *
 * @internal
 */
function parseNativeEnum(args: Node[]): CastrSchema {
  const argNode = args[0];
  if (!argNode) {
    throw new Error(
      'z.nativeEnum() requires an enum argument. The Zod parser fails fast on ' +
        'unrecognised constructs instead of silently dropping them.',
    );
  }

  const enumDecl = resolveEnumDeclaration(argNode);
  if (!enumDecl) {
    throw new Error(
      `Unsupported z.nativeEnum() argument "${describeZodExpression(argNode)}"` +
        `${describeNodeLocation(argNode)}: it does not resolve to a statically ` +
        'analysable TypeScript enum declaration. Only enum declarations whose ' +
        'members are statically computable can be captured.',
    );
  }

  const enumValues = extractEnumMemberValues(enumDecl);
  if (enumValues.length === 0) {
    throw new Error(
      `Unsupported z.nativeEnum() argument "${describeZodExpression(argNode)}"` +
        `${describeNodeLocation(argNode)}: the enum has no members, so the schema ` +
        'would match no values.',
    );
  }

  const type = deriveHomogeneousLiteralType(enumValues);
  return {
    ...(type === undefined ? {} : { type }),
    enum: enumValues,
    metadata: createDefaultMetadata(),
  };
}
