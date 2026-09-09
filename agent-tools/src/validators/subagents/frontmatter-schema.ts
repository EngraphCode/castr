import path from 'node:path';
import { parseDocument } from 'yaml';
import { z } from 'zod';
import { cricketRole, supportsReviewer } from '../../core/reviewer-adapter-platform-contract.js';

/** Markdown harnesses whose reviewer contracts are validated here. */
export type SubagentPlatform = 'claude' | 'cursor';

const text = z.string().trim().min(1);
const toolList = z
  .union([text, z.array(text).min(1)])
  .transform((value) =>
    (typeof value === 'string' ? value.split(',').map((tool) => tool.trim()) : value).toSorted(),
  );
const claudeSchema = z.strictObject({
  name: text,
  description: text,
  model: text,
  effort: text.optional(),
  tools: toolList,
  disallowedTools: toolList,
  permissionMode: z.literal('plan').optional(),
});
const cursorSchema = z.strictObject({
  name: text,
  description: text,
  model: text.optional(),
  readonly: z.literal(true),
});

/** Validate parsed external YAML against the installed reviewer contract, not the full vendor API. */
function validateFrontmatter(platform: SubagentPlatform, file: string, input: unknown): string[] {
  const result =
    platform === 'claude' ? claudeSchema.safeParse(input) : cursorSchema.safeParse(input);
  if (!result.success) {
    return result.error.issues.map(
      (issue) => `${file}: frontmatter ${issue.path.join('.')} ${issue.message}`,
    );
  }
  const value = result.data;
  const issues: string[] = [];
  const role = cricketRole(value.name);
  if (value.name !== path.basename(file, '.md'))
    issues.push(`${file}: frontmatter name must match filename`);
  if (!supportsReviewer(value.name, platform)) issues.push(`${file}: unsupported ${platform} role`);
  if (platform === 'cursor') {
    if (role && value.model !== undefined)
      issues.push(`${file}: Cursor Cricket model must be unpinned`);
    if (!role && (!value.model || ['auto', 'fast'].includes(value.model)))
      issues.push(`${file}: ordinary Cursor reviewer requires a model`);
  }
  if ('tools' in value) {
    const expectedTools = role
      ? ['Read']
      : ['Read', 'Grep', 'Glob', 'Bash', 'WebFetch', 'WebSearch'];
    const expectedDenied = role
      ? ['Write', 'Edit', 'Bash', 'Grep', 'Glob']
      : ['Write', 'Edit', 'NotebookEdit'];
    if (JSON.stringify(value.tools) !== JSON.stringify(expectedTools.toSorted()))
      issues.push(`${file}: tools must preserve the reviewer safe posture`);
    if (JSON.stringify(value.disallowedTools) !== JSON.stringify(expectedDenied.toSorted()))
      issues.push(`${file}: disallowedTools must preserve the reviewer safe posture`);
    if (role && (value.model !== role.claudeModel || value.effort !== role.effort))
      issues.push(`${file}: Cricket model and effort must match its registered role`);
    if (!role && value.permissionMode !== 'plan')
      issues.push(`${file}: ordinary Claude reviewer requires permissionMode plan`);
    if (!role && value.effort !== undefined)
      issues.push(`${file}: ordinary Claude reviewer must retain its default effort`);
  }
  return issues;
}

/**
 * Validate a Markdown reviewer's platform metadata and template-loading instruction.
 *
 * @param platform - Harness whose installed reviewer contract applies.
 * @param file - Wrapper path used for filename identity and diagnostic context.
 * @param content - Full Markdown source, including its leading YAML frontmatter.
 * @returns File-scoped issues and template paths found in the instruction body.
 * Missing/malformed frontmatter and contract violations are returned as issues;
 * metadata never satisfies the required body instruction. Referenced files are
 * not read here, so callers must separately verify their existence.
 * @throws If YAML conversion rejects an unresolved alias or excessive alias expansion.
 * @example
 * ```typescript
 * const result = validateMarkdownWrapper('cursor', adapterPath, adapterSource);
 * if (result.issues.length > 0) throw new Error(result.issues.join('\n'));
 * ```
 */
export function validateMarkdownWrapper(
  platform: SubagentPlatform,
  file: string,
  content: string,
): { issues: string[]; templatePaths: string[] } {
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u.exec(content);
  const block = frontmatter?.[1];
  if (frontmatter === null || block === undefined)
    return { issues: [`${file}: missing YAML frontmatter block`], templatePaths: [] };
  const document = parseDocument(block, { uniqueKeys: true });
  if (document.errors.length > 0)
    return {
      issues: document.errors.map((error) => `${file}: invalid YAML frontmatter: ${error.message}`),
      templatePaths: [],
    };
  const issues = validateFrontmatter(platform, file, document.toJS());
  const body = content.slice(frontmatter[0].length);
  const templatePaths = [
    ...body.matchAll(/Your first action MUST be to read and internalise `([^`]+)`\./gu),
  ]
    .map((match) => match[1])
    .filter((value): value is string => value !== undefined);
  if (templatePaths.length !== 1)
    issues.push(`${file}: exactly one required template loading line is required`);
  const role = cricketRole(path.basename(file, '.md'));
  for (const template of templatePaths) {
    if (!/^\.agent\/sub-agents\/templates\/[a-z0-9-]+\.md$/u.test(template))
      issues.push(`${file}: template path must be inside .agent/sub-agents/templates`);
    if (role && template !== role.templatePath)
      issues.push(`${file}: Cricket template must match ${role.templatePath}`);
  }
  return { issues, templatePaths };
}
