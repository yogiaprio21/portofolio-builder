export const API_BASE = "http://localhost:3000";

export async function createPortfolio(data){
  const res = await fetch(`${API_BASE}/portfolios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return await res.json();
}

export async function getPortfolio(id){
  const res = await fetch(`${API_BASE}/portfolios/${id}`);
  return await res.json();
}
