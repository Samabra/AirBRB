const API_BASE = 'http://localhost:5005';


export function apiRequest(path, method = 'GET', body, token) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    return fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    })
        .then((res) =>
            res.json().then((data) => ({
            ok: res.ok,
            data
        }))
    )
    .then(({ ok, data }) => {
        if (!ok) {
        return Promise.reject(new Error(data.error || 'Request failed'));
        }
        return data;
    });
}