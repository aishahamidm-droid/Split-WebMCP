'use client';

import { SyntheticEvent, useEffect, useState } from 'react';

interface SharedNote { id: string; title: string; body: string; actor: 'human' | 'agent' }

export default function NotepadPage() {
  const [notes, setNotes] = useState<SharedNote[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    const request = () => window.parent.postMessage({ type: 'split-notepad:request' }, window.location.origin);
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.data?.type !== 'split-notepad:state' || !Array.isArray(event.data.notes)) return;
      setNotes(event.data.notes as SharedNote[]);
    };
    window.addEventListener('message', receive);
    request();
    const timer = window.setInterval(request, 1200);
    return () => { window.removeEventListener('message', receive); window.clearInterval(timer); };
  }, []);

  const submit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!body.trim()) return;
    window.parent.postMessage({ type: 'split-notepad:add', title: title.trim(), body: body.trim() }, window.location.origin);
    setTitle(''); setBody('');
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(150deg,#fff7fb,#eef9ff)] p-4 text-[#2f2a3d]">
      <header><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#14747c]">Split workspace</p><h1 className="text-2xl font-black text-[#9a345a]">Notepad</h1><p className="mt-1 text-xs text-[#6f6375]">Shared with Quick Tools and WebMCP agents.</p></header>
      <form onSubmit={submit} className="mt-4 rounded-2xl border border-[#e9bdd1] bg-white/90 p-3 shadow-sm"><input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={100} placeholder="Title" className="h-9 w-full rounded-xl border border-[#e9bdd1] px-3 text-sm outline-none" /><textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={2000} placeholder="Write a note…" className="mt-2 min-h-28 w-full resize-y rounded-xl border border-[#e9bdd1] p-3 text-sm outline-none" /><button className="mt-2 rounded-xl bg-[#14747c] px-4 py-2 text-sm font-bold text-white">Save note</button></form>
      <section className="mt-4 grid gap-2">{notes.map((note, index) => <article key={note.id} className={`rounded-2xl p-3 shadow-sm ${['bg-[#ffe7f0]', 'bg-[#e7f7ff]', 'bg-[#f2edff]', 'bg-[#fff1d6]', 'bg-[#e6f8eb]'][index % 5]}`}><div className="flex items-center justify-between gap-2"><h2 className="font-bold">{note.title}</h2><span className="text-[9px] font-bold uppercase tracking-wider text-[#6f6375]">{note.actor}</span></div><p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-[#5a5066]">{note.body}</p></article>)}</section>
    </main>
  );
}
