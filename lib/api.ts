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
  CompetitorActorKey,
  CompetitorTarget,
  CompetitorTargetInput,
  CompetitorTargetsResponse,
  EstimatedCost,
  ActorSummaryEnvelope,
  ActorResultEnvelope,
  BrandUsage,
  ApifyRunListResponse,
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

  /** Change a user's role (NORMAL ↔ ORG_ADMIN) within the caller's organization. */
  updateUserRole: (token: string, userId: number, role: 'NORMAL' | 'ORG_ADMIN'): Promise<AxiosResponse<{ success: boolean; user_id: number; role: string }>> =>
    api.patch(`/admin/users/${userId}/role`, { role }, { headers: _brandAuthHeaders(token) }),

  /** Rotate the target user's session_key, invalidating their JWTs. */
  forceSignOutUser: (token: string, userId: number): Promise<AxiosResponse<{ success: boolean; message: string; user_id: number }>> =>
    api.post(`/admin/users/${userId}/force-signout`, {}, { headers: _brandAuthHeaders(token) }),

  /** Remove a user from the caller's organization (soft-deletes memberships, rotates session). */
  removeUser: (token: string, userId: number): Promise<AxiosResponse<{ success: boolean; message: string; user_id: number }>> =>
    api.delete(`/admin/users/${userId}`, { headers: _brandAuthHeaders(token) }),
};

// ─── Competitor Analysis API ──────────────────────────────────────────────────

export const competitorAPI = {
  /** List all competitors saved for the authenticated brand. */
  list: (token: string): Promise<AxiosResponse<CompetitorEnvelope<CompetitorListResponse>>> =>
    api.get('/competitors', { headers: _brandAuthHeaders(token) }),

  /** Get a single competitor + latest job summary + targets. */
  get: (token: string, id: number): Promise<AxiosResponse<CompetitorEnvelope<Competitor>>> =>
    api.get(`/competitors/${id}`, { headers: _brandAuthHeaders(token) }),

  /** Create a competitor with per-actor targets. Does NOT auto-run any scraper. */
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

  // ── Targets ────────────────────────────────────────────────────────────────

  listTargets: (
    token: string,
    id: number,
  ): Promise<AxiosResponse<CompetitorEnvelope<CompetitorTargetsResponse>>> =>
    api.get(`/competitors/${id}/targets`, { headers: _brandAuthHeaders(token) }),

  upsertTarget: (
    token: string,
    id: number,
    actorKey: CompetitorActorKey,
    payload: CompetitorTargetInput,
  ): Promise<AxiosResponse<CompetitorEnvelope<CompetitorTarget>>> =>
    api.put(
      `/competitors/${id}/targets/${actorKey}`,
      payload,
      { headers: _brandAuthHeaders(token) },
    ),

  deleteTarget: (
    token: string,
    id: number,
    actorKey: CompetitorActorKey,
  ): Promise<AxiosResponse<{ success: boolean; message: string }>> =>
    api.delete(`/competitors/${id}/targets/${actorKey}`, {
      headers: _brandAuthHeaders(token),
    }),

  // ── Per-actor run + estimate + summary + results ──────────────────────────

  runActor: (
    token: string,
    id: number,
    actorKey: CompetitorActorKey,
  ): Promise<AxiosResponse<CompetitorEnvelope<CompetitorJobCreatedResponse>>> =>
    api.post(
      `/competitors/${id}/actors/${actorKey}/run`,
      {},
      { headers: _brandAuthHeaders(token) },
    ),

  estimateActor: (
    token: string,
    id: number,
    actorKey: CompetitorActorKey,
  ): Promise<AxiosResponse<CompetitorEnvelope<EstimatedCost>>> =>
    api.get(`/competitors/${id}/actors/${actorKey}/estimate`, {
      headers: _brandAuthHeaders(token),
    }),

  actorSummary: <TSummary = unknown>(
    token: string,
    id: number,
    actorKey: CompetitorActorKey,
    filters: Record<string, unknown> | null,
  ): Promise<AxiosResponse<CompetitorEnvelope<ActorSummaryEnvelope<TSummary>>>> =>
    api.post(
      `/competitors/${id}/actors/${actorKey}/summary`,
      { filters },
      { headers: _brandAuthHeaders(token) },
    ),

  actorResults: <TData = unknown>(
    token: string,
    id: number,
    actorKey: CompetitorActorKey,
  ): Promise<AxiosResponse<CompetitorEnvelope<ActorResultEnvelope<TData>>>> =>
    api.get(`/competitors/${id}/results/${actorKey}`, {
      headers: _brandAuthHeaders(token),
    }),

  // ── Job & combined results ────────────────────────────────────────────────

  jobStatus: (
    token: string,
    jobId: number,
  ): Promise<AxiosResponse<CompetitorEnvelope<CompetitorJobStatusResponse>>> =>
    api.get(`/competitors/jobs/${jobId}`, { headers: _brandAuthHeaders(token) }),

  /** Returns the latest result row per actor (data omitted; use actorResults for the heavy payload). */
  results: (
    token: string,
    id: number,
  ): Promise<AxiosResponse<CompetitorEnvelope<CompetitorResultsResponse>>> =>
    api.get(`/competitors/${id}/results`, { headers: _brandAuthHeaders(token) }),
};

// ─── Usage / Billing API ──────────────────────────────────────────────────────

export const usageAPI = {
  brandCurrent: (
    token: string,
  ): Promise<AxiosResponse<CompetitorEnvelope<BrandUsage>>> =>
    api.get('/usage/brand/current', { headers: _brandAuthHeaders(token) }),

  brandRuns: (
    token: string,
    params?: { limit?: number; cursor?: number | null },
  ): Promise<AxiosResponse<CompetitorEnvelope<ApifyRunListResponse>>> =>
    api.get('/usage/brand/runs', {
      headers: _brandAuthHeaders(token),
      params,
    }),
};

// ─── Analytics Overview API (marketing-expert spec) ────────────────────────

export const analyticsAPI = {
  /** POST the brand's posts list; server returns top-of-page KPIs + ERR + Grade dist. */
  overview: (
    token: string,
    posts: Record<string, unknown>[],
    follower_count_start?: number,
    follower_count_end?: number,
  ) =>
    api.post('/analytics/overview', posts, {
      headers: _brandAuthHeaders(token),
      params: { follower_count_start, follower_count_end },
    }),

  audienceGender: (token: string) =>
    api.get<{ success: boolean; data: { female: number; male: number; unspecified: number } }>(
      '/analytics/audience/gender',
      { headers: _brandAuthHeaders(token) },
    ),

  audienceAge: (token: string) =>
    api.get<{ success: boolean; data: Record<string, number> }>(
      '/analytics/audience/age',
      { headers: _brandAuthHeaders(token) },
    ),

  followersGrowth: (token: string, since?: string, until?: string) =>
    api.get<{ success: boolean; data: {
      follower_count_start: number;
      follower_count_end: number;
      growth_rate_pct: number | null;
      series: { value: number; end_time: string }[];
      period: { since: string; until: string };
    } }>('/analytics/followers/growth', {
      headers: _brandAuthHeaders(token), params: { since, until },
    }),
};

// ─── Facebook Insights v2 (brand-JWT) ──────────────────────────────────────

export const facebookInsightsAPI = {
  pageDemographics: (token: string, since?: string, until?: string) =>
    api.get('/facebook/insights/page/demographics', {
      headers: _brandAuthHeaders(token), params: { since, until },
    }),
  pageReachBreakdown: (token: string, since?: string, until?: string, compare = false) =>
    api.get('/facebook/insights/page/reach-breakdown', {
      headers: _brandAuthHeaders(token), params: { since, until, compare },
    }),
  pageFrequency: (token: string, since?: string, until?: string) =>
    api.get('/facebook/insights/page/frequency', {
      headers: _brandAuthHeaders(token), params: { since, until },
    }),
};

// ─── Facebook Ads (full marketer KPIs) ─────────────────────────────────────

export const facebookAdsAPI = {
  accounts: (token: string) =>
    api.get('/facebook/ads/accounts', { headers: _brandAuthHeaders(token) }),
  accountSummary: (token: string, accountId: string, since?: string, until?: string, compare = true) =>
    api.get(`/facebook/ads/${accountId}/insights/summary`, {
      headers: _brandAuthHeaders(token), params: { since, until, compare },
    }),
  series: (token: string, accountId: string, since?: string, until?: string, granularity = '1') =>
    api.get(`/facebook/ads/${accountId}/insights/series`, {
      headers: _brandAuthHeaders(token), params: { since, until, granularity },
    }),
  byCampaign: (token: string, accountId: string, since?: string, until?: string) =>
    api.get(`/facebook/ads/${accountId}/insights/by-campaign`, {
      headers: _brandAuthHeaders(token), params: { since, until },
    }),
  byAd: (token: string, accountId: string, since?: string, until?: string) =>
    api.get(`/facebook/ads/${accountId}/insights/by-ad`, {
      headers: _brandAuthHeaders(token), params: { since, until },
    }),
  demographics: (token: string, accountId: string, since?: string, until?: string) =>
    api.get(`/facebook/ads/${accountId}/insights/demographics`, {
      headers: _brandAuthHeaders(token), params: { since, until },
    }),
  geo: (token: string, accountId: string, since?: string, until?: string) =>
    api.get(`/facebook/ads/${accountId}/insights/geo`, {
      headers: _brandAuthHeaders(token), params: { since, until },
    }),
  placement: (token: string, accountId: string, since?: string, until?: string) =>
    api.get(`/facebook/ads/${accountId}/insights/placement`, {
      headers: _brandAuthHeaders(token), params: { since, until },
    }),
};

// ─── TikTok Ads ────────────────────────────────────────────────────────────

export const tiktokAdsAPI = {
  advertisers: (token: string) =>
    api.get('/tiktok/ads/advertisers', { headers: _brandAuthHeaders(token) }),
  accountSummary: (token: string, advertiserId: string, since?: string, until?: string, compare = true) =>
    api.get(`/tiktok/ads/${advertiserId}/insights/summary`, {
      headers: _brandAuthHeaders(token), params: { since, until, compare },
    }),
  byCampaign: (token: string, advertiserId: string, since?: string, until?: string) =>
    api.get(`/tiktok/ads/${advertiserId}/insights/by-campaign`, {
      headers: _brandAuthHeaders(token), params: { since, until },
    }),
  byAd: (token: string, advertiserId: string, since?: string, until?: string) =>
    api.get(`/tiktok/ads/${advertiserId}/insights/by-ad`, {
      headers: _brandAuthHeaders(token), params: { since, until },
    }),
};

// ─── Unified Ads Feed ──────────────────────────────────────────────────────

export const adsFeedAPI = {
  feed: (
    token: string,
    params: {
      since?: string; until?: string; platforms?: string;
      fb_account_id?: string; tiktok_advertiser_id?: string;
    } = {},
  ) => api.get('/ads/feed', { headers: _brandAuthHeaders(token), params }),
};

// ─── Instagram v2 (engagement totals + breakdowns + stories + comments) ────

export const instagramV2API = {
  engagementTotals: (token: string, days = 30) =>
    api.get('/instagram/v2/engagement-totals', {
      headers: _brandAuthHeaders(token), params: { days },
    }),
  reachByFollowType: (token: string, days = 30) =>
    api.get('/instagram/v2/reach-by-follow-type', {
      headers: _brandAuthHeaders(token), params: { days },
    }),
  reachByMediaProductType: (token: string, days = 30) =>
    api.get('/instagram/v2/reach-by-media-product-type', {
      headers: _brandAuthHeaders(token), params: { days },
    }),
  stories: (token: string, limit = 25) =>
    api.get('/instagram/v2/stories', {
      headers: _brandAuthHeaders(token), params: { limit },
    }),
  storyInsights: (token: string, storyId: string) =>
    api.get(`/instagram/v2/stories/${storyId}/insights`, { headers: _brandAuthHeaders(token) }),
  audience: (token: string) =>
    api.get('/instagram/v2/audience', { headers: _brandAuthHeaders(token) }),
  commentsAnalysis: (token: string, mediaId: string, limit = 50, includeReplies = true) =>
    api.get(`/instagram/v2/media/${mediaId}/comments/analysis`, {
      headers: _brandAuthHeaders(token),
      params: { limit, include_replies: includeReplies },
    }),
};

// ─── Campaign Tags ─────────────────────────────────────────────────────────

export const campaignTagsAPI = {
  list: (token: string) =>
    api.get('/campaign-tags', { headers: _brandAuthHeaders(token) }),
  create: (token: string, payload: { name: string; color?: string; description?: string }) =>
    api.post('/campaign-tags', payload, { headers: _brandAuthHeaders(token) }),
  update: (token: string, id: number, payload: { name?: string; color?: string; description?: string }) =>
    api.patch(`/campaign-tags/${id}`, payload, { headers: _brandAuthHeaders(token) }),
  remove: (token: string, id: number) =>
    api.delete(`/campaign-tags/${id}`, { headers: _brandAuthHeaders(token) }),
  attach: (token: string, payload: { platform: string; post_id: string; tag_ids: number[] }) =>
    api.post('/campaign-tags/posts/attach', payload, { headers: _brandAuthHeaders(token) }),
  lookup: (token: string, platform: string, post_id: string) =>
    api.get('/campaign-tags/posts/lookup', {
      headers: _brandAuthHeaders(token), params: { platform, post_id },
    }),
};

// ─── Publish (composer / calendar / media) ─────────────────────────────────

export const publishAPI = {
  listDrafts: (token: string, status?: string) =>
    api.get('/publish/drafts', {
      headers: _brandAuthHeaders(token), params: { status_filter: status },
    }),
  createDraft: (token: string, payload: Record<string, unknown>) =>
    api.post('/publish/drafts', payload, { headers: _brandAuthHeaders(token) }),
  updateDraft: (token: string, id: number, payload: Record<string, unknown>) =>
    api.patch(`/publish/drafts/${id}`, payload, { headers: _brandAuthHeaders(token) }),
  deleteDraft: (token: string, id: number) =>
    api.delete(`/publish/drafts/${id}`, { headers: _brandAuthHeaders(token) }),
  submit: (token: string, id: number) =>
    api.post(`/publish/drafts/${id}/submit`, {}, { headers: _brandAuthHeaders(token) }),
  approve: (token: string, id: number) =>
    api.post(`/publish/drafts/${id}/approve`, {}, { headers: _brandAuthHeaders(token) }),
  reject: (token: string, id: number, reason: string) =>
    api.post(`/publish/drafts/${id}/reject`, { reason }, { headers: _brandAuthHeaders(token) }),
  cancel: (token: string, id: number) =>
    api.post(`/publish/drafts/${id}/cancel`, {}, { headers: _brandAuthHeaders(token) }),

  calendar: (token: string, from: string, to: string, statuses?: string) =>
    api.get('/publish/calendar', {
      headers: _brandAuthHeaders(token), params: { from, to, statuses },
    }),
  reschedule: (token: string, id: number, scheduled_at: string) =>
    api.patch(`/publish/calendar/${id}/reschedule`, { scheduled_at }, {
      headers: _brandAuthHeaders(token),
    }),

  listMedia: (token: string, kind?: 'image' | 'video') =>
    api.get('/publish/media', {
      headers: _brandAuthHeaders(token), params: { kind },
    }),
  uploadMedia: (token: string, file: File) => {
    const fd = new FormData();
    fd.append('upload', file);
    return api.post('/publish/media', fd, {
      headers: { ..._brandAuthHeaders(token), 'Content-Type': 'multipart/form-data' },
    });
  },
  mediaRawUrl: (assetId: number) => `${API_BASE_URL}/publish/media/${assetId}/raw`,
  deleteMedia: (token: string, id: number) =>
    api.delete(`/publish/media/${id}`, { headers: _brandAuthHeaders(token) }),
};

// ─── Reports ───────────────────────────────────────────────────────────────

export const reportsAPI = {
  generate: (token: string, payload: {
    period_start: string; period_end: string; sections: string[]; kpis?: Record<string, unknown>;
  }) => api.post('/reports/generate', payload, { headers: _brandAuthHeaders(token) }),
  listRuns: (token: string, limit = 50) =>
    api.get('/reports/runs', { headers: _brandAuthHeaders(token), params: { limit } }),
  pdfUrl: (runId: number) => `${API_BASE_URL}/reports/runs/${runId}/pdf`,
  listSchedules: (token: string) =>
    api.get('/reports/schedules', { headers: _brandAuthHeaders(token) }),
  createSchedule: (token: string, payload: {
    name: string; cadence: 'weekly' | 'monthly'; recipients: string[]; template?: Record<string, unknown>;
  }) => api.post('/reports/schedules', payload, { headers: _brandAuthHeaders(token) }),
  deleteSchedule: (token: string, id: number) =>
    api.delete(`/reports/schedules/${id}`, { headers: _brandAuthHeaders(token) }),
  runScheduleNow: (token: string, id: number) =>
    api.post(`/reports/schedules/${id}/run-now`, {}, { headers: _brandAuthHeaders(token) }),
};

// ─── Brand Identity ───────────────────────────────────────────────────────

export const brandIdentityAPI = {
  get: (token: string) =>
    api.get('/brands/identity', { headers: _brandAuthHeaders(token) }),
  update: (token: string, payload: {
    primary_color?: string; secondary_color?: string; font_family?: string;
    white_label_subdomain?: string; logo?: File;
  }) => {
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== undefined && v !== null) fd.append(k, v as Blob | string);
    });
    return api.put('/brands/identity', fd, {
      headers: { ..._brandAuthHeaders(token), 'Content-Type': 'multipart/form-data' },
    });
  },
  logoUrl: () => `${API_BASE_URL}/brands/identity/logo`,
};

export default api;
