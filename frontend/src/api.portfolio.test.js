import { describe, it, expect, vi } from 'vitest';

vi.stubGlobal(
  'fetch',
  vi.fn(async (url, opts) => {
    if (String(url).includes('/api/portfolios') && (!opts || opts.method === 'GET')) {
      return { ok: true, json: async () => [{ id: 1, title: 'A', description: 'B' }] };
    }
    return { ok: true, json: async () => ({ id: 1 }) };
  }),
);
vi.mock('./shared/config/env', () => ({ env: { apiBase: 'http://example.com' } }));

describe('portfolio API', () => {
  it('lists portfolio items', async () => {
    const { listPortfolioItems } = await import('./api.js');
    const items = await listPortfolioItems();
    const [calledUrl] = fetch.mock.calls[0];
    expect(String(calledUrl)).toBe('http://example.com/api/portfolios');
    expect(Array.isArray(items)).toBe(true);
  });

  it('creates portfolio item with auth', async () => {
    const { createPortfolioItem } = await import('./api.js');
    const res = await createPortfolioItem({ title: 'X', description: 'Y' }, 'token123');
    const [, opts] = fetch.mock.calls[1];
    expect(opts.headers.Authorization).toBe('Bearer token123');
    expect(res.id).toBe(1);
  });
});
