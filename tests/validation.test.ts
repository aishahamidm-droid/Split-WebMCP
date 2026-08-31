import assert from 'node:assert/strict';
import test from 'node:test';
import { InputError, normalizeNavigationInput, normalizeUrl, rows } from '../lib/validation.ts';

void test('accepts approved demo and http/https resources', () => {
  assert.equal(normalizeUrl('split://demo/welcome'), '/demo/welcome');
  assert.equal(normalizeUrl('https://example.com/path'), 'https://example.com/path');
  assert.equal(normalizeNavigationInput('example.com'), 'https://example.com/');
});

void test('turns plain search text into an encoded search URL', () => {
  assert.equal(normalizeNavigationInput('webmcp security'), 'https://duckduckgo.com/?q=webmcp%20security');
});

void test('rejects unsafe schemes, credentials, malformed inputs, and unknown demos', () => {
  for (const value of ['javascript:alert(1)', 'data:text/html,bad', 'file:///etc/passwd', 'https://user:pass@example.com', 'split://demo/missing']) {
    assert.throws(() => normalizeUrl(value), InputError);
  }
});

void test('comparison rows enforce shape and bounds', () => {
  assert.deepEqual(rows([{ dimension: 'Price', left: '$1', right: '$2' }]), [{ dimension: 'Price', left: '$1', right: '$2', verdict: undefined }]);
  assert.throws(() => rows([]), InputError);
  assert.throws(() => rows([{ dimension: '', left: 'A', right: 'B' }]), InputError);
});
