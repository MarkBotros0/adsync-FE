import axios, { AxiosResponse } from 'axios';
import type {
  AuthStatus,
  PagesResponse,
  PageInsights,
  PostsResponse,
  AdInsights,
  ApiResponse,
  BrandSession,
  BrandValidateResponse,
  Subscription,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API types
interface LoginResponse {
  login_url: string;
  message: string;
}

interface LogoutResponse {
  success: boolean;
  message: string;
}

// Auth endpoints (legacy + brand-linked)
export const authAPI = {
  /** Initiate Facebook OAuth. Pass brand JWT to link the session to the brand. */
  login: (brandToken?: string): Promise<AxiosResponse<LoginResponse>> =>
    api.get<LoginResponse>('/facebook/auth/login', brandToken
      ? { headers: { Authorization: `Bearer ${brandToken}` } }
      : undefined),

  checkStatus: (sessionId: string): Promise<AxiosResponse<AuthStatus>> =>
    api.get<AuthStatus>(`/facebook/auth/status/${sessionId}`),

  logout: (sessionId: string): Promise<AxiosResponse<LogoutResponse>> =>
    api.post<LogoutResponse>(`/facebook/auth/logout/${sessionId}`),
};

interface FacebookSessionResponse {
  connected: boolean;
  session_id: string | null;
  user_name: string | null;
  user_id?: string | null;
}

/** Brand-linked Facebook session management (requires brand JWT). */
export const facebookSessionAPI = {
  /** Get the Facebook session linked to the authenticated brand. */
  getSession: (brandToken: string): Promise<AxiosResponse<FacebookSessionResponse>> =>
    api.get<FacebookSessionResponse>('/facebook/auth/session', {
      headers: { Authorization: `Bearer ${brandToken}` },
    }),

  /** Disconnect the Facebook account from the brand. */
  disconnect: (brandToken: string): Promise<AxiosResponse<{ success: boolean; message: string }>> =>
    api.delete('/facebook/auth/disconnect', {
      headers: { Authorization: `Bearer ${brandToken}` },
    }),
};

// Pages endpoints
export const pagesAPI = {
  getPages: (sessionId: string): Promise<AxiosResponse<PagesResponse>> => 
    api.get<PagesResponse>('/facebook/pages', { 
      params: { session_id: sessionId } 
    }),
  
  getPageInsights: (
    pageId: string, 
    sessionId: string, 
    pageToken?: string
  ): Promise<AxiosResponse<ApiResponse<PageInsights>>> => 
    api.get<ApiResponse<PageInsights>>(`/facebook/pages/${pageId}/insights`, { 
      params: { session_id: sessionId, page_token: pageToken } 
    }),
  
  getPagePosts: (
    pageId: string, 
    sessionId: string, 
    limit: number = 25, 
    pageToken?: string
  ): Promise<AxiosResponse<PostsResponse>> =>
    api.get<PostsResponse>(`/facebook/pages/${pageId}/posts`, {
      params: { session_id: sessionId, limit, page_token: pageToken }
    }),
};

// Insights endpoints
export const insightsAPI = {
  getAdInsights: (
    accountId: string, 
    sessionId: string
  ): Promise<AxiosResponse<AdInsights>> =>
    api.get<AdInsights>(`/facebook/insights/${accountId}`, { 
      params: { session_id: sessionId } 
    }),
};

// ─── Brand Auth API ───────────────────────────────────────────────────────────

interface BrandRegisterPayload {
  name: string;
  email: string;
  password: string;
  subscription_name?: string;
  logo_url?: string;
  website?: string;
  industry?: string;
}

interface BrandLoginPayload {
  email: string;
  password: string;
}

function _brandAuthHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export const brandAuthAPI = {
  register: (payload: BrandRegisterPayload): Promise<AxiosResponse<BrandSession>> =>
    api.post<BrandSession>('/brands/register', payload),

  login: (payload: BrandLoginPayload): Promise<AxiosResponse<BrandSession>> =>
    api.post<BrandSession>('/brands/login', payload),

  me: (token: string): Promise<AxiosResponse<{ success: boolean; brand: BrandSession['brand'] }>> =>
    api.get('/brands/me', { headers: _brandAuthHeaders(token) }),

  /** Called every 5 s by the frontend to validate the JWT and session_key. */
  validate: (token: string): Promise<AxiosResponse<BrandValidateResponse>> =>
    api.get<BrandValidateResponse>('/brands/validate', { headers: _brandAuthHeaders(token) }),

  logout: (token: string): Promise<AxiosResponse<{ success: boolean; message: string }>> =>
    api.post('/brands/logout', {}, { headers: _brandAuthHeaders(token) }),

  /** Rotates the server-side session key, invalidating all other sessions. */
  forceSignOut: (token: string): Promise<AxiosResponse<BrandSession & { message: string }>> =>
    api.post('/brands/force-signout', {}, { headers: _brandAuthHeaders(token) }),
};

// ─── Subscriptions API ────────────────────────────────────────────────────────

export const subscriptionsAPI = {
  list: (): Promise<AxiosResponse<{ success: boolean; subscriptions: Subscription[] }>> =>
    api.get('/subscriptions'),

  get: (name: string): Promise<AxiosResponse<{ success: boolean; subscription: Subscription }>> =>
    api.get(`/subscriptions/${name}`),
};

export default api;
