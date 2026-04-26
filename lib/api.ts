import axios, { AxiosResponse } from 'axios';
import type {
  AuthStatus,
  PagesResponse,
  PageInsights,
  PostsResponse,
  AdInsights,
  ApiResponse,
  UserSession,
  BrandValidateResponse,
  Subscription,
  IGMediaList,
  IGMediaWithInsights,
  IGMediaInsights,
  IGAccountSummary,
  IGDemographics,
  IGMedia,
  IGComment,
  IGTimeSeriesPoint,
  OAuthLoginResponse,
  OAuthCallbackResponse,
  FacebookSessionResponse,
  InstagramSessionResponse,
  TikTokSessionResponse,
  TikTokVideoList,
  BrandRegisterPayload,
  BrandLoginPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  ContentFeedResponse,
  InvitePayload,
  AcceptInvitePayload,
  InviteVerifyResponse,
  Invitation,
  AdminInvitationsResponse,
  AdminUsersResponse,
  AdminBrandsResponse,
  CreateBrandPayload,
  CompetitorCreatePayload,
  CompetitorEnvelope,
  CompetitorListResponse,
  CompetitorCreateResponse,
  Competitor,
  CompetitorJobCreatedResponse,
  CompetitorJobStatusResponse,
  CompetitorResultsResponse,
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
  register: (payload: BrandRegisterPayload): Promise<AxiosResponse<UserSession>> =>
    api.post<UserSession>('/brands/register', payload),

  login: (payload: BrandLoginPayload): Promise<AxiosResponse<UserSession>> =>
    api.post<UserSession>('/brands/login', payload),

  selectBrand: (payload: { selection_token: string; brand_id: number }): Promise<AxiosResponse<UserSession>> =>
    api.post<UserSession>('/brands/select-brand', payload),

  switchBrand: (token: string, brand_id: number): Promise<AxiosResponse<UserSession>> =>
    api.post<UserSession>('/brands/switch-brand', { brand_id }, { headers: _brandAuthHeaders(token) }),

  myBrands: (token: string): Promise<AxiosResponse<{ success: boolean; brands: import('./types').BrandSwitcherEntry[] }>> =>
    api.get('/brands/my-brands', { headers: _brandAuthHeaders(token) }),

  me: (token: string): Promise<AxiosResponse<{ success: boolean; user: UserSession['user'] }>> =>
    api.get('/brands/me', { headers: _brandAuthHeaders(token) }),

  /** Called every 5 s by the frontend to validate the JWT and session_key. */
  validate: (token: string): Promise<AxiosResponse<BrandValidateResponse>> =>
    api.get<BrandValidateResponse>('/brands/validate', { headers: _brandAuthHeaders(token) }),

  forgotPassword: (payload: ForgotPasswordPayload): Promise<AxiosResponse<{ success: boolean; message: string }>> =>
    api.post('/brands/forgot-password', payload),

  resetPassword: (payload: ResetPasswordPayload): Promise<AxiosResponse<{ success: boolean; message: string }>> =>
    api.post('/brands/reset-password', payload),

  logout: (token: string): Promise<AxiosResponse<{ success: boolean; message: string }>> =>
    api.post('/brands/logout', {}, { headers: _brandAuthHeaders(token) }),

  /** Rotates the server-side session key, invalidating all other sessions. */
  forceSignOut: (token: string): Promise<AxiosResponse<{ success: boolean; message: string; access_token: string; token_type: string }>> =>
    api.post('/brands/force-signout', {}, { headers: _brandAuthHeaders(token) }),
};

// ─── Organization API ─────────────────────────────────────────────────────────

export const organizationAPI = {
  getMyOrg: (token: string): Promise<AxiosResponse<{ success: boolean; organization: import('./types').Organization & { brand_count: number; max_brands: number } }>> =>
    api.get('/organizations/me', { headers: _brandAuthHeaders(token) }),

  createBrand: (token: string, payload: { name: string; logo_url?: string; website?: string; industry?: string }): Promise<AxiosResponse<{ success: boolean; brand: import('./types').Brand }>> =>
    api.post('/organizations/brands', payload, { headers: _brandAuthHeaders(token) }),

  listBrands: (token: string): Promise<AxiosResponse<{ success: boolean; total: number; brands: import('./types').Brand[] }>> =>
    api.get('/organizations/brands', { headers: _brandAuthHeaders(token) }),

  updateBrand: (token: string, brandId: number, payload: { name?: string; logo_url?: string; website?: string; industry?: string }): Promise<AxiosResponse<{ success: boolean; brand: import('./types').Brand }>> =>
    api.patch(`/organizations/brands/${brandId}`, payload, { headers: _brandAuthHeaders(token) }),

  deleteBrand: (token: string, brandId: number): Promise<AxiosResponse<{ success: boolean; message: string }>> =>
    api.delete(`/organizations/brands/${brandId}`, { headers: _brandAuthHeaders(token) }),

  listMembers: (token: string): Promise<AxiosResponse<{ success: boolean; total: number; members: { id: number; email: string; name: string; is_active: boolean; joined_at: string }[] }>> =>
    api.get('/organizations/members', { headers: _brandAuthHeaders(token) }),
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

  /** Get daily follower count time-series for the connected Instagram account (session-only). */
  getFollowerTimeSeries: (
    sessionId: string,
    options?: { since?: string; until?: string },
  ): Promise<AxiosResponse<ApiResponse<Record<string, IGTimeSeriesPoint[]>>>> =>
    api.get(`/instagram/account/insights`, {
      params: {
        session_id: sessionId,
        period: 'day',
        since: options?.since,
        until: options?.until,
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

// ─── Unified Content Feed API ─────────────────────────────────────────────────

export const contentFeedAPI = {
  /**
   * Fetch content from all connected platforms in a single call.
   * Authenticated via brand JWT — sessions are resolved server-side.
   */
  getFeed: (
    brandToken: string,
    options?: {
      platforms?: string;
      date_from?: string;
      date_to?: string;
      sort?: 'recent' | 'popular';
      page?: number;
      page_size?: number;
    },
  ): Promise<AxiosResponse<ContentFeedResponse>> =>
    api.get<ContentFeedResponse>('/content/feed', {
      headers: _brandAuthHeaders(brandToken),
      params: options,
    }),

  /** Fetch per-post insights for a single content item. */
  getPostInsights: (
    brandToken: string,
    platform: string,
    postId: string,
    postFormat?: string,
  ): Promise<AxiosResponse<{ success: boolean; data?: import('./types').PostInsights; error?: string }>> =>
    api.get(`/content/post/${platform}/${postId}/insights`, {
      headers: _brandAuthHeaders(brandToken),
      params: postFormat ? { post_format: postFormat } : undefined,
    }),
};

// ─── Invitation API ───────────────────────────────────────────────────────────

export const invitationAPI = {
  /** Send an invitation email (SUPER or ADMIN). */
  invite: (token: string, payload: InvitePayload): Promise<AxiosResponse<{ success: boolean; message: string; invitation: Invitation }>> =>
    api.post('/brands/invite', payload, { headers: _brandAuthHeaders(token) }),

  /** Verify an invitation token is still valid (public). */
  verify: (inviteToken: string): Promise<AxiosResponse<InviteVerifyResponse>> =>
    api.get('/brands/invite/verify', { params: { token: inviteToken } }),

  /** Accept an invitation and create an account (public). */
  accept: (payload: AcceptInvitePayload): Promise<AxiosResponse<UserSession>> =>
    api.post<UserSession>('/brands/invite/accept', payload),

  /** Delete a pending invitation (ADMIN or SUPER). */
  delete: (token: string, invitationId: number): Promise<AxiosResponse<{ success: boolean; message: string }>> =>
    api.delete(`/brands/invite/${invitationId}`, { headers: _brandAuthHeaders(token) }),
};

// ─── Admin API (SUPER only) ───────────────────────────────────────────────────

export const adminAPI = {
  /** List all users across all brands. */
  listUsers: (token: string): Promise<AxiosResponse<AdminUsersResponse>> =>
    api.get<AdminUsersResponse>('/admin/users', { headers: _brandAuthHeaders(token) }),

  /** List all brands. */
  listBrands: (token: string): Promise<AxiosResponse<AdminBrandsResponse>> =>
    api.get<AdminBrandsResponse>('/admin/brands', { headers: _brandAuthHeaders(token) }),

  /** Create a new brand. */
  createBrand: (token: string, payload: CreateBrandPayload): Promise<AxiosResponse<{ success: boolean; brand: import('./types').Brand }>> =>
    api.post('/admin/brands', payload, { headers: _brandAuthHeaders(token) }),

  /** List users for a specific brand. */
  listBrandUsers: (token: string, brandId: number): Promise<AxiosResponse<{ success: boolean; brand: import('./types').Brand; total: number; users: import('./types').User[] }>> =>
    api.get(`/admin/brands/${brandId}/users`, { headers: _brandAuthHeaders(token) }),

  /** List all pending invitations across all brands (SUPER only). */
  listInvitations: (token: string): Promise<AxiosResponse<AdminInvitationsResponse>> =>
    api.get<AdminInvitationsResponse>('/admin/invitations', { headers: _brandAuthHeaders(token) }),

  /** List pending invitations for a specific brand. */
  listBrandInvitations: (token: string, brandId: number): Promise<AxiosResponse<AdminInvitationsResponse>> =>
    api.get<AdminInvitationsResponse>(`/admin/brands/${brandId}/invitations`, { headers: _brandAuthHeaders(token) }),
};

// ─── Competitor Analysis API ──────────────────────────────────────────────────

export const competitorAPI = {
  /** List all competitors saved for the authenticated brand. */
  list: (token: string): Promise<AxiosResponse<CompetitorEnvelope<CompetitorListResponse>>> =>
    api.get('/competitors', { headers: _brandAuthHeaders(token) }),

  /** Get a single competitor + latest job summary. */
  get: (token: string, id: number): Promise<AxiosResponse<CompetitorEnvelope<Competitor>>> =>
    api.get(`/competitors/${id}`, { headers: _brandAuthHeaders(token) }),

  /** Create a competitor and immediately kick off a scrape job. */
  create: (
    token: string,
    payload: CompetitorCreatePayload,
  ): Promise<AxiosResponse<CompetitorEnvelope<CompetitorCreateResponse>>> =>
    api.post('/competitors', payload, { headers: _brandAuthHeaders(token) }),

  /** Soft-delete a competitor. */
  delete: (
    token: string,
    id: number,
  ): Promise<AxiosResponse<{ success: boolean; message: string }>> =>
    api.delete(`/competitors/${id}`, { headers: _brandAuthHeaders(token) }),

  /** Trigger a fresh scrape job for an existing competitor. */
  refresh: (
    token: string,
    id: number,
  ): Promise<AxiosResponse<CompetitorEnvelope<CompetitorJobCreatedResponse>>> =>
    api.post(`/competitors/${id}/refresh`, {}, { headers: _brandAuthHeaders(token) }),

  /** Re-run a single actor in the most recent job for this competitor. */
  retryActor: (
    token: string,
    id: number,
    actorKey: string,
  ): Promise<AxiosResponse<CompetitorEnvelope<{ job_id: number; actor_key: string; status: string }>>> =>
    api.post(
      `/competitors/${id}/results/${actorKey}/retry`,
      {},
      { headers: _brandAuthHeaders(token) },
    ),

  /** Poll job status — returns counters + per-actor statuses. */
  jobStatus: (
    token: string,
    jobId: number,
  ): Promise<AxiosResponse<CompetitorEnvelope<CompetitorJobStatusResponse>>> =>
    api.get(`/competitors/jobs/${jobId}`, { headers: _brandAuthHeaders(token) }),

  /** Get the most recent job's full per-actor results. */
  results: (
    token: string,
    id: number,
  ): Promise<AxiosResponse<CompetitorEnvelope<CompetitorResultsResponse>>> =>
    api.get(`/competitors/${id}/results`, { headers: _brandAuthHeaders(token) }),
};

export default api;
