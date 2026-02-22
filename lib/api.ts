import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth endpoints
export const authAPI = {
  login: () => api.get('/facebook/auth/login'),
  checkStatus: (sessionId: string) => api.get(`/facebook/auth/status/${sessionId}`),
  logout: (sessionId: string) => api.post(`/facebook/auth/logout/${sessionId}`),
};

// Pages endpoints
export const pagesAPI = {
  getPages: (sessionId: string) => api.get('/facebook/pages', { params: { session_id: sessionId } }),
  getPageInsights: (pageId: string, sessionId: string, pageToken?: string) => 
    api.get(`/facebook/pages/${pageId}/insights`, { 
      params: { session_id: sessionId, page_token: pageToken } 
    }),
  getPagePosts: (pageId: string, sessionId: string, limit = 25, pageToken?: string) =>
    api.get(`/facebook/pages/${pageId}/posts`, {
      params: { session_id: sessionId, limit, page_token: pageToken }
    }),
};

// Insights endpoints
export const insightsAPI = {
  getAdInsights: (accountId: string, sessionId: string) =>
    api.get(`/facebook/insights/${accountId}`, { params: { session_id: sessionId } }),
};

export default api;
