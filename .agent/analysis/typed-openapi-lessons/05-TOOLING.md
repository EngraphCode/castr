# 05: Tooling & CLI Experience

**Domain**: Developer Tooling, CLI Design, Configuration  
**Impact**: 🟡 Medium (affects all users)  
**Effort**: 🟢 Low to Medium  
**Priority**: P1 (near-term)

---

## 📋 Quick Summary

typed-openapi's tooling philosophy:

1. **Modular Exports** - Users import only what they need
2. **Config File Support** - Version-controlled configuration
3. **Watch Mode** - Auto-regenerate on changes
4. **Better CLI Feedback** - Progress, warnings, tips
5. **Plugin Architecture** - Extensible generation

**Key insight**: Great CLI experience makes tools feel professional

---

## 1. Modular Export Strategy

### 1.1 typed-openapi's Approach

```json
{
  "exports": {
    ".": "./dist/index.js", // Main API
    "./node": "./dist/node.export.js", // Node-specific
    "./pretty": "./dist/pretty.export.js" // Formatting
  }
}
```

**Benefits**:

- Better tree-shaking
- Clear separation of concerns
- Optional features don't bloat main export

**Usage**:

```typescript
// Users building tools
import { generateFile } from 'typed-openapi';
import { formatWithPrettier } from 'typed-openapi/pretty';
import { readOpenApiFile } from 'typed-openapi/node';
```

### 1.2 Applying to openapi-zod-client

**Current**: Single export point

**Proposed**:

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./cli": "./dist/cli.js",
    "./templates": "./dist/templates.js",
    "./validation": "./dist/validation.js",
    "./types": "./dist/types.js"
  }
}
```

**Usage**:

```typescript
// Main API
import { generateZodClientFromOpenAPI } from 'openapi-zod-client';

// Template utilities
import { getHandlebars, registerHelpers } from 'openapi-zod-client/templates';

// Validation helpers
import { validateRequest, validateResponse } from 'openapi-zod-client/validation';

// Just types (for type-only imports)
import type { TemplateContext } from 'openapi-zod-client/types';
```

**See implementation**: [examples/30-modular-exports.ts](./examples/30-modular-exports.ts)

---

## 2. Config File Support

### 2.1 The Problem

**Current**: All configuration via CLI flags

```bash
pnpm openapi-zod-client ./api.yaml -o ./client.ts --with-alias --strict-objects --export-schemas --group-strategy tag
```

**Problems**:

- Long commands
- Hard to version control
- Can't share across team
- Difficult for CI/CD

### 2.2 Solution: Config Files

**Support multiple formats**:

```typescript
// openapi-zod-client.config.ts (preferred)
import { defineConfig } from "openapi-zod-client";

export default defineConfig({
  input: "./openapi.yaml",
  output: "./src/api-client.ts",
  template: "schemas-with-metadata",
  options: {
    withAlias: true,
    baseUrl: process.env.API_BASE_URL || "https://api.example.com",
    exportSchemas: "referenced",
    strictObjects: true,
    groupStrategy: "tag",
    withValidationHelpers: true,
  },
  prettier: {
    tabWidth: 2,
    singleQuote: true,
  },
});

// openapi-zod-client.config.json (also supported)
{
  "input": "./openapi.yaml",
  "output": "./src/api-client.ts",
  "options": {
    "strictObjects": true
  }
}
```

**CLI usage**:

```bash
# Looks for config file automatically
pnpm openapi-zod-client

# Specify config file
pnpm openapi-zod-client --config custom-config.ts

# Override config with CLI flags
pnpm openapi-zod-client --output ./different-output.ts
```

**Implementation with cosmiconfig**:

```typescript
import { cosmiconfig } from 'cosmiconfig';

const explorer = cosmiconfig('openapi-zod-client');

async function loadConfig() {
  const result = await explorer.search();
  return result?.config;
}
```

**See full implementation**: [examples/31-config-file-support.ts](./examples/31-config-file-support.ts)

### 2.3 Multiple Configs

**For monorepos**:

```typescript
// configs/api-v1.config.ts
export default defineConfig({
  input: './specs/api-v1.yaml',
  output: './packages/api-v1/src/client.ts',
});

// configs/api-v2.config.ts
export default defineConfig({
  input: './specs/api-v2.yaml',
  output: './packages/api-v2/src/client.ts',
});
```

**Usage**:

```bash
pnpm openapi-zod-client --config ./configs/api-v1.config.ts
pnpm openapi-zod-client --config ./configs/api-v2.config.ts
```

**package.json scripts**:

```json
{
  "scripts": {
    "generate:v1": "openapi-zod-client --config ./configs/api-v1.config.ts",
    "generate:v2": "openapi-zod-client --config ./configs/api-v2.config.ts",
    "generate:all": "pnpm generate:v1 && pnpm generate:v2"
  }
}
```

---

## 3. Watch Mode

### 3.1 The Need

**Current workflow**:

1. Edit OpenAPI spec
2. Run generator manually
3. Check output
4. Repeat

**Better workflow**:

1. Edit OpenAPI spec
2. Generator runs automatically
3. Hot reload in dev server

### 3.2 Implementation

```bash
# CLI option
pnpm openapi-zod-client --watch

🔄 Watch mode enabled
👀 Watching: ./openapi.yaml
✨ Ready! Waiting for changes...

# On file change
🔄 Detected changes in openapi.yaml
⚙️  Regenerating...
✅ Successfully regenerated (1.2s)
```

**Implementation**:

```typescript
import chokidar from 'chokidar';

async function watchMode(config: Config) {
  console.log('🔄 Watch mode enabled');
  console.log('👀 Watching:', config.input);

  const watcher = chokidar.watch(config.input, {
    persistent: true,
    ignoreInitial: false,
  });

  watcher.on('change', async (path) => {
    console.log('🔄 Detected changes in', path);
    console.log('⚙️  Regenerating...');

    try {
      const startTime = Date.now();
      await generateZodClientFromOpenAPI(config);
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);

      console.log(`✅ Successfully regenerated (${duration}s)`);
    } catch (error) {
      console.error('❌ Generation failed:', error.message);
    }
  });

  console.log('✨ Ready! Waiting for changes...');
}
```

**See full implementation**: [examples/32-watch-mode.ts](./examples/32-watch-mode.ts)

### 3.3 Smart Watch

Watch multiple files:

```typescript
const filesToWatch = [
  config.input, // Main OpenAPI file
  ...(config.additionalSpecs || []), // Referenced specs
  config.templatePath, // Custom template
];

const watcher = chokidar.watch(filesToWatch, {
  /* ... */
});
```

Debounce rapid changes:

```typescript
let timeout: NodeJS.Timeout;

watcher.on('change', (path) => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    regenerate(path);
  }, 300); // Wait 300ms for more changes
});
```

---

## 4. Better CLI Feedback

### 4.1 Progress Reporting

**Current**: Silent or verbose

**Enhanced**:

```bash
pnpm openapi-zod-client ./large-api.yaml -o ./client.ts

📖 Reading OpenAPI spec...
✓ Loaded: large-api.yaml (2.4 MB)

⚙️  Generating client...
  ├─ Parsing schemas... (180 schemas)
  ├─ Resolving references... (45 $refs)
  ├─ Generating endpoints... (320 endpoints)
  ├─ Rendering template...
  └─ Formatting with Prettier...

✅ Generated successfully!

📊 Summary:
  • Output: ./client.ts (1.8 MB, gzipped: 240 KB)
  • Time: 2.3s
  • Schemas: 180
  • Endpoints: 320

💡 Optimization Tips:
  • Consider --export-schemas referenced (-60% size)
  • Use --output-mode types for faster IDE (0KB runtime)
```

**Implementation**:

```typescript
import ora from 'ora';

async function generateWithProgress(config: Config) {
  const spinner = ora('Reading OpenAPI spec...').start();

  try {
    const openApiDoc = await loadSpec(config.input);
    spinner.succeed(`Loaded: ${config.input}`);

    spinner.start('Generating client...');

    const result = await generateZodClientFromOpenAPI({
      openApiDoc,
      ...config,
      onProgress: (step) => {
        spinner.text = `Generating client... ${step}`;
      },
    });

    spinner.succeed('Generated successfully!');

    // Show summary
    console.log('\n📊 Summary:');
    console.log(`  • Output: ${config.output}`);
    console.log(`  • Time: ${result.duration}s`);
    console.log(`  • Schemas: ${result.schemaCount}`);
    console.log(`  • Endpoints: ${result.endpointCount}`);

    // Show tips
    if (result.suggestions.length > 0) {
      console.log('\n💡 Optimization Tips:');
      result.suggestions.forEach((tip) => console.log(`  • ${tip}`));
    }
  } catch (error) {
    spinner.fail('Generation failed');
    console.error(error);
    process.exit(1);
  }
}
```

**See full implementation**: [examples/33-cli-feedback.ts](./examples/33-cli-feedback.ts)

### 4.2 Warnings and Suggestions

**Schema warnings**:

```bash
⚠️  Found 120 unused schemas
  Tip: Use --export-schemas referenced to exclude them

⚠️  Large API detected (500+ endpoints)
  Tip: Use --group-strategy none for better IDE performance

⚠️  Deprecated endpoints found: 15
  Tip: Use --with-deprecated=false to exclude them
```

**Validation warnings**:

```bash
⚠️  OpenAPI spec issues:
  • Missing operationId: GET /users (line 45)
  • Duplicate operationId: createUser (line 123, 456)
  • Invalid $ref: #/components/schemas/Unknown (line 789)

  Run with --strict to treat warnings as errors
```

---

## 5. Plugin Architecture

### 5.1 Concept

Allow users to extend generation:

```typescript
// plugins/add-jsdoc.ts
export const addJSDocPlugin: Plugin = {
  name: 'add-jsdoc',

  transformSchema(schema, context) {
    if (schema.description) {
      return {
        ...schema,
        jsdoc: `/**\n * ${schema.description}\n */`,
      };
    }
    return schema;
  },

  transformEndpoint(endpoint, context) {
    if (endpoint.description) {
      return {
        ...endpoint,
        jsdoc: generateJSDoc(endpoint),
      };
    }
    return endpoint;
  },
};
```

**Usage**:

```typescript
// openapi-zod-client.config.ts
import { defineConfig } from 'openapi-zod-client';
import { addJSDocPlugin } from './plugins/add-jsdoc';

export default defineConfig({
  plugins: [addJSDocPlugin],
});
```

**See plugin system**: [examples/34-plugin-architecture.ts](./examples/34-plugin-architecture.ts)

---

## 6. Development Experience

### 6.1 Debug Mode

```bash
pnpm openapi-zod-client ./api.yaml --debug

🐛 Debug mode enabled

📖 Loading OpenAPI spec...
  File: ./api.yaml
  Parser: @apidevtools/swagger-parser

✓ Spec loaded: 45 ms
  Version: 3.0.3
  Title: My API
  Servers: https://api.example.com

⚙️  Parsing schemas...
  Total schemas: 180
  Referenced: 120
  Unused: 60

  Processing Pet schema...
    Type: object
    Required: [id, name, photoUrls]
    Optional: [category, tags, status]
    Generated: z.object({ ... }).strict()
```

### 6.2 Dry Run

```bash
pnpm openapi-zod-client ./api.yaml --dry-run

🔍 Dry run mode (no files will be written)

✓ Spec validation passed
✓ Generation completed
✓ Output size: 1.8 MB

📊 What would be generated:
  • ./client.ts (1.8 MB)
  • 180 schemas
  • 320 endpoints

  Run without --dry-run to write files
```

---

## 7. References

### Code Examples

- [30-modular-exports.ts](./examples/30-modular-exports.ts)
- [31-config-file-support.ts](./examples/31-config-file-support.ts)
- [32-watch-mode.ts](./examples/32-watch-mode.ts)
- [33-cli-feedback.ts](./examples/33-cli-feedback.ts)
- [34-plugin-architecture.ts](./examples/34-plugin-architecture.ts)

### External Resources

- [cosmiconfig](https://github.com/cosmiconfig/cosmiconfig)
- [chokidar](https://github.com/paulmillr/chokidar)
- [ora (spinners)](https://github.com/sindresorhus/ora)

---

**Next**: Read [06-STANDARDS.md](./06-STANDARDS.md) for standards compliance and versioning.
