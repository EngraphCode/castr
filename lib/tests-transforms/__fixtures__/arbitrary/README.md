# Arbitrary Fixtures

Mixed real-world OpenAPI fixtures used for semantic equivalence testing.

These specs are used for semantic equivalence testing — verifying that no information is lost during transform execution with sample input.

## Fixtures

| File                         | Source            | Notes                            |
| ---------------------------- | ----------------- | -------------------------------- |
| `petstore-3.0.yaml`          | OpenAPI examples  | Basic REST API                   |
| `petstore-expanded-3.0.yaml` | OpenAPI examples  | Inheritance, error responses     |
| `tictactoe-3.1.yaml`         | OpenAPI examples  | Enums, path-level refs, security |
| `webhook-3.1.yaml`           | OpenAPI examples  | Webhooks (3.1 feature)           |
| `callback-3.0.yaml`          | OpenAPI examples  | Callbacks                        |
| `oak-api.json`               | Committed fixture | Real-world OpenAPI JSON spec     |

## Normalization Behaviors

Castr applies idiomatic normalizations during transform execution:

| Behavior                           | Description                                                                            |
| ---------------------------------- | -------------------------------------------------------------------------------------- |
| **Version flow**                   | `openapi` version flows from IR (scalar parser may upgrade 3.0.x → 3.1.x)              |
| **Empty `required` omitted**       | Per OAS 3.1 / JSON Schema 2020-12, `required: []` is omitted (semantically equivalent) |
| **Path-level `$ref` preservation** | Path-level parameter refs are preserved, not inlined                                   |

## Creating Symlinks

```bash
ln -s ../../examples/openapi/v3.0/petstore.yaml petstore-3.0.yaml
```

Additional committed real-world specs may live outside this directory when they are used for explicit fail-fast proofs rather than semantic-equivalence transform coverage.
