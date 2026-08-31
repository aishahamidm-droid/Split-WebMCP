import type { ReactNode } from 'react';

export function DemoShell({ eyebrow, title, children, tone = 'ocean' }: { eyebrow: string; title: string; children: ReactNode; tone?: 'ocean' | 'blue' | 'rose' | 'amber' }) {
  const colors = { ocean: 'from-[#e1f3f4] to-[#f8fbfc] text-[#14747c]', blue: 'from-[#e6f0ff] to-[#fafcff] text-[#285d9f]', rose: 'from-[#fbe9ef] to-[#fffafa] text-[#a14864]', amber: 'from-[#fff1d4] to-[#fffdf7] text-[#a96618]' };
  return <main className="min-h-screen bg-white text-[#172033]"><header className={`border-b border-black/10 bg-gradient-to-br ${colors[tone]} px-6 py-10 lg:px-10`}><p className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-65">{eyebrow}</p><h1 className="mt-3 max-w-2xl text-3xl font-black tracking-tight lg:text-5xl">{title}</h1></header><article className="mx-auto max-w-3xl px-6 py-8 text-sm leading-7 text-[#59687c] lg:px-10">{children}</article></main>;
}
