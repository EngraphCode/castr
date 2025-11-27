#!/bin/bash

# Script to automatically add assertSingleFileResult to snapshot test files

# List of files to update
files=(
  "lib/tests-snapshot/edge-cases/array-default-values.test.ts"
  "lib/tests-snapshot/edge-cases/description-in-zod.test.ts"
  "lib/tests-snapshot/edge-cases/jsdoc.test.ts"
  "lib/tests-snapshot/edge-cases/missing-zod-chains.test.ts"
  "lib/tests-snapshot/edge-cases/number-default-as-number.test.ts"
  "lib/tests-snapshot/edge-cases/object-default-values.test.ts"
  "lib/tests-snapshot/endpoints/common-parameters.test.ts"
  "lib/tests-snapshot/endpoints/param-with-content.test.ts"
  "lib/tests-snapshot/naming/handle-props-with-special-characters.test.ts"
  "lib/tests-snapshot/options/validation/enum-min-max.test.ts"
  "lib/tests-snapshot/options/validation/enum-null.test.ts"
  "lib/tests-snapshot/options/validation/numerical-enum.test.ts"
  "lib/tests-snapshot/schemas/composition/allOf-oneOf-anyOf-single-ref.test.ts"
  "lib/tests-snapshot/schemas/composition/anyOf-behavior.test.ts"
  "lib/tests-snapshot/schemas/composition/allOf-infer-required-only-item.test.ts"
  "lib/tests-snapshot/schemas/composition/allOf-missing-and.test.ts"
  "lib/tests-snapshot/schemas/references/missing-zod-chains-on-z-object-with-refs-props.test.ts"
  "lib/tests-snapshot/options/validation/min-with-max.test.ts"
  "lib/tests-snapshot/schemas/references/request-body-ref.test.ts"
  "lib/tests-snapshot/options/generation/array-body-with-chains-tag-group-strategy.test.ts"
  "lib/tests-snapshot/schemas/composition/array-oneOf-discriminated-union.test.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    
    # Step 1: Add import if not present
    if ! grep -q "assertSingleFileResult" "$file"; then
      # Find the last import line and add the new import after it
      sed -i '' '/^import.*from.*vitest/a\
import { assertSingleFileResult } from '"'"'../../../tests-helpers/generation-result-assertions.js'"'"';
' "$file"
    fi
    
    # Step 2: Replace expect(output).toMatchInlineSnapshot with the correct pattern
    # This uses perl for better multi-line regex support
    perl -i -p0e 's/(const output = await generateZodClientFromOpenAPI\([^)]+\);)\n(\s+)(expect\(output\)\.toMatchInlineSnapshot)/$1\n$2assertSingleFileResult(output);\n$2expect(output.content).toMatchInlineSnapshot/g' "$file"
    
    echo "✓ Updated $file"
  else
    echo "✗ File not found: $file"
  fi
done

echo "Done!"




