/**
 * Zod AST Static Capture — literal extraction and fail-fast reporting.
 *
 * Semantic extraction of statically known values from AST nodes —
 * scalar literals (including signed numerics), regex literal bodies,
 * and JSON-like array/object literals — together with the fail-fast
 * error helpers raised when a construct or argument cannot be captured
 * statically (finding C5: lossless or loud, never silent).
 *
 * This module is a dependency leaf: parser layers (modifiers,
 * composition, types) can use it without import cycles.
 */

import { Node, SyntaxKind } from 'ts-morph';
import type { UnknownRecord } from '../../../../shared/type-utils/types.js';

/** Symbol name for the global `undefined` identifier, used for semantic comparison. */
const GLOBAL_UNDEFINED_SYMBOL_NAME = 'undefined';

/**
 * A single method call in a Zod chain.
 */
export interface ZodMethodCall {
  /** Method name (e.g., 'min', 'optional', 'email') */
  name: string;
  /** Raw argument nodes */
  argNodes: Node[];
  /** Parsed argument values (for simple literals) */
  args: unknown[];
}

/**
 * Try to extract a numeric or string literal value.
 * Handles signed numeric literals (`-100`, `+10`), which the AST wraps
 * in a prefix-unary expression around the numeric literal.
 * @internal
 */
function tryExtractTypedLiteral(node: Node): { value: unknown; found: boolean } {
  if (Node.isStringLiteral(node)) {
    return { value: node.getLiteralValue(), found: true };
  }
  if (Node.isNumericLiteral(node)) {
    return { value: node.getLiteralValue(), found: true };
  }
  return tryExtractSignedNumericLiteral(node);
}

/**
 * Try to extract a signed numeric literal (`-100`, `+10`).
 * @internal
 */
function tryExtractSignedNumericLiteral(node: Node): { value: unknown; found: boolean } {
  if (!Node.isPrefixUnaryExpression(node)) {
    return { value: undefined, found: false };
  }
  const operand = node.getOperand();
  if (!Node.isNumericLiteral(operand)) {
    return { value: undefined, found: false };
  }
  const operator = node.getOperatorToken();
  if (operator === SyntaxKind.MinusToken) {
    return { value: -operand.getLiteralValue(), found: true };
  }
  if (operator === SyntaxKind.PlusToken) {
    return { value: operand.getLiteralValue(), found: true };
  }
  return { value: undefined, found: false };
}

/**
 * Try to extract a boolean, null, or undefined literal value.
 * @internal
 */
function tryExtractSpecialLiteral(node: Node): { value: unknown; found: boolean } {
  if (Node.isTrueLiteral(node)) {
    return { value: true, found: true };
  }
  if (Node.isFalseLiteral(node)) {
    return { value: false, found: true };
  }
  if (Node.isNullLiteral(node)) {
    return { value: null, found: true };
  }
  if (Node.isIdentifier(node) && node.getSymbol()?.getName() === GLOBAL_UNDEFINED_SYMBOL_NAME) {
    return { value: undefined, found: true };
  }
  return { value: undefined, found: false };
}

/**
 * Try to extract a simple literal value (string, number, boolean, null, undefined).
 * @internal
 */
function tryExtractSimpleLiteral(node: Node): { value: unknown; found: boolean } {
  const typed = tryExtractTypedLiteral(node);
  if (typed.found) {
    return typed;
  }
  return tryExtractSpecialLiteral(node);
}

/**
 * Extract a regex literal body from a RegularExpressionLiteral node.
 *
 * Uses `getLiteralValue()` which returns the parsed `RegExp` object,
 * then reads `.source` to get the pattern body — a semantic API
 * that avoids manual string parsing of the `/body/flags` format.
 *
 * @internal
 */
function extractRegexBody(node: Node): string | undefined {
  if (Node.isRegularExpressionLiteral(node)) {
    const regex: RegExp = node.getLiteralValue();
    return regex.source;
  }
  return undefined;
}

/**
 * Extract a literal value from an AST node.
 * @param node - AST node
 * @returns Extracted value or undefined
 * @internal
 */
export function extractLiteralValue(node: Node): unknown {
  const simple = tryExtractSimpleLiteral(node);
  if (simple.found) {
    return simple.value;
  }
  return extractRegexBody(node);
}

/**
 * Extract a statically known JSON-like value from an AST node: scalar
 * literals, array literals of extractable values, and object literals
 * whose property values are extractable.
 *
 * Returns undefined when any part of the value cannot be extracted
 * statically, so callers can fail fast instead of capturing a corrupted
 * partial value.
 *
 * @internal
 */
export function extractStaticJsonValue(node: Node): unknown {
  if (Node.isArrayLiteralExpression(node)) {
    const values: unknown[] = [];
    for (const element of node.getElements()) {
      const value = extractStaticJsonValue(element);
      if (value === undefined) {
        return undefined;
      }
      values.push(value);
    }
    return values;
  }
  if (Node.isObjectLiteralExpression(node)) {
    return extractStaticJsonObject(node);
  }
  return extractLiteralValue(node);
}

/**
 * Extract an object literal whose property values are all statically
 * extractable. Returns undefined on shorthand/spread/computed properties
 * or any unextractable value.
 *
 * @internal
 */
function extractStaticJsonObject(node: Node): UnknownRecord | undefined {
  if (!Node.isObjectLiteralExpression(node)) {
    return undefined;
  }
  const result: UnknownRecord = {};
  for (const prop of node.getProperties()) {
    if (!Node.isPropertyAssignment(prop)) {
      return undefined;
    }
    const name = prop.getName();
    const initializer = prop.getInitializer();
    if (!name || !initializer) {
      return undefined;
    }
    const value = extractStaticJsonValue(initializer);
    if (value === undefined) {
      return undefined;
    }
    result[name] = value;
  }
  return result;
}

// ============================================================================
// Fail-fast reporting
// ============================================================================

const MAX_EXPRESSION_DESCRIPTION_DEPTH = 6;

/**
 * Format a node's 1-indexed source position for error messages.
 * Returns an empty string when no node is available.
 *
 * @internal
 */
export function describeNodeLocation(node: Node | undefined): string {
  if (!node) {
    return '';
  }
  const { line, column } = node.getSourceFile().getLineAndColumnAtPos(node.getStart());
  return ` at line ${line}, column ${column}`;
}

/**
 * Describe an expression for error messages using semantic APIs only
 * (ADR-026): symbol names for identifiers, property names for member
 * accesses, and syntax-kind names as the fallback.
 *
 * @internal
 */
export function describeZodExpression(node: Node, depth = 0): string {
  if (depth > MAX_EXPRESSION_DESCRIPTION_DEPTH) {
    return node.getKindName();
  }
  if (Node.isIdentifier(node)) {
    return node.getSymbol()?.getName() ?? node.getKindName();
  }
  if (Node.isCallExpression(node)) {
    return `${describeZodExpression(node.getExpression(), depth + 1)}()`;
  }
  if (Node.isPropertyAccessExpression(node)) {
    return `${describeZodExpression(node.getExpression(), depth + 1)}.${node.getName()}`;
  }
  return node.getKindName();
}

/**
 * Fail fast on a member schema the parser cannot represent.
 *
 * @param memberContext - Human-readable slot description, e.g. "z.union member"
 * @param memberNode - The AST node of the unrecognised member expression
 *
 * @internal
 */
export function throwUnsupportedMemberSchema(memberContext: string, memberNode: Node): never {
  throw new Error(
    `Unsupported ${memberContext} "${describeZodExpression(memberNode)}"` +
      `${describeNodeLocation(memberNode)}. ` +
      'The Zod parser fails fast on unrecognised constructs instead of silently dropping them.',
  );
}

/**
 * Fail fast on a recognised chained method whose argument cannot be
 * captured statically (finding: name-only whitelisting let unextractable
 * arguments no-op silently).
 *
 * @param methodName - The chained method name, e.g. "min"
 * @param expected - Human-readable expectation, e.g. "a numeric literal"
 * @param locationNode - Node used for the source position in the message
 *
 * @internal
 */
export function throwUnsupportedMethodArgument(
  methodName: string,
  expected: string,
  locationNode: Node | undefined,
): never {
  throw new Error(
    `Unsupported .${methodName}(...) argument${describeNodeLocation(locationNode)}: ` +
      `expected ${expected}. The Zod parser fails fast on arguments it cannot capture ` +
      'statically instead of silently dropping them.',
  );
}

/**
 * Require a numeric literal first argument on a recognised constraint
 * method; fails fast otherwise so the constraint can never no-op.
 * @internal
 */
export function requireNumericArgument(method: ZodMethodCall): number {
  const arg = method.args[0];
  if (typeof arg !== 'number') {
    throwUnsupportedMethodArgument(method.name, 'a numeric literal', method.argNodes[0]);
  }
  return arg;
}

/**
 * Require a string-literal first argument on a recognised pattern method;
 * fails fast otherwise so the pattern can never no-op.
 * @internal
 */
export function requireStringArgument(method: ZodMethodCall): string {
  const arg = method.args[0];
  if (typeof arg !== 'string') {
    throwUnsupportedMethodArgument(
      method.name,
      'a string or regular-expression literal',
      method.argNodes[0],
    );
  }
  return arg;
}
