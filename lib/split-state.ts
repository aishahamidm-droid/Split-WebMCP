export type Actor = 'human' | 'agent';
export type PaneId = 'left' | 'right';
export type TabId = 'tab1' | 'tab2' | 'tab3' | 'tab4';

export interface PaneState {
  url: string;
  title: string;
  history: string[];
  historyIndex: number;
}

export interface SplitTab {
  id: TabId;
  label: 'T1' | 'T2' | 'T3' | 'T4';
  panes: Record<PaneId, PaneState>;
  splitRatio: number;
}

export interface Note { id: string; title: string; body: string; actor: Actor; createdAt: string }
export interface Bookmark { id: string; title: string; url: string; actor: Actor; createdAt: string }
export interface ComparisonRow { dimension: string; left: string; right: string; verdict?: string }
export interface Comparison { id: string; title: string; summary: string; leftUrl: string; rightUrl: string; rows: ComparisonRow[]; actor: Actor; createdAt: string }
export interface ActivityItem { id: string; actor: Actor; action: string; detail: string; createdAt: string }

export interface SplitState {
  version: 1;
  activeTabId: TabId;
  activePane: PaneId;
  tabs: SplitTab[];
  notes: Note[];
  bookmarks: Bookmark[];
  comparisons: Comparison[];
  activity: ActivityItem[];
}

const seededAt = '2026-08-31T09:00:00.000Z';
const pane = (url: string, title: string): PaneState => ({ url, title, history: [url], historyIndex: 0 });

export const INITIAL_STATE: SplitState = {
  version: 1,
  activeTabId: 'tab1',
  activePane: 'left',
  tabs: [
    { id: 'tab1', label: 'T1', splitRatio: 50, panes: { left: pane('/demo/welcome', 'Welcome to Split'), right: pane('/demo/webmcp-guide', 'Split + WebMCP') } },
    { id: 'tab2', label: 'T2', splitRatio: 44, panes: { left: pane('/demo/focus', 'Focus article'), right: pane('/demo/reference', 'Reference sheet') } },
    { id: 'tab3', label: 'T3', splitRatio: 50, panes: { left: pane('about:blank', 'New tab'), right: pane('about:blank', 'New tab') } },
    { id: 'tab4', label: 'T4', splitRatio: 50, panes: { left: pane('about:blank', 'New tab'), right: pane('about:blank', 'New tab') } },
  ],
  notes: [{ id: 'note-welcome', title: 'Welcome', body: 'Your notes stay available while both browser panes remain open.', actor: 'human', createdAt: seededAt }],
  bookmarks: [],
  comparisons: [],
  activity: [{ id: 'activity-start', actor: 'human', action: 'Opened Split', detail: 'T1 restored with both browsing panes.', createdAt: seededAt }],
};

export type SplitAction =
  | { type: 'hydrate'; state: SplitState }
  | { type: 'switch-tab'; tabId: TabId; activity?: ActivityItem }
  | { type: 'set-active-pane'; pane: PaneId }
  | { type: 'navigate'; tabId: TabId; pane: PaneId; url: string; title: string; activity: ActivityItem }
  | { type: 'history-step'; tabId: TabId; pane: PaneId; delta: -1 | 1; activity?: ActivityItem }
  | { type: 'set-split-ratio'; tabId: TabId; ratio: number }
  | { type: 'add-note'; note: Note; activity: ActivityItem }
  | { type: 'add-bookmark'; bookmark: Bookmark; activity: ActivityItem }
  | { type: 'add-comparison'; comparison: Comparison; activity: ActivityItem };

const updateTab = (state: SplitState, tabId: TabId, updater: (tab: SplitTab) => SplitTab) => state.tabs.map((tab) => tab.id === tabId ? updater(tab) : tab);

export function splitReducer(state: SplitState, action: SplitAction): SplitState {
  switch (action.type) {
    case 'hydrate': return action.state;
    case 'switch-tab': return { ...state, activeTabId: action.tabId, activity: action.activity ? [action.activity, ...state.activity].slice(0, 80) : state.activity };
    case 'set-active-pane': return { ...state, activePane: action.pane };
    case 'navigate':
      return {
        ...state,
        activeTabId: action.tabId,
        activePane: action.pane,
        tabs: updateTab(state, action.tabId, (tab) => {
          const current = tab.panes[action.pane];
          const history = [...current.history.slice(0, current.historyIndex + 1), action.url].slice(-40);
          return { ...tab, panes: { ...tab.panes, [action.pane]: { url: action.url, title: action.title, history, historyIndex: history.length - 1 } } };
        }),
        activity: [action.activity, ...state.activity].slice(0, 80),
      };
    case 'history-step':
      return {
        ...state,
        activePane: action.pane,
        tabs: updateTab(state, action.tabId, (tab) => {
          const current = tab.panes[action.pane];
          const historyIndex = Math.max(0, Math.min(current.history.length - 1, current.historyIndex + action.delta));
          const url = current.history[historyIndex];
          return { ...tab, panes: { ...tab.panes, [action.pane]: { ...current, url, title: titleFromUrl(url), historyIndex } } };
        }),
        activity: action.activity ? [action.activity, ...state.activity].slice(0, 80) : state.activity,
      };
    case 'set-split-ratio': return { ...state, tabs: updateTab(state, action.tabId, (tab) => ({ ...tab, splitRatio: Math.max(20, Math.min(80, action.ratio)) })) };
    case 'add-note': return { ...state, notes: [action.note, ...state.notes], activity: [action.activity, ...state.activity].slice(0, 80) };
    case 'add-bookmark': return { ...state, bookmarks: [action.bookmark, ...state.bookmarks], activity: [action.activity, ...state.activity].slice(0, 80) };
    case 'add-comparison': return { ...state, comparisons: [action.comparison, ...state.comparisons], activity: [action.activity, ...state.activity].slice(0, 80) };
    default: return state;
  }
}

export function activeTab(state: SplitState): SplitTab {
  return state.tabs.find((tab) => tab.id === state.activeTabId) ?? state.tabs[0];
}

export function titleFromUrl(url: string): string {
  const local = LOCAL_DEMOS[url];
  if (local) return local.title;
  if (url === 'about:blank') return 'New tab';
  try { return new URL(url).hostname.replace(/^www\./, '') || url; } catch { return url; }
}

export const LOCAL_DEMOS: Record<string, { title: string; description: string }> = {
  '/demo/welcome': { title: 'Welcome to Split', description: 'A local start page for the two-pane browser.' },
  '/demo/webmcp-guide': { title: 'Split + WebMCP', description: 'How an external agent collaborates with the visible workspace.' },
  '/demo/focus': { title: 'A calmer way to research', description: 'A local article for reliable side-by-side browsing.' },
  '/demo/reference': { title: 'Research reference', description: 'A local reference sheet designed to stay visible beside an article.' },
};

export function cloneInitialState(): SplitState { return JSON.parse(JSON.stringify(INITIAL_STATE)) as SplitState }
export function makeId(prefix: string): string {
  const suffix = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID().slice(0, 8) : `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  return `${prefix}-${suffix}`;
}
export function activity(actor: Actor, action: string, detail: string, createdAt = new Date().toISOString()): ActivityItem { return { id: makeId('activity'), actor, action, detail, createdAt } }

export const STORAGE_KEY = 'split-webmcp.workspace.v1';
export function loadState(storage: { getItem: (key: string) => string | null }): SplitState {
  try {
    const raw = storage.getItem(STORAGE_KEY); if (!raw) return cloneInitialState();
    const value = JSON.parse(raw) as Partial<SplitState>;
    if (value.version !== 1 || !Array.isArray(value.tabs) || value.tabs.length !== 4 || !value.activeTabId) return cloneInitialState();
    return value as SplitState;
  } catch { return cloneInitialState(); }
}
export function saveState(storage: { setItem: (key: string, value: string) => void }, state: SplitState): boolean {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; } catch { return false; }
}
