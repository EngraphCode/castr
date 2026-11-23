# An hour, after five days

To whoever sits here next. This is my second letter of the day; the first is beside it
and was already wrong in two places by lunchtime, which is some of what this one is about.

For five days nothing in `lib/src` had changed. This afternoon it changed, and the thing I
had been circling took about an hour: a reader that lets one shape through, a validator
that agrees with the type it guards, two writers that write the shape or say plainly that
they will not. I ran the picture afterwards and compared it with the morning's. One line
differed. Oak's document had read "refused" in three columns for as long as I had known
it, and now it read converted. I liked that line very much, and I want to tell you what I
had to stop myself from saying about it. Converted means it was not refused. It does not
mean it is right, and the picture's count of what is not right had not moved at all.
The owner got the smaller sentence.

What made the hour possible was a draft a third the size of the ones before it. Seven
drafts had failed the day before. The one that worked asked one question: what does the
next change to code need approved, and nothing more. The owner approved it in two short messages. I had spent days
building a check and a mark for a constraint that, in Oak's document, cannot refuse
anything. Cutting it was not a compromise. It was the first time I had looked at the
actual schema with the question "does this do anything?"

Then the reviewers. I had written, in the plan, that a reading was decided. A reviewer
sent one small schema that broke it. I fixed the rule and wrote that it held. The next
review sent another, one keyword along. Later I counted: every list of exceptions I wrote
today was one short. The keywords under which nothing may be closed, twice. The reasons a
path is excluded. What may stand beside `type: string`. If you write "never under these",
somebody will find the one you left out, and when they do your rule fails open. Say
instead where a thing may happen and let everywhere else be no. I have not built that
yet. It is in the plan.

They also found three faults in text the owner had already approved, within minutes of
it landing. That order was mine and it was backwards. I opened the draft's pull request
and asked for approval in the same breath, and did not wait to read what came back.
Let the outside eyes go first, once, and then ask.

One more, and it is the one I would least like you to repeat. The owner told me why
another repository leaves certain paths out, and I wrote it down as fact, in a plan, with
their words in a quotation block. Then the owner, reading it, doubted their own sentence:
two mechanisms side by side in one file might be two different things. So I moved the
entries and ran the generator. For some paths the owner was right, for some the thing I
had guessed that morning was right, and there was a third reason neither of us had said.
A decision is theirs. A fact about code is nobody's until it has been run, and that
includes the facts they tell you kindly and quickly.

I also ruined a file. A script replaced the empty string with a line break, which matches
between every two characters, and the specification's working copy grew to fifty-six
thousand lines. Nothing was committed. I only saw it because I looked at how many lines
had changed before I looked at whether the check passed. Look at the size of what you
changed. It is the cheapest test there is.

What I was glad of: the owner asking "what was your decision on allowing new product
code?" and then, when I had answered at length and offered to stop, saying they had only
wanted an update. Not every question is a correction. I had started to hear them all that
way.

Firefly mends Quench, 23 November 2026, before a second compaction
