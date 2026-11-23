/**
 * The written forms of a constrained map (specification Appendix B.2, first row), built
 * as syntax-tree nodes and printed by the compiler's printer.
 *
 * A child the text writers produce is read back by the compiler's parser, so the new
 * output holds no hand-assembled text of its own.
 *
 * @internal
 */

import { CodeBlockWriter, ts } from 'ts-morph';

const { factory } = ts;

/**
 * The refusal a writer gives for a schema-valued `additionalProperties` on a schema that
 * is not a constrained map. No row of Appendix B.2 classes it, so it is not written.
 */
export const SCHEMA_VALUED_ADDITIONAL_PROPERTIES_OUTSIDE_THE_ROW =
  'A schema-valued additionalProperties is written only for a constrained map: an object ' +
  'schema that holds none of properties, required, patternProperties, ' +
  'unevaluatedProperties, $ref, $dynamicRef, allOf, anyOf, oneOf, not, if and ' +
  'dependentSchemas (specification Appendix B.2). This schema is outside that row.';

const CARRIER_FILE = 'map-nodes.ts';
const KEY_PARAMETER = 'key';

type WriteText = (writer: CodeBlockWriter) => void;

function textOf(write: WriteText): string {
  const writer = new CodeBlockWriter({ useTabs: false, indentNumberOfSpaces: 2 });
  write(writer);
  return writer.toString();
}

function parse(text: string): ts.SourceFile {
  return ts.createSourceFile(CARRIER_FILE, text, ts.ScriptTarget.ES2022, true);
}

function print(node: ts.Node, source: ts.SourceFile): string {
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  return printer.printNode(ts.EmitHint.Unspecified, node, source);
}

function expressionIn(source: ts.SourceFile): ts.Expression {
  const statement = source.statements[0];
  if (statement === undefined || !ts.isExpressionStatement(statement)) {
    throw new Error('The Zod writer produced text that is not one expression.');
  }
  return ts.isParenthesizedExpression(statement.expression)
    ? statement.expression.expression
    : statement.expression;
}

function typeIn(source: ts.SourceFile): ts.TypeNode {
  const statement = source.statements[0];
  if (statement === undefined || !ts.isTypeAliasDeclaration(statement)) {
    throw new Error('The TypeScript writer produced text that is not one type.');
  }
  return statement.type;
}

function zodCall(target: ts.Expression, method: string, argument: ts.Expression): ts.Expression {
  return factory.createCallExpression(
    factory.createPropertyAccessExpression(target, method),
    undefined,
    [argument],
  );
}

/**
 * `z.strictObject({}).catchall(S)`, where `S` is the Zod the writer gives the map's values.
 *
 * @param writeValue - writes the Zod expression for the values
 * @param deferred - whether the values refer back to a schema still being declared, in
 *   which case the reference is resolved when first used (`z.lazy`)
 */
export function writeZodConstrainedMap(writeValue: WriteText, deferred: boolean): string {
  const source = parse(`(${textOf(writeValue)});`);
  const value = expressionIn(source);
  const zod = factory.createIdentifier('z');
  const resolved = deferred
    ? zodCall(
        zod,
        'lazy',
        factory.createArrowFunction(undefined, undefined, [], undefined, undefined, value),
      )
    : value;
  const emptyStrictObject = zodCall(zod, 'strictObject', factory.createObjectLiteralExpression());
  return print(zodCall(emptyStrictObject, 'catchall', resolved), source);
}

/** `{ [key: string]: T }`, where `T` is the type the writer gives the map's values. */
export function writeTypeScriptConstrainedMap(writeValue: WriteText): string {
  const source = parse(`type Value = ${textOf(writeValue)};`);
  const index = factory.createIndexSignature(
    undefined,
    [
      factory.createParameterDeclaration(
        undefined,
        undefined,
        KEY_PARAMETER,
        undefined,
        factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
      ),
    ],
    typeIn(source),
  );
  return print(factory.createTypeLiteralNode([index]), source);
}
