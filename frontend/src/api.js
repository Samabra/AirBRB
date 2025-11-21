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
  
    return fetch(`${API_BASE}${path}`, options)
      .then((res) =>
        res.json().then((data) => ({
          ok: res.ok,
          data,
        }))
      )
      .then(({ ok, data }) => {
        if (!ok) {
          return Promise.reject(new Error(data.error || 'Request failed'));
        }
        return data;
      });
  }
  