/**
 * Central API utility for Placify.
 * All requests go through here, credentials (cookies) are always included.
 */

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(method, path, body) {
  const options = {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  };
  if (body !== undefined) options.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path),

  // Progress endpoints
  progress: {
    getSummary: () => api.get('/progress'),
    solveTopic: (topicId, count = 1) => api.post(`/progress/topic/${topicId}/solve`, { count }),
    recordQuiz: (data) => api.post('/progress/quiz', data),
    toggleGoal: (index, completed) => api.patch(`/progress/goals/${index}`, { completed }),
    toggleBookmark: (data) => api.post('/progress/bookmarks', data),
    getContent: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return api.get(`/progress/content${qs ? `?${qs}` : ''}`);
    }
  }
};
