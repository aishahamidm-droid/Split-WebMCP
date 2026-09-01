export type Actor = 'human' | 'agent';
export type PaneId = 'left' | 'right';
export type TabId = 'tab1' | 'tab2' | 'tab3' | 'tab4';
export type PaletteName = 'Ocean' | 'Forest' | 'Graphite' | 'Rose' | 'Indigo' | 'Ruby' | 'Amber' | 'Mint' | 'Blue';

export interface AppPalette { name: PaletteName; primary: string; background: string; text: string; hint: string; inputLine: string; buttonInactive: string; handle: string }
export const PALETTES: AppPalette[] = [
  { name: 'Ocean', primary: '#14747c', background: '#f4f7fb', text: '#172033', hint: '#718095', inputLine: '#c9d3df', buttonInactive: '#e1e8f0', handle: '#cbd5e1' },
  { name: 'Forest', primary: '#267052', background: '#f4f8f5', text: '#182822', hint: '#687e73', inputLine: '#bed3c8', buttonInactive: '#e0eae4', handle: '#bfd1c7' },
  { name: 'Graphite', primary: '#475569', background: '#f7f9fc', text: '#161d28', hint: '#6f7a8a', inputLine: '#c5ceda', buttonInactive: '#e4e9f0', handle: '#cbd5e1' },
  { name: 'Rose', primary: '#af4863', background: '#fcf6f8', text: '#2f1d26', hint: '#826973', inputLine: '#e0c4cd', buttonInactive: '#f1e2e7', handle: '#e2ccd3' },
  { name: 'Indigo', primary: '#4f46e5', background: '#f7f7ff', text: '#1e203a', hint: '#707191', inputLine: '#c9cbec', buttonInactive: '#e5e6f8', handle: '#c7d2fe' },
  { name: 'Ruby', primary: '#be3044', background: '#fff7f7', text: '#37181d', hint: '#8b6067', inputLine: '#e7bec6', buttonInactive: '#f7e0e4', handle: '#e8cad0' },
  { name: 'Amber', primary: '#b46318', background: '#fff9ef', text: '#332413', hint: '#7e694e', inputLine: '#e7cca0', buttonInactive: '#f4e7ce', handle: '#e6d3b2' },
  { name: 'Mint', primary: '#0d9488', background: '#f1fcf9', text: '#122d2b', hint: '#587d78', inputLine: '#b2ded7', buttonInactive: '#dbf0ec', handle: '#bbded8' },
  { name: 'Blue', primary: '#2563eb', background: '#f5f9ff', text: '#182745', hint: '#637797', inputLine: '#bed0ef', buttonInactive: '#dfe9f8', handle: '#bfdbfe' },
];
export function resolvePalette(name: PaletteName, darkMode: boolean): AppPalette {
  const base = PALETTES.find((item) => item.name === name) ?? PALETTES[0];
  return darkMode ? { ...base, background: '#121820', text: '#ecf2f8', hint: '#94a3b8', inputLine: '#506074', buttonInactive: '#2d3748', handle: '#465367' } : base;
}

export interface PaneState {
  url: string;
  title: string;
  history: string[];
  historyIndex: number;
  textScale: number;
  homepage: string;
}

export interface SplitTab {
  id: TabId;
  label: 'T1' | 'T2' | 'T3' | 'T4';
  panes: Record<PaneId, PaneState>;
  splitRatio: number;
  privateMode: boolean;
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
  appearance: { paletteName: PaletteName; darkMode: boolean; quickToolPosition: { right: number; bottom: number } };
}

const seededAt = '2026-08-31T09:00:00.000Z';
const pane = (url: string, title: string): PaneState => ({ url, title, history: [url], historyIndex: 0, textScale: 100, homepage: '/demo/welcome' });

export const INITIAL_STATE: SplitState = {
  version: 1,
  activeTabId: 'tab1',
  activePane: 'left',
  tabs: [
    { id: 'tab1', label: 'T1', splitRatio: 50, privateMode: false, panes: { left: pane('/demo/welcome', 'Welcome to Split'), right: pane('/demo/webmcp-guide', 'Split + WebMCP') } },
    { id: 'tab2', label: 'T2', splitRatio: 44, privateMode: false, panes: { left: pane('/demo/focus', 'Focus article'), right: pane('/demo/reference', 'Reference sheet') } },
    { id: 'tab3', label: 'T3', splitRatio: 50, privateMode: false, panes: { left: pane('about:blank', 'New tab'), right: pane('about:blank', 'New tab') } },
    { id: 'tab4', label: 'T4', splitRatio: 50, privateMode: false, panes: { left: pane('about:blank', 'New tab'), right: pane('about:blank', 'New tab') } },
  ],
  notes: [{ id: 'note-welcome', title: 'Welcome', body: 'Your notes stay available while both browser panes remain open.', actor: 'human', createdAt: seededAt }],
  bookmarks: [],
  comparisons: [],
  activity: [{ id: 'activity-start', actor: 'human', action: 'Opened Split', detail: 'T1 restored with both browsing panes.', createdAt: seededAt }],
  appearance: { paletteName: 'Ocean', darkMode: false, quickToolPosition: { right: 18, bottom: 42 } },
};

export type SplitAction =
  | { type: 'hydrate'; state: SplitState }
  | { type: 'switch-tab'; tabId: TabId; activity?: ActivityItem }
  | { type: 'set-active-pane'; pane: PaneId }
  | { type: 'navigate'; tabId: TabId; pane: PaneId; url: string; title: string; activity: ActivityItem }
  | { type: 'history-step'; tabId: TabId; pane: PaneId; delta: -1 | 1; activity?: ActivityItem }
  | { type: 'history-jump'; tabId: TabId; pane: PaneId; index: number; activity?: ActivityItem }
  | { type: 'clear-history'; tabId: TabId; pane: PaneId; activity: ActivityItem }
  | { type: 'set-split-ratio'; tabId: TabId; ratio: number }
  | { type: 'set-pane-preferences'; tabId: TabId; pane: PaneId; textScale?: number; homepage?: string; activity?: ActivityItem }
  | { type: 'set-private-mode'; tabId: TabId; enabled: boolean; activity: ActivityItem }
  | { type: 'set-appearance'; paletteName?: PaletteName; darkMode?: boolean; activity: ActivityItem }
  | { type: 'set-quick-tool-position'; right: number; bottom: number }
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
          return { ...tab, panes: { ...tab.panes, [action.pane]: { ...current, url: action.url, title: action.title, history, historyIndex: history.length - 1 } } };
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
    case 'history-jump':
      return {
        ...state,
        activePane: action.pane,
        tabs: updateTab(state, action.tabId, (tab) => {
          const current = tab.panes[action.pane]; const historyIndex = Math.max(0, Math.min(current.history.length - 1, action.index)); const url = current.history[historyIndex];
          return { ...tab, panes: { ...tab.panes, [action.pane]: { ...current, url, title: titleFromUrl(url), historyIndex } } };
        }),
        activity: action.activity ? [action.activity, ...state.activity].slice(0, 80) : state.activity,
      };
    case 'clear-history':
      return {
        ...state,
        tabs: updateTab(state, action.tabId, (tab) => {
          const current = tab.panes[action.pane];
          return { ...tab, panes: { ...tab.panes, [action.pane]: { ...current, history: [current.url], historyIndex: 0 } } };
        }),
        activity: [action.activity, ...state.activity].slice(0, 80),
      };
    case 'set-split-ratio': return { ...state, tabs: updateTab(state, action.tabId, (tab) => ({ ...tab, splitRatio: Math.max(20, Math.min(80, action.ratio)) })) };
    case 'set-pane-preferences':
      return {
        ...state,
        tabs: updateTab(state, action.tabId, (tab) => ({ ...tab, panes: { ...tab.panes, [action.pane]: { ...tab.panes[action.pane], ...(action.textScale == null ? {} : { textScale: Math.max(75, Math.min(150, action.textScale)) }), ...(action.homepage == null ? {} : { homepage: action.homepage }) } } })),
        activity: action.activity ? [action.activity, ...state.activity].slice(0, 80) : state.activity,
      };
    case 'set-private-mode': return { ...state, tabs: updateTab(state, action.tabId, (tab) => ({ ...tab, privateMode: action.enabled })), activity: [action.activity, ...state.activity].slice(0, 80) };
    case 'set-appearance': return { ...state, appearance: { ...state.appearance, ...(action.paletteName == null ? {} : { paletteName: action.paletteName }), ...(action.darkMode == null ? {} : { darkMode: action.darkMode }) }, activity: [action.activity, ...state.activity].slice(0, 80) };
    case 'set-quick-tool-position': return { ...state, appearance: { ...state.appearance, quickToolPosition: { right: Math.max(8, action.right), bottom: Math.max(34, action.bottom) } } };
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
  '/demo/notepad': { title: 'Split Notepad', description: 'The shared Split notepad opened inside a browser pane.' },
};

export function cloneInitialState(): SplitState { return JSON.parse(JSON.stringify(INITIAL_STATE)) as SplitState }
export function makeId(prefix: string): string {
  const suffix = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID().slice(0, 8) : `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  return `${prefix}-${suffix}`;
}
export function activity(actor: Actor, action: string, detail: string, createdAt = new Date().toISOString()): ActivityItem { return { id: makeId('activity'), actor, action, detail, createdAt } }

export const STORAGE_KEY = 'split-webmcp.workspace.v1';
function completeState(value: SplitState): SplitState {
  return {
    ...value,
    appearance: { ...INITIAL_STATE.appearance, ...value.appearance, quickToolPosition: { ...INITIAL_STATE.appearance.quickToolPosition, ...value.appearance?.quickToolPosition } },
    tabs: value.tabs.map((tab, index) => ({
      ...tab,
      privateMode: false,
      panes: {
        left: { ...tab.panes.left, textScale: tab.panes.left.textScale ?? 100, homepage: tab.panes.left.homepage ?? INITIAL_STATE.tabs[index].panes.left.homepage },
        right: { ...tab.panes.right, textScale: tab.panes.right.textScale ?? 100, homepage: tab.panes.right.homepage ?? INITIAL_STATE.tabs[index].panes.right.homepage },
      },
    })),
  };
}
export function loadState(storage: { getItem: (key: string) => string | null }): SplitState {
  try {
    const raw = storage.getItem(STORAGE_KEY); if (!raw) return cloneInitialState();
    const value = JSON.parse(raw) as Partial<SplitState>;
    if (value.version !== 1 || !Array.isArray(value.tabs) || value.tabs.length !== 4 || !value.activeTabId) return cloneInitialState();
    return completeState(value as SplitState);
  } catch { return cloneInitialState(); }
}
export function saveState(storage: { setItem: (key: string, value: string) => void }, state: SplitState): boolean {
  try {
    const persisted = { ...state, tabs: state.tabs.map((tab, index) => tab.privateMode ? cloneInitialState().tabs[index] : tab) };
    storage.setItem(STORAGE_KEY, JSON.stringify(persisted)); return true;
  } catch { return false; }
}
