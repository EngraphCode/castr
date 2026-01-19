# Arbitrary Fixtures

Symlinks to real-world OpenAPI specs from `lib/examples/openapi/`.

These specs are used for semantic equivalence testing — verifying that no information is lost during the round-trip transformation.

## Fixtures

| File                         | Source           | Notes                            |
| ---------------------------- | ---------------- | -------------------------------- |
| `petstore-3.0.yaml`          | OpenAPI examples | Basic REST API                   |
| `petstore-expanded-3.0.yaml` | OpenAPI examples | Inheritance, error responses     |
| `tictactoe-3.1.yaml`         | OpenAPI examples | Enums, path-level refs, security |
| `webhook-3.1.yaml`           | OpenAPI examples | Webhooks (3.1 feature)           |
| `callback-3.0.yaml`          | OpenAPI examples | Callbacks                        |

## Normalization Behaviors

Castr applies idiomatic normalizations during round-trip:

| Behavior                           | Description                                                                            |
| ---------------------------------- | -------------------------------------------------------------------------------------- |
| **Version flow**                   | `openapi` version flows from IR (scalar parser may upgrade 3.0.x → 3.1.x)              |
| **Empty `required` omitted**       | Per OAS 3.1 / JSON Schema 2020-12, `required: []` is omitted (semantically equivalent) |
| **Path-level `$ref` preservation** | Path-level parameter refs are preserved, not inlined                                   |

## Creating Symlinks

```bash
ln -s ../../examples/openapi/v3.0/petstore.yaml petstore-3.0.yaml
```
