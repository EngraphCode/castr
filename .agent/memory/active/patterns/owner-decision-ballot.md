---
name: Owner Decision Ballot
polarity: pattern
use_this_when: An agent session is blocked on an owner decision and the owner is (or must be assumed) away — publish a tap-to-answer artifact page, push-notify the owner, and let the answering happen on their schedule, readable by any later session
category: agent
related_pattern: autonomous-background-programme
proven_in: '.agent/plans/proof-programme/queued-decisions.md — first end-to-end round trip (publish → owner taps → read-back), 2026-08-23'
proven_date: 2026-08-23
barrier:
  broadly_applicable: true
  proven_by_implementation: true
  prevents_recurring_mistake: 'Owner-blocking questions parked on surfaces nobody watches — a recurring shape independent of any one mechanism: chat text scrolls away, a register row waits for a read that may be days off, and a session held open waiting dies with its container; the question must travel to the owner on the channel they watch and the answer must land where any later session can read it'
  stable: true
---

> **POLARITY: PATTERN.** This is a shape to repeat: an owner-blocking decision
> travels to the owner's watched channel as a tap-to-answer page, and the
> attributed answer lands where any later session reads it — parking the
> question on an unwatched surface is the failure this replaces.

## Principle

An owner decision needed while the owner is away is a **round trip across
time**: the ask must reach the owner on the channel they actually watch
(mobile push), the answer must be **recorded durably and attributed**, and
the reader of the answer is usually **a different session** than the asker.
A published Artifact page with the `artifact` runtime capability satisfies
all three: buttons publish a new version of the page _as the owner_ (their
tap, their identity, a timestamp), the page's state block is machine-readable
by any session via the Artifact tool, and a push notification carries the
link. The owner's standing direction (2026-08-23): anything blocked on the
owner assumes they are away and alerts via the mobile Claude app the moment
the block exists.

## The loop

1. **Author** the ballot page from the template below: one question per
   card, Approve/Decline (or domain verbs), an optional note field, honest
   copy about what happens after a tap.
2. **Publish** it with the Artifact tool, declaring
   `capabilities: {artifact: {}}`, and **record the ballot URL** in the
   queued-decisions register row it serves — the URL in the row is how a
   later session finds the answers.
3. **Push-notify** the owner with the link (first sentence becomes the
   phone banner).
4. **The owner taps.** Each tap calls `artifact.publish()` with the full
   replacement page carrying the updated state JSON — attributed to the
   owner, compare-and-set against races.
5. **Read the answers**: any session with the URL calls the Artifact tool's
   `read` action and parses the state block (the JSON script element with
   `id="state"`) — `{q1:{answer,at}, q2:{...}, note}`. Then execute, and
   record the outcome in the register row as usual.

Evidence base at capture: one end-to-end round trip (publish → owner taps →
read-back), 2026-08-23, from an interactive session.

## Session-type caveats (measured)

- An **interactive or SDK main-loop session** that publishes the ballot
  holds a live watch: the owner's tap wakes it. This is the tight loop.
- A **scheduled/background session cannot hold the watch** (the platform
  refuses both the publish-time subscription and an explicit `watch`).
  Either poll on a bounded cadence with a named exit criterion, or — the
  zero-infrastructure default for a cadenced loop — let the **next**
  scheduled session read the ballot from the URL in the register row.
- Read-only viewers' taps reject `not_writer`/`not_granted`: the template
  shows honest read-only copy instead of dead buttons. Only the artifact's
  owner (or an editor) can answer.
- The page's copy must match the real return path ("checks this card every
  few minutes", not "has been woken") — never over-promise the mechanism.

## Template

Parameterize the `QUESTIONS` array and the masthead; keep the mechanism
intact. Two mechanism notes: the page's canonical source for republishing is
reconstructed from a pre-render snapshot of the static markup plus the
`#main` script's own text — never the whole live DOM, which carries
shell-injected nodes; and the state JSON escapes every `<` to the JSON
escape sequence `\u003c` so a note can never break out of the state block.

```html
<title>Decision Ballot</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560&family=Source+Sans+3:wght@400;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
/>
<style id="theme">
  :root {
    --ground: #f5f4ef;
    --card: #fffefb;
    --ink: #23262b;
    --muted: #71746d;
    --line: #e2e1d8;
    --accent: #0e7568;
    --accent-ink: #ffffff;
    --accent-soft: #e3efec;
    --ok: #1e6b3a;
    --ok-soft: #e4f0e6;
    --warn: #8a5a12;
    --warn-soft: #f4ecdc;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme='light']) {
      --ground: #16181b;
      --card: #1e2125;
      --ink: #e8e8e4;
      --muted: #9a9d97;
      --line: #32353a;
      --accent: #4fbdae;
      --accent-ink: #0d1f1c;
      --accent-soft: #1d3330;
      --ok: #6fce8f;
      --ok-soft: #1a2f20;
      --warn: #d9a95a;
      --warn-soft: #332a18;
    }
  }
  :root[data-theme='dark'] {
    --ground: #16181b;
    --card: #1e2125;
    --ink: #e8e8e4;
    --muted: #9a9d97;
    --line: #32353a;
    --accent: #4fbdae;
    --accent-ink: #0d1f1c;
    --accent-soft: #1d3330;
    --ok: #6fce8f;
    --ok-soft: #1a2f20;
    --warn: #d9a95a;
    --warn-soft: #332a18;
  }
  body {
    background: var(--ground);
    color: var(--ink);
    font-family: 'Source Sans 3', system-ui, sans-serif;
    font-size: 16.5px;
    line-height: 1.55;
    margin: 0;
    padding: 28px 16px 48px;
  }
  .sheet {
    max-width: 590px;
    margin: 0 auto;
  }
  .mono {
    font-family: 'IBM Plex Mono', ui-monospace, monospace;
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
  }
  h1 {
    font-family: Fraunces, Georgia, serif;
    font-weight: 560;
    font-size: 1.85rem;
    line-height: 1.15;
    margin: 6px 0 4px;
    text-wrap: balance;
  }
  .lede {
    color: var(--muted);
    margin: 0;
    font-size: 0.95rem;
  }
  .q {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 12px;
    padding: 20px 20px 18px;
    margin-top: 14px;
  }
  .q h2 {
    font-family: Fraunces, Georgia, serif;
    font-weight: 560;
    font-size: 1.16rem;
    margin: 2px 0 8px;
    text-wrap: balance;
  }
  .q p {
    margin: 0 0 8px;
    font-size: 0.93rem;
  }
  .why {
    color: var(--muted);
    font-size: 0.87rem;
  }
  .row {
    display: flex;
    gap: 10px;
    margin-top: 14px;
    flex-wrap: wrap;
  }
  button {
    font:
      600 0.95rem/1 'Source Sans 3',
      system-ui,
      sans-serif;
    border-radius: 9px;
    padding: 13px 18px;
    cursor: pointer;
    border: 1.5px solid var(--accent);
    flex: 1 1 130px;
    min-height: 46px;
  }
  button:focus-visible {
    outline: 3px solid var(--accent);
    outline-offset: 2px;
  }
  button[disabled] {
    opacity: 0.55;
    cursor: default;
  }
  .yes {
    background: var(--accent);
    color: var(--accent-ink);
  }
  .no {
    background: var(--card);
    color: var(--accent);
  }
  .verdict {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border-radius: 999px;
    padding: 6px 14px;
    font-weight: 600;
    font-size: 0.9rem;
    background: var(--ok-soft);
    color: var(--ok);
  }
  .verdict.decline {
    background: var(--warn-soft);
    color: var(--warn);
  }
  .stamp {
    color: var(--muted);
    font-size: 0.8rem;
    margin-top: 8px;
  }
  .notewrap {
    margin-top: 16px;
  }
  label {
    display: block;
    font-size: 0.85rem;
    color: var(--muted);
    margin-bottom: 6px;
  }
  input[type='text'] {
    width: 100%;
    box-sizing: border-box;
    background: var(--ground);
    color: var(--ink);
    border: 1px solid var(--line);
    border-radius: 9px;
    padding: 11px 12px;
    font:
      400 0.95rem 'Source Sans 3',
      system-ui,
      sans-serif;
  }
  input[type='text']:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
  }
  .done {
    margin-top: 16px;
    padding: 14px 16px;
    background: var(--accent-soft);
    color: var(--ink);
    border-radius: 12px;
    font-size: 0.93rem;
  }
  .status {
    margin-top: 10px;
    color: var(--muted);
    font-size: 0.85rem;
    min-height: 1.2em;
  }
  .foot {
    margin-top: 22px;
    padding: 0 4px;
    color: var(--muted);
    font-size: 0.82rem;
  }
  .notesaved {
    font-size: 0.86rem;
    color: var(--muted);
    font-style: italic;
  }
</style>
<div class="sheet">
  <header class="masthead">
    <span class="mono">PROGRAMME · CONTEXT · DATE</span>
    <h1>Headline naming what is waiting</h1>
    <p class="lede">
      Tap an answer — it records as you; the working session reads it and executes.
    </p>
  </header>
  <div id="app"><p class="status">Loading…</p></div>
  <p class="foot">
    Context line. State the real return path here (watch-wake, poll cadence, or
    next-scheduled-session read).
  </p>
</div>
<script type="application/json" id="state">
  { "v": 1, "q1": { "answer": null, "at": null }, "q2": { "answer": null, "at": null }, "note": "" }
</script>
<script id="main">
  (() => {
    const STATE = JSON.parse(document.getElementById('state').textContent);

    const QUESTIONS = [
      {
        key: 'q1',
        title: '1 · First question',
        body: 'What is being decided.',
        why: 'Why it is worth deciding now.',
        yes: 'Approve',
        no: 'Decline',
      },
      {
        key: 'q2',
        title: '2 · Second question',
        body: 'What is being decided.',
        why: 'Why it is worth deciding now.',
        yes: 'Approve',
        no: 'Decline',
      },
    ];

    function safeJson(obj) {
      return JSON.stringify(obj).replace(/</g, '\\u003c');
    }

    function pageSource(state) {
      const script = document.getElementById('main').textContent;
      return (
        PAGE_BEFORE_STATE +
        '<script type="application/json" id="state">' +
        safeJson(state) +
        '<\/script>\n<script id="main">' +
        script +
        '<\/script>\n'
      );
    }

    // Static-source snapshot: taken at script evaluation, BEFORE render()
    // mutates #app, from this page's own pristine elements — never the whole
    // live DOM (the shell injects runtime nodes outside these elements).
    const PAGE_BEFORE_STATE = (() => {
      const title = '<title>' + document.title + '</title>\n';
      const links =
        Array.from(document.querySelectorAll('link[rel]'))
          .filter((l) => /fonts\.g/.test(l.href))
          .map((l) => l.outerHTML)
          .join('\n') + '\n';
      const style = document.getElementById('theme').outerHTML + '\n';
      const sheet =
        document
          .querySelector('.sheet')
          .outerHTML.replace(
            /<div id="app">[\s\S]*?<\/div>/,
            '<div id="app"><p class="status">Loading…</p></div>',
          ) + '\n';
      return title + links + style + sheet;
    })();

    function esc(s) {
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
    }

    function render() {
      const app = document.getElementById('app');
      const answered = QUESTIONS.every((q) => STATE[q.key].answer);
      let html = '';
      for (const q of QUESTIONS) {
        const st = STATE[q.key];
        html +=
          '<section class="q"><h2>' +
          q.title +
          '</h2><p>' +
          q.body +
          '</p><p class="why">' +
          q.why +
          '</p>';
        if (st.answer) {
          const decline = st.answer === 'decline' ? ' decline' : '';
          const word = st.answer === 'decline' ? q.no : q.yes;
          html +=
            '<div class="row"><span class="verdict' +
            decline +
            '">' +
            (st.answer === 'decline' ? '✖ ' : '✔ ') +
            word +
            ' — recorded</span></div><p class="stamp">' +
            esc(st.at || '') +
            '</p>';
        } else {
          html +=
            '<div class="row">' +
            '<button class="yes" data-q="' +
            q.key +
            '" data-a="approve">' +
            q.yes +
            '</button>' +
            '<button class="no" data-q="' +
            q.key +
            '" data-a="decline">' +
            q.no +
            '</button></div>';
        }
        html += '</section>';
      }
      if (STATE.note) {
        html +=
          '<div class="notewrap"><p class="notesaved">Note recorded: “' +
          esc(STATE.note) +
          '”</p></div>';
      }
      if (!answered) {
        html +=
          '<div class="notewrap"><label for="note">Redirect or nuance ' +
          '(optional — saved with your next tap)</label>' +
          '<input type="text" id="note" maxlength="500" value="' +
          esc(STATE.note) +
          '"></div>';
      } else {
        html +=
          '<div class="done"><strong>Recorded.</strong> The working ' +
          'session reads this card and executes. Anything else — reply in ' +
          'the Claude session.</div>';
      }
      html += '<p class="status" id="status" role="status" aria-live="polite"></p>';
      app.innerHTML = html;
      for (const b of app.querySelectorAll('button')) {
        b.addEventListener('click', () => answer(b.dataset.q, b.dataset.a));
      }
      const saved = sessionStorage.getItem('ballot-note');
      const noteEl = document.getElementById('note');
      if (noteEl && saved && !noteEl.value) noteEl.value = saved;
      if (noteEl)
        noteEl.addEventListener('input', () => {
          try {
            sessionStorage.setItem('ballot-note', noteEl.value);
          } catch (e) {}
        });
    }

    async function answer(key, val) {
      const statusEl = document.getElementById('status');
      const noteEl = document.getElementById('note');
      const next = JSON.parse(JSON.stringify(STATE));
      next[key] = { answer: val, at: new Date().toISOString() };
      if (noteEl) next.note = noteEl.value.trim();
      for (const b of document.querySelectorAll('button')) b.disabled = true;
      statusEl.textContent = 'Recording…';
      try {
        if (noteEl) sessionStorage.setItem('ballot-note', noteEl.value);
      } catch (e) {}
      const artifact = await window.claude.use('artifact');
      if (!artifact) {
        statusEl.textContent =
          'Saving is unavailable from this view — reply in the Claude session instead.';
        for (const b of document.querySelectorAll('button')) b.disabled = false;
        return;
      }
      try {
        await artifact.publish('<!doctype html>\n' + pageSource(next));
        // On success this view reloads to the new version.
      } catch (err) {
        const code = err && err.code;
        if (code === 'conflict') {
          // The shell reloads every open view to the winning version;
          // abort local optimistic UI so a delayed reload never strands
          // the viewer on disabled buttons.
          statusEl.textContent = 'A newer version just arrived — reloading.';
          for (const b of document.querySelectorAll('button')) b.disabled = false;
        } else if (code === 'not_writer' || code === 'not_granted') {
          statusEl.textContent =
            'This view is read-only — answers here don’t record. Reply in the Claude session instead.';
        } else {
          statusEl.textContent =
            'Couldn’t record (' + (code || 'error') + '). Tap again once, or reply in the session.';
          for (const b of document.querySelectorAll('button')) b.disabled = false;
        }
      }
    }

    render();
  })();
</script>
```

## Publish call

Publish via the Artifact tool with `capabilities: {"artifact": {}}`, a
stable emoji favicon, and a one-sentence description; then push-notify with
the URL. Republishing the same file path keeps the URL; from another
conversation pass the URL as `url`. Load the platform's
`artifact-capabilities` skill (vendor-provided at runtime, not a Practice
skill in this repo) before writing any variant that changes the runtime
behaviour — the capability roster and call contract are account- and
version-specific. The theme block in the template is cosmetic — restyle
freely; only the ids (`#theme`, `#app`, `#state`, `#main`) and the script
mechanics are load-bearing.
