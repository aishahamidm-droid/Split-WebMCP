'use client';

import { PointerEvent as ReactPointerEvent, SyntheticEvent, useEffect, useReducer, useRef, useState } from 'react';
import { Activity, ArrowLeft, ArrowRight, Bookmark, Bot, ChevronRight, ExternalLink, FileText, Maximize2, PanelTop, RefreshCw, RotateCcw, Search, ShieldCheck, Sparkles, Star, UserRound, Wrench, X } from 'lucide-react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useIsMobile } from '@/hooks/use-mobile';
import { activeTab, activity, cloneInitialState, loadState, LOCAL_DEMOS, makeId, saveState, splitReducer, STORAGE_KEY, titleFromUrl, type Actor, type PaneId, type SplitAction, type SplitState } from '@/lib/split-state';
import { normalizeNavigationInput } from '@/lib/validation';
import { createTools, registerTools } from '@/lib/webmcp';

type ToolView = 'notes' | 'bookmarks' | 'compare' | 'activity';
type WebMcpStatus = { available: boolean; count: number; errors: string[] };

function ActorBadge({ actor }: { actor: Actor }) {
  return actor === 'agent'
    ? <span className="inline-flex items-center gap-1 rounded-full bg-[#e7f4ff] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[#24658a]"><Bot className="size-3" /> Agent</span>
    : <span className="inline-flex items-center gap-1 rounded-full bg-[#eef2f6] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[#59687c]"><UserRound className="size-3" /> Human</span>;
}

interface BrowserPaneProps {
  paneId: PaneId;
  state: SplitState;
  dispatch: (action: SplitAction) => void;
  onBookmark: (paneId: PaneId) => void;
}

function BrowserPane({ paneId, state, dispatch, onBookmark }: BrowserPaneProps) {
  const tab = activeTab(state); const paneState = tab.panes[paneId];
  const [address, setAddress] = useState(paneState.url); const [error, setError] = useState(''); const [reloadKey, setReloadKey] = useState(0);
  // oxlint-disable-next-line react/react-compiler -- synchronize the editable address with external pane navigation
  useEffect(() => { setAddress(paneState.url); }, [paneState.url]);
  const navigate = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault(); setError('');
    try {
      const url = normalizeNavigationInput(address);
      dispatch({ type: 'navigate', tabId: tab.id, pane: paneId, url, title: titleFromUrl(url), activity: activity('human', 'Navigated browser pane', `${tab.label} ${paneId} → ${url}`) });
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Invalid address.'); }
  };
  const local = paneState.url in LOCAL_DEMOS;
  const blank = paneState.url === 'about:blank';
  const canBack = paneState.historyIndex > 0; const canForward = paneState.historyIndex < paneState.history.length - 1;
  return (
    <section onPointerDown={() => dispatch({ type: 'set-active-pane', pane: paneId })} className={`flex h-full min-h-[310px] flex-col overflow-hidden bg-white ${state.activePane === paneId ? 'ring-2 ring-inset ring-[#14747c]/30' : ''}`} aria-label={`${paneId} browser pane`}>
      <div className="flex h-10 shrink-0 items-center gap-1 border-b border-[#d9e0e8] bg-[#f8fafc] px-1.5">
        <span className="hidden min-w-8 text-center text-[9px] font-bold tracking-[0.12em] text-[#718095] lg:block">{paneId === 'left' ? 'LEFT' : 'RIGHT'}</span>
        <button onClick={() => dispatch({ type: 'history-step', tabId: tab.id, pane: paneId, delta: -1 })} disabled={!canBack} aria-label={`Back in ${paneId} pane`} className="browser-control"><ArrowLeft /></button>
        <button onClick={() => dispatch({ type: 'history-step', tabId: tab.id, pane: paneId, delta: 1 })} disabled={!canForward} aria-label={`Forward in ${paneId} pane`} className="browser-control"><ArrowRight /></button>
        <form onSubmit={navigate} className="flex min-w-0 flex-1 items-center rounded-md border border-[#c9d3df] bg-white focus-within:border-[#14747c] focus-within:ring-2 focus-within:ring-[#14747c]/15">
          <Search className="ml-2 size-3.5 shrink-0 text-[#718095]" />
          <input value={address} onChange={(event) => setAddress(event.target.value)} aria-label={`Search or enter URL for ${paneId} pane`} className="h-7 min-w-0 flex-1 bg-transparent px-2 text-xs text-[#172033] outline-none" placeholder="Search or enter address" />
        </form>
        <button onClick={() => setReloadKey((value) => value + 1)} aria-label={`Refresh ${paneId} pane`} className="browser-control secondary"><RefreshCw /></button>
        <button onClick={() => onBookmark(paneId)} aria-label={`Bookmark ${paneId} pane`} className="browser-control secondary"><Star /></button>
      </div>
      {error && <div role="alert" className="border-b border-red-200 bg-red-50 px-3 py-1.5 text-[11px] text-red-700">{error}</div>}
      <div className="relative min-h-0 flex-1 bg-white">
        {local && <iframe key={`${paneState.url}-${reloadKey}`} src={paneState.url} title={`${paneState.title} in ${paneId} pane`} className="h-full w-full border-0" sandbox="allow-scripts allow-same-origin" />}
        {blank && <div className="grid h-full place-items-center bg-[#f8fafc] p-6 text-center"><div><span className="mx-auto grid size-12 place-items-center rounded-2xl border border-[#c9d3df] bg-white text-[#14747c]"><PanelTop /></span><h2 className="mt-4 text-base font-semibold">New pane</h2><p className="mt-1 text-xs text-[#718095]">Enter an address above or ask a WebMCP agent to open a resource here.</p></div></div>}
        {!local && !blank && <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_top_right,#e3f3f4,transparent_48%),#f8fafc] p-6"><article className="w-full max-w-md rounded-2xl border border-[#c9d3df] bg-white p-6 shadow-[0_18px_50px_rgba(23,32,51,.08)]"><span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef2f6] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#59687c]"><ShieldCheck className="size-3.5" /> Safe fallback</span><h2 className="mt-5 text-2xl font-bold tracking-tight">{paneState.title}</h2><p className="mt-2 break-all text-xs text-[#718095]">{paneState.url}</p><p className="mt-5 text-sm leading-6 text-[#59687c]">This website may prevent embedding through CSP or X-Frame-Options. Split preserves the pane and resource state without bypassing browser security.</p><a href={paneState.url} target="_blank" rel="noreferrer noopener" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#14747c] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#105f66]"><ExternalLink className="size-4" /> Open original page</a></article></div>}
      </div>
      <div className="flex h-6 shrink-0 items-center justify-between border-t border-[#d9e0e8] bg-[#f8fafc] px-2 text-[9px] text-[#718095]"><span className="truncate">{paneState.title}</span><span>{paneState.historyIndex + 1}/{paneState.history.length}</span></div>
    </section>
  );
}

function ToolPanel({ view, state, dispatch, close }: { view: ToolView; state: SplitState; dispatch: (action: SplitAction) => void; close: () => void }) {
  const [noteTitle, setNoteTitle] = useState(''); const [noteBody, setNoteBody] = useState('');
  const tab = activeTab(state); const comparison = state.comparisons[0];
  const submitNote = (event: SyntheticEvent<HTMLFormElement>) => { event.preventDefault(); const body = noteBody.trim(); if (!body) return; const createdAt = new Date().toISOString(); const title = noteTitle.trim() || 'Untitled'; dispatch({ type: 'add-note', note: { id: makeId('note'), title, body: body.slice(0, 2000), actor: 'human', createdAt }, activity: activity('human', 'Added note', title, createdAt) }); setNoteTitle(''); setNoteBody(''); };
  const createStarterComparison = () => {
    const left = tab.panes.left; const right = tab.panes.right; const createdAt = new Date().toISOString();
    dispatch({ type: 'add-comparison', comparison: { id: makeId('comparison'), title: `${left.title} ↔ ${right.title}`, summary: 'A lightweight comparison attached to the pages currently visible in Split.', leftUrl: left.url, rightUrl: right.url, actor: 'human', createdAt, rows: [{ dimension: 'Resource', left: left.title, right: right.title }, { dimension: 'Location', left: left.url, right: right.url }] }, activity: activity('human', 'Created comparison', `${left.title} and ${right.title}`, createdAt) });
  };
  return (
    <aside className="fixed inset-y-3 right-3 z-40 flex w-[min(390px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-[#b7c5d4] bg-[#fffdfd] shadow-[0_24px_80px_rgba(23,32,51,.24)]" aria-label="Split quick tools">
      <header className="flex h-13 items-center border-b border-[#d9e0e8] bg-[#f4f7fb] px-4"><div><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#718095]">Quick tools</p><h2 className="text-sm font-bold capitalize">{view}</h2></div><button onClick={close} aria-label="Close quick tools" className="ml-auto grid size-8 place-items-center rounded-lg hover:bg-[#e1e8f0]"><X className="size-4" /></button></header>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {view === 'notes' && <><form onSubmit={submitNote} className="rounded-xl border border-[#c9d3df] bg-[#f8fafc] p-3"><input value={noteTitle} onChange={(event) => setNoteTitle(event.target.value)} maxLength={100} placeholder="Note title" className="h-9 w-full rounded-lg border border-[#c9d3df] bg-white px-3 text-sm outline-none focus:border-[#14747c]" /><textarea value={noteBody} onChange={(event) => setNoteBody(event.target.value)} maxLength={2000} placeholder="Write a note while both pages stay open…" className="mt-2 min-h-24 w-full resize-y rounded-lg border border-[#c9d3df] bg-white p-3 text-sm outline-none focus:border-[#14747c]" /><button className="mt-2 w-full rounded-lg bg-[#14747c] px-3 py-2 text-sm font-semibold text-white">Save note</button></form><div className="mt-3 space-y-2">{state.notes.map((note) => <article key={note.id} className="rounded-xl border border-[#d9e0e8] bg-white p-3"><div className="flex items-center justify-between"><strong className="text-sm">{note.title}</strong><ActorBadge actor={note.actor} /></div><p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-[#59687c]">{note.body}</p></article>)}</div></>}
        {view === 'bookmarks' && <>{state.bookmarks.length === 0 ? <Empty icon={<Bookmark />} title="No bookmarks yet" body="Use the star in either browser bar or ask an agent to save a visible page." /> : <div className="space-y-2">{state.bookmarks.map((item) => <button key={item.id} onClick={() => dispatch({ type: 'navigate', tabId: state.activeTabId, pane: state.activePane, url: item.url, title: item.title, activity: activity('human', 'Opened bookmark', item.title) })} className="flex w-full items-center gap-3 rounded-xl border border-[#d9e0e8] bg-white p-3 text-left hover:border-[#14747c]"><Bookmark className="size-4 shrink-0 text-[#14747c]" /><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{item.title}</strong><span className="block truncate text-[10px] text-[#718095]">{item.url}</span></span><ActorBadge actor={item.actor} /><ChevronRight className="size-4 text-[#718095]" /></button>)}</div>}</>}
        {view === 'compare' && <>{!comparison ? <Empty icon={<Sparkles />} title="Comparison is optional" body="Keep browsing in both panes. Create a small comparison only when it helps the current task." action={<button onClick={createStarterComparison} className="rounded-lg bg-[#14747c] px-3 py-2 text-xs font-semibold text-white">Compare visible pages</button>} /> : <article><ActorBadge actor={comparison.actor} /><h3 className="mt-3 text-lg font-bold">{comparison.title}</h3><p className="mt-1 text-xs leading-5 text-[#59687c]">{comparison.summary}</p><div className="mt-4 overflow-hidden rounded-xl border border-[#c9d3df]">{comparison.rows.map((row) => <div key={row.dimension} className="grid grid-cols-[.7fr_1fr_1fr] border-b border-[#d9e0e8] text-[11px] last:border-b-0"><strong className="bg-[#f4f7fb] p-2">{row.dimension}</strong><span className="border-l border-[#d9e0e8] p-2 text-[#59687c]">{row.left}</span><span className="border-l border-[#d9e0e8] p-2 text-[#59687c]">{row.right}</span></div>)}</div></article>}</>}
        {view === 'activity' && <div className="space-y-1">{state.activity.map((item) => <article key={item.id} className="flex gap-3 rounded-xl p-2.5 hover:bg-[#f4f7fb]"><span className={`grid size-8 shrink-0 place-items-center rounded-lg ${item.actor === 'agent' ? 'bg-[#e7f4ff] text-[#24658a]' : 'bg-[#eef2f6] text-[#59687c]'}`}>{item.actor === 'agent' ? <Bot className="size-4" /> : <UserRound className="size-4" />}</span><div><strong className="text-xs">{item.action}</strong><p className="mt-0.5 text-[11px] leading-4 text-[#718095]">{item.detail}</p></div></article>)}</div>}
      </div>
    </aside>
  );
}

function Empty({ icon, title, body, action }: { icon: React.ReactNode; title: string; body: string; action?: React.ReactNode }) {
  return <div className="grid min-h-72 place-items-center text-center"><div><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#e9f5f6] text-[#14747c]">{icon}</span><h3 className="mt-4 text-sm font-bold">{title}</h3><p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-[#718095]">{body}</p>{action && <div className="mt-4">{action}</div>}</div></div>;
}

function QuickTools({ open, setOpen, view, setView }: { open: boolean; setOpen: (value: boolean) => void; view: ToolView; setView: (value: ToolView) => void }) {
  const [position, setPosition] = useState({ right: 18, bottom: 42 }); const drag = useRef<{ x: number; y: number; right: number; bottom: number; moved: boolean } | null>(null);
  const startDrag = (event: ReactPointerEvent<HTMLButtonElement>) => { drag.current = { x: event.clientX, y: event.clientY, right: position.right, bottom: position.bottom, moved: false }; event.currentTarget.setPointerCapture(event.pointerId); };
  const moveDrag = (event: ReactPointerEvent<HTMLButtonElement>) => { if (!drag.current) return; const dx = event.clientX - drag.current.x; const dy = event.clientY - drag.current.y; if (Math.abs(dx) + Math.abs(dy) > 5) drag.current.moved = true; setPosition({ right: Math.max(8, Math.min(window.innerWidth - 58, drag.current.right - dx)), bottom: Math.max(34, Math.min(window.innerHeight - 66, drag.current.bottom - dy)) }); };
  const endDrag = () => { if (drag.current && !drag.current.moved) setOpen(!open); drag.current = null; };
  const items: Array<{ id: ToolView; icon: React.ReactNode; label: string }> = [{ id: 'notes', icon: <FileText />, label: 'Notes' }, { id: 'bookmarks', icon: <Bookmark />, label: 'Bookmarks' }, { id: 'compare', icon: <Maximize2 />, label: 'Compare' }, { id: 'activity', icon: <Activity />, label: 'Activity' }];
  return <div className="fixed z-30 flex flex-col-reverse items-center gap-2" style={{ right: position.right, bottom: position.bottom }}>{open && items.map((item) => <button key={item.id} onClick={() => { setView(item.id); setOpen(true); }} title={item.label} aria-label={item.label} className={`grid size-10 place-items-center rounded-xl border shadow-lg ${view === item.id ? 'border-[#14747c] bg-[#e9f5f6] text-[#14747c]' : 'border-[#c9d3df] bg-white text-[#59687c]'}`}>{item.icon}</button>)}<button onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} aria-label="Drag or open quick tools" title="Drag or open quick tools" className="grid size-12 touch-none place-items-center rounded-2xl bg-[#14747c] text-white shadow-[0_10px_30px_rgba(20,116,124,.35)]"><Wrench className="size-5" /></button></div>;
}

export function SplitApp() {
  const [state, dispatch] = useReducer(splitReducer, undefined, cloneInitialState); const stateRef = useRef(state);
  const [hydrated, setHydrated] = useState(false); const [toolsOpen, setToolsOpen] = useState(false); const [toolView, setToolView] = useState<ToolView>('notes');
  const [status, setStatus] = useState<WebMcpStatus>({ available: false, count: 0, errors: [] }); const mobile = useIsMobile();
  useEffect(() => { stateRef.current = state; }, [state]);
  // oxlint-disable-next-line react/react-compiler -- hydrate versioned browser storage after mount
  useEffect(() => { dispatch({ type: 'hydrate', state: loadState(window.localStorage) }); setHydrated(true); }, []);
  useEffect(() => { if (hydrated) saveState(window.localStorage, state); }, [state, hydrated]);
  useEffect(() => { let cancelled = false; let dispose = () => {}; const tools = createTools({ getState: () => stateRef.current, apply: (action) => dispatch(action) }); void registerTools(document.modelContext, tools).then((registration) => { if (cancelled) { registration.dispose(); return; } dispose = registration.dispose; setStatus({ available: registration.available, count: registration.registered.length, errors: registration.errors }); }); return () => { cancelled = true; dispose(); }; }, []);
  const tab = activeTab(state);
  const bookmarkPane = (paneId: PaneId) => { const current = tab.panes[paneId]; if (state.bookmarks.some((item) => item.url === current.url)) return; const createdAt = new Date().toISOString(); dispatch({ type: 'add-bookmark', bookmark: { id: makeId('bookmark'), title: current.title, url: current.url, actor: 'human', createdAt }, activity: activity('human', 'Saved bookmark', current.title, createdAt) }); };
  const reset = () => { window.localStorage.removeItem(STORAGE_KEY); dispatch({ type: 'hydrate', state: cloneInitialState() }); };
  return (
    <main className="flex h-dvh min-h-[620px] flex-col overflow-hidden bg-[#f4f7fb] text-[#172033]">
      <header className="flex h-14 shrink-0 items-center border-b border-[#c9d3df] bg-white px-3 lg:px-4"><div className="grid size-9 place-items-center rounded-xl bg-[#14747c] text-sm font-black text-white">S</div><div className="ml-3"><h1 className="text-base font-black tracking-[0.15em]">SPLIT</h1><p className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#718095]">Dual Browser · WebMCP</p></div><div className="ml-auto flex items-center gap-2"><button onClick={() => { setToolView('activity'); setToolsOpen(true); }} className={`inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[10px] font-bold ${status.available ? 'bg-[#e9f5f6] text-[#14747c]' : 'bg-[#eef2f6] text-[#718095]'}`}>{status.available ? <Sparkles className="size-3.5" /> : <ShieldCheck className="size-3.5" />}{status.available ? `${status.count} WebMCP tools` : 'Human mode'}</button><button onClick={reset} aria-label="Reset demo workspace" className="grid size-8 place-items-center rounded-lg text-[#718095] hover:bg-[#eef2f6]"><RotateCcw className="size-4" /></button></div></header>
      <nav aria-label="Saved Split workspaces" className="grid h-12 shrink-0 grid-cols-4 gap-1.5 border-b border-[#c9d3df] bg-[#f4f7fb] p-1.5 lg:px-3">{state.tabs.map((item) => <button key={item.id} onClick={() => dispatch({ type: 'switch-tab', tabId: item.id, activity: activity('human', 'Switched workspace', `${item.label} restored with both pane URLs and split ratio.`) })} className={`rounded-lg text-xs font-bold transition ${state.activeTabId === item.id ? 'bg-[#14747c] text-white shadow-sm' : 'bg-[#e1e8f0] text-[#172033] hover:bg-[#d5dee8]'}`}>{item.label}<span className="ml-1 hidden text-[9px] font-medium opacity-65 sm:inline">{Math.round(item.splitRatio)}/{Math.round(100 - item.splitRatio)}</span></button>)}</nav>
      <section className="min-h-0 flex-1 p-1.5">
        <ResizablePanelGroup key={`${tab.id}-${mobile ? 'mobile' : 'desktop'}`} orientation={mobile ? 'vertical' : 'horizontal'} defaultLayout={{ left: tab.splitRatio, right: 100 - tab.splitRatio }} onLayoutChanged={(layout) => { if (typeof layout.left === 'number') dispatch({ type: 'set-split-ratio', tabId: tab.id, ratio: layout.left }); }}>
          <ResizablePanel id="left" minSize="20%"><BrowserPane paneId="left" state={state} dispatch={dispatch} onBookmark={bookmarkPane} /></ResizablePanel>
          <ResizableHandle withHandle className="mx-1 w-3 rounded-md bg-[#cbd5e1] aria-[orientation=horizontal]:my-1 aria-[orientation=horizontal]:h-3 aria-[orientation=horizontal]:w-full" />
          <ResizablePanel id="right" minSize="20%"><BrowserPane paneId="right" state={state} dispatch={dispatch} onBookmark={bookmarkPane} /></ResizablePanel>
        </ResizablePanelGroup>
      </section>
      <footer className="flex min-h-7 shrink-0 items-center justify-between border-t border-[#c9d3df] bg-[#172033] px-3 py-1 text-[9px] text-white/65"><span className="flex items-center gap-1.5"><ShieldCheck className="size-3" /> Safe URLs · honest embed fallback · local workspace state</span><span className="hidden sm:block">Human + Agent share T1–T4, panes, notes, bookmarks, and evidence</span></footer>
      <QuickTools open={toolsOpen} setOpen={setToolsOpen} view={toolView} setView={setToolView} />
      {toolsOpen && <ToolPanel view={toolView} state={state} dispatch={dispatch} close={() => setToolsOpen(false)} />}
    </main>
  );
}
