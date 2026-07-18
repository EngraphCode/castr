import { parse as parseYaml } from 'yaml';
import { z } from 'zod';

/** The two agent classes projected into platform-specific wrappers. */
export type AgentClass = 'reviewer' | 'worker';

/** The closed set of tools a worker may be granted, portable across every generated surface. */
const workerToolSchema = z.enum(['Read', 'Grep', 'Glob']);
export type WorkerTool = z.infer<typeof workerToolSchema>;

/** Canonical cross-platform projection metadata for one agent template. */
export interface AgentProjection {
  readonly agentClass: AgentClass;
  readonly tools: readonly WorkerTool[];
}

/** The posture of every template that declares no projection metadata. */
export const DEFAULT_REVIEWER_PROJECTION: AgentProjection = {
  agentClass: 'reviewer',
  tools: [],
};

const projectionSchema = z.discriminatedUnion('class', [
  z.strictObject({ class: z.literal('reviewer') }),
  z.strictObject({
    class: z.literal('worker'),
    tools: z.array(workerToolSchema).default([]),
  }),
]);

const templateMetadataSchema = z.looseObject({
  projection: projectionSchema.optional(),
});

const FRONTMATTER_PATTERN = /^---\r?\n(?<yaml>[\s\S]*?)\r?\n---(?:\r?\n|$)/u;

/**
 * Read strict projection metadata from a canonical agent template.
 *
 * Templates without projection metadata are reviewers by default. The
 * projection object is closed so misspelled capability keys fail loudly.
 */
export function readAgentProjection(templatePath: string, templateText: string): AgentProjection {
  const yaml = templateText.match(FRONTMATTER_PATTERN)?.groups?.['yaml'];
  if (yaml === undefined) {
    return DEFAULT_REVIEWER_PROJECTION;
  }

  let parsed: unknown;
  try {
    parsed = parseYaml(yaml);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`${templatePath}: invalid projection metadata — ${message}`, { cause: error });
  }

  const result = templateMetadataSchema.safeParse(parsed);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`${templatePath}: invalid projection metadata — ${details}`);
  }

  const projection = result.data.projection;
  return projection === undefined
    ? DEFAULT_REVIEWER_PROJECTION
    : {
        agentClass: projection.class,
        tools: projection.class === 'worker' ? projection.tools : [],
      };
}
