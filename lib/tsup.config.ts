import { defineConfig } from "tsup";

export default defineConfig({
    entry: {
        "openapi-zod-client": "src/index.ts",
        cli: "src/cli.ts",
    },
    format: ["cjs", "esm"],
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: false,
    treeshake: true,
    outDir: "dist",
});
