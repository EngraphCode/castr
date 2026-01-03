/**
 * IR Schema Context - Discriminated Unions
 *
 * Separates schema structure from usage context, preventing semantic category errors.
 * Replaces overloaded `required` field with explicit context types.
 *
 * @see ADR-023 for architectural rationale
 * @module
 */

import type { CastrSchema, CastrSchemaNode } from './ir-schema.js';

/**
 * Schema usage context - determines how presence modifiers are applied.
 *
 * Different contexts have different semantics for optionality:
 * - Component: Never optional (type definitions)
 * - Property: May be optional (based on parent's required array)
 * - CompositionMember: Never optional (structural alternatives)
 * - ArrayItems: Never optional (array may be empty)
 * - Parameter: May be required/optional (based on OpenAPI spec)
 */
export type CastrSchemaContext =
  | IRComponentSchemaContext
  | IRPropertySchemaContext
  | IRCompositionMemberContext
  | IRArrayItemsContext
  | CastrParameterSchemaContext;

/**
 * Component schema context (from #/components/schemas/{name}).
 *
 * Component schemas are reusable type definitions and are NEVER optional.
 * Asking "is this component schema optional?" is a category error.
 *
 * @example
 * // OpenAPI:
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id: { type: string }
 *
 * // Generated:
 * export const User = z.object({ id: z.string() }).strict();
 * // NO .optional() - component schemas define types, not instances
 */
export interface IRComponentSchemaContext {
  contextType: 'component';
  name: string;
  schema: CastrSchema;
  metadata: CastrSchemaNode;
}

/**
 * Property schema context (within an object's properties).
 *
 * Properties may be optional based on the parent object's required array.
 *
 * @example
 * // OpenAPI:
 * type: object
 * properties:
 *   id: { type: string }
 *   email: { type: string }
 * required: ['id']
 *
 * // Generated:
 * z.object({
 *   id: z.string(),           // required: true  → NO .optional()
 *   email: z.string().optional()  // required: false → YES .optional()
 * })
 */
export interface IRPropertySchemaContext {
  contextType: 'property';
  name: string;
  schema: CastrSchema;
  optional: boolean; // From parent's required array
}

/**
 * Composition member context (oneOf/anyOf/allOf member).
 *
 * Composition members are structural alternatives and are NEVER optional.
 * The composition itself might be optional, but members are not.
 *
 * @example
 * // OpenAPI:
 * oneOf:
 *   - type: string
 *   - type: number
 *
 * // Generated:
 * z.union([z.string(), z.number()])
 * // NOT z.union([z.string().optional(), z.number().optional()])
 */
export interface IRCompositionMemberContext {
  contextType: 'compositionMember';
  compositionType: 'oneOf' | 'anyOf' | 'allOf';
  schema: CastrSchema;
}

/**
 * Array items context (items property of an array).
 *
 * Array items are NEVER optional - the array may be empty, but items
 * that exist match the items schema without optionality.
 *
 * @example
 * // OpenAPI:
 * type: array
 * items:
 *   type: string
 *
 * // Generated:
 * z.array(z.string())
 * // NOT z.array(z.string().optional())
 */
export interface IRArrayItemsContext {
  contextType: 'arrayItems';
  schema: CastrSchema;
}

/**
 * Parameter schema context (path/query/header/cookie parameter).
 *
 * Parameters may be required or optional based on OpenAPI spec.
 *
 * @example
 * // OpenAPI:
 * parameters:
 *   - name: userId
 *     in: path
 *     required: true
 *     schema: { type: string }
 *
 * // Generated:
 * z.string()  // required: true → NO .optional()
 */
export interface CastrParameterSchemaContext {
  contextType: 'parameter';
  name: string;
  location: 'path' | 'query' | 'header' | 'cookie';
  schema: CastrSchema;
  required: boolean; // From ParameterObject.required
}
