/**
 * Pure session-shape resolver for the Claude Code statusline.
 *
 * @remarks
 * Answers, from already-gathered values, the glance questions the statusline
 * session-shape indicators render: *am I in a team, what shape is it, is
 * someone directing, and is a rapid (ArcAngel) channel live for me?*
 *
 * Truth sources are deliberately a small, HARD-BOUNDED read budget per tick:
 * the active-claims registry, the experiments-directory listing, and the
 * CONTENT of at most {@link ARC_CONTENT_READ_CAP} in-window channel files
 * (each capped at {@link ARC_CONTENT_BYTE_CAP} bytes) — the feather badges
 * constitutively need colour + roster from content, and the caps preserve
 * the original two-reads constraint's intent (no unbounded host load; the
 * window keeps the set tiny in practice). Channels beyond the cap surface
 * honestly as `overflow` badges, never silently. The comms corpus remains
 * structurally excluded from this path: the statusline ticks constantly and
 * the large-flat-directory scan class has a documented watcher body count.
 * The imperative adapter (`statusline-identity.ts`) gathers the inputs; this
 * module holds no I/O so the semantics are unit-testable over fixture
 * matrices.
 *
 * @packageDocumentation
 */

import {
  ARC_ACTIVE_WINDOW_SECONDS,
  ARC_PALETTE_SIZE,
  deriveArcRoster,
  isCrossHostChannelName,
  normaliseForFilenameMatch,
  parseArcChannel,
  resolveChannelColour,
} from '../arc/arc-channel-grammar.js';
import { isClaimStale } from '../collaboration-state/claims.js';
import {
  type CollaborationClaim,
  type CollaborationRegistry,
} from '../collaboration-state/types.js';

/**
 * One entry of the experiments-directory listing (ArcAngel rapid channels).
 * `name` is the channel path relative to the experiments directory (so
 * per-pair participant-bearing directory names participate in matching);
 * `mtimeIso` is the file's last-modified instant in ISO 8601 UTC.
 *
 * For channels inside the ARC activity window the gatherer also supplies
 * `content` (capped at {@link ARC_CONTENT_BYTE_CAP} bytes) so the resolver
 * can read the recorded colour and the on-channel roster; when it cannot,
 * `contentAbsent` says why — `beyond-cap` (the bounded read budget ran out;
 * renders as overflow) or `unreadable` (a read error; renders as invalid).
 * Out-of-window entries carry neither field.
 */
export interface ExperimentsEntry {
  readonly name: string;
  readonly mtimeIso: string;
  readonly content?: string;
  readonly contentAbsent?: 'beyond-cap' | 'unreadable';
}

/**
 * Bounded content-read budget: at most this many in-window channels get a
 * content read per tick (newest first); the byte cap bounds each read. Both
 * are asserted by the gatherer; the resolver treats budget breaches as the
 * defined `overflow` badge state.
 */
export const ARC_CONTENT_READ_CAP = 8;

/** Per-file byte cap for one channel content read. */
export const ARC_CONTENT_BYTE_CAP = 256 * 1024;

/**
 * Colour state of one channel badge — a closed shape. `indexed` carries the
 * recorded palette index; `invalid` is loud (missing, malformed, or
 * out-of-range colour, or an unreadable in-window file — regardless of file
 * date: the gate's dated strictness tiers govern FILE conformance, the badge
 * has no quiet grandfathered state); `overflow` marks a channel beyond the
 * bounded read budget. The cure for an invalid badge is one append-only
 * `Channel-colour: <index>` line on the channel.
 */
export type ArcBadgeColour =
  | { readonly kind: 'indexed'; readonly index: number }
  | { readonly kind: 'invalid' }
  | { readonly kind: 'overflow' };

/** One feather badge: an in-window channel this session participates in. */
export interface ArcChannelBadge {
  readonly name: string;
  readonly colour: ArcBadgeColour;
  /**
   * True when the channel is a cross-machine ARC guest window (PDR-138),
   * derived from the entry NAME alone via {@link isCrossHostChannelName} — so
   * it resolves even for `overflow`/`contentAbsent` entries, which carry no
   * content read. The marker is honest-by-convention: the window-open ceremony
   * mandates the `cross-host` basename token; nothing in the local substrate
   * can detect a cross-machine window, so the name is the carrier.
   */
  readonly crossHost: boolean;
}

/** Inputs for one session-shape resolution; all values explicit, no ambient state. */
export interface SessionShapeInputs {
  /** Own PDR-027 display name (e.g. "Monsoon guards Cirrus"); undefined when identity is unavailable. */
  readonly ownAgentName: string | undefined;
  /** Parsed active-claims registry; undefined when the read or parse failed. */
  readonly registry: CollaborationRegistry | undefined;
  /** Experiments-directory listing; undefined when the directory is absent or unreadable. */
  readonly experimentsListing: readonly ExperimentsEntry[] | undefined;
  /** The resolution instant, ISO 8601 UTC. */
  readonly nowIso: string;
}

/** Resolved coordination shape for one statusline tick. */
export interface SessionShape {
  /**
   * Own session role from the first fresh own claim (by registry array
   * position) that carries one; undefined when no fresh own claim names a
   * role. An agent holding several role-bearing claims mid-transition shows
   * the earliest-registered role until the older claim closes.
   */
  readonly ownRole: string | undefined;
  /**
   * Team shape, read relative to *this* session's membership — a session is
   * "in" a team only when it holds a fresh own claim. `unknown` means the
   * registry could not be read for this tick — the resolver does not claim a
   * confident shape it never saw, so the statusline shows no team icon
   * (distinct from `solo`, a confident peerless reading).
   *
   * For a readable registry the shape is resolved in two stages. First, the
   * membership gate: if this session holds **no** fresh own claim it is not a
   * team member, so the shape is `observing-directed` when a fresh claim
   * positively carries the director role (Director ruling 2026-07-10: the one
   * fact that changes a non-member's behaviour is that the estate is
   * DIRECTED — route via the Director, expect claims discipline),
   * `observing` when any *other* fresh claim exists (the quiet "others are
   * active here, you have not registered" glyph), or `solo` when the registry
   * holds no fresh claim at all. The directed variant is honesty-gated (T6
   * soft-degradation precedent): it requires a positively-read fresh
   * `role === "director"` claim — a missing role field or a stale director
   * claim degrades to the bare `observing`, and an unreadable registry is
   * already `unknown`; a false directed signal is never shown. An absent
   * identity cannot be matched to any claim, so it too falls through this
   * non-member gate. Second, for a registered session, in strict priority
   * order: `directed` (any fresh claim whose `role` is exactly the lowercase
   * string `director` — the schema's well-known values are lowercase by
   * convention and matching is case-sensitive) beats `peer` (two or more
   * distinct fresh identities) beats `solo`. A director active among *other*
   * agents while this session holds no claim reads as `observing-directed`,
   * not `directed`: it is not this session's directed team.
   */
  readonly teamShape: 'unknown' | 'solo' | 'peer' | 'directed' | 'observing' | 'observing-directed';
  /**
   * One badge per in-window rapid channel this session participates in —
   * membership is the UNION of the filename match (a channel opened FOR this
   * agent lights up before they post) and the on-channel entry-header roster
   * (a roster-accretion joiner the filename never names lights up too).
   * Ordered by channel name for a stable glance surface. Empty when no
   * channel is live for this agent or the listing was unreadable.
   */
  readonly arcChannels: readonly ArcChannelBadge[];
}

/**
 * The liveness window (how recently a channel must have been written to
 * count as live) is the protocol-level {@link ARC_ACTIVE_WINDOW_SECONDS},
 * imported from the ARC channel grammar — the single home for protocol
 * constants (consolidate-at-second-consumer; this module was the second
 * consumer of the private copy it previously declared).
 */

/**
 * Resolve the session's coordination shape from explicit inputs.
 *
 * Stale claims (per the registry's own {@link isClaimStale} predicate) are
 * invisible: a stale director claim does not shape the icon, and a stale own
 * claim carries no role. Missing inputs degrade soft but honestly: an
 * unreadable registry resolves to `unknown` (not a false `solo`), and an
 * unreadable listing reads as no ARC wing — the statusline never fails a tick
 * over an unreadable coordination surface, but it never claims a confident
 * team shape it could not read.
 */
export function resolveSessionShape(inputs: SessionShapeInputs): SessionShape {
  const arcChannels = resolveArcChannels(
    inputs.experimentsListing,
    inputs.ownAgentName,
    inputs.nowIso,
  );

  if (inputs.registry === undefined) {
    return { ownRole: undefined, teamShape: 'unknown', arcChannels };
  }

  const freshClaims = inputs.registry.claims.filter((claim) => !isClaimStale(claim, inputs.nowIso));

  return {
    ownRole: resolveOwnRole(freshClaims, inputs.ownAgentName),
    teamShape: resolveTeamShape(freshClaims, inputs.ownAgentName),
    arcChannels,
  };
}

function resolveOwnRole(
  freshClaims: readonly CollaborationClaim[],
  ownAgentName: string | undefined,
): string | undefined {
  if (ownAgentName === undefined) {
    return undefined;
  }
  // Own-claim match is by name alone — kept deliberately in lockstep with the
  // membership gate in resolveTeamShape. If one moves to the composite
  // name|prefix identity key, the other must move with it, or the role demark
  // and the team icon will disagree about whether this session is a member.
  return freshClaims.find(
    (claim) => claim.agent_id.agent_name === ownAgentName && claim.role !== undefined,
  )?.role;
}

function resolveTeamShape(
  freshClaims: readonly CollaborationClaim[],
  ownAgentName: string | undefined,
): SessionShape['teamShape'] {
  // Membership gate: a session is "in" a team only when it holds a fresh own
  // claim (matched by name — kept in lockstep with resolveOwnRole; see the note
  // there before changing either matcher). A non-member — including a session
  // with no resolved identity — reads the registry from the outside:
  // `observing-directed` when a fresh claim positively carries the director
  // role (Director ruling 2026-07-10; the check mirrors the member branch
  // below — honesty-gated, so a missing role or a stale director degrades to
  // the bare `observing`), `observing` when any other agent is live, else a
  // confident `solo`. This is what keeps a brand-new, unregistered session
  // from wearing a team icon it has not earned.
  const ownHasFreshClaim =
    ownAgentName !== undefined &&
    freshClaims.some((claim) => claim.agent_id.agent_name === ownAgentName);
  if (!ownHasFreshClaim) {
    if (freshClaims.length === 0) {
      return 'solo';
    }
    return freshClaims.some((claim) => claim.role === 'director')
      ? 'observing-directed'
      : 'observing';
  }

  if (freshClaims.some((claim) => claim.role === 'director')) {
    return 'directed';
  }
  // Identity is the PDR-027 tuple (name primary, prefix disambiguating):
  // one agent holding several claims contributes one identity. A session
  // restart that changes the prefix briefly reads as two identities (a
  // transient false peer) — accepted for a glance surface; do not "fix"
  // this to name-only keying, which would hide genuine same-name peers.
  const distinctIdentities = new Set(
    freshClaims.map((claim) => `${claim.agent_id.agent_name}|${claim.agent_id.session_id_prefix}`),
  );
  return distinctIdentities.size >= 2 ? 'peer' : 'solo';
}

/**
 * Which in-window channels deserve a content read under the bounded budget:
 * filename-member channels FIRST (membership is computable without content —
 * a seat must never lose its own channel's colour to unrelated newer
 * channels; the starvation scenario is a review-verified failure mode), then
 * the rest newest-first (the best available proxy for roster-only
 * membership, which is undetectable without content). Returns the names to
 * read, at most {@link ARC_CONTENT_READ_CAP}.
 */
export function rankArcContentReads(
  listing: readonly ExperimentsEntry[],
  ownAgentName: string | undefined,
  nowMs: number,
): ReadonlySet<string> {
  const ownNeedle =
    ownAgentName === undefined ? undefined : normaliseForFilenameMatch(ownAgentName);
  const inWindow = listing.filter((entry) => {
    const ageMs = nowMs - Date.parse(entry.mtimeIso);
    return ageMs >= 0 && ageMs <= ARC_ACTIVE_WINDOW_SECONDS * 1000;
  });
  const isMember = (entry: ExperimentsEntry): boolean =>
    ownNeedle !== undefined && normaliseForFilenameMatch(entry.name).includes(ownNeedle);
  return new Set(
    inWindow
      .toSorted((a, b) => {
        const memberDelta = Number(isMember(b)) - Number(isMember(a));
        return memberDelta !== 0 ? memberDelta : b.mtimeIso.localeCompare(a.mtimeIso);
      })
      .slice(0, ARC_CONTENT_READ_CAP)
      .map((entry) => entry.name),
  );
}

function resolveArcChannels(
  listing: readonly ExperimentsEntry[] | undefined,
  ownAgentName: string | undefined,
  nowIso: string,
): readonly ArcChannelBadge[] {
  if (listing === undefined || ownAgentName === undefined) {
    return [];
  }
  const ownNeedle = normaliseForFilenameMatch(ownAgentName);
  const nowMs = Date.parse(nowIso);
  const badges: ArcChannelBadge[] = [];
  for (const entry of listing) {
    // Age must fall within [0, window]. A future mtime (clock skew) yields a
    // negative age that would otherwise satisfy `<= window` and raise a false
    // badge; an unparseable mtime yields NaN, which fails both bounds.
    const ageMs = nowMs - Date.parse(entry.mtimeIso);
    if (!(ageMs >= 0 && ageMs <= ARC_ACTIVE_WINDOW_SECONDS * 1000)) {
      continue;
    }
    const parse =
      entry.content === undefined ? undefined : parseArcChannel(entry.name, entry.content);
    const filenameMember = normaliseForFilenameMatch(entry.name).includes(ownNeedle);
    const rosterMember =
      parse !== undefined &&
      deriveArcRoster(parse).some(
        (member) => normaliseForFilenameMatch(member.authorName) === ownNeedle,
      );
    if (!filenameMember && !rosterMember) {
      continue;
    }
    badges.push({
      name: entry.name,
      colour: resolveBadgeColour(entry, parse),
      crossHost: isCrossHostChannelName(entry.name),
    });
  }
  return badges.toSorted((a, b) => a.name.localeCompare(b.name));
}

function resolveBadgeColour(
  entry: ExperimentsEntry,
  parse: ReturnType<typeof parseArcChannel> | undefined,
): ArcBadgeColour {
  if (parse === undefined) {
    // In-window but content absent: the gatherer said why; an unnamed absence
    // is a gathering defect and reads loud (invalid), never quiet.
    return entry.contentAbsent === 'beyond-cap' ? { kind: 'overflow' } : { kind: 'invalid' };
  }
  if (parse.findings.some((finding) => finding.code === 'malformed-colour-line')) {
    return { kind: 'invalid' };
  }
  const colour = resolveChannelColour(parse);
  if (colour.kind === 'indexed') {
    return colour.index < ARC_PALETTE_SIZE ? colour : { kind: 'invalid' };
  }
  // No colour recorded: loud `invalid`, regardless of file date. The gate's
  // dated tiers govern file conformance; the badge carries no quiet
  // grandfathered state (no compatibility layers) — the cure is one
  // append-only Channel-colour line.
  return { kind: 'invalid' };
}

// Participant/name normalisation for channel matching is the grammar module's
// normaliseForFilenameMatch (imported above) — the single normalisation home.
