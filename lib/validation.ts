import { LOCAL_DEMOS, type ComparisonRow, type PaneId, type TabId } from './split-state.ts';

export class InputError extends Error { constructor(message: string) { super(message); this.name = 'InputError'; } }
export function record(input: unknown): Record<string, unknown> { if (!input || typeof input !== 'object' || Array.isArray(input)) throw new InputError('Input must be an object.'); return input as Record<string, unknown>; }
export function text(input: unknown, label: string, max: number, required = true): string {
  if (typeof input !== 'string') { if (!required && input == null) return ''; throw new InputError(`${label} must be a string.`); }
  const value = input.trim(); if (required && !value) throw new InputError(`${label} is required.`); if (value.length > max) throw new InputError(`${label} must be ${max} characters or fewer.`); return value;
}
export function pane(input: unknown): PaneId { if (input !== 'left' && input !== 'right') throw new InputError('pane must be "left" or "right".'); return input; }
export function tab(input: unknown, fallback?: TabId): TabId { if (input == null && fallback) return fallback; if (!['tab1', 'tab2', 'tab3', 'tab4'].includes(String(input))) throw new InputError('tabId must be tab1, tab2, tab3, or tab4.'); return input as TabId; }

export function normalizeUrl(input: unknown): string {
  const value = text(input, 'url', 2048);
  if (value === 'about:blank') return value;
  if (value in LOCAL_DEMOS) return value;
  if (value.startsWith('split://demo/')) {
    const path = value.replace('split://demo/', '/demo/');
    if (path in LOCAL_DEMOS) return path;
    throw new InputError('Unknown Split demo page.');
  }
  let parsed: URL;
  try { parsed = new URL(value); } catch { throw new InputError('url must be an absolute http/https URL or an approved Split demo page.'); }
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new InputError('Only http and https URLs are allowed.');
  if (parsed.username || parsed.password) throw new InputError('URLs containing credentials are not allowed.');
  return parsed.toString();
}

export function normalizeNavigationInput(input: string): string {
  const value = text(input, 'address', 2048);
  if (value === 'about:blank' || value in LOCAL_DEMOS || value.startsWith('split://demo/')) return normalizeUrl(value);
  if (/^https?:\/\//i.test(value)) return normalizeUrl(value);
  if (!value.includes(' ') && /[.]/.test(value)) return normalizeUrl(`https://${value}`);
  return `https://duckduckgo.com/?q=${encodeURIComponent(value)}`;
}

export function rows(input: unknown): ComparisonRow[] {
  if (!Array.isArray(input) || input.length < 1 || input.length > 12) throw new InputError('rows must contain 1–12 items.');
  return input.map((item, index) => { const data = record(item); return { dimension: text(data.dimension, `rows[${index}].dimension`, 80), left: text(data.left, `rows[${index}].left`, 300), right: text(data.right, `rows[${index}].right`, 300), verdict: text(data.verdict, `rows[${index}].verdict`, 160, false) || undefined }; });
}
