import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://split-webmcp.aishahamidm.chatgpt.site'),
  title: 'Split WebMCP — Dual Browser',
  description: 'Split’s two-pane browser workspace, extended with real WebMCP tools for human and agent collaboration.',
  openGraph: {
    title: 'Split WebMCP',
    description: 'Two browsers. One shared workspace. Human + Agent.',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Split WebMCP',
    description: 'Two browsers. One shared workspace. Human + Agent.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
