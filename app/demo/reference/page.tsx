import { DemoShell } from '@/components/demo-shell';

export default function ReferencePage() {
  return <DemoShell eyebrow="Reference sheet" title="Side-by-side research checklist" tone="amber"><div className="space-y-3">{[['1', 'Origin', 'Who published this page, and when?'], ['2', 'Evidence', 'Which claims are directly supported?'], ['3', 'Contrast', 'What does the other pane add or contradict?'], ['4', 'Capture', 'Save the useful result to Split notes or bookmarks.']].map(([number, title, body]) => <section key={number} className="grid grid-cols-[36px_1fr] gap-3 rounded-xl border border-[#e6d5b8] bg-[#fffdf8] p-4"><span className="grid size-8 place-items-center rounded-lg bg-[#a96618] font-bold text-white">{number}</span><div><strong className="text-[#172033]">{title}</strong><p>{body}</p></div></section>)}</div></DemoShell>;
}
