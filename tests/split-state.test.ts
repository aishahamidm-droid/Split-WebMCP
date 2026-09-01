import assert from 'node:assert/strict';
import test from 'node:test';
import { activeTab, activity, cloneInitialState, loadState, resolvePalette, saveState, splitReducer, STORAGE_KEY } from '../lib/split-state.ts';

void test('navigation updates only the requested pane and preserves history', () => {
  const initial = cloneInitialState();
  const next = splitReducer(initial, { type: 'navigate', tabId: 'tab1', pane: 'left', url: 'https://example.com/', title: 'example.com', activity: activity('human', 'Navigated', 'example.com') });
  assert.equal(activeTab(next).panes.left.url, 'https://example.com/');
  assert.equal(activeTab(next).panes.right.url, '/demo/webmcp-guide');
  assert.equal(activeTab(next).panes.left.history.length, 2);
  const back = splitReducer(next, { type: 'history-step', tabId: 'tab1', pane: 'left', delta: -1 });
  assert.equal(activeTab(back).panes.left.url, '/demo/welcome');
});

void test('T1–T4 keep independent pane state and split ratios', () => {
  const initial = cloneInitialState();
  const resized = splitReducer(initial, { type: 'set-split-ratio', tabId: 'tab2', ratio: 73 });
  const switched = splitReducer(resized, { type: 'switch-tab', tabId: 'tab2' });
  assert.equal(activeTab(switched).label, 'T2');
  assert.equal(activeTab(switched).splitRatio, 73);
  assert.equal(switched.tabs.find((tab) => tab.id === 'tab1')?.splitRatio, 50);
});

void test('notes and bookmarks retain actor provenance', () => {
  const initial = cloneInitialState(); const createdAt = '2026-08-31T10:00:00.000Z';
  const withNote = splitReducer(initial, { type: 'add-note', note: { id: 'n1', title: 'Agent note', body: 'Finding', actor: 'agent', createdAt }, activity: { id: 'a1', actor: 'agent', action: 'Added note', detail: 'Agent note', createdAt } });
  const withBookmark = splitReducer(withNote, { type: 'add-bookmark', bookmark: { id: 'b1', title: 'Example', url: 'https://example.com/', actor: 'human', createdAt }, activity: { id: 'a2', actor: 'human', action: 'Saved bookmark', detail: 'Example', createdAt } });
  assert.equal(withBookmark.notes[0].actor, 'agent');
  assert.equal(withBookmark.bookmarks[0].actor, 'human');
  assert.equal(withBookmark.activity[0].actor, 'human');
});

void test('persistence round-trips and malformed data falls back safely', () => {
  const memory = new Map<string, string>();
  const storage = { getItem: (key: string) => memory.get(key) ?? null, setItem: (key: string, value: string) => { memory.set(key, value); } };
  const state = cloneInitialState(); state.activeTabId = 'tab3';
  assert.equal(saveState(storage, state), true);
  assert.equal(loadState(storage).activeTabId, 'tab3');
  memory.set(STORAGE_KEY, '{broken');
  assert.equal(loadState(storage).activeTabId, 'tab1');
});

void test('pane preferences and pane-aware history are independently controlled', () => {
  let state = cloneInitialState();
  state = splitReducer(state, { type: 'set-pane-preferences', tabId: 'tab1', pane: 'right', textScale: 130, homepage: 'https://example.com/' });
  state = splitReducer(state, { type: 'navigate', tabId: 'tab1', pane: 'right', url: 'https://example.com/a', title: 'A', activity: activity('human', 'Navigated', 'A') });
  state = splitReducer(state, { type: 'navigate', tabId: 'tab1', pane: 'right', url: 'https://example.com/b', title: 'B', activity: activity('human', 'Navigated', 'B') });
  state = splitReducer(state, { type: 'history-jump', tabId: 'tab1', pane: 'right', index: 1 });
  assert.equal(state.tabs[0].panes.right.textScale, 130);
  assert.equal(state.tabs[0].panes.right.homepage, 'https://example.com/');
  assert.equal(state.tabs[0].panes.right.url, 'https://example.com/a');
  assert.equal(state.tabs[0].panes.left.textScale, 100);
});

void test('private Split sessions are not persisted as browser-level incognito', () => {
  const memory = new Map<string, string>();
  const storage = { getItem: (key: string) => memory.get(key) ?? null, setItem: (key: string, value: string) => { memory.set(key, value); } };
  let state = cloneInitialState();
  state = splitReducer(state, { type: 'set-private-mode', tabId: 'tab1', enabled: true, activity: activity('human', 'Private', 'T1') });
  state = splitReducer(state, { type: 'navigate', tabId: 'tab1', pane: 'left', url: 'https://private.example/', title: 'Private', activity: activity('human', 'Navigated', 'Private') });
  saveState(storage, state);
  const restored = loadState(storage);
  assert.equal(restored.tabs[0].privateMode, false);
  assert.equal(restored.tabs[0].panes.left.url, '/demo/welcome');
});

void test('original Split palette, dark mode, and quick-tool position persist', () => {
  const memory = new Map<string, string>();
  const storage = { getItem: (key: string) => memory.get(key) ?? null, setItem: (key: string, value: string) => { memory.set(key, value); } };
  let state = cloneInitialState();
  state = splitReducer(state, { type: 'set-appearance', paletteName: 'Rose', darkMode: true, activity: activity('human', 'Appearance', 'Rose dark') });
  state = splitReducer(state, { type: 'set-quick-tool-position', right: 84, bottom: 96 });
  assert.equal(resolvePalette('Rose', false).primary, '#af4863');
  assert.equal(resolvePalette('Rose', true).background, '#121820');
  assert.equal(saveState(storage, state), true);
  const restored = loadState(storage);
  assert.equal(restored.appearance.paletteName, 'Rose');
  assert.equal(restored.appearance.darkMode, true);
  assert.deepEqual(restored.appearance.quickToolPosition, { right: 84, bottom: 96 });
});
