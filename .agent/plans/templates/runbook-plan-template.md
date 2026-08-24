# Runbook-plan template

A repeatable operational procedure (a production promotion, a
migration, a recurring ceremony). Long-lived; procedure changes return
it back to `current/` for re-approval. Copy, fill, delete the guidance.

```markdown
---
title: <Human name — the repeatable operational procedure>
status: current
lane: current
created: <YYYY-MM-DD>
last_updated: <YYYY-MM-DD>
owner_directive: >-
  <The owner words or standing doctrine that authorises this procedure.>
---

# <Name>

## When to run

<The trigger or cadence.>

## Preconditions

<What must already be true before step 1 — each item checkable, with
the check named.>

## Steps

<Numbered. Each step names WHO executes it — `agent` or `owner-held`.
An owner-held step surfaces as a visible owner card at the moment it
becomes actionable, never an ambient queue item — and names the
verification that proves it happened.>

## Verification

<How the end state is confirmed, with the instrument named.>

## Rollback

<The path back from every step that changes shared state. A step with
no rollback is named as such, with the owner's explicit acceptance
dated.>
```
