# Adversarially Verify Subagent Output

**All subagent work, responses, claims, and sources MUST be critically and
adversarially assessed before being accepted or used for any purpose whatsoever.**
(Owner directive, 2026-07-03 — standing rule. Operationalises
[PDR-125](../practice-core/decision-records/PDR-125-adversarial-verification-of-delegated-work.md),
which carries the portable pattern: acceptance means verified, and
loss-detection belongs to the context-holder alone.)

## Why

A subagent's report is a claim, not a fact. Subagents compress, miss, and
occasionally assert what they did not verify; a coordinating agent that accepts
reports at face value launders unverified claims into plans, doctrine, commits, and
owner-facing statements. This repo has a same-day instance: a survey agent's "the Practice
donor lacks plan templates" claim was false, was accepted, and propagated into another
repo's memory before the owner caught it.

## How to apply

1. **Verify checkable claims directly** before acting on them: counts, file
   existence, paths, quoted contents, "X does not exist" claims (an agent's
   not-found is a claim about its search, not about the world).
2. **Re-run reported proofs yourself** when accepting completion claims: gate runs,
   live-fire demonstrations, test results. A subagent's transcript of a passing
   command is hearsay until reproduced or independently evidenced (e.g. by running
   the same command).
3. **Spot-check edits** a subagent made: read representative output files against
   the brief; grep for contract violations (foreign references, forbidden patterns)
   rather than trusting the agent's own self-audit.
4. **Reviewer output is also subagent output.** A review verdict gets the same
   treatment — verify its factual findings before applying its fixes, and remember
   that reviewer approval is not immunity from standing owner doctrine (same-day
   instance: a reviewer praised event-gating the owner had already forbidden).
5. **Record the verification**, not just the acceptance: what was checked, how, and
   what was found wrong. A wrong subagent claim that is caught is a napkin entry;
   one that is accepted is a defect.
6. **Challenge the clean bills, not only the findings.** For review-shaped
   dispatches, run BOTH passes: verify what the reviewer flagged AND
   adversarially challenge what the reviewer waved through as sound. A
   verification layer scoped to positive findings leaves reviewer
   false-negatives structurally untouched. Worked instance (2026-07-05,
   WS3 roster analysis): adversarial verification confirmed 16/16 flagged
   findings while a separate challenge pass over the same reviewer's
   CONFIRMED-SOUND verdicts overturned five of them — each then
   re-verified first-hand before entering the ledger.

7. **Predecessor-handoff artefacts are subagent output too.** A handoff
   record, next-session brief, or continuity note from a prior session is
   evidence to RE-DERIVE against current reality, never truth to inherit —
   session succession is a delegation boundary in time. Worked instance
   (design-practice lane): a predecessor's completion claim was false; the
   successor's first-hand re-derivation caught it before it propagated.
   PDR-063's discontinuity-boundary validation step is the mechanical form.

Acceptance means _verified_, never _reported_. This rule composes with
`verify-dont-trust.md` (the general form) and applies it specifically to the
agent-delegation boundary, where the volume of generated claims is highest.
