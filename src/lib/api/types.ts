/**
 * SexyBot / X Auto Poster backend API contracts (Milestone 1).
 * Frontend mocks implement these shapes; real API should match.
 */

/** ISO-8601 timestamps; UI labels times in America/Los_Angeles (PT). */
export type ISODateTime = string;

export type XAccountId = string;
export type WatchId = string;
export type PostId = string;
export type DraftId = string;
export type AlertId = string;
export type ActivityId = string;

/* ─── Auth ─────────────────────────────────────────────────────────────── */

export type AuthStatus = "disconnected" | "connected" | "error" | "reconnecting";

export interface XAccount {
  id: XAccountId;
  handle: string;
  displayName: string;
  avatarUrl?: string;
  connectedAt: ISODateTime;
}

export interface AuthState {
  status: AuthStatus;
  account: XAccount | null;
  /** Loud auth error shown as reconnect banner */
  errorMessage: string | null;
  /** Rate-limit / API loud error */
  rateLimitMessage: string | null;
}

export interface AuthConnectResponse {
  account: XAccount;
}

export interface AuthDisconnectResponse {
  ok: true;
  /** Watches are kept; alerts pause */
  watchesKept: true;
  alertsPaused: true;
}

/* ─── Posts (exact / manual — skips AI review gate) ────────────────────── */

export type PostStatus = "queued" | "scheduled" | "posted" | "failed";

export interface ExactPost {
  id: PostId;
  text: string;
  status: PostStatus;
  createdAt: ISODateTime;
  scheduledFor?: ISODateTime;
  postedAt?: ISODateTime;
  errorMessage?: string;
  /** External X status URL when posted */
  xUrl?: string;
}

export interface CreateExactPostRequest {
  text: string;
  /** If set, schedule; otherwise post now. Exact posts skip AI review. */
  scheduledFor?: ISODateTime;
}

export interface CreateExactPostResponse {
  post: ExactPost;
}

export interface RetryPostResponse {
  post: ExactPost;
}

export interface ListExactPostsResponse {
  posts: ExactPost[];
}

/* ─── Watch ────────────────────────────────────────────────────────────── */

export interface WatchTarget {
  id: WatchId;
  handle: string;
  displayName?: string;
  avatarUrl?: string;
  addedAt: ISODateTime;
  lastPostAt?: ISODateTime;
  lastPostText?: string;
  lastPostUrl?: string;
}

export interface AddWatchRequest {
  handle: string;
}

export interface AddWatchResponse {
  watch: WatchTarget;
}

export interface ListWatchesResponse {
  watches: WatchTarget[];
  /** Product lock: max 3 */
  max: 3;
}

export interface RemoveWatchResponse {
  ok: true;
}

export type AlertKind = "new_post";

export interface WatchAlert {
  id: AlertId;
  watchId: WatchId;
  handle: string;
  kind: AlertKind;
  postText: string;
  postUrl: string;
  createdAt: ISODateTime;
  read: boolean;
}

export interface ListAlertsResponse {
  alerts: WatchAlert[];
}

export interface MarkAlertReadResponse {
  alert: WatchAlert;
}

/* ─── Auto poster ──────────────────────────────────────────────────────── */

export type AutoMode = "trending_memes" | "crypto" | "custom_prompts";

export type AutoRunStatus = "paused" | "active" | "review_only";

export interface QuietHours {
  enabled: boolean;
  /** "HH:mm" in America/Los_Angeles */
  start: string;
  end: string;
}

export interface CustomPromptPreset {
  id: string;
  label: string;
  prompt: string;
}

export interface AutoSettings {
  mode: AutoMode;
  /** Hours between drafts; default 6 */
  cadenceHours: number;
  quietHours: QuietHours;
  /** Review-before-post; ON days 1–7 by default */
  reviewBeforePost: boolean;
  customPrompt: string;
  /** Day counter since Auto first enabled (1-indexed) */
  dayNumber: number;
  status: AutoRunStatus;
  /** Show Day-8 full-auto banner once */
  day8BannerDismissed: boolean;
  /** Early unlock of full-auto before day 8 */
  earlyUnlockConfirmed: boolean;
}

export type DraftStatus = "pending_review" | "approved" | "skipped" | "posted" | "failed";

export interface AutoDraft {
  id: DraftId;
  text: string;
  mode: AutoMode;
  status: DraftStatus;
  createdAt: ISODateTime;
  scheduledFor?: ISODateTime;
  postedAt?: ISODateTime;
  errorMessage?: string;
}

export interface UpdateAutoSettingsRequest {
  mode?: AutoMode;
  cadenceHours?: number;
  quietHours?: QuietHours;
  reviewBeforePost?: boolean;
  customPrompt?: string;
  status?: AutoRunStatus;
}

export interface AutoHistoryItem {
  id: DraftId;
  text: string;
  status: DraftStatus;
  mode: AutoMode;
  at: ISODateTime;
}

export interface ListAutoQueueResponse {
  queue: AutoDraft[];
  nextDraft: AutoDraft | null;
}

export interface ListAutoHistoryResponse {
  items: AutoHistoryItem[];
}

export interface ApproveDraftResponse {
  draft: AutoDraft;
}

export interface SkipDraftResponse {
  draft: AutoDraft;
}

export interface EarlyUnlockResponse {
  settings: AutoSettings;
}

/* ─── Activity / Home ──────────────────────────────────────────────────── */

export type ActivityKind =
  | "exact_posted"
  | "exact_failed"
  | "auto_posted"
  | "auto_draft"
  | "watch_alert"
  | "auth_error"
  | "auto_paused"
  | "auto_resumed";

export interface ActivityItem {
  id: ActivityId;
  kind: ActivityKind;
  title: string;
  detail?: string;
  at: ISODateTime;
  href?: string;
}

export interface ListActivityResponse {
  items: ActivityItem[];
}

/* ─── Notifications / Settings ─────────────────────────────────────────── */

export interface NotificationSettings {
  /** Watch alerts in-app (default) */
  watchAlertsInApp: boolean;
  autoDraftReady: boolean;
  postFailures: boolean;
  /** Alerts paused after disconnect until reconnect */
  alertsPaused: boolean;
}

export interface UpdateNotificationSettingsRequest {
  watchAlertsInApp?: boolean;
  autoDraftReady?: boolean;
  postFailures?: boolean;
}

export interface ClearDataResponse {
  ok: true;
}

/* ─── Onboarding ───────────────────────────────────────────────────────── */

export type OnboardingStep = "connect" | "auto_defaults" | "watches" | "done";

export interface OnboardingState {
  completed: boolean;
  step: OnboardingStep;
  /** Skip after connect → defaults applied, Auto paused until enabled */
  skippedAfterConnect: boolean;
}

/* ─── App bootstrap ────────────────────────────────────────────────────── */

export interface AppSnapshot {
  auth: AuthState;
  onboarding: OnboardingState;
  watches: WatchTarget[];
  alerts: WatchAlert[];
  exactPosts: ExactPost[];
  auto: AutoSettings;
  autoQueue: AutoDraft[];
  autoHistory: AutoHistoryItem[];
  activity: ActivityItem[];
  notifications: NotificationSettings;
  customPromptPresets: CustomPromptPreset[];
}
