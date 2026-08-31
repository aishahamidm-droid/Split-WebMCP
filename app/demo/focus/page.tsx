import { DemoShell } from '@/components/demo-shell';

export default function FocusPage() {
  return <DemoShell eyebrow="Reading · 4 min" title="A calmer way to research with two browser panes." tone="rose"><p className="text-base">Research becomes brittle when every useful source replaces the last one. A stable second pane gives context somewhere to live.</p><h2 className="mt-8 text-xl font-bold text-[#172033]">Keep the question beside the source</h2><p className="mt-2">Put an article in one pane and a reference, note, or checklist in the other. Resize only when one side needs more attention.</p><blockquote className="mt-8 border-l-4 border-[#a14864] bg-[#fff6f9] p-5 text-[#75364b]">The useful unit is not a tab. It is a pair of pages that belong together.</blockquote></DemoShell>;
}
