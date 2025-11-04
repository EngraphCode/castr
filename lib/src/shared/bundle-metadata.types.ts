import type { OpenAPI } from '@scalar/openapi-types';

/**
 * Describes the source supplied to {@link loadOpenApiDocument} and how it was resolved.
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
export interface BundleEntrypoint {
  /** Identifies how the entrypoint was supplied. */
  readonly kind: 'file' | 'url' | 'object';
  /** Fully resolved URI or description of the entrypoint. */
  readonly uri: string;
}

/**
 * Captures a single filesystem asset that {@link loadOpenApiDocument} pulled in while
 * bundling the OpenAPI document.
 *
 * @remarks
 * The loader records each file so that future tooling can:
 * - Compute change detection or incremental rebuilds.
 * - Surface precise provenance information in error messages.
 * - Inspect sizes to understand bundling performance.
 */
export interface BundleFileEntry {
  /** Absolute path to the file that was read. */
  readonly absolutePath: string;
  /** File size in bytes, if it could be determined. */
  readonly byteLength?: number;
  /** ISO-8601 timestamp when the file metadata was captured. */
  readonly capturedAt?: string;
}

/**
 * Summarises a remote resource (`fetchUrls` plugin) that contributed to the final bundle.
 */
export interface BundleUrlEntry {
  /** Fully-qualified URL that was fetched. */
  readonly url: string;
  /** HTTP status code returned by the fetch, when available. */
  readonly statusCode?: number;
}

/**
 * Describes a warning generated during the bundling process.
 *
 * @remarks
 * Warnings are preserved rather than logged immediately so that callers can decide how to
 * surface them (CLI output, structured logs, programmatic callbacks).
 */
export interface BundleWarning {
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
 * @remarks
 * Tracking counts per URI allows downstream code to highlight the most influential dependencies
 * or detect unexpected fan-out while keeping the loader itself side-effect free.
 */
export interface ExternalReferenceSummary {
  /** Source URI (file path or URL) that contained the referenced fragment. */
  readonly uri: string;
  /** Number of times the external location was referenced. */
  readonly usageCount: number;
}

/**
 * Metadata captured alongside the bundled OpenAPI document.
 *
 * @remarks
 * These details are intentionally rich – they form the backbone of diagnostic tooling in later
 * sessions (characterisation diffs, cache metadata, MCP reporting).
 */
export interface BundleMetadata {
  /** The entrypoint supplied to the loader. */
  readonly entrypoint: BundleEntrypoint;
  /** Files read from disk during bundling. */
  readonly files: readonly BundleFileEntry[];
  /** Remote URLs fetched during bundling. */
  readonly urls: readonly BundleUrlEntry[];
  /** All warnings emitted by Scalar while loading the document. */
  readonly warnings: readonly BundleWarning[];
  /** External reference usage grouped by source URI. */
  readonly externalReferences: readonly ExternalReferenceSummary[];
}

/**
 * Output of {@link loadOpenApiDocument}: the raw Scalar document plus metadata describing how it was produced.
 *
 * @remarks
 * The Scalar representation maintains optional and extension-friendly typing, while metadata preserves bundling context.
 * Later stages in the pipeline will transform the document into a stricter `openapi3-ts` object once validation has run.
 */
export interface LoadedOpenApiDocument {
  /** Raw document returned by Scalar's `bundle()` API. */
  readonly document: OpenAPI.Document;
  /** Metadata detailing how the bundle was assembled. */
  readonly metadata: BundleMetadata;
}
