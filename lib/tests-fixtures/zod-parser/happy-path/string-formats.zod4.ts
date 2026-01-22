/**
 * Zod 4 Happy Path Fixtures — String Formats
 *
 * Contains valid Zod 4 string format expressions for parser testing.
 * All expressions use Zod 4 TOP-LEVEL functions, NOT method syntax.
 *
 * @module tests-fixtures/zod-parser/happy-path/string-formats
 */
import { z } from 'zod';

// =============================================================================
// String Format Functions (Zod 4 top-level functions)
// =============================================================================

/** z.email() - Email address validation */
export const EmailSchema = z.email();

/** z.url() - URL validation */
export const UrlSchema = z.url();

/** z.uuid() - UUID validation (any version) */
export const UuidSchema = z.uuid();

/** z.uuidv4() - UUIDv4 validation */
export const Uuidv4Schema = z.uuidv4();

/** z.uuidv7() - UUIDv7 validation */
export const Uuidv7Schema = z.uuidv7();

/** z.base64() - Base64 validation */
export const Base64Schema = z.base64();

/** z.base64url() - Base64URL validation */
export const Base64UrlSchema = z.base64url();

/** z.ipv4() - IPv4 address validation */
export const Ipv4Schema = z.ipv4();

/** z.ipv6() - IPv6 address validation */
export const Ipv6Schema = z.ipv6();

/** z.cidrv4() - IPv4 CIDR block validation */
export const Cidrv4Schema = z.cidrv4();

/** z.cidrv6() - IPv6 CIDR block validation */
export const Cidrv6Schema = z.cidrv6();

/** z.jwt() - JWT validation */
export const JwtSchema = z.jwt();

/** z.e164() - E.164 phone number format */
export const E164Schema = z.e164();

/** z.hostname() - Hostname validation */
export const HostnameSchema = z.hostname();

// =============================================================================
// ISO Date/Time Functions (Zod 4 namespace syntax)
// =============================================================================

/** z.iso.date() - ISO date string (YYYY-MM-DD) */
export const IsoDateSchema = z.iso.date();

/** z.iso.datetime() - ISO datetime string (UTC only in Zod 4) */
export const IsoDatetimeSchema = z.iso.datetime();

/** z.iso.time() - ISO time string (HH:MM:SS) */
export const IsoTimeSchema = z.iso.time();

/** z.iso.duration() - ISO duration string (P1D, PT1H, etc.) */
export const IsoDurationSchema = z.iso.duration();
