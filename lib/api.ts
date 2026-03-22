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
  IGMediaList,
  IGMediaWithInsights,
  IGMediaInsights,
  IGAccountSummary,
  IGDemographics,
  IGMedia,
  IGComment,
  OAuthLoginResponse,
  OAuthCallbackResponse,
  FacebookSessionResponse,
  InstagramSessionResponse,
  TikTokSessionResponse,
  TikTokVideoList,
  BrandRegisterPayload,
  BrandLoginPayload,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth endpoints (legacy + brand-linked)
export const authAPI = {
  /** Initiate Facebook OAuth. Pass brand JWT to link the session to the brand. */
  login: (brandToken?: string): Promise<AxiosResponse<OAuthLoginResponse>> =>
    api.get<OAuthLoginResponse>('/facebook/auth/login', brandToken
      ? { headers: { Authorization: `Bearer ${brandToken}` } }
      : undefined),

  checkStatus: (sessionId: string): Promise<AxiosResponse<AuthStatus>> =>
    api.get<AuthStatus>(`/facebook/auth/status/${sessionId}`),

  logout: (sessionId: string): Promise<AxiosResponse<{ success: boolean; message: string }>> =>
    api.post<{ success: boolean; message: string }>(`/facebook/auth/logout/${sessionId}`),
};

/** Brand-linked Instagram session management (requires brand JWT). */
export const instagramSessionAPI = {
  /** Initiate Instagram Business Login. Pass brand JWT to link the session. */
  connect: (brandToken: string): Promise<AxiosResponse<OAuthLoginResponse>> =>
    api.get<OAuthLoginResponse>('/instagram/auth/connect', {
      headers: { Authorization: `Bearer ${brandToken}` },
    }),

  /** Get the Instagram session linked to the authenticated brand. */
  getSession: (brandToken: string): Promise<AxiosResponse<InstagramSessionResponse>> =>
    api.get<InstagramSessionResponse>('/instagram/auth/session', {
      headers: { Authorization: `Bearer ${brandToken}` },
    }),

  /** Disconnect the Instagram account from the brand. */
  disconnect: (brandToken: string): Promise<AxiosResponse<{ success: boolean; message: string }>> =>
    api.delete('/instagram/auth/disconnect', {
      headers: { Authorization: `Bearer ${brandToken}` },
    }),
};

/** Brand-linked TikTok session management (requires brand JWT). */
export const tiktokSessionAPI = {
  /** Initiate TikTok Login Kit OAuth. Pass brand JWT to link the session to the brand. */
  connect: (brandToken: string): Promise<AxiosResponse<OAuthLoginResponse>> =>
    api.get<OAuthLoginResponse>('/tiktok/auth/connect', {
      headers: { Authorization: `Bearer ${brandToken}` },
    }),

  /** Get the TikTok session linked to the authenticated brand. */
  getSession: (brandToken: string): Promise<AxiosResponse<TikTokSessionResponse>> =>
    api.get<TikTokSessionResponse>('/tiktok/auth/session', {
      headers: { Authorization: `Bearer ${brandToken}` },
    }),

  /** Disconnect the TikTok account from the brand. */
  disconnect: (brandToken: string): Promise<AxiosResponse<{ success: boolean; message: string }>> =>
    api.delete('/tiktok/auth/disconnect', {
      headers: { Authorization: `Bearer ${brandToken}` },
    }),
};

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

// ─── Instagram API ────────────────────────────────────────────────────────────
//
// All calls require session_id (Instagram session) + ig_user_id.

export const instagramAPI = {
  /** Get the full profile for an Instagram account. */
  getProfile: (
    igUserId: string,
    sessionId: string,
  ): Promise<AxiosResponse<ApiResponse<IGMedia>>> =>
    api.get<ApiResponse<IGMedia>>(`/instagram/accounts/${igUserId}/profile`, {
      params: { session_id: sessionId },
    }),

  /** Get feed media (posts, reels, carousels) with engagement counts. */
  getMedia: (
    igUserId: string,
    sessionId: string,
    options?: { limit?: number; since?: string; until?: string; after?: string },
  ): Promise<AxiosResponse<ApiResponse<IGMediaList>>> =>
    api.get<ApiResponse<IGMediaList>>(`/instagram/accounts/${igUserId}/media`, {
      params: {
        session_id: sessionId,
        limit: options?.limit,
        since: options?.since,
        until: options?.until,
        after: options?.after,
      },
    }),

  /** Get media + per-post insights in a single call (capped at 25 items). */
  getMediaWithInsights: (
    igUserId: string,
    sessionId: string,
    options?: { limit?: number; since?: string; until?: string },
  ): Promise<AxiosResponse<ApiResponse<{ total: number; media: IGMediaWithInsights[]; paging: object }>>> =>
    api.get(`/instagram/accounts/${igUserId}/media/with-insights`, {
      params: {
        session_id: sessionId,
        limit: options?.limit,
        since: options?.since,
        until: options?.until,
      },
    }),

  /** Get currently active stories (24-hour window). */
  getStories: (
    igUserId: string,
    sessionId: string,
  ): Promise<AxiosResponse<ApiResponse<{ total: number; stories: IGMedia[] }>>> =>
    api.get(`/instagram/accounts/${igUserId}/stories`, {
      params: { session_id: sessionId },
    }),

  /** Get a single media object. Requires ig_user_id to look up the page token. */
  getSingleMedia: (
    mediaId: string,
    sessionId: string,
    igUserId: string,
  ): Promise<AxiosResponse<ApiResponse<IGMedia>>> =>
    api.get<ApiResponse<IGMedia>>(`/instagram/media/${mediaId}`, {
      params: { session_id: sessionId, ig_user_id: igUserId },
    }),

  /** Get per-post insights. `mediaProductType`: 'FEED' | 'REELS' | 'STORY' */
  getMediaInsights: (
    mediaId: string,
    sessionId: string,
    igUserId: string,
    mediaProductType: string = 'FEED',
  ): Promise<AxiosResponse<ApiResponse<IGMediaInsights>>> =>
    api.get<ApiResponse<IGMediaInsights>>(`/instagram/media/${mediaId}/insights`, {
      params: { session_id: sessionId, ig_user_id: igUserId, media_product_type: mediaProductType },
    }),

  /** Get comments on a media object. */
  getComments: (
    mediaId: string,
    sessionId: string,
    igUserId: string,
    limit: number = 50,
  ): Promise<AxiosResponse<ApiResponse<{ media_id: string; total: number; comments: IGComment[]; paging: object }>>> =>
    api.get(`/instagram/media/${mediaId}/comments`, {
      params: { session_id: sessionId, ig_user_id: igUserId, limit },
    }),

  /** Get children of a carousel album. */
  getCarouselChildren: (
    mediaId: string,
    sessionId: string,
    igUserId: string,
  ): Promise<AxiosResponse<ApiResponse<{ media_id: string; total: number; children: IGMedia[] }>>> =>
    api.get(`/instagram/media/${mediaId}/children`, {
      params: { session_id: sessionId, ig_user_id: igUserId },
    }),

  /** Get time-series account insights. period: 'day' | 'week' | 'days_28' | 'month' */
  getAccountInsights: (
    igUserId: string,
    sessionId: string,
    options?: { period?: string; since?: string; until?: string },
  ): Promise<AxiosResponse<ApiResponse<Record<string, { value: number; end_time: string }[]>>>> =>
    api.get(`/instagram/accounts/${igUserId}/insights`, {
      params: {
        session_id: sessionId,
        period: options?.period ?? 'day',
        since: options?.since,
        until: options?.until,
      },
    }),

  /** Get a full analytics summary (engagement totals + time-series + demographics). */
  getAccountSummary: (
    igUserId: string,
    sessionId: string,
    days: number = 30,
  ): Promise<AxiosResponse<ApiResponse<IGAccountSummary>>> =>
    api.get<ApiResponse<IGAccountSummary>>(`/instagram/accounts/${igUserId}/insights/summary`, {
      params: { session_id: sessionId, days },
    }),

  /** Get Reels only for an IG account using the dedicated /reels edge. */
  getReels: (
    igUserId: string,
    sessionId: string,
    options?: { limit?: number; since?: string; until?: string; after?: string },
  ): Promise<AxiosResponse<ApiResponse<IGMediaList>>> =>
    api.get<ApiResponse<IGMediaList>>(`/instagram/accounts/${igUserId}/reels`, {
      params: {
        session_id: sessionId,
        limit: options?.limit,
        since: options?.since,
        until: options?.until,
        after: options?.after,
      },
    }),

  /** Get lifetime audience demographics (gender/age, cities, countries). */
  getAudienceDemographics: (
    igUserId: string,
    sessionId: string,
  ): Promise<AxiosResponse<ApiResponse<IGDemographics>>> =>
    api.get<ApiResponse<IGDemographics>>(`/instagram/accounts/${igUserId}/insights/audience`, {
      params: { session_id: sessionId },
    }),
};

// ─── TikTok Content API ───────────────────────────────────────────────────────

export const tiktokAPI = {
  /** Get the connected TikTok account's videos (newest first, paginated). */
  getVideos: (
    sessionId: string,
    options?: { max_count?: number; cursor?: number },
  ): Promise<AxiosResponse<ApiResponse<TikTokVideoList>>> =>
    api.get<ApiResponse<TikTokVideoList>>('/tiktok/account/videos', {
      params: {
        session_id: sessionId,
        max_count: options?.max_count,
        cursor: options?.cursor,
      },
    }),
};

// ─── OAuth Callback API ───────────────────────────────────────────────────────

export const oauthCallbackAPI = {
  /** Forward the Facebook OAuth callback code+state to the backend. */
  facebookCallback: (code: string, state: string): Promise<AxiosResponse<OAuthCallbackResponse>> =>
    api.get<OAuthCallbackResponse>('/facebook/auth/callback', { params: { code, state } }),

  /** Forward the Instagram OAuth callback code+state to the backend. */
  instagramCallback: (code: string, state: string): Promise<AxiosResponse<OAuthCallbackResponse>> =>
    api.get<OAuthCallbackResponse>('/instagram/auth/callback', { params: { code, state } }),

  /** Forward the TikTok OAuth callback code+state to the backend. */
  tiktokCallback: (code: string, state: string): Promise<AxiosResponse<OAuthCallbackResponse>> =>
    api.get<OAuthCallbackResponse>('/tiktok/auth/callback', { params: { code, state } }),
};

export default api;
