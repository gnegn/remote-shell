const API_BASE = "/api";

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("authToken");
  
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    // Якщо токен протермінований або відсутній — редірект на логін
    window.location.href = "/login";
    return;
  }

  return res;
}
