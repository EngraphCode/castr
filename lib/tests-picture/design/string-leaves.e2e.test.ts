/**
 * Every string the prototype's types can hold, listed with why it is a string.
 *
 * The check reads `model.ts` and `boundary.ts` through the compiler, so a string added to the model
 * without an entry here fails, and so does an entry for a string that is gone. It reads
 * a source file of the repository, so it is an end-to-end test.
 */

import { describe, it, expect } from 'vitest';

import { stringLeaves } from './string-leaves.js';

/**
 * Why a place holds a string.
 *
 * - `text`: words for a person. No grammar.
 * - `data`: a string a document states as a value or a key. Any string is one.
 * - `grammar`: text in a grammar a specification defines, kept as text. The
 *   specification allows that only as an exception its owner approves, so each of these
 *   is a request the amendment must carry, and none is granted.
 */
type Reason =
  | { readonly why: 'text' | 'data'; readonly what: string }
  | { readonly why: 'grammar'; readonly what: string; readonly grammar: string };

const LEAVES: Readonly<Record<string, Reason>> = {
  'Api.contact.email': {
    why: 'grammar',
    what: 'an address to write to',
    grammar: 'an email address (RFC 5322)',
  },
  'Api.contact.name': { why: 'text', what: 'the name of whom to write to' },
  'Api.contact.url': {
    why: 'grammar',
    what: 'an address',
    grammar:
      'a URI or a URI reference (RFC 3986), kept for a person or a client to follow and never resolved here',
  },
  'Api.extensions': { why: 'data', what: 'the names of fields no format defines' },
  'Api.licence.held.spdx': {
    why: 'grammar',
    what: 'a licence, by its identifier',
    grammar: 'an SPDX licence expression',
  },
  'Api.licence.held.url': {
    why: 'grammar',
    what: 'an address',
    grammar:
      'a URI or a URI reference (RFC 3986), kept for a person or a client to follow and never resolved here',
  },
  'Api.licence.name': { why: 'text', what: 'the name of a licence' },
  'Api.terms': {
    why: 'grammar',
    what: 'an address',
    grammar:
      'a URI or a URI reference (RFC 3986), kept for a person or a client to follow and never resolved here',
  },
  'Api.title': { why: 'text', what: 'words for a person' },
  'Api.version': { why: 'data', what: 'the version a description gives its API' },
  'Api.webhooks': { why: 'data', what: 'the names of webhooks' },
  'Body.description': { why: 'text', what: 'words for a person' },
  'Body.extensions': { why: 'data', what: 'the names of fields no format defines' },
  'Callback.calls.to': {
    why: 'data',
    what: 'the text between the readings in a callback’s address',
  },
  'Callback.extensions': { why: 'data', what: 'the names of fields no format defines' },
  'Carrier.description': { why: 'text', what: 'words for a person' },
  'Carrier.examples': { why: 'data', what: 'the names of examples' },
  'Carrier.extensions': { why: 'data', what: 'the names of fields no format defines' },
  'Constant[object].members': { why: 'data', what: 'the keys of an object a schema states' },
  'Constant[string].value': { why: 'data', what: 'a string a schema states' },
  'Definition.aliases': {
    why: 'grammar',
    what: 'the names a source gave a definition: a key, an anchor, an identifier',
    grammar: 'an anchor (JSON Schema core 8.2.2) and a URI (RFC 3986) are among them',
  },
  'Encoding.extensions': { why: 'data', what: 'the names of fields no format defines' },
  'Encoding.headers': {
    why: 'grammar',
    what: 'the headers of one part of a body, by name',
    grammar:
      'a token of HTTP (RFC 9110): one piece, compared without regard to case where HTTP says so',
  },
  'Encodings[name].names': {
    why: 'data',
    what: 'the names of the properties encodings are given for',
  },
  'Example.extensions': { why: 'data', what: 'the names of fields no format defines' },
  'Example.value.text': { why: 'data', what: 'a value as it is serialised' },
  'Example.value.url': {
    why: 'grammar',
    what: 'an address',
    grammar:
      'a URI or a URI reference (RFC 3986), kept for a person or a client to follow and never resolved here',
  },
  'Flow.refresh': {
    why: 'grammar',
    what: 'an address',
    grammar:
      'a URI or a URI reference (RFC 3986), kept for a person or a client to follow and never resolved here',
  },
  'Flow.scopes': { why: 'data', what: 'the names of scopes, each with words for a person' },
  'Follow.description': { why: 'text', what: 'words for a person' },
  'Follow.extensions': { why: 'data', what: 'the names of fields no format defines' },
  'Follow.parameters.name': {
    why: 'data',
    what: 'the name of a parameter a link passes a value to',
  },
  'Link.description': { why: 'text', what: 'words for a person' },
  'Link.url': {
    why: 'grammar',
    what: 'an address',
    grammar:
      'a URI or a URI reference (RFC 3986), kept for a person or a client to follow and never resolved here',
  },
  'Media.examples': { why: 'data', what: 'the names of examples' },
  'Media.extensions': { why: 'data', what: 'the names of fields no format defines' },
  'MediaRange.parameters': {
    why: 'grammar',
    what: 'the parameters of a media type, by name',
    grammar:
      'a token of HTTP (RFC 9110): one piece, compared without regard to case where HTTP says so',
  },
  'MediaRange.subtype': {
    why: 'grammar',
    what: 'the subtype of a media type, or `*`',
    grammar:
      'a token of HTTP (RFC 9110): one piece, compared without regard to case where HTTP says so',
  },
  'MediaRange.type': {
    why: 'grammar',
    what: 'the type of a media type, or `*`',
    grammar:
      'a token of HTTP (RFC 9110): one piece, compared without regard to case where HTTP says so',
  },
  'Method[other].token': {
    why: 'grammar',
    what: 'an HTTP method the formats do not name, as it is sent',
    grammar:
      'a token of HTTP (RFC 9110): one piece, compared without regard to case where HTTP says so',
  },
  'ObjectPart.fields': { why: 'data', what: 'the names of an object’s fields' },
  'ObjectPart.required': { why: 'data', what: 'the names of keys that must be present' },
  'Operation.callbacks': { why: 'data', what: 'the names of callbacks' },
  'Operation.extensions': { why: 'data', what: 'the names of fields no format defines' },
  'Operation.name': { why: 'data', what: 'the name a description gives an operation' },
  'Parameter.name': { why: 'data', what: 'the name of a parameter' },
  'PartDefinition.aliases': {
    why: 'grammar',
    what: 'the names a source gave a part: a key under which it is filed',
    grammar: 'a component name is limited to letters, digits, `.`, `-` and `_` (OpenAPI 4.7)',
  },
  'Passed[text].parts': {
    why: 'data',
    what: 'the text between the readings in a value a link passes',
  },
  'PathItem.extensions': { why: 'data', what: 'the names of fields no format defines' },
  'Pattern.source': {
    why: 'grammar',
    what: 'a regular expression',
    grammar: 'ECMA-262 regular expressions, in the dialect the pattern names',
  },
  'Requirement.asks': { why: 'data', what: 'the names of scopes or roles a requirement asks' },
  'Resource.dynamicAnchors': {
    why: 'grammar',
    what: 'the dynamic anchors a resource declares',
    grammar: 'an anchor (JSON Schema core 8.2.2): one token, with no parts',
  },
  'ResourceId.resource': {
    why: 'grammar',
    what: 'the identifier of a resource',
    grammar: 'a URI (RFC 3986)',
  },
  'Response.extensions': { why: 'data', what: 'the names of fields no format defines' },
  'Response.follows': { why: 'data', what: 'the names of links' },
  'Response.headers': {
    why: 'grammar',
    what: 'the headers of a response, by name',
    grammar:
      'a token of HTTP (RFC 9110): one piece, compared without regard to case where HTTP says so',
  },
  'Runtime.part.name': {
    why: 'grammar',
    what: 'the name of a header, or of a query or path parameter, read at run time',
    grammar:
      'a token of HTTP (RFC 9110): one piece, compared without regard to case where HTTP says so',
  },
  'Runtime.part.steps': { why: 'data', what: 'the keys that lead into a body' },
  'Said.description': { why: 'text', what: 'words for a person' },
  'Said.title': { why: 'text', what: 'words for a person' },
  'Scheme.by.authorisationCode.authorise': {
    why: 'grammar',
    what: 'an address',
    grammar:
      'a URI or a URI reference (RFC 3986), kept for a person or a client to follow and never resolved here',
  },
  'Scheme.by.authorisationCode.token': {
    why: 'grammar',
    what: 'an address',
    grammar:
      'a URI or a URI reference (RFC 3986), kept for a person or a client to follow and never resolved here',
  },
  'Scheme.by.bearerFormat': { why: 'text', what: 'words for a person' },
  'Scheme.by.clientCredentials.token': {
    why: 'grammar',
    what: 'an address',
    grammar:
      'a URI or a URI reference (RFC 3986), kept for a person or a client to follow and never resolved here',
  },
  'Scheme.by.deviceAuthorisation.device': {
    why: 'grammar',
    what: 'an address',
    grammar:
      'a URI or a URI reference (RFC 3986), kept for a person or a client to follow and never resolved here',
  },
  'Scheme.by.deviceAuthorisation.token': {
    why: 'grammar',
    what: 'an address',
    grammar:
      'a URI or a URI reference (RFC 3986), kept for a person or a client to follow and never resolved here',
  },
  'Scheme.by.discovery': {
    why: 'grammar',
    what: 'an address',
    grammar:
      'a URI or a URI reference (RFC 3986), kept for a person or a client to follow and never resolved here',
  },
  'Scheme.by.implicit.authorise': {
    why: 'grammar',
    what: 'an address',
    grammar:
      'a URI or a URI reference (RFC 3986), kept for a person or a client to follow and never resolved here',
  },
  'Scheme.by.metadata': {
    why: 'grammar',
    what: 'an address',
    grammar:
      'a URI or a URI reference (RFC 3986), kept for a person or a client to follow and never resolved here',
  },
  'Scheme.by.name': {
    why: 'grammar',
    what: 'the name of a key, or of an HTTP authentication scheme',
    grammar:
      'a token of HTTP (RFC 9110): one piece, compared without regard to case where HTTP says so',
  },
  'Scheme.by.password.token': {
    why: 'grammar',
    what: 'an address',
    grammar:
      'a URI or a URI reference (RFC 3986), kept for a person or a client to follow and never resolved here',
  },
  'Scheme.description': { why: 'text', what: 'words for a person' },
  'Scheme.extensions': { why: 'data', what: 'the names of fields no format defines' },
  'Server.description': { why: 'text', what: 'words for a person' },
  'Server.extensions': { why: 'data', what: 'the names of fields no format defines' },
  'Server.name': { why: 'text', what: 'words for a person' },
  'Server.variables': { why: 'data', what: 'the names of a server’s variables' },
  'Server.variables.allowed': { why: 'data', what: 'the values a variable may take' },
  'Server.variables.default': {
    why: 'data',
    what: 'the value a variable takes unless another is given',
  },
  'Server.variables.description': { why: 'text', what: 'words for a person' },
  'Shape[reference-in-scope].anchor': {
    why: 'grammar',
    what: 'the dynamic anchor a reference in scope looks for',
    grammar: 'an anchor (JSON Schema core 8.2.2): one token, with no parts',
  },
  'Step[data].path': { why: 'data', what: 'the keys that lead to a schema inside other data' },
  'Step[field].name': { why: 'data', what: 'the name of a field' },
  'Step[named].name': { why: 'data', what: 'the key a definition is filed under' },
  'Tag.extensions': { why: 'data', what: 'the names of fields no format defines' },
  'Tag.kind': { why: 'text', what: 'words for a person' },
  'Tag.name': { why: 'data', what: 'the name of a tag' },
  'TemplatePart[text].text': { why: 'data', what: 'the text of an address between its variables' },
  'TemplatePart[variable].name': { why: 'data', what: 'the name of a variable in an address' },
  'Words.description': { why: 'text', what: 'words for a person' },
  'Words.summary': { why: 'text', what: 'words for a person' },
  'Written.as': {
    why: 'grammar',
    what: 'a reference as its source wrote it, in the record and never read again',
    grammar: 'a URI reference (RFC 3986), whose fragment may be a JSON Pointer (RFC 6901)',
  },
  'Step[callback].name': { why: 'data', what: 'the name of a callback' },
  'Step[example].name': { why: 'data', what: 'the name of an example' },
  'Step[follow].name': { why: 'data', what: 'the name of a link' },
  'Step[header].name': {
    why: 'grammar',
    what: 'the name of a header',
    grammar:
      'a token of HTTP (RFC 9110): one piece, compared without regard to case where HTTP says so',
  },
  'Step[parameter].name': { why: 'data', what: 'the name of a parameter' },
  'Step[part].name': {
    why: 'grammar',
    what: 'the name a part of a description is filed under',
    grammar: 'a component name is limited to letters, digits, `.`, `-` and `_` (OpenAPI 4.7)',
  },
  'Step[webhook].name': { why: 'data', what: 'the name of a webhook' },
};

function inOrder(left: string, right: string): number {
  return left.localeCompare(right, 'en');
}

describe('the strings of the prototype', () => {
  it('are each listed with a reason, and no entry is for a string that is gone', () => {
    expect(stringLeaves()).toEqual(Object.keys(LEAVES).sort(inOrder));
  });

  it('include 34 kept as text in a grammar a specification defines', () => {
    const kept = Object.values(LEAVES).filter((reason) => reason.why === 'grammar');

    expect(kept).toHaveLength(34);
  });
});
