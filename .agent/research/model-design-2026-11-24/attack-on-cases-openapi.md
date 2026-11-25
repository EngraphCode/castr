> **A reader's report, not a finding of this repository.** A reader who knows OpenAPI
> attacked the draft of
> [the cases the model's design must hold](../../analysis-and-reports/model-design-cases-2026-11-25.md)
> on 25 November 2026 and read the texts of 3.2.1 and 3.1.2. It is kept whole, as returned. The case numbers are
> those of the draft it read; the note has since gained cases and its section I was
> renumbered. What the seat checked of it, and what it changed, is in the note and in
> the thread record's step log. Paths on the reader's machine are replaced by
> `<scratchpad>` and `<repo>`; the reader's scripts are not kept.

OpenAPI review of cases.md: 1 WRONG, 5 OVERCLAIM, 2 INVALID-DOCUMENT, 12 missing cases plus OpenAPI sets for Section I. Nothing was written to disk.

Sources: I read the texts of 3.2.1 and 3.1.2 from spec.openapis.org in this session. "READ" below means I checked the quote there. A1, A3, A9, A10, F1, F3, F4, G2 and A5's cycle sentence hold up against the text.

## Claims

1. **A2. OVERCLAIM.** READ: §4.23.1 of 3.2.1 and §4.8.23.1 of 3.1.2; §4.9.1 and §4.8.9.1.
   - The case says it "Holds: a reference to a parameter and to a response in the same way as to a schema". OpenAPI has three kinds of reference, and they treat the keys beside the reference differently:
     - A Reference Object: "summary … by default SHOULD override that of the referenced component"; "any properties added SHALL be ignored. Note that this restriction on additional properties is a difference between Reference Objects and Schema Objects that contain a $ref keyword."
     - A Path Item `$ref`: "In case a Path Item Object field appears both in the defined object and the referenced object, the behavior is undefined."
     - `components.pathItems` is "Map[string, Path Item Object]", with no Reference Object.
   - Fix: the model holds three kinds of reference edge:
     - a schema `$ref`, whose siblings apply;
     - a Reference Object, whose `summary` and `description` override the target's and whose other siblings are ignored;
     - a path item `$ref`, whose siblings are undefined.

2. **A7. OVERCLAIM.** READ: G.3 of 3.2.1; §4.3.3 of 3.1.2.
   - The case says "only the entry document's paths add to the API". The text is narrower: "only the entry document's Paths Object contributes URLs to the described API." Path items from other documents still enter the API by reference (the text's own G.3.1 example).
   - The case also says the text "leaves how a name is resolved … to the implementation". That leaves out the rule the text does give: "it is RECOMMENDED that tools resolve from the entry document, rather than the current document."
   - Fix: say "contributes URLs". Hold entry-document resolution as the recommended default, marked implementation-defined.

3. **A8. OVERCLAIM.** READ: §4.1.1 and §4.22 of both versions; §4.30 and §4.22.1 of 3.2.1.
   - The case says "four edges that the source writes as a bare name". Three problems:
     - **A tag edge may have no target:** "Not all tags that are used by the Operation Object must be declared"; "It is not mandatory to have a Tag Object per tag".
     - **In 3.2 a security key can be a URI:** it "MUST either correspond to a security scheme declared … or be the URI of a Security Scheme Object". A name takes precedence over a URI. In 3.1.2 it can only be a name.
     - **3.2 adds a fifth name edge, tag to tag:** `parent` is "The name of a tag that this tag is nested under. The named tag MUST exist".
   - Fix: a tag is an identity that may have no Tag Object. A security key is a name or a URI. Add `parent`.

4. **F2. OVERCLAIM.** READ: §4.12, §4.12.1 and §4.12.2.1 of 3.2.1.
   - The case says `querystring` "has no use for a name". The text still marks `name` "REQUIRED", and identity is "a combination of a name and location". The only thing it says is that "the value of name is not used in the parameter serialization."
   - The text also says `querystring` "MUST be specified using the content field" and must not appear together with `query` parameters.
   - Fix: hold the name; it is ignored only when the value is serialised. A `querystring` parameter takes `content` only.

5. **F6. WRONG.** READ: §4.9.1 of 3.2.1.
   - The case says a naive structure loses `PURGE` "if a method is one of eight field names". 3.2 has nine fixed method fields; the ninth is "query … A definition of a QUERY operation, as defined in [RFC10008]".
   - The fragment's own `query` is also lost by a structure with eight fields.
   - Fix: nine fields in 3.2, eight in 3.1. The naive structure loses `query` as well as `PURGE`.

6. **F7. OVERCLAIM.** READ: §4.10.1, §4.18.1, §4.18.3 and §4.20.3 of 3.2.1; §4.8.18 of 3.1.2.
   - The case says "A callback is keyed by a runtime expression, which has a grammar". There are two keys, not one:
     - The operation's `callbacks` map is keyed by a name: "The key is a unique identifier for the Callback Object".
     - Inside the Callback Object, a key may be literal URL text with several expressions in it. The text's own example is `http://notificationServer.com?transactionId={$request.body#/id}&email={$request.body#/email}`.
   - The ABNF in §4.20.3 covers the expression only, not the template that holds it.
   - The Callback Object "MAY be extended with Specification Extensions", so a key starting `x-` there is an extension, not an expression.
   - Fix: hold the callback's name, then its key as a template, with the literal parts and the expressions in order.

7. **F2–F5. INVALID-DOCUMENT** (a framing problem). READ: §4.1.1 and §4.12.2.1 of 3.2.1.
   - These fragments put `parameters` and `responses` at the document root. The OpenAPI Object has no such fields, so they are valid only as the body of an Operation Object.
   - F2 also needs a path that holds `{id}`: "If in is "path", the name field MUST correspond to a single template expression occurring within the path field".
   - Fix: label each one as an operation body under, for example, `/x/{id}`.

8. **G1. INVALID-DOCUMENT.** READ: §4.30 and §4.30.1 of 3.2.1.
   - `oauth` names no declared scheme, and the meaning of `["read"]` depends on the scheme's type: "If the security scheme is of type "oauth2" or "openIdConnect", then the value is a list of scope names … For other security scheme types, the array MAY contain a list of role names".
   - Fix: declare `components.securitySchemes.oauth` with type `oauth2`.

## Missing cases (MISSING-CASE, most damaging first)

All twelve fragments below parse.

1. **A reference to a location that has no name.** READ: the `operationRef` example in §4.20.2.1 of both versions. The rule that a schema `$ref` may point anywhere comes from JSON Schema, which §4.24 defers to; that part is from memory of JSON Schema.

   ```json
   {
     "paths": {
       "/pets/{id}": {
         "get": {
           "parameters": [
             { "name": "id", "in": "path", "required": true, "schema": { "type": "string" } }
           ],
           "responses": {
             "200": {
               "description": "ok",
               "links": { "self": { "operationRef": "#/paths/~1pets~1%7Bid%7D/get" } },
               "content": {
                 "application/json": {
                   "schema": { "$ref": "#/components/schemas/Pet/properties/owner" }
                 }
               }
             }
           }
         }
       }
     },
     "components": {
       "schemas": { "Pet": { "type": "object", "properties": { "owner": { "type": "string" } } } }
     }
   }
   ```

   A1 and A2 model a reference as an edge between named definitions. Here the target has no name, and its address is a JSON Pointer with `~1` escapes and percent-encoded braces.

2. **One path item referenced from two paths.** READ: §4.20.1 and §4.8.20.1: "operations from any Path Item Object that is referenced multiple times within the OAD cannot be resolved unambiguously … implementation-defined".

   ```json
   {
     "paths": {
       "/a": { "$ref": "#/components/pathItems/P" },
       "/b": { "$ref": "#/components/pathItems/P" }
     },
     "components": {
       "pathItems": {
         "P": {
           "get": {
             "operationId": "op",
             "responses": {
               "200": { "description": "ok", "links": { "again": { "operationId": "op" } } }
             }
           }
         }
       }
     }
   }
   ```

   One Operation Object is two operations, at two paths, with one `operationId`. A model that takes an operation's identity from its object or from its `operationId` collapses them.

3. **A Reference Object that overrides, beside a schema `$ref` that does not.** READ: §4.23.1 and §4.8.23.1.

   ```json
   {
     "paths": {
       "/pets": {
         "get": {
           "parameters": [
             {
               "$ref": "#/components/parameters/Limit",
               "description": "Page size for this list",
               "x-a": 1
             }
           ],
           "responses": {
             "200": {
               "description": "ok",
               "content": {
                 "application/json": {
                   "schema": { "$ref": "#/components/schemas/T", "description": "here", "x-a": 1 }
                 }
               }
             }
           }
         }
       }
     },
     "components": {
       "parameters": {
         "Limit": {
           "name": "limit",
           "in": "query",
           "description": "Page size",
           "schema": { "type": "integer" }
         }
       },
       "schemas": { "T": { "type": "string", "description": "there" } }
     }
   }
   ```

   On the parameter, `description` replaces the target's and `x-a` is ignored. On the schema, both annotations stand and `x-a` is kept. An edge with no payload loses the override; one generic "reference with siblings" node merges the two rules. Row 108 states this, but no case tests it.

4. **A schema that is its own resource inside an OpenAPI document.** READ: §4.24.7 and §4.8.24.5. Draft-07 ignoring the keywords beside `$ref` is from memory; A4 states the same.

   ```json
   {
     "components": {
       "schemas": {
         "Legacy": {
           "$schema": "http://json-schema.org/draft-07/schema#",
           "$id": "https://example.com/legacy",
           "definitions": { "N": { "type": "string" } },
           "properties": {
             "n": { "$ref": "#/definitions/N", "maxLength": 3 },
             "o": { "$ref": "owner" }
           }
         }
       }
     }
   }
   ```

   "The value of $schema within a resource root Schema Object always overrides any default." So `maxLength` here states nothing, `#/definitions/N` resolves inside `Legacy` rather than at the document root, and `owner` resolves to `https://example.com/owner`. A reader that runs one dialect and one base per OpenAPI document gets all three wrong.

5. **A discriminator on a parent, reached through `allOf`, with `defaultMapping` (3.2).** READ: §4.25.1, §4.25.2 and §4.25.4 of 3.2.1.

   ```json
   {
     "components": {
       "schemas": {
         "Pet": {
           "type": "object",
           "properties": { "petType": { "type": "string" } },
           "discriminator": { "propertyName": "petType", "defaultMapping": "OtherPet" }
         },
         "Cat": {
           "allOf": [
             { "$ref": "#/components/schemas/Pet" },
             { "properties": { "petType": { "const": "Cat" } }, "required": ["petType"] }
           ]
         },
         "OtherPet": { "allOf": [{ "$ref": "#/components/schemas/Pet" }] }
       }
     }
   }
   ```

   The parent lists no alternatives; they are the schemas that build on it through `allOf`, so the edges run backwards. Validation "does not perform a search for child schemas". Building a `oneOf` from them would change what validates; holding only listed alternatives, as A9 does, loses them.

6. **An `x-` key whose meaning depends on its container.** READ: §5 of 3.2.1 and §4.9 of 3.1.2; §4.7.1; §4.30.1, which says nothing about extensions; §4.17.1.

   ```json
   {
     "components": {
       "x-a": 1,
       "schemas": { "x-a": { "type": "string" } },
       "securitySchemes": { "x-a": { "type": "apiKey", "name": "k", "in": "header" } },
       "responses": {
         "R": { "description": "ok", "headers": { "x-a": { "schema": { "type": "string" } } } }
       }
     },
     "security": [{ "x-a": [] }],
     "webhooks": { "x-a": { "post": { "responses": { "200": { "description": "ok" } } } } }
   }
   ```

   Only `components["x-a"]` is an extension. The others are a schema, a scheme, a header, a requirement key and a webhook, all named `x-a`. G2's "extensions on the kinds it forgot" does not catch a reader that strips every `x-` key.

7. **`security: []`, `[{}]`, and several schemes in one requirement.** READ: §4.1.1 and §4.10.1 of both versions; §4.30.

   ```json
   {
     "security": [{ "key": [] }],
     "paths": {
       "/a": { "get": { "security": [], "responses": { "200": { "description": "ok" } } } },
       "/b": { "get": { "security": [{}], "responses": { "200": { "description": "ok" } } } },
       "/c": {
         "get": {
           "security": [{ "key": [], "oauth": ["read"] }],
           "responses": { "200": { "description": "ok" } }
         }
       }
     },
     "components": {
       "securitySchemes": {
         "key": { "type": "apiKey", "name": "k", "in": "header" },
         "oauth": {
           "type": "oauth2",
           "flows": {
             "clientCredentials": { "tokenUrl": "https://example.com/t", "scopes": { "read": "r" } }
           }
         }
       }
     }
   }
   ```
   - `[]` "remove[s] a top-level security declaration", and "The list can be incomplete, up to being empty or absent".
   - Only `{}` makes security "explicitly optional".
   - `/c` needs both schemes at once.
   - A naive model reads `[]` as public, and reads the list as flat rather than OR over AND.

8. **`readOnly` and `writeOnly`: one schema, two sides.** READ: §4.24.5.2 and §4.8.24.3.2.

   ```json
   {
     "components": {
       "schemas": {
         "User": {
           "type": "object",
           "required": ["id", "password"],
           "properties": {
             "id": { "type": "string", "readOnly": true },
             "password": { "type": "string", "writeOnly": true }
           }
         }
       }
     }
   }
   ```

   Section D's cases for the two sides are all Zod. Here `id` is required in a response and not in a request, and `password` the reverse. A one-sided shape gets one of the two directions wrong. Row 115 states this; no case tests it.

9. **A name resolved from the entry document, not from the document it is written in.** READ: G.3.1 of 3.2.1; Appendix F of 3.1.2. Entry document, then `other.json`:

   ```json
   {
     "components": { "securitySchemes": { "S": { "type": "http", "scheme": "bearer" } } },
     "paths": { "/foo": { "$ref": "other.json#/components/pathItems/Foo" } }
   }
   ```

   ```json
   {
     "components": {
       "securitySchemes": { "S": { "type": "http", "scheme": "basic" } },
       "pathItems": {
         "Foo": {
           "get": { "security": [{ "S": [] }], "responses": { "200": { "description": "ok" } } }
         }
       }
     }
   }
   ```

   Resolving `S` in the document where it is written gives basic; the text recommends bearer. The edge's target is in a different document from its source.

10. **Name bindings beyond the four.** READ: §4.8.2 (the ABNF), §4.20.1 and §4.22.1 of 3.2.1.

    ```json
    {
      "tags": [{ "name": "cats", "parent": "pets" }, { "name": "pets" }],
      "paths": {
        "/files/{name}.{ext}": {
          "get": {
            "operationId": "getFile",
            "parameters": [
              { "name": "name", "in": "path", "required": true, "schema": { "type": "string" } },
              { "name": "ext", "in": "path", "required": true, "schema": { "type": "string" } }
            ],
            "responses": {
              "200": {
                "description": "ok",
                "links": {
                  "same": {
                    "operationId": "getFile",
                    "parameters": { "path.name": "$request.path.name" }
                  }
                }
              }
            }
          }
        }
      }
    }
    ```

    Four more bindings by name:
    - a template expression to its path parameter, with two expressions in one segment;
    - a link parameter key (`path.name`) to a parameter of the target operation, by location and name;
    - a tag to its parent tag;
    - an `encoding` key to a property name (in missing case 11).

    Kept as strings, every writer has to match the text again.

11. **No case has a request body.** READ: §4.13.1 and §4.14.1 of 3.2.1; §4.8.14.1 of 3.1.2.

    ```json
    {
      "paths": {
        "/up": {
          "post": {
            "requestBody": {
              "required": true,
              "content": {
                "multipart/form-data": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "file": { "contentMediaType": "image/png" },
                      "meta": { "type": "object" }
                    }
                  },
                  "encoding": { "meta": { "contentType": "application/json" } }
                },
                "text/*": { "schema": { "type": "string" } },
                "text/plain": { "schema": { "type": "string", "maxLength": 10 } },
                "application/jsonl": { "itemSchema": { "type": "object" } }
              }
            },
            "responses": { "204": { "description": "ok" } }
          }
        }
      }
    }
    ```

    It shows four things:
    - a `content` key can be a range, and "only the most specific key is applicable", which is the analogue of F4's status codes;
    - an `encoding` key binds to a property;
    - in 3.2, `itemSchema` describes each item, not the whole body;
    - a body can be required.

    A naive model holds "the body" as one schema.

12. **One JSON value read as two kinds.** READ: G.2 of 3.2.1 and §4.3.2 of 3.1.2; this fragment is the text's own example.
    ```json
    {
      "paths": { "/x": { "$ref": "#/components/schemas/E" } },
      "components": { "schemas": { "E": {} } }
    }
    ```
    The same `{}` is both a Schema Object and a Path Item Object, and the behaviour is "implementation defined". A model keyed by JSON location alone cannot hold two kinds at one location.

## Section I (MISSING-CASE, READ)

No equivalence set in Section I has an OpenAPI document as a member.

**Should be one value** (with what the source left unsaid held beside it):

- `servers` absent, `[]`, and `[{"url":"/"}]`. §4.1.1, both versions: "not provided, or is an empty array … a single Server Object with a url value of /".
- A `query` parameter with no `style` or `explode`, and the same parameter with `"style":"form","explode":true` (§4.12.2.2).
- Response headers `X-Rate` and `x-rate`. §4.17.1: "header names are case-insensitive", which F5's own claim relies on.
- A discriminator with no mapping, and one with `mapping: {"Cat":"Cat"}` (§4.25.3).
- `#/components/schemas/Pet`, and the same target spelled through the document's base URI (§4.1.2.2.1). In 3.2, if `$self` is present, a reference spelled through the retrieval URI is not interoperable (§4.1.1).

**Should not be one value:**

- An operation's `security` absent, `[]`, and `[{}]`.
- A Reference Object `{"$ref":X,"description":d}` and a Schema Object `{"$ref":X,"description":d}`.
- `x-a` under `components` and `x-a` under `components.schemas`.

**Count:** 1 WRONG, 5 OVERCLAIM, 2 INVALID-DOCUMENT, 12 MISSING-CASE, plus the OpenAPI sets for Section I.
