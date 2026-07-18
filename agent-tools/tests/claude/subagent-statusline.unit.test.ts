import {
  clipVisible,
  formatModelDisplay,
  planSubagentStatusline,
  renderTaskRow,
} from '../../src/claude/subagent-statusline';

const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const ANSI_CODE = new RegExp(String.raw`${String.fromCharCode(27)}\[[0-9;]*m`, 'g');
const stripAnsi = (text: string): string => text.replaceAll(ANSI_CODE, '');

const task = {
  id: 'task-1',
  name: 'code-reviewer',
  type: 'code-reviewer',
  status: 'running',
  description: 'Review the diff',
  label: 'review:gateway',
  model: 'claude-sonnet-5',
};

describe('formatModelDisplay', () => {
  // Owner directive (2026-07-18): the one-line subagent statusline includes the model.
  it.each([
    ['claude-sonnet-5', 'Sonnet 5'],
    ['claude-fable-5', 'Fable 5'],
    ['claude-opus-4-8', 'Opus 4.8'],
    ['claude-haiku-4-5-20251001', 'Haiku 4.5'],
  ] as const)('shortens the resolved model id %s to %s', (id, display) => {
    expect(formatModelDisplay(id)).toBe(display);
  });

  it('falls back to the raw id when the shape is not a claude model id', () => {
    expect(formatModelDisplay('gpt-5.5')).toBe('gpt-5.5');
  });
});

describe('renderTaskRow', () => {
  it('renders the label and the DIM model display', () => {
    const row = renderTaskRow(task);
    expect(stripAnsi(row)).toBe('review:gateway · Sonnet 5');
    expect(row).toContain(`${DIM}Sonnet 5${RESET}`);
  });

  it('falls back to name then description when the label is absent', () => {
    expect(stripAnsi(renderTaskRow({ ...task, label: undefined }))).toBe(
      'code-reviewer · Sonnet 5',
    );
    expect(stripAnsi(renderTaskRow({ ...task, label: undefined, name: undefined }))).toBe(
      'Review the diff · Sonnet 5',
    );
  });

  it('appends a non-running status dim between the label and the model', () => {
    expect(stripAnsi(renderTaskRow({ ...task, status: 'completed' }))).toBe(
      'review:gateway · completed · Sonnet 5',
    );
  });

  it('renders the model alone when no label, name, or description is present', () => {
    expect(
      stripAnsi(
        renderTaskRow({ ...task, label: undefined, name: undefined, description: undefined }),
      ),
    ).toBe('Sonnet 5');
  });
});

describe('planSubagentStatusline', () => {
  it('emits one id/content line per addressable task', () => {
    const plan = planSubagentStatusline(
      JSON.stringify({ columns: 120, tasks: [task, { ...task, id: 'task-2', label: 'verify' }] }),
    );
    expect(plan.kind).toBe('render');
    if (plan.kind !== 'render') {
      throw new Error('expected a render plan');
    }
    expect(plan.rows).toHaveLength(2);
    const first = JSON.parse(plan.rows[0] ?? '');
    expect(first.id).toBe('task-1');
    expect(stripAnsi(first.content)).toBe('review:gateway · Sonnet 5');
  });

  it('skips tasks with no id (they cannot be addressed) and keeps the rest', () => {
    const plan = planSubagentStatusline(
      JSON.stringify({
        tasks: [
          { ...task, id: undefined },
          { ...task, id: 'task-9' },
        ],
      }),
    );
    if (plan.kind !== 'render') {
      throw new Error('expected a render plan');
    }
    expect(plan.rows).toHaveLength(1);
    expect(JSON.parse(plan.rows[0] ?? '').id).toBe('task-9');
  });

  it('renders a task with no model as its label alone rather than dropping the row', () => {
    const plan = planSubagentStatusline(
      JSON.stringify({ tasks: [{ id: 't', label: 'probe', model: undefined }] }),
    );
    if (plan.kind !== 'render') {
      throw new Error('expected a render plan');
    }
    expect(stripAnsi(JSON.parse(plan.rows[0] ?? '').content)).toBe('probe');
  });

  it.each([
    ['empty input', ''],
    ['non-JSON input', 'not json'],
    ['JSON without tasks', JSON.stringify({ columns: 80 })],
    ['non-array tasks', JSON.stringify({ tasks: 42 })],
  ] as const)(
    'is a silent no-op on %s (a broken statusline never disrupts a session)',
    (_l, input) => {
      expect(planSubagentStatusline(input).kind).toBe('noop');
    },
  );
});

describe('clipVisible', () => {
  it('returns the row unchanged when the visible width fits', () => {
    const row = `${DIM}abc${RESET}def`;
    expect(clipVisible(row, 6)).toBe(row);
  });

  it('never counts ANSI codes toward the visible width', () => {
    const row = `${DIM}${RESET}${DIM}12345${RESET}`;
    expect(clipVisible(row, 5)).toBe(row);
  });

  it('clips to the column budget, ending with an ellipsis and a style reset', () => {
    const clipped = clipVisible('abcdefghij', 5);
    expect(stripAnsi(clipped)).toBe('abcd…');
    expect(clipped.endsWith(RESET)).toBe(true);
  });

  it('clips the VISIBLE text of a styled row, not its bytes', () => {
    const clipped = clipVisible(`${DIM}abcdefghij${RESET}`, 5);
    expect(stripAnsi(clipped)).toBe('abcd…');
  });
});

describe('planSubagentStatusline — columns budget (one line per task, never wrapped)', () => {
  it('clips every rendered row to the payload columns', () => {
    const plan = planSubagentStatusline(
      JSON.stringify({ columns: 40, tasks: [{ ...task, label: 'x'.repeat(200) }] }),
    );
    if (plan.kind !== 'render') {
      throw new Error('expected a render plan');
    }
    const content: string = JSON.parse(plan.rows[0] ?? '').content;
    expect([...stripAnsi(content)].length).toBe(40);
    expect(stripAnsi(content).endsWith('…')).toBe(true);
  });

  it('leaves rows under the budget unclipped', () => {
    const plan = planSubagentStatusline(JSON.stringify({ columns: 120, tasks: [task] }));
    if (plan.kind !== 'render') {
      throw new Error('expected a render plan');
    }
    expect(stripAnsi(JSON.parse(plan.rows[0] ?? '').content)).toBe('review:gateway · Sonnet 5');
  });

  it.each([
    ['zero', 0],
    ['negative', -4],
    ['fractional', 1.5],
    ['string-typed', '80'],
  ] as const)('ignores a %s columns value rather than guessing a budget', (_label, columns) => {
    const plan = planSubagentStatusline(
      JSON.stringify({ columns, tasks: [{ ...task, label: 'y'.repeat(200) }] }),
    );
    if (plan.kind !== 'render') {
      throw new Error('expected a render plan');
    }
    expect([...stripAnsi(JSON.parse(plan.rows[0] ?? '').content)].length).toBeGreaterThan(200);
  });
});

describe('planSubagentStatusline — COLUMNS environment fallback (adapter-supplied)', () => {
  // Platform contract: Claude Code sets COLUMNS/LINES before running the
  // script (code.claude.com/docs/en/statusline §how-status-lines-work).
  it('uses the adapter-supplied env columns when the payload carries none', () => {
    const plan = planSubagentStatusline(
      JSON.stringify({ tasks: [{ ...task, label: 'z'.repeat(200) }] }),
      '40',
    );
    if (plan.kind !== 'render') {
      throw new Error('expected a render plan');
    }
    expect([...stripAnsi(JSON.parse(plan.rows[0] ?? '').content)].length).toBe(40);
  });

  it('prefers the payload columns over the env value', () => {
    const plan = planSubagentStatusline(
      JSON.stringify({ columns: 40, tasks: [{ ...task, label: 'z'.repeat(200) }] }),
      '200',
    );
    if (plan.kind !== 'render') {
      throw new Error('expected a render plan');
    }
    expect([...stripAnsi(JSON.parse(plan.rows[0] ?? '').content)].length).toBe(40);
  });

  it.each([
    ['non-numeric', 'abc'],
    ['zero', '0'],
    ['empty', ''],
  ] as const)('ignores a %s env columns value', (_label, envColumns) => {
    const plan = planSubagentStatusline(
      JSON.stringify({ tasks: [{ ...task, label: 'z'.repeat(200) }] }),
      envColumns,
    );
    if (plan.kind !== 'render') {
      throw new Error('expected a render plan');
    }
    expect([...stripAnsi(JSON.parse(plan.rows[0] ?? '').content)].length).toBeGreaterThan(200);
  });
});
