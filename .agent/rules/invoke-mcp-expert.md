# Invoke MCP Expert

Operationalises [ADR-129 (Domain Specialist Capability Pattern)](../../docs/architecture/architectural-decisions/129-domain-specialist-capability-pattern.md), [ADR-123 (MCP Server Primitives Strategy)](../../docs/architecture/architectural-decisions/123-mcp-server-primitives-strategy.md), and [ADR-141 (MCP Apps Standard as Only UI Surface)](../../docs/architecture/architectural-decisions/141-mcp-apps-standard-primary.md).

When changes touch castr's MCP output surface — the MCP Tools writer, emitted
tool definitions, or MCP protocol semantics — invoke the `mcp-expert`
specialist in addition to the standard gateway reviewer.

For planning or contract-review briefs, give the specialist the actual target
hosts named by the current plan and ask them to evaluate that target set, not a
generic MCP ecosystem.

## Trigger Conditions

Invoke `mcp-expert` when the change involves:

- MCP tool definitions castr emits (annotations, input schemas, descriptions,
  metadata) and the IR→MCP writer that produces them
- Tool input-validation semantics (e.g. `isMcpToolInput()`, zero-input tool
  shapes, `additionalProperties` handling at the tool boundary)
- MCP protocol version or specification changes affecting emitted definitions
- MCP SDK version upgrades or breaking changes
- Reviewer briefs that make host-support or tool-shape compatibility claims

## Non-Goals

Do not invoke `mcp-expert` for:

- Generic schema-transform correctness unrelated to the MCP output format
  (use the gateway reviewer and schema experts)
- Security exploitability assessment (use `security-expert`)
- castr product decisions that do not involve MCP protocol capabilities
- TypeScript type safety unrelated to MCP schemas (use `type-reviewer`)

## Target-Host Briefing Discipline

For castr MCP work, pin the target host set from the live plan. When the
controlling plan names specific hosts, say that explicitly in the brief
and reject hypothetical, legacy, or resource-less-host findings unless the
reviewer cites current evidence that a named target has that limitation.

Findings that require a tool fallback for a resource, an optional argument for a
closed prompt, or a handler bridge for an invented host capability are
design-shape findings. Verify the governing plan and host evidence before
absorbing them.

## Overlap Boundaries

- **Gateway reviewer** (`code-reviewer`): always invoke as the gateway.
  `mcp-expert` adds MCP-specific depth.
- **Schema experts** (`openapi-expert`, `zod-expert`, `json-schema-expert`):
  add when the MCP change interacts with their semantic surfaces.
- **`security-expert`**: add when MCP auth changes have exploitability implications.
- **`architecture-expert-fred`**: add when MCP changes affect package boundaries or ADR compliance.
- **`architecture-expert-wilma`**: add when transport lifecycle or retry patterns have resilience implications.

## Invocation

See `.agent/memory/executive/invoke-code-experts.md` for the full reviewer catalogue and invocation policy. The `mcp-expert` canonical template is at `.agent/sub-agents/templates/mcp-expert.md`.
