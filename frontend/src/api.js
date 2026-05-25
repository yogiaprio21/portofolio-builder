import { env } from './shared/config/env';

export const ACCESS_TOKEN_KEY = 'ACCESS_TOKEN';
const USER_KEY = 'USER';
let refreshPromise = null;

function authHeaders(token) {
  const headers = { 'Content-Type': 'application/json' };
  const t =
    token || (typeof window !== 'undefined' ? window.localStorage.getItem(ACCESS_TOKEN_KEY) : '');
  if (t) headers['Authorization'] = `Bearer ${t}`;
  return headers;
}

function persistSession(data) {
  if (typeof window === 'undefined' || !data) return;
  if (data.token) window.localStorage.setItem(ACCESS_TOKEN_KEY, data.token);
  if (data.user) window.localStorage.setItem(USER_KEY, JSON.stringify(data.user));
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getStoredToken() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(ACCESS_TOKEN_KEY) || '';
}

async function rawFetchJson(url, options = {}) {
  const res = await fetch(url, { credentials: 'include', ...options });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

async function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = rawFetchJson(`${env.apiBase}/auth/refresh`, { method: 'POST' })
      .then(({ res, data }) => {
        if (!res.ok) {
          clearSession();
          return null;
        }
        persistSession(data);
        return data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function fetchJson(url, options = {}, { retryAuth = true } = {}) {
  let { res, data } = await rawFetchJson(url, options);
  if (res.status === 401 && retryAuth) {
    const refreshed = await refreshSession();
    if (refreshed?.token) {
      const nextOptions = { ...options };
      nextOptions.headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${refreshed.token}`,
      };
      ({ res, data } = await rawFetchJson(url, nextOptions));
    }
  }
  if (!res.ok) {
    if (res.status === 401) clearSession();
    return { error: data.error || 'Request failed', status: res.status };
  }
  persistSession(data);
  return data;
}

export async function createPortfolio(data) {
  return await fetchJson(`${env.apiBase}/portfolios`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
}

export async function getPortfolio(id) {
  return await fetchJson(`${env.apiBase}/portfolios/${id}`, {
    headers: authHeaders(),
  });
}

export async function updatePortfolio(id, payload) {
  return await fetchJson(`${env.apiBase}/portfolios/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function getTemplates() {
  return await fetchJson(`${env.apiBase}/templates`);
}

export async function getTemplate(id) {
  return await fetchJson(`${env.apiBase}/templates/${id}`);
}

export async function login(payload) {
  return await fetchJson(
    `${env.apiBase}/auth/login`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    { retryAuth: false },
  );
}

export async function register(payload) {
  return await fetchJson(`${env.apiBase}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function logout() {
  const data = await fetchJson(
    `${env.apiBase}/auth/logout`,
    {
      method: 'POST',
      headers: authHeaders(),
    },
    { retryAuth: false },
  );
  clearSession();
  return data;
}

export async function getMe() {
  return await fetchJson(`${env.apiBase}/auth/me`, {
    headers: authHeaders(),
  });
}

export async function resendVerification(payload) {
  return await fetchJson(
    `${env.apiBase}/auth/resend-verification`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    { retryAuth: false },
  );
}

export async function verifyEmail(token) {
  const url = new URL(`${env.apiBase}/auth/verify`);
  url.searchParams.set('token', token);
  return await fetchJson(url);
}

export async function aiEnhanceCv(payload) {
  try {
    const res = await fetch(`${env.apiBase}/ai/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('AI endpoint not available');
    return await res.json();
  } catch (err) {
    return { error: err.message || 'AI unavailable' };
  }
}

// Portfolio Items (PostgreSQL-backed)
export async function listPortfolioItems({ q, limit, offset } = {}) {
  const url = new URL(`${env.apiBase}/api/portfolios`);
  if (q) url.searchParams.set('q', q);
  if (limit != null) url.searchParams.set('limit', String(limit));
  if (offset != null) url.searchParams.set('offset', String(offset));
  return await fetchJson(url);
}

export async function getPortfolioItem(id) {
  return await fetchJson(`${env.apiBase}/api/portfolios/${id}`);
}

export async function createPortfolioItem(payload, token) {
  return await fetchJson(`${env.apiBase}/api/portfolios`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function updatePortfolioItem(id, payload, token) {
  return await fetchJson(`${env.apiBase}/api/portfolios/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function deletePortfolioItem(id, token) {
  return await fetchJson(`${env.apiBase}/api/portfolios/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
}

export async function uploadImage(file) {
  const form = new FormData();
  form.append('image', file);
  return await fetchJson(`${env.apiBase}/upload/image`, {
    method: 'POST',
    headers: getStoredToken() ? { Authorization: `Bearer ${getStoredToken()}` } : undefined,
    body: form,
  });
}

export async function listMyPortfolioItems({ q, limit, offset } = {}) {
  const url = new URL(`${env.apiBase}/api/my/portfolios`);
  if (q) url.searchParams.set('q', q);
  if (limit != null) url.searchParams.set('limit', String(limit));
  if (offset != null) url.searchParams.set('offset', String(offset));
  return await fetchJson(url, { headers: authHeaders() });
}
