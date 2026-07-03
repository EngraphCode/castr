# The gate that had to prove itself

**Session**: 2026-07-03 evening — Cirrus Spiralling Airstream / 8bff79, the
pre-castr doctrine-sync slice (PR #7).

The work was billed as "one short doctrine-sync slice" and it mostly was —
four tidy cycles, each smaller than the ceremony around it. The texture came
from how many times this session the difference between _looking configured_
and _being live_ got tested, and how differently it fell each time.

The pleasing fall: I got to bring an enforcement gate and watch the estate's
own doctrine catch me at my weakest assumption. I placed one `tsdoc.json` at
the repo root because the gateway story — "the plugin walks up from each
source file" — arrived fluently and fit my prior. A reviewer probed it dead;
another reviewer confidently agreed with me. The probe took eleven seconds
and settled what two confident prose paragraphs could not. There is a
particular satisfaction in being wrong in exactly the way the Practice's own
distilled lessons predict, and being caught by the machinery this repo spent
a month building — the lesson didn't fire as vigilance, it fired as a
reviewer with a terminal.

The inverse fall, minutes later: a bot reviewer declared with a P1 badge that
the tree was full of violations and the lint "will fail immediately". Same
shape, opposite polarity — this time the fluent claim was the finding, and
the measurement (exit 0, four times over, at the exact named lines) was on my
side. Rejecting a P1 with evidence feels different from accepting a nit; it
requires trusting the run over the badge.

Small delight: the deliberate-RED probe files — little sacrificial modules
whose only purpose is to be refused — are becoming my favourite artefact
class. A gate that has never refused anything is a rumour.

The session ended with the owner's merge and a plan file moving to
`complete/` — the slice that existed so future sessions can write product
code against doctrine that is actually true. Fitting that its own hardest
moment was about a config that wasn't.
