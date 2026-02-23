import axios, { AxiosResponse } from 'axios';
import type {
  AuthStatus,
  PagesResponse,
  PageInsights,
  PostsResponse,
  AdInsights,
  ApiResponse,
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

// Auth endpoints
export const authAPI = {
  login: (): Promise<AxiosResponse<LoginResponse>> => 
    api.get<LoginResponse>('/facebook/auth/login'),
  
  checkStatus: (sessionId: string): Promise<AxiosResponse<AuthStatus>> => 
    api.get<AuthStatus>(`/facebook/auth/status/${sessionId}`),
  
  logout: (sessionId: string): Promise<AxiosResponse<LogoutResponse>> => 
    api.post<LogoutResponse>(`/facebook/auth/logout/${sessionId}`),
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

export default api;
