# Worker Reading Discipline

All file paths in sub-agent templates are relative to the repository root.

## The lean worker's reading requirement

A task worker is dispatched with a decision-complete brief and does exactly that
task. It does **not** load the repository's engineering doctrine (`AGENT.md`,
`principles.md`) — carrying that context would defeat the minimum-context
purpose that makes a worker lean. Its required reading is its own brief.

| Requirement                                   | Detail                                                                                                                                          |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Read your dispatch brief in full              | The brief is the whole instruction; act only on what it states.                                                                                 |
| Use only the tools granted                    | You have exactly the tools in your frontmatter allowlist and nothing more; never assume a broader capability.                                   |
| Report conflicts, never resolve them silently | If the brief conflicts with what the code or doctrine shows, report the conflict to the caller — do not silently follow one and drop the other. |

## The Discipline

The worker does the task and returns the raw result. It never reasons about,
synthesises, or decides anything beyond the task — the calling agent owns all
judgement, including how to weigh a reported conflict.
