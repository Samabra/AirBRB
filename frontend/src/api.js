const API_BASE = 'http://localhost:5005';


export function apiRequest(path, method = 'GET', body, token) {
    const headers = { 'Content-Type': 'application/json' };
  
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  
    const options = { method, headers };
  
    if (method !== 'GET' && method !== 'HEAD' && body) {
      options.body = JSON.stringify(body);
    }
  
    return fetch(`${API_BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined })
  .then(async (res) => {
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      if (!res.ok) return Promise.reject(new Error(data.error || 'Request failed'));
      return data;
    } catch {
      return Promise.reject(new Error(`Invalid JSON response: ${text}`));
    }
    });
  }
  