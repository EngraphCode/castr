/**
 * Warning emission helpers for endpoint definition extraction
 * Extracted from getEndpointDefinitionList.ts to reduce file size
 *
 * @internal
 */

import type { TemplateContext } from '../context/template-context.js';
import { logger } from '../shared/utils/logger.js';

/**
 * Emit warnings for ignored responses
 * Pure function: logs conditional warnings based on configuration
 *
 * @returns void (side effect: logger warnings)
 */
export function emitResponseWarnings(
  ignoredFallbackResponse: string[],
  ignoredGenericError: string[],
  options?: TemplateContext['options'],
): void {
  if (options?.willSuppressWarnings === true) {
    return;
  }

  if (ignoredFallbackResponse.length > 0) {
    logger.warn(
      `The following endpoints have no status code other than \`default\` and were ignored as the OpenAPI spec recommends. However they could be added by setting \`defaultStatusBehavior\` to \`auto-correct\`: ${ignoredGenericError.join(
        ', ',
      )}`,
    );
  }

  if (ignoredGenericError.length > 0) {
    logger.warn(
      `The following endpoints could have had a generic error response added by setting \`defaultStatusBehavior\` to \`auto-correct\` ${ignoredGenericError.join(
        ', ',
      )}`,
    );
  }
}
