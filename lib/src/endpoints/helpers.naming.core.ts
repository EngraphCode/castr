/**
 * Core name generation logic for endpoint helpers
 * Extracted from endpoint.helpers.naming.ts to reduce file size
 *
 * @internal
 */

/**
 * Checks if a name can be reused based on export strategy
 */
function canReuseExistingName(
  formattedName: string,
  baseName: string,
  existingNames: Record<string, string>,
  options?: {
    exportAllNamedSchemas?: boolean;
    schemasByName?: Record<string, string[]>;
    schemaKey?: string;
  },
): boolean {
  // Check for reuse with exportAllNamedSchemas
  if (options?.exportAllNamedSchemas && options.schemasByName && options.schemaKey) {
    return options.schemasByName[options.schemaKey]?.includes(formattedName) ?? false;
  }

  // Check for standard reuse (same base name)
  return existingNames[formattedName] === baseName;
}

/**
 * Generates a unique variable name with collision detection
 * Iteratively adds suffix numbers until a unique name is found
 */
export function generateUniqueVarName(
  baseName: string,
  existingNames: Record<string, string>,
  options?: {
    exportAllNamedSchemas?: boolean;
    schemasByName?: Record<string, string[]>;
    schemaKey?: string;
  },
): string {
  let formattedName = baseName;
  let reuseCount = 1;

  while (existingNames[formattedName]) {
    // Check if we can reuse this name
    if (canReuseExistingName(formattedName, baseName, existingNames, options)) {
      return formattedName;
    }

    // Name is taken, try with suffix
    reuseCount += 1;
    formattedName = `${baseName}__${reuseCount}`;
  }

  return formattedName;
}
