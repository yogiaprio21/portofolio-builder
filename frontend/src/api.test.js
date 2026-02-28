import { describe, it, expect, vi } from 'vitest';

vi.stubGlobal(
  'fetch',
  vi.fn(async () => ({ ok: true, json: async () => ({ ok: true }) })),
);
vi.mock('./shared/config/env', () => ({ env: { apiBase: 'http://example.com' } }));

describe('api module', () => {
  it('uses API_BASE from env', async () => {
    const { createPortfolio } = await import('./api.js');
    await createPortfolio({ a: 1 });
    expect(fetch).toHaveBeenCalledWith('http://example.com/portfolios', expect.any(Object));
  });
});
