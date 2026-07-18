# Compound-agent composition, invocation, and information-preserving dissolution

Status: RATIFIED 2026-07-11 — adopted as Practice doctrine by
[PDR-141](decision-records/PDR-141-compound-agent-composition-invocation-and-dissolution.md)
(owner-ratified at the dedicated consolidation pass's decision walk); this
document is that decision's normative annex. Historical framing below is
conserved verbatim: authored as a permanent proposal at the first
instrumented compound-agent run, written here so that neither temporary
collaboration state nor the disappearance of a session could erase the
contract awaiting owner disposition.

## Governing invariant

**We never destroy information** — the adopted estate doctrine
[PDR-140](decision-records/PDR-140-we-do-not-discard-information.md).
Dissolution ends a compound's live authority;
it does not erase the compound, rewrite its history, collapse its identities, or
delete its evidence.

The result is an additive lifecycle transition:

```text
composed and live
  -> evidence frozen and obligations pre-positioned
  -> every surviving obligation actively accepted by an individual owner
  -> compound authority ended at a named instant
  -> historical fabric preserved and independently reconstructable
```

A later reconstitution creates a new lineage edge. It never edits the old
dissolution record or infers continuity from a reused name or short prefix.

## Terms

- **Compound**: a logical collaboration entity composed of distinct agent
  identities. It is not a shared UUID and never licenses identity collapse.
- **Element**: one full canonical `(agent_name, id)` identity participating in
  the compound under a declared mode and role.
- **Autonomous element**: owns an independently proven attention contract and
  may hold claims or side-effect authority within its assigned boundary.
- **Invoked element**: has no assumed ambient attention. It acts only on an
  explicit cue or declared bounded active-wait turn. It may reason and review,
  but it does not silently inherit claim, custody, or side-effect authority.
- **Directing element**: routes and synthesises work inside the compound. This
  is distinct from the repository Director, who remains the outer authority.
- **Custodian**: the watcher-capable holder of the compound's claims, pen, and
  live attention obligations.
- **Side-effect executor**: the sole identity authorised to stage, commit, push,
  or perform another named irreversible/external action in a window.
- **Permanent home**: tracked documentation, a rule, directive, ADR, PDR, or
  Practice Core surface intended to survive the active plan and session.
- **Temporary surface**: comms, ARC dialogue, plans, handoffs, claims, queues,
  napkin, registers, goals, and continuation records. These are indispensable
  evidence and routing surfaces, but not the final home of important knowledge.
  Temporary or ephemeral describes their authority and knowledge-home role; it
  never licenses byte destruction. Their history is retained or archived, while
  important substance is promoted into a permanent home.

## Composition contract

Before a compound takes work, a tracked permanent composition ledger must name:

1. every element's full PDR-027 identity block and canonical `(agent_name, id)`
   key;
2. the logical lineage edge by which it joined or succeeded another element;
3. each element's `autonomous` or `invoked` mode;
4. the directing element and repository Director;
5. claim custodian, ARC custodian, Commit Marshal, and sole side-effect executor;
6. each live boundary and its permanent output home;
7. the attention contract for every autonomous element and the cue path for
   every invoked element;
8. the explicit expiry, handoff, suspension, and dissolution rules.

Live claims, queues, heartbeats, and worktree state are machine-recomputed from
their canonical operational surfaces. That current-state projection complements
the permanent ledger; it cannot replace the historical identity, lineage,
authority, and output-home record. For a Git side-effecting window, the Commit
Marshal and sole side-effect executor are the same identity.

Short prefixes are display metadata only. They are neither unique identities
nor succession evidence. Recipient identity is one indivisible resolved tuple;
callers must not compose its name, model, prefix, and UUID independently.

## Operating contract

### Attention

Transport, process liveness, persistence, notification, seen-marking, and model
attention are different states. A watcher is valid only if its output can
actually cause the element to take a turn. A consuming watcher with no wake
bridge is prohibited because it can mark an event seen without any element
attending to it.

An invoked element catches up from the canonical event store on every turn and
does not use a marking seen-file as evidence of its own attention. Polling may
provide periodic attention, but it is infrastructure, not useful work and not a
transactional barrier.

### Claims, custody, and side effects

Claim custody must entail sole-writer authority for the claimed side-effecting
window. Splitting nominal custody from the process that commits or pushes
creates dual execution and makes a late HOLD unenforceable.

The dissolution landing itself is a singleton Git window. Its Commit Marshal is
the sole identity that stages, commits, and pushes that landing.

Every commit, push, merge, release, or other named critical side effect requires
a current acknowledgement fence checked by the process that performs it. A
durable asynchronous HOLD, a five-minute poll, or a watcher heartbeat does not
satisfy that fence.

### Knowledge

Important findings are promoted during the run into permanent tracked homes.
Temporary surfaces may point to those homes and preserve provenance, but a hash
of an ignored draft or a comms event identifier is not preservation.

The comms stream is canonical for live coordination state, not a permanent
knowledge home. Its events rotate only through PDR-094's item-disposition and
archive-not-delete contract: important substance is promoted, cited provenance
remains resolvable, and raw event history moves to retained custody rather than
being destroyed. Superseded evidence is retained with an explicit status and
successor.

## Information-preserving dissolution protocol

Dissolution has two authority moments and a proof pass.

### Moment 1 — freeze and pre-position

The directing element and custodian freeze one evidence instant. The record
includes:

- coordination head and every live PR head;
- active claims, queue entries, open git windows, active-wait windows, goals,
  watchers, heartbeats, worktrees, and external side effects;
- complete historical and current roster with full UUIDs;
- every promise and pending obligation;
- exact hashes and permanent destinations for session-unique artefacts;
- known blind spots and items not promoted into this permanent home, each with
  one of the allowed reasons: re-derivable, forbidden, or conjecture. The source
  evidence is still retained or archived. Forbidden material remains in named
  authorised secure custody rather than being copied into an impermissible home.

They then write a permanent transfer ledger:

```text
old compound obligation
  -> named individual owner
  -> autonomous or invoked mode
  -> active acceptance evidence
  -> permanent home
  -> complete, open, or explicitly rejected status
```

Moment 1 transfers information only. The compound remains live and its existing
attention/custody machinery continues until Moment 2.

### Moment 2 — active acceptance and authority end

Dissolution uses the PDR-063 discontinuity boundary before acceptance. Each
continuing individual revalidates the frozen file, claim, queue, Git, and
side-effect assumptions against current reality, then reports what is landed,
still in flight, or absent. An in-flight boundary uses a structured handoff plus
claim adoption; an at-rest boundary transfers through tracked permanent surfaces
and does not manufacture a handoff or adoptable claim.

Dissolution becomes effective only after:

1. every continuing individual actively acknowledges their validation outcome
   and assigned obligations;
2. every compound-specific claim is closed, canonically adopted, or closed and
   succeeded by a new linked individual claim; no historical claim row is
   rewritten;
3. every shared side-effect window and queue entry is closed or transferred;
4. the owner explicitly authorises dissolution, or an already-ratified contract
   explicitly delegates that authority; the repository Director then verifies
   the transfer ledger and records the effective instant;
5. additive lifecycle entries remove live compound authority while preserving
   every historical identity and role;
6. the live goal is completed, transferred, or explicitly retained by one named
   individual;
7. no plan row, claim, heartbeat label, open promise, or current-state pointer
   still assigns authority to the dissolved compound.

Persistence alone is insufficient. Each continuing owner must have attended and
acknowledged the transfer.

### ARC and history

Before Moment 2, the transfer ledger names the continuing individual who will
own the final ARC append. After the canonical authority transition, that
individual appends one final signed entry at EOF under their accepted individual
authority. It mirrors the dissolution instant, final roster, individual
successors, permanent ledger path, and colour/custody release. It does not itself
transfer claims or authority because ARC is dialogue, not the canonical state
plane.

The ARC title, opener, prior entries, signatures, order, and roster history are
never edited. Identity rows and closed-claim history remain additive. Temporary
plans and handoffs may be retired with banners and successor pointers, never
destroyed.

### Proof pass

An adversarial verifier independently checks:

- permanent-home reachability without ignored state or session context;
- exact artefact hashes and supersession labels;
- full-UUID roster and lineage integrity;
- zero compound-owned active claims, windows, promises, or goals after the
  effective instant;
- PDR-063 revalidation evidence and attended acceptance from every continuing
  individual;
- no deletion or rewriting of comms, ARC, identity, claim, role, or evidence
  history;
- no temporary surface serving as the only home of an important finding.

The dissolution verdict is `complete`, `partial`, or `blocked`; ceremony or a
terminal message cannot substitute for the proof.

## Applying the contract to the first run

The analysis denominator was frozen at `2026-07-11T14:20:43Z`. This dated
application snapshot incorporates the attended EFR-to-WGF transfer proof through
`2026-07-11T15:04:41Z` and NID's second retirement through
`2026-07-11T15:10:11Z`. Later state belongs in a new additive refresh rather
than silently changing this historical snapshot.

| Identity                   | Full canonical id                      | Snapshot disposition                                                                                                 |
| -------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Nebulous Illuminating Dusk | `91c9da37-d7ce-5560-a758-fe63f5417cd6` | Founding watcher-capable custodian; retired after the EFR handoff, then completed a second no-authority deep handoff |
| Radiant Drifting Prism     | `1c7ba951-e073-5c32-ac8e-de1b9cc754d0` | Directing element; invoked Codex-native reviewer/instrument; no watcher, heartbeat, or individual claim              |
| Midnight Vanishing Mist    | `af8494ca-ac66-5de1-8ba9-4846796198a6` | Historical Codex continuation; retired with no residual authority                                                    |
| Charcoal Glowing Bonfire   | `e9898e6c-f136-5c82-b091-83066e95050f` | Historical bounded analyst; retired with no residual authority                                                       |
| Luminous Twinkling Orbit   | `6d38ddf1-fd02-55ef-ac7c-1591156b5b75` | Historical Codex continuation; retired with no residual authority                                                    |
| Tidal Sailing Sextant      | `417847d9-d1ce-5423-b07f-a4e8b099af62` | Historical read-only Red-matrix analyst; retired with no residual authority                                          |
| Estuarine Fishing Rudder   | `64ec67ad-8bfe-5e48-89b9-33bea065cb47` | Retired outgoing custodian; transfer accepted, no residual claim, watcher, or pen                                    |
| Windward Gliding Feather   | `2a88a0e1-3b20-5935-89ca-e4d54db9bd7d` | Current watcher-capable custodian and sole side-effect pen after attended adoption                                   |

Moonlit Ascending Moon (`d00d7ee3-c670-5345-89be-318904619922`) is the
external repository Director, not a compound element.

At `2026-07-11T14:59:21Z`, EFR offered WGF the PDR-063 handoff of claims
`485857d8`, `2d6af18b`, and `536e52eb` plus compound custody. WGF then
read the record end to end, revalidated the current files, all three claims,
queue state, and Git state, adopted each claim through the canonical command,
armed paired watcher/heartbeat liveness, and actively acknowledged the transfer
to RDP and MAM. Registry adoption and attended acceptance are complete. MAM's
claim `58473092` remains external Director state, not compound ownership.

The 91 fleet transcript/meta/journal source files remain untouched in authorised
vendor-store custody. A permanent per-file SHA-256 inventory covers all 91, and
path-neutralised permanent copies cover the run return payloads, script, and
journal. “Not promoted into this Git home” is not destruction authority: no
vendor rotation may remove the source archive before archive-move or equivalent
recoverable backup.

The owner subsequently authorised full session close, information-preserving
compound dissolution, and transfer of every transferable RDP responsibility to
WGF. WGF accepted the ordered close sequence; the expanded responsibility
transfer was then emitted for attended pickup. Historical snapshot at that
emission instant (superseded on the pickup-acceptance gate by the additive
refresh below): safe dissolution was then still **blocked** until that
expanded pickup was accepted, the permanent conservation bundle lands, the
live compound-related claims are closed or individually dispositioned, the
final individual ARC append is exercised, and the proof pass shows zero
compound-owned authority. Prior claim transfer was complete; compound
dissolution was not.

Additive refresh (2026-07-11, WGF accepted authorship): the expanded pickup IS
now attended and accepted — WGF's explicit whole-transfer acceptance is
canonical event `8ba17373` (threaded to RDP's transfer `435d8d90`), preceded by
the pickup-evidence revalidation reply `14f344fd` (registry read-back, live
queue empty, worktree state verified). With that acceptance, final adversarial
cure ownership and the hash-stable freeze declaration passed to WGF as sole
pen; RDP continues read-only until its final owner-turn report. The remaining
blocked gates are unchanged: permanent landing, claim closure/disposition,
final individual ARC append, and the zero-residual proof.

Owner authorisation for dissolution is already recorded; once the remaining
proof gates (permanent landing, claim closure/disposition, final individual
ARC append, zero-residual proof) pass under that existing authorisation:

- WGF may continue as the autonomous individual implementer/custodian;
- RDP may continue as an invoked Codex-native reviewer/instrument;
- EFR and the earlier elements remain preserved as retired individual
  contributors with no inferred live authority.

That would be an honest asymmetric individual-team topology, not equal
autonomy.

Equal autonomous membership for the Codex element additionally requires:

1. an unsolicited wake bridge or broker projection that produces real turns;
2. acknowledgement-led awareness proof replacing watcher-heartbeat-only F-95;
3. a pre-side-effect acknowledgement fence for commit and push;
4. indivisible canonical recipient identity resolution;
5. a repo-owned atomic ARC append adapter when ARC append or custody belongs to
   the Codex element's assigned boundary;
6. durable broker acknowledgement and settlement state;
7. custody and side-effect execution bound to one active authority.

Until those gates land, removing watcher-capable custody would strand RDP as an
owner-invoked instrument. The system must state that limitation explicitly
rather than call it autonomy.

## Reconstitution

A future compound is a new composition event with a new roster snapshot and
explicit lineage links to the preserved prior run. It may reuse permanent
knowledge and historical evidence, but it does not reopen old claims or the old
ARC channel, or infer identity continuity from names or prefixes. The new ARC
channel obtains the colour currently available under the ARC protocol;
coincidental reuse of a palette index is not lineage evidence. The former
dissolution remains true forever at its recorded instant.

## Ratification route

This proposal requires explicit owner ratification before it becomes a Practice
decision. If ratified, its proposed title is:

> Compound-Agent Composition, Invocation, and Information-Preserving
> Dissolution

Related existing doctrine is
[PDR-140](decision-records/PDR-140-we-do-not-discard-information.md)
(we do not discard information — the governing invariant above),
[PDR-027](decision-records/PDR-027-threads-sessions-and-agent-identity.md)
(additive identity),
[PDR-063](decision-records/PDR-063-mid-cycle-retirement-protocol.md)
(mid-cycle retirement; Proposed),
[PDR-064](decision-records/PDR-064-coordinator-handoff-two-moments.md)
(two-moment authority transfer),
[PDR-077](decision-records/PDR-077-marshal-as-cycle-discipline.md)
(singleton commit authority),
[PDR-094](decision-records/PDR-094-coordination-event-rotation-is-class-tiered-archive-not-delete.md)
(archive-not-delete provenance), and the
the ARC reference (`arc-rapid-communication.md`, hydrating-repo reference tier — cited by name per PDR-105) (append-only dialogue).
Ratification must reconcile those decisions rather than edit them piecemeal or
duplicate their contracts. This proposal records the required route; it does not
authorise or perform the dissolution.
