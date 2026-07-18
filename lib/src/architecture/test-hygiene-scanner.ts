/**
 * Test Hygiene Scanner
 *
 * Pure content predicates used by `test-hygiene.arch.test.ts` to detect the
 * hygiene violations `testing-strategy.md` bans from the primary `pnpm test`
 * gate. Each predicate takes file content as a string and reports whether the
 * forbidden construct is present — no filesystem access, no global state.
 *
 * Detection walks the TypeScript AST (via the `typescript` package the repo
 * already depends on) instead of scanning text. A substring scan under-matches
 * the syntax space (side-effect imports, compound assignment operators) and
 * over-matches quoted data (forbidden patterns inside string literals or
 * comments); parsing eliminates both failure classes at once.
 *
 * @see test-hygiene.arch.test.ts for the gate that applies these predicates
 *   and the shrink-only baselines recording the known violations.
 */

import {
  createSourceFile,
  forEachChild,
  isAsExpression,
  isBinaryExpression,
  isCallExpression,
  isComputedPropertyName,
  isDeleteExpression,
  isElementAccessExpression,
  isExportDeclaration,
  isExternalModuleReference,
  isIdentifier,
  isImportDeclaration,
  isImportEqualsDeclaration,
  isNonNullExpression,
  isObjectBindingPattern,
  isParenthesizedExpression,
  isPostfixUnaryExpression,
  isPrefixUnaryExpression,
  isPropertyAccessExpression,
  isSatisfiesExpression,
  isStringLiteralLike,
  isTypeAssertionExpression,
  isVariableDeclaration,
  ScriptTarget,
  SyntaxKind,
} from 'typescript';
import type { BindingElement, CallExpression, Expression, Node, SourceFile } from 'typescript';

/**
 * Filesystem modules that gated tests must not import.
 */
const FS_MODULE_SPECIFIERS: ReadonlySet<string> = new Set([
  'fs',
  'fs/promises',
  'node:fs',
  'node:fs/promises',
  'fs-extra',
]);

/**
 * `vi.*` helpers that mutate the shared module registry.
 */
const MODULE_REGISTRY_MOCK_HELPERS: ReadonlySet<string> = new Set([
  'mock',
  'doMock',
  'unmock',
  'doUnmock',
]);

/**
 * Global roots that `vi.spyOn` must not target.
 */
const GLOBAL_SPY_ROOTS: ReadonlySet<string> = new Set(['console', 'globalThis', 'process']);

/**
 * Parse file content with the error-tolerant TypeScript parser. The file name
 * is synthetic — predicates receive content, not paths.
 */
function parseSource(content: string): SourceFile {
  return createSourceFile('scanned-test.ts', content, ScriptTarget.Latest, true);
}

/**
 * True when any node in the tree (including the root) matches the predicate.
 */
function containsNode(root: Node, matches: (node: Node) => boolean): boolean {
  if (matches(root)) {
    return true;
  }
  const found = forEachChild(root, (child) => (containsNode(child, matches) ? true : undefined));
  return found === true;
}

/**
 * Strip every transparent wrapper from an expression — the node kinds that
 * change only the static type or grouping of the wrapped expression while
 * evaluating to the very same reference: parentheses, non-null assertions
 * (`expr!`), `as` assertions, `satisfies` expressions, and angle-bracket
 * assertions (`<T>expr`). Leaving any of these intact lets ordinary
 * TypeScript syntax (`(console as Sink).warn = fake`) smuggle a forbidden
 * global past the base-resolution checks.
 */
function unwrapExpression(expression: Expression): Expression {
  let current = expression;
  while (
    isParenthesizedExpression(current) ||
    isNonNullExpression(current) ||
    isAsExpression(current) ||
    isSatisfiesExpression(current) ||
    isTypeAssertionExpression(current)
  ) {
    current = current.expression;
  }
  return current;
}

/**
 * The module specifier a node imports, for every import form — static
 * declarations (including side-effect and type-only imports), re-exports,
 * `import ... = require(...)`, dynamic `import(...)`, and `require(...)`
 * calls. `undefined` when the node imports nothing.
 */
function importedModuleSpecifier(node: Node): string | undefined {
  if (isImportDeclaration(node) || isExportDeclaration(node)) {
    const specifier = node.moduleSpecifier;
    return specifier !== undefined && isStringLiteralLike(specifier) ? specifier.text : undefined;
  }
  if (isImportEqualsDeclaration(node) && isExternalModuleReference(node.moduleReference)) {
    const specifier = node.moduleReference.expression;
    return isStringLiteralLike(specifier) ? specifier.text : undefined;
  }
  if (isCallExpression(node) && isImportOrRequireCallee(node.expression)) {
    const [firstArgument] = node.arguments;
    return firstArgument !== undefined && isStringLiteralLike(firstArgument)
      ? firstArgument.text
      : undefined;
  }
  return undefined;
}

/**
 * True for the callee of a dynamic `import(...)` or a `require(...)` call.
 */
function isImportOrRequireCallee(callee: Expression): boolean {
  return (
    callee.kind === SyntaxKind.ImportKeyword || (isIdentifier(callee) && callee.text === 'require')
  );
}

/**
 * The helper name of a `vi.<helper>(...)` or `vi['<helper>'](...)` call;
 * `undefined` for any other call.
 */
function viHelperName(call: CallExpression): string | undefined {
  const callee = unwrapExpression(call.expression);
  if (isPropertyAccessExpression(callee)) {
    const base = unwrapExpression(callee.expression);
    return isIdentifier(base) && base.text === 'vi' ? callee.name.text : undefined;
  }
  if (isElementAccessExpression(callee) && isStringLiteralLike(callee.argumentExpression)) {
    const base = unwrapExpression(callee.expression);
    return isIdentifier(base) && base.text === 'vi' ? callee.argumentExpression.text : undefined;
  }
  return undefined;
}

/**
 * The identifier at the base of a property/element access chain (e.g.
 * `process` for `process.env.FOO`); `undefined` when the base is not an
 * identifier.
 */
function rootIdentifierName(expression: Expression): string | undefined {
  let current = unwrapExpression(expression);
  while (isPropertyAccessExpression(current) || isElementAccessExpression(current)) {
    current = unwrapExpression(current.expression);
  }
  return isIdentifier(current) ? current.text : undefined;
}

/**
 * True when the expression is the named global itself — the bare identifier
 * (`console`) or the `globalThis`-qualified form (`globalThis.console`,
 * `globalThis['console']`).
 */
function isNamedGlobal(expression: Expression, name: string): boolean {
  const unwrapped = unwrapExpression(expression);
  if (isIdentifier(unwrapped)) {
    return unwrapped.text === name;
  }
  if (isPropertyAccessExpression(unwrapped)) {
    const base = unwrapExpression(unwrapped.expression);
    return isIdentifier(base) && base.text === 'globalThis' && unwrapped.name.text === name;
  }
  if (isElementAccessExpression(unwrapped) && isStringLiteralLike(unwrapped.argumentExpression)) {
    const base = unwrapExpression(unwrapped.expression);
    return (
      isIdentifier(base) && base.text === 'globalThis' && unwrapped.argumentExpression.text === name
    );
  }
  return false;
}

/**
 * True for `process.env` in property or element form, optionally
 * `globalThis`-qualified.
 */
function isProcessEnvExpression(expression: Expression): boolean {
  const unwrapped = unwrapExpression(expression);
  if (isPropertyAccessExpression(unwrapped)) {
    return unwrapped.name.text === 'env' && isNamedGlobal(unwrapped.expression, 'process');
  }
  if (isElementAccessExpression(unwrapped) && isStringLiteralLike(unwrapped.argumentExpression)) {
    return (
      unwrapped.argumentExpression.text === 'env' && isNamedGlobal(unwrapped.expression, 'process')
    );
  }
  return false;
}

/**
 * The property name a binding element binds — its explicit property name
 * (identifier, string literal, or literal-computed) or, for shorthand
 * bindings, the bound identifier itself. `undefined` when the name is not
 * statically known.
 */
function boundPropertyName(element: BindingElement): string | undefined {
  const property = element.propertyName ?? element.name;
  if (isIdentifier(property) || isStringLiteralLike(property)) {
    return property.text;
  }
  if (isComputedPropertyName(property) && isStringLiteralLike(property.expression)) {
    return property.expression.text;
  }
  return undefined;
}

/**
 * True when a variable declaration destructures `env` out of the global
 * `process` — `const { env } = process`, `const { env: alias } = process`,
 * or a rest pattern (`const { ...copy } = process`), which copies `env`
 * along with everything else.
 */
function destructuresEnvFromProcess(node: Node): boolean {
  if (!isVariableDeclaration(node) || node.initializer === undefined) {
    return false;
  }
  if (!isObjectBindingPattern(node.name) || !isNamedGlobal(node.initializer, 'process')) {
    return false;
  }
  return node.name.elements.some(
    (element) => element.dotDotDotToken !== undefined || boundPropertyName(element) === 'env',
  );
}

/**
 * True when the node references `process.env` at all — a property or element
 * access on it, the bare `process.env` expression itself (aliasing,
 * enumeration, argument passing), or a destructuring of `env` out of
 * `process`.
 */
function isProcessEnvTouch(node: Node): boolean {
  if (isPropertyAccessExpression(node) || isElementAccessExpression(node)) {
    return isProcessEnvExpression(node);
  }
  return destructuresEnvFromProcess(node);
}

/**
 * True when the expression is a forbidden mutation target: a `console`
 * member, `process.env` itself, or a `process.env` entry (property or
 * element access, optionally `globalThis`-qualified).
 */
function isForbiddenMutationTarget(expression: Expression): boolean {
  const unwrapped = unwrapExpression(expression);
  if (isProcessEnvExpression(unwrapped)) {
    return true;
  }
  if (isPropertyAccessExpression(unwrapped) || isElementAccessExpression(unwrapped)) {
    const base = unwrapped.expression;
    return isNamedGlobal(base, 'console') || isProcessEnvExpression(base);
  }
  return false;
}

/**
 * True when the node mutates a forbidden global target — any assignment
 * operator (`=`, `+=`, `||=`, `??=`, ...; the `SyntaxKind` assignment-token
 * range covers every present and future compound form), `delete`, or
 * increment/decrement.
 */
function isDirectGlobalMutation(node: Node): boolean {
  if (isBinaryExpression(node)) {
    const operator = node.operatorToken.kind;
    const isAssignment =
      operator >= SyntaxKind.FirstAssignment && operator <= SyntaxKind.LastAssignment;
    return isAssignment && isForbiddenMutationTarget(node.left);
  }
  if (isDeleteExpression(node)) {
    return isForbiddenMutationTarget(node.expression);
  }
  if (isPostfixUnaryExpression(node) || isPrefixUnaryExpression(node)) {
    const isUpdate =
      node.operator === SyntaxKind.PlusPlusToken || node.operator === SyntaxKind.MinusMinusToken;
    return isUpdate && isForbiddenMutationTarget(node.operand);
  }
  return false;
}

/**
 * True when the node is a `vi.*` call that mutates global state:
 * `vi.stubGlobal`, `vi.stubEnv`, or `vi.spyOn` whose first argument is rooted
 * at `console`, `globalThis`, or `process`.
 */
function isVitestGlobalMutationCall(node: Node): boolean {
  if (!isCallExpression(node)) {
    return false;
  }
  const helper = viHelperName(node);
  if (helper === 'stubGlobal' || helper === 'stubEnv') {
    return true;
  }
  if (helper !== 'spyOn') {
    return false;
  }
  const [target] = node.arguments;
  if (target === undefined) {
    return false;
  }
  const root = rootIdentifierName(target);
  return root !== undefined && GLOBAL_SPY_ROOTS.has(root);
}

/**
 * True when the file content imports a filesystem module through any import
 * form — static (including side-effect and type-only), dynamic `import()`,
 * `require(...)`, `import ... = require(...)`, or a re-export.
 *
 * @param content - TypeScript source text of a gated test file.
 * @returns Whether any filesystem-module specifier is imported.
 */
export function usesFsModule(content: string): boolean {
  return containsNode(parseSource(content), (node) => {
    const specifier = importedModuleSpecifier(node);
    return specifier !== undefined && FS_MODULE_SPECIFIERS.has(specifier);
  });
}

/**
 * True when the file content mocks the module registry via
 * `vi.mock`/`vi.doMock`/`vi.unmock`/`vi.doUnmock` (`testing-strategy.md` bans
 * `vi.doMock` by name and requires simple fakes passed as arguments instead;
 * `vi.unmock`/`vi.doUnmock` exist only to manage the same registry mutation).
 *
 * @param content - TypeScript source text of a gated test file.
 * @returns Whether any module-registry mocking call is present.
 */
export function mocksModuleRegistry(content: string): boolean {
  return containsNode(parseSource(content), (node) => {
    if (!isCallExpression(node)) {
      return false;
    }
    const helper = viHelperName(node);
    return helper !== undefined && MODULE_REGISTRY_MOCK_HELPERS.has(helper);
  });
}

/**
 * True when the file content mutates global state through vitest helpers —
 * `vi.spyOn` targeting `console`/`globalThis`/`process`, `vi.stubGlobal`, or
 * `vi.stubEnv`.
 *
 * @param content - TypeScript source text of a gated test file.
 * @returns Whether any vitest global-mutation helper call is present.
 */
export function mutatesGlobalStateViaVitestHelpers(content: string): boolean {
  return containsNode(parseSource(content), isVitestGlobalMutationCall);
}

/**
 * True when the file content mutates the global `console` or `process.env`
 * directly — assignment (plain or compound, e.g. `=`, `+=`, `||=`, `??=`),
 * `delete`, or increment/decrement on those targets. Reads of `console`
 * members are fine — only mutation changes console state. Reads of
 * `process.env` are separately prohibited (`test-immediate-fails.md` item 5,
 * `no-global-state-in-tests.md`) and detected by {@link touchesProcessEnv}.
 *
 * @param content - TypeScript source text of a gated test file.
 * @returns Whether any direct global `console`/`process.env` mutation is
 *   present.
 */
export function mutatesConsoleOrProcessEnv(content: string): boolean {
  return containsNode(parseSource(content), isDirectGlobalMutation);
}

/**
 * True when the file content touches `process.env` at all — read or write.
 * `.agent/rules/test-immediate-fails.md` item 5 and
 * `.agent/rules/no-global-state-in-tests.md` prohibit READING `process.env`
 * in every in-process test, not just mutating it: reads inherit ambient
 * shell state and hide missing DI seams. Detected forms: property access
 * (`process.env.CI`), element access (`process.env['CI']`,
 * `process['env']`), the bare `process.env` expression (aliasing,
 * enumeration, argument passing), destructuring of an entry
 * (`const { CI } = process.env`) or of `env` itself
 * (`const { env } = process`, rest patterns), and
 * `globalThis`-qualified variants of each. The one sanctioned ambient-env
 * location — smoke composition roots (the Vitest runner config or spawn
 * invocation) — is not a test file and lies outside the scanned set.
 *
 * @param content - TypeScript source text of a gated test file.
 * @returns Whether any `process.env` read or write is present.
 */
export function touchesProcessEnv(content: string): boolean {
  return containsNode(parseSource(content), isProcessEnvTouch);
}
