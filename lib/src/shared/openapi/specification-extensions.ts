/**
 * OpenAPI Specification Extension key detection.
 *
 * OpenAPI 3.x allows certain objects (for the parser surface: the Paths
 * Object and the Responses Object) to be extended with Specification
 * Extensions — fields whose names match `^x-`. Extension entries are vendor
 * metadata, not paths or responses, so map iteration over those objects must
 * not build them into IR structures.
 *
 * Designated centralized data-string utility (ADR-026).
 */

import { startsWith } from 'lodash-es';

const SPECIFICATION_EXTENSION_PREFIX = 'x-';

/**
 * Return true when a map key is an OpenAPI Specification Extension field name.
 *
 * Per OAS 3.x, extension field names match `^x-` exactly (field names are
 * case-sensitive, so `X-` keys are NOT extensions and stay subject to the
 * strict validation applied to ordinary keys).
 *
 * Only apply this predicate to maps the specification declares extensible
 * (Paths Object, Responses Object, Callback Object). Plain maps such as
 * content maps, response-header maps, security-requirement objects, and
 * `additionalOperations` legitimately contain keys beginning with `x-`
 * (for example the `x-world/x-vrml` media type, `X-Rate-Limit`-style header
 * names, user-chosen scheme names, and custom HTTP method tokens).
 *
 * @param key - Map key from an extensible OpenAPI object
 * @returns `true` when the key names a specification extension
 *
 * @see {@link https://spec.openapis.org/oas/v3.1.0#specification-extensions | OpenAPI Specification Extensions}
 * @internal
 */
export function isSpecificationExtensionKey(key: string): boolean {
  return startsWith(key, SPECIFICATION_EXTENSION_PREFIX);
}
