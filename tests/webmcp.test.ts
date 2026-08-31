import assert from 'node:assert/strict';
import test from 'node:test';
import { cloneInitialState, splitReducer, type SplitState } from '../lib/split-state.ts';
import { createTools, registerTools, type WebMcpTool } from '../lib/webmcp.ts';

function harness() {
  let state: SplitState = cloneInitialState();
  const tools = createTools({ getState: () => state, apply: (action) => { state = splitReducer(state, action); }, now: () => '2026-08-31T10:00:00.000Z' });
  return { tools, state: () => state };
}

void test('registers the coherent nine-tool Split surface with AbortSignal lifecycle', async () => {
  const seen: WebMcpTool[] = []; const signals: AbortSignal[] = [];
  const registration = await registerTools({ registerTool(tool, options) { seen.push(tool); if (options?.signal) signals.push(options.signal); } }, harness().tools);
  assert.equal(registration.available, true);
  assert.equal(registration.registered.length, 9);
  assert.deepEqual(registration.registered, ['get_workspace', 'get_panes', 'get_tabs', 'open_resource', 'get_notes', 'add_note', 'get_bookmarks', 'save_bookmark', 'create_comparison']);
  assert.ok(signals.every((signal) => !signal.aborted));
  registration.dispose();
  assert.ok(signals.every((signal) => signal.aborted));
});

void test('feature detection fallback registers nothing without WebMCP', async () => {
  const registration = await registerTools(undefined, harness().tools);
  assert.equal(registration.available, false);
  assert.deepEqual(registration.registered, []);
});

void test('agent open_resource changes the same visible pane state', async () => {
  const app = harness(); const tool = app.tools.find((item) => item.name === 'open_resource')!;
  await tool.execute({ url: 'https://example.com/research', pane: 'right', tabId: 'tab1', title: 'Research source' });
  assert.equal(app.state().tabs[0].panes.right.url, 'https://example.com/research');
  assert.equal(app.state().activePane, 'right');
  assert.equal(app.state().activity[0].actor, 'agent');
});

void test('agent notes, bookmarks, and comparisons update shared state', async () => {
  const app = harness();
  await app.tools.find((item) => item.name === 'add_note')!.execute({ title: 'Finding', body: 'Both panes are relevant.' });
  await app.tools.find((item) => item.name === 'save_bookmark')!.execute({ pane: 'left' });
  await app.tools.find((item) => item.name === 'create_comparison')!.execute({ title: 'Visible pages', summary: 'Structured review.', rows: [{ dimension: 'Purpose', left: 'Start', right: 'Guide' }] });
  assert.equal(app.state().notes[0].actor, 'agent');
  assert.equal(app.state().bookmarks[0].url, '/demo/welcome');
  assert.equal(app.state().comparisons[0].rows.length, 1);
});

void test('tool handlers reject malformed and unsafe arguments even outside browser schema validation', async () => {
  const app = harness(); const tool = app.tools.find((item) => item.name === 'open_resource')!;
  assert.throws(() => tool.execute({ url: 'javascript:alert(1)', pane: 'left' }));
  assert.throws(() => tool.execute({ url: 'https://example.com', pane: 'middle' }));
});
