---
pdr_kind: governance
---

# PDR-126: Machine Identities for Agent Fleets — Split the Bypass-Holder from the Daily-Driver

**Status**: Accepted (owner-directed and owner-walked, 2026-07-04; first
phenotype landed the same day)
**Date**: 2026-07-04
**Related**:
[PDR-125](PDR-125-adversarial-verification-of-delegated-work.md)
(verification discipline — the trust model this identity model serves);
[PDR-027](PDR-027-threads-sessions-and-agent-identity.md)
(session identity tuples — WHO an agent is in the Practice; this PDR is who
an agent is to the FORGE);
the host rule `identify-as-agent-under-shared-credentials.md` (the
behavioural workaround this model structurally retires).

## Context

Agents operating under a shared human credential inherit everything the
human can do — including any emergency bypass the human holds — and
everything they do is attributed to the human. Branch protection built on
such credentials protects against nothing the fleet does, and provenance
of agent actions is unrecoverable. A behavioural rule ("identify as an
agent in what you write") mitigates attribution but cannot touch
capability.

## Decision

A Practice-bearing organisation runs **two machine identities with
disjoint roles**:

1. **The bypass-holder (release tier).** One app-class identity holds the
   ONLY path through default-branch protection. It is used exclusively by
   automated release/deployment flows that mint short-lived tokens from
   its credentials inside CI. No human account and no agent identity
   carries bypass — including organisation admins, because under shared
   credentials an admin bypass silently extends to every agent acting as
   that admin.
2. **The daily-driver (agent tier).** A second, deliberately constrained
   app-class identity mints short-lived installation tokens for agent
   tooling (CLI, MCPs). Agents act as this identity's bot, with narrow
   write permissions, explicit repository scoping, and NO bypass: agent
   work goes through the same pull-request wall as humans.

**The permission split is the security model.** Neither identity is
sufficient alone; their disjointness is the point. Credentials live in
owner-controlled stores (env files outside version control, CI secret
stores); committed `.example` templates carry the shape and the minting
recipe so the model is reproducible without its secrets. Key material and
secret-store writes are handled only by the credential owner, never by an
agent.

## Consequences

- Branch protection means something in an agent-dense org: nothing the
  fleet does can touch the default branch outside a reviewed PR.
- Agent actions are attributed to the agent-tier bot identity, giving
  provenance for free and retiring identify-as-agent prose disclaimers
  where the tooling path is used.
- Emergency bypass is scoped to a workflow identity whose key the owner
  controls, not to a person whose credentials a fleet shares.
- Token lifetime (≈1 hour) bounds the blast radius of any leaked agent
  token.
- Cost: two apps to register (a manual, owner-clicked step — app-creation
  flows require the org admin's browser session), keys to custody, and a
  minting step in tooling.

## First phenotype

Landed in the resonance repo 2026-07-04 (see that repo's ADR-001 for the
concrete estate); the candidate register names the second adopter — an
org repo carrying both shared-credential exposure and an admin-bypass
ruleset this model corrects.
