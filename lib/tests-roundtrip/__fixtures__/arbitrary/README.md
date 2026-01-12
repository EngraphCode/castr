# Arbitrary Fixtures

Symlinks to real-world OpenAPI specs from `lib/examples/openapi/`.

These specs are used for semantic equivalence testing — verifying that no information is lost during the round-trip transformation.

## Fixtures Used

- `petstore.yaml` → Basic REST API
- `petstore-expanded.yaml` → Inheritance, error responses
- `tictactoe.yaml` → Enums, simple operations

Create symlinks as needed:

```bash
ln -s ../../examples/openapi/v3.0/petstore.yaml .
```
