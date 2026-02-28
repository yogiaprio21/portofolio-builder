import { env } from "./shared/config/env";

function authHeaders(token) {
  const headers = { "Content-Type": "application/json" };
  const t = token || (typeof window !== 'undefined' ? window.localStorage.getItem('ACCESS_TOKEN') : '');
  if (t) headers["Authorization"] = `Bearer ${t}`;
  return headers;
}

async function fetchJson(url, options) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { error: data.error || "Request failed", status: res.status };
  }
  return data;
}

export async function createPortfolio(data){
  return await fetchJson(`${env.apiBase}/portfolios`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
}

export async function getPortfolio(id){
  return await fetchJson(`${env.apiBase}/portfolios/${id}`, {
    headers: authHeaders()
  });
}

export async function updatePortfolio(id, payload){
  return await fetchJson(`${env.apiBase}/portfolios/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload)
  });
}

export async function getTemplates(){
  return await fetchJson(`${env.apiBase}/templates`);
}

export async function getTemplate(id){
  return await fetchJson(`${env.apiBase}/templates/${id}`);
}

export async function login(payload){
  return await fetchJson(`${env.apiBase}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

export async function register(payload){
  return await fetchJson(`${env.apiBase}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

export async function verifyEmail(token){
  const url = new URL(`${env.apiBase}/auth/verify`);
  url.searchParams.set("token", token);
  return await fetchJson(url);
}

export async function aiEnhanceCv(payload){
  try {
    const res = await fetch(`${env.apiBase}/ai/parse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("AI endpoint not available");
    return await res.json();
  } catch (err) {
    return { error: err.message || "AI unavailable" };
  }
}

// Portfolio Items (PostgreSQL-backed)
export async function listPortfolioItems({ q, limit, offset } = {}){
  const url = new URL(`${env.apiBase}/api/portfolios`);
  if (q) url.searchParams.set("q", q);
  if (limit != null) url.searchParams.set("limit", String(limit));
  if (offset != null) url.searchParams.set("offset", String(offset));
  return await fetchJson(url);
}

export async function getPortfolioItem(id){
  return await fetchJson(`${env.apiBase}/api/portfolios/${id}`);
}

export async function createPortfolioItem(payload, token){
  return await fetchJson(`${env.apiBase}/api/portfolios`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload)
  });
}

export async function updatePortfolioItem(id, payload, token){
  return await fetchJson(`${env.apiBase}/api/portfolios/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(payload)
  });
}

export async function deletePortfolioItem(id, token){
  return await fetchJson(`${env.apiBase}/api/portfolios/${id}`, {
    method: "DELETE",
    headers: authHeaders(token)
  });
}

export async function uploadImage(file){
  const form = new FormData();
  form.append("image", file);
  return await fetchJson(`${env.apiBase}/upload/image`, {
    method: "POST",
    body: form
  });
}

export async function listMyPortfolioItems({ limit, offset } = {}) {
  const url = new URL(`${env.apiBase}/api/my/portfolios`);
  if (limit != null) url.searchParams.set("limit", String(limit));
  if (offset != null) url.searchParams.set("offset", String(offset));
  return await fetchJson(url, { headers: authHeaders() });
}
