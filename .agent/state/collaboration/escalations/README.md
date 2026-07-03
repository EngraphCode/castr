# Owner Escalations

This directory holds one JSON file per live owner-facing escalation.

Escalations are unresolved case records, not durable decision authority. Every
escalation must point to a conversation file and an originating entry. If no
conversation exists yet, create the conversation first. When the owner resolves
the case, write the durable result back into the conversation as a `decision`,
`joint_decision`, or `resolution` entry, then close the escalation by referencing
that conversation entry.

The schema authority is
[`escalation.schema.json`](../../../../agent-tools/src/collaboration-state/schemas/escalation.schema.json)
(committed source — schemas were decoupled from the runtime data plane in WS7).
Worked examples and fixtures live in the `@engraph/agent-tools` test suite
(`agent-tools/tests/collaboration-state/`).

This directory is seeded empty — no escalation records are carried over from
upstream.
