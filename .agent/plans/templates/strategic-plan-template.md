# Strategic-plan template

The why and the what: the outcome, the bet it serves, what success
looks like, and the tempo of the subtree. No implementation detail, no
todos. Copy, fill, delete the guidance. The ratification block opens
the frontmatter so sketch-vs-ratified is visible at the top of every
plan, always.

```markdown
---
id: <kebab-slug, stable forever>
node_type: strategic
name: <Human name>
overview: <One line: the outcome this node exists to reach.>
status: sketch
ratified_by: null
ratified_date: null
ratified_where: null
serves: <published strategic-choice ID from docs/strategy>
impact_areas:
  - <area from impact-areas.md>
gate_expiry_default: <ISO-8601 duration, e.g. P21D — the tempo this node sets for its subtree>
depends_on: []
owner_gates: []
tickets: []
last_updated: <YYYY-MM-DD>
---

# <Name>

## Outcome

<What is true in the world when this bet pays off — stated as an
observable state, not an activity.>

## The bet

<Why this outcome, why this way, and what we are deliberately not
doing instead.>

## Success looks like

<The evidence that would show the outcome reached — named honestly,
including what this node explicitly does not claim.>

## Delivery

Delivery plans serving this node declare `serves: <this-id>` —
enumerate them by search, never by a hand-kept list. Milestones live
in Linear as named observable states; this node points at them, never
mirrors them.
```
