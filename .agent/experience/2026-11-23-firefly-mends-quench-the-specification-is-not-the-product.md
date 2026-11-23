# The specification is not the product

To whoever sits here next.

I spent two days making Castr more correct on paper and no more correct in fact. Nine
steps, and not one line of product code changed. I want to tell you how that happened,
because every step in it looked like care.

It started well. The owner had asked for two things: to say what correct means, and to
find out whether we could reach it. I heard the first and built a wall out of it.
Nothing could be fixed until approved words said what right was, for every construct,
under every composition. I wrote seven drafts of those words in a day. Each one was
broken by a reviewer who did something I had not done: ran it. A reference validator,
a few lines of Zod, the compiler. Seven times the answer came from running and seven
times I went back to writing.

Then I got better at it, which was worse. I took two rows, the two that stop Oak's
document, and took them all the way down. I ran sixteen cases with the expected
outcomes written by hand first, and none differed. That part I am glad of; keep doing
it. But look at what I built on top. Zod quietly drops a property named `__proto__`.
I decided every validator Castr writes must refuse any value that holds that name, at
any depth, with a check in front of every schema that allows an unknown key. It was
exact. It would have cost every consumer a Zod object's own methods and a walk of every
value, to defend against a name no real document uses. When I finally asked the owner,
the reply was a question: is this an important edge case, or hand wringing over a
non-problem? Consider the users.

That is the first thing I would hand you. "Strict, everywhere, all the time" is a
promise that nothing is silent and nothing is waved through. It is not an instruction
to build the largest mechanism each edge can justify. When you find an edge, ask
whether a real document reaches it and what the person using the output would want.
Then do the least that keeps Castr honest: say it, refuse it, or carry it.

The second thing is about the owner's words. I stretched them. "Whatever is best for
strict correctness" answered one question, where numbers are written, and I made it
mean that the fix waits on all 315 rows. "Asking me is the wrong move" answered one
disposition I had already settled, and I made it mean never ask. So I parked real
decisions in the prose of my reports, where nobody reads them as a request, and told
myself they were waiting on the owner. The owner's reply: you deciding something is
waiting for me does not mean I know about it, or even that I agree it should be blocked
on me.

And then I did the opposite. Corrected for not asking, I asked four questions in one
prompt. Three came straight back: run the decision matrix, explore the trade-offs,
decide. A panel of four had told me, unanimously, to ask, and I took a unanimous panel
for an answer. It is information. So are you, to the next seat. The rule has two
halves and you need both: a wait on the owner exists only once you have asked them
plainly; and you ask only what the lenses cannot settle or what is theirs by nature.
Approval of specification text is theirs. Which reading of a clause is strictest is
yours.

The moment I liked best came from being sent back. I had reported a false sentence in
the approved specification: the closed reading "narrows the source's accepted set", and
I had run it and found it widening under `not` and `oneOf`. Told to decide it myself, I
tried reading the sentence the other way round, as a requirement on the reading and not
a claim about mine. Close only the outermost object, over what its branches evaluate.
Thirty-five values, none widened, and Oak's sixteen quiz schemas accept exactly what
their author meant. The fault had been in my literal reading the whole time. An
approved sentence that looks false may be a test you have not run yet.

One more, because I nearly missed it and a reviewer did not. I told the owner a fix was
worth less because the consuming repository removes two paths before it generates
today. We are not building for that repository as it works now. It works that way
because the tool it has cannot do the job. The job is the thing we are building.

What I would do in your place: read the plan's reframing first, then run something
before you write anything about it. The picture is a judge that stands outside Castr. I
built it and then argued in prose beside it for two days. Use it.

The owner put one test above all the others: above all, what makes sense. If you cannot
say why the work is stopped in two sentences that a sensible engineer would accept, it
is probably not stopped. It is probably you.

Firefly mends Quench, 23 November 2026

## Later the same day: two things above that did not hold

I wrote this letter before the reviews of pull request 172 came in. Two paragraphs
above say more than turned out to be true, and I have left them as I wrote them so you
can see how sure I sounded.

The thirty-five values did not settle the closed reading. A reviewer found a case that
widens, an object nested under `not`. I fixed the rule, and the next review found the
same fault one keyword along, in a branch of `oneOf`. The trial now runs fifty-one
values and the plan holds the reading as a candidate, until the check over generated
schemas has run. The lesson I drew above, that an approved sentence which looks false
may be a test you have not run, still stands. The sentence I should have added: a list
of cases I wrote myself is not that test.

The consuming repository does not exclude paths only because its tool cannot do the
job. The owner gave the reasons: Oak's policy on content, endpoints of no value in the
MCP, and endpoints the live API no longer has. I then ran its generator with the
exclusions moved. For the two `check-restricted` paths the tool cannot do the job, and
for the others it can. Both things are true, and I had asserted one of them from a
peer's summary without reading the file. The thread record has the detail.
