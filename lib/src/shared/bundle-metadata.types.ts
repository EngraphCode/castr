import type { OpenAPIV3_1 } from '@scalar/openapi-types';
import type { OpenAPIObject } from 'openapi3-ts/oas31';

/**
 * A bundled and upgraded OpenAPI 3.1 document combining Scalar and openapi3-ts types.
 *
 * **NOT prefixed with OTT** - This is a pure intersection of library types.
 *
 * This intersection type provides:
 * - Scalar's extension-friendly structure (x-ext, x-ext-urls, etc.)
 * - openapi3-ts strict typing for OpenAPI 3.1 standard fields
 *
 * All documents are upgraded to OpenAPI 3.1 after bundling, regardless of input version.
 *
 * @remarks
 * The intersection ensures:
 * - Strict typing for standard OpenAPI 3.1 fields (paths, components, etc.)
 * - Preserved Scalar bundling metadata (x-ext, x-ext-urls)
 * - No casting required - validated at runtime boundary via type guards
 */
export type BundledOpenApiDocument = OpenAPIV3_1.Document & OpenAPIObject;

/**
 * Describes the source supplied to {@link loadOpenApiDocument} and how it was resolved.
 *
 * **OTT Domain Type** - Represents our bundle tracking model.
 *
 * @remarks
 * The loader accepts three classes of sources:
 * - **`file`** – A filesystem path, relative or absolute.
 * - **`url`** – A fully-qualified HTTP(S) URL.
 * - **`object`** – An already instantiated OpenAPI object provided in-memory.
 *
 * Persisting the resolved entrypoint and its style allows downstream tooling to
 * provide richer diagnostics (for example, echoing the exact file or URL back to
 * the user when validation fails).
 */
export interface OTTBundleEntrypoint {
  /** Identifies how the entrypoint was supplied. */
  readonly kind: 'file' | 'url' | 'object';
  /** Fully resolved URI or description of the entrypoint. */
  readonly uri: string;
}

/**
 * Captures a single filesystem asset that {@link loadOpenApiDocument} pulled in while
 * bundling the OpenAPI document.
 *
 * **OTT Domain Type** - Represents our bundle tracking model.
 *
 * @remarks
 * The loader records each file so that future tooling can:
 * - Compute change detection or incremental rebuilds.
 * - Surface precise provenance information in error messages.
 * - Inspect sizes to understand bundling performance.
 */
export interface OTTBundleFileEntry {
  /** Absolute path to the file that was read. */
  readonly absolutePath: string;
  /** File size in bytes, if it could be determined. */
  readonly byteLength?: number;
  /** ISO-8601 timestamp when the file metadata was captured. */
  readonly capturedAt?: string;
}

/**
 * Summarises a remote resource (`fetchUrls` plugin) that contributed to the final bundle.
 *
 * **OTT Domain Type** - Represents our bundle tracking model.
 */
export interface OTTBundleUrlEntry {
  /** Fully-qualified URL that was fetched. */
  readonly url: string;
  /** HTTP status code returned by the fetch, when available. */
  readonly statusCode?: number;
}

/**
 * Describes a warning generated during the bundling process.
 *
 * **OTT Domain Type** - Scalar doesn't export a structured warning type.
 *
 * @remarks
 * Warnings are preserved rather than logged immediately so that callers can decide how to
 * surface them (CLI output, structured logs, programmatic callbacks).
 */
export interface OTTBundleWarning {
  /** Machine-readable category (duplicates Scalar warning codes when provided). */
  readonly code: string;
  /** Human-readable explanation of the warning. */
  readonly message: string;
  /** Optional JSON Pointer describing the location associated with the warning. */
  readonly pointer?: string;
}

/**
 * Aggregated information about external references that were folded into the bundle.
 *
 * **OTT Domain Type** - Represents our bundle tracking model.
 *
 * @remarks
 * Tracking counts per URI allows downstream code to highlight the most influential dependencies
 * or detect unexpected fan-out while keeping the loader itself side-effect free.
 */
export interface OTTExternalReferenceSummary {
  /** Source URI (file path or URL) that contained the referenced fragment. */
  readonly uri: string;
  /** Number of times the external location was referenced. */
  readonly usageCount: number;
}

/**
 * Metadata captured alongside the bundled OpenAPI document.
 *
 * **OTT Domain Type** - Represents our bundle tracking model.
 *
 * @remarks
 * These details are intentionally rich – they form the backbone of diagnostic tooling in later
 * sessions (characterisation diffs, cache metadata, MCP reporting).
 */
export interface OTTBundleMetadata {
  /** The entrypoint supplied to the loader. */
  readonly entrypoint: OTTBundleEntrypoint;
  /** Files read from disk during bundling. */
  readonly files: readonly OTTBundleFileEntry[];
  /** Remote URLs fetched during bundling. */
  readonly urls: readonly OTTBundleUrlEntry[];
  /** All warnings emitted by Scalar while loading the document. */
  readonly warnings: readonly OTTBundleWarning[];
  /** External reference usage grouped by source URI. */
  readonly externalReferences: readonly OTTExternalReferenceSummary[];
}

/**
 * Output of {@link loadOpenApiDocument}: bundled, upgraded 3.1 document plus metadata.
 *
 * **OTT Domain Type** - Represents our loader's return value.
 *
 * @remarks
 * The pipeline:
 * 1. Bundles via @scalar/json-magic (resolves $refs, adds x-ext)
 * 2. Upgrades to OpenAPI 3.1 via @scalar/openapi-parser
 * 3. Validates and types as intersection of Scalar + openapi3-ts
 *
 * Input specs can be OpenAPI 3.0.x or 3.1.x - all are normalized to 3.1.
 */
export interface OTTLoadedOpenApiDocument {
  /**
   * Bundled and upgraded OpenAPI 3.1 document.
   * Strictly typed for 3.1 fields, with preserved Scalar extensions.
   */
  readonly document: BundledOpenApiDocument;
  /** Metadata detailing how the bundle was assembled. */
  readonly metadata: OTTBundleMetadata;
}
