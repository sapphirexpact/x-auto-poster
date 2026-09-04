/**
 * Mock API layer — swap for real SexyBot HTTP client later.
 * All mutations update in-memory snapshot via AppContext.
 */
import type {
  AddWatchRequest,
  AppSnapshot,
  AutoSettings,
  CreateExactPostRequest,
  ExactPost,
  NotificationSettings,
  OnboardingState,
  UpdateAutoSettingsRequest,
  WatchTarget,
} from "@/lib/api/types";
import { hoursFromNow, nowISO } from "@/lib/utils/time";

export const WATCH_MAX = 3 as const;

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function mockConnect(snapshot: AppSnapshot): AppSnapshot {
  return {
    ...snapshot,
    auth: {
      status: "connected",
      account: {
        id: "acc1",
        handle: "sapphiredemo",
        displayName: "Sapphire Demo",
        connectedAt: nowISO(),
      },
      errorMessage: null,
      rateLimitMessage: null,
    },
    notifications: { ...snapshot.notifications, alertsPaused: false },
    onboarding: {
      ...snapshot.onboarding,
      step: snapshot.onboarding.completed ? "done" : "auto_defaults",
    },
    activity: [
      {
        id: uid("act"),
        kind: "auto_resumed",
        title: "X account connected",
        detail: "@sapphiredemo",
        at: nowISO(),
      },
      ...snapshot.activity,
    ],
  };
}

export function mockDisconnect(snapshot: AppSnapshot): AppSnapshot {
  return {
    ...snapshot,
    auth: {
      status: "disconnected",
      account: null,
      errorMessage: null,
      rateLimitMessage: null,
    },
    // Keep watches; pause alerts; kill switch pauses Auto only — disconnect also pauses auto
    notifications: { ...snapshot.notifications, alertsPaused: true },
    auto: { ...snapshot.auto, status: "paused" },
    activity: [
      {
        id: uid("act"),
        kind: "auto_paused",
        title: "Disconnected X account",
        detail: "Watches kept · alerts paused · Auto paused",
        at: nowISO(),
      },
      ...snapshot.activity,
    ],
  };
}

export function mockSimulateAuthError(snapshot: AppSnapshot): AppSnapshot {
  return {
    ...snapshot,
    auth: {
      ...snapshot.auth,
      status: "error",
      errorMessage:
        "X auth expired or revoked. Reconnect your account to resume posting and alerts.",
    },
    activity: [
      {
        id: uid("act"),
        kind: "auth_error",
        title: "Auth error",
        detail: "Reconnect required",
        at: nowISO(),
        href: "/settings",
      },
      ...snapshot.activity,
    ],
  };
}

export function mockSkipOnboarding(snapshot: AppSnapshot): AppSnapshot {
  const onboarding: OnboardingState = {
    completed: true,
    step: "done",
    skippedAfterConnect: true,
  };
  return {
    ...snapshot,
    onboarding,
    auto: {
      ...snapshot.auto,
      mode: "trending_memes",
      cadenceHours: 6,
      reviewBeforePost: true,
      status: "paused",
      dayNumber: 1,
    },
  };
}

export function mockCompleteOnboardingStep(
  snapshot: AppSnapshot,
  step: OnboardingState["step"],
): AppSnapshot {
  return {
    ...snapshot,
    onboarding: {
      ...snapshot.onboarding,
      step,
      completed: step === "done",
      skippedAfterConnect: false,
    },
  };
}

export function mockApplyAutoDefaults(snapshot: AppSnapshot): AppSnapshot {
  return {
    ...snapshot,
    auto: {
      ...snapshot.auto,
      mode: "trending_memes",
      cadenceHours: 6,
      reviewBeforePost: true,
      quietHours: { enabled: true, start: "22:00", end: "07:00" },
      status: "active",
      dayNumber: 1,
    },
    onboarding: { ...snapshot.onboarding, step: "watches" },
  };
}

export function mockCreateExactPost(
  snapshot: AppSnapshot,
  req: CreateExactPostRequest,
): AppSnapshot {
  const text = req.text.trim().slice(0, 280);
  if (!text) return snapshot;

  if (snapshot.auth.status !== "connected") {
    return {
      ...snapshot,
      auth: {
        ...snapshot.auth,
        errorMessage: "Connect an X account before posting.",
        status: snapshot.auth.status === "disconnected" ? "disconnected" : "error",
      },
    };
  }

  const failRateLimit = text.toLowerCase().includes("rate limit");
  const post: ExactPost = {
    id: uid("p"),
    text,
    status: failRateLimit ? "failed" : req.scheduledFor ? "scheduled" : "posted",
    createdAt: nowISO(),
    scheduledFor: req.scheduledFor,
    postedAt: !failRateLimit && !req.scheduledFor ? nowISO() : undefined,
    errorMessage: failRateLimit
      ? "Rate limited by X. Wait a few minutes, then Retry."
      : undefined,
    xUrl:
      !failRateLimit && !req.scheduledFor
        ? `https://x.com/${snapshot.auth.account?.handle}/status/${Date.now()}`
        : undefined,
  };

  return {
    ...snapshot,
    exactPosts: [post, ...snapshot.exactPosts],
    auth: failRateLimit
      ? {
          ...snapshot.auth,
          rateLimitMessage: "X rate limit hit on exact post. Retry from Post history.",
        }
      : { ...snapshot.auth, rateLimitMessage: null },
    activity: [
      {
        id: uid("act"),
        kind: failRateLimit ? "exact_failed" : "exact_posted",
        title: failRateLimit
          ? "Exact post failed"
          : req.scheduledFor
            ? "Exact post scheduled"
            : "Exact post published",
        detail: text.slice(0, 80),
        at: nowISO(),
        href: "/post",
      },
      ...snapshot.activity,
    ],
  };
}

export function mockRetryPost(snapshot: AppSnapshot, postId: string): AppSnapshot {
  const posts = snapshot.exactPosts.map((p) => {
    if (p.id !== postId) return p;
    return {
      ...p,
      status: "posted" as const,
      postedAt: nowISO(),
      errorMessage: undefined,
      xUrl: `https://x.com/${snapshot.auth.account?.handle ?? "user"}/status/${Date.now()}`,
    };
  });
  return {
    ...snapshot,
    exactPosts: posts,
    auth: { ...snapshot.auth, rateLimitMessage: null },
    activity: [
      {
        id: uid("act"),
        kind: "exact_posted",
        title: "Exact post retried · published",
        at: nowISO(),
        href: "/post",
      },
      ...snapshot.activity,
    ],
  };
}

export function mockAddWatch(
  snapshot: AppSnapshot,
  req: AddWatchRequest,
): { snapshot: AppSnapshot; error?: string } {
  const handle = req.handle.replace(/^@/, "").trim().toLowerCase();
  if (!handle) return { snapshot, error: "Enter a handle." };
  if (snapshot.watches.length >= WATCH_MAX) {
    return {
      snapshot,
      error: `Watch limit reached (${WATCH_MAX}/${WATCH_MAX}). Remove one to add another.`,
    };
  }
  if (snapshot.watches.some((w) => w.handle.toLowerCase() === handle)) {
    return { snapshot, error: "Already watching that handle." };
  }
  const watch: WatchTarget = {
    id: uid("w"),
    handle,
    displayName: handle,
    addedAt: nowISO(),
    lastPostAt: hoursFromNow(-5),
    lastPostText: `(Mock) Latest post from @${handle}`,
    lastPostUrl: `https://x.com/${handle}`,
  };
  return {
    snapshot: {
      ...snapshot,
      watches: [...snapshot.watches, watch],
    },
  };
}

export function mockRemoveWatch(snapshot: AppSnapshot, watchId: string): AppSnapshot {
  return {
    ...snapshot,
    watches: snapshot.watches.filter((w) => w.id !== watchId),
    alerts: snapshot.alerts.filter((a) => a.watchId !== watchId),
  };
}

export function mockMarkAlertRead(snapshot: AppSnapshot, alertId: string): AppSnapshot {
  return {
    ...snapshot,
    alerts: snapshot.alerts.map((a) =>
      a.id === alertId ? { ...a, read: true } : a,
    ),
  };
}

export function mockUpdateAuto(
  snapshot: AppSnapshot,
  patch: UpdateAutoSettingsRequest,
): AppSnapshot {
  const auto: AutoSettings = { ...snapshot.auto, ...patch };
  if (patch.quietHours) {
    auto.quietHours = { ...snapshot.auto.quietHours, ...patch.quietHours };
  }
  let activity = snapshot.activity;
  if (patch.status === "paused" && snapshot.auto.status !== "paused") {
    activity = [
      {
        id: uid("act"),
        kind: "auto_paused",
        title: "Auto paused (kill switch)",
        detail: "Watch and exact Post still work",
        at: nowISO(),
        href: "/auto",
      },
      ...activity,
    ];
  }
  if (patch.status === "active" && snapshot.auto.status === "paused") {
    activity = [
      {
        id: uid("act"),
        kind: "auto_resumed",
        title: "Auto resumed",
        at: nowISO(),
        href: "/auto",
      },
      ...activity,
    ];
  }
  return { ...snapshot, auto, activity };
}

export function mockApproveDraft(snapshot: AppSnapshot, draftId: string): AppSnapshot {
  const draft = snapshot.autoQueue.find((d) => d.id === draftId);
  if (!draft) return snapshot;
  return {
    ...snapshot,
    autoQueue: snapshot.autoQueue.filter((d) => d.id !== draftId),
    autoHistory: [
      {
        id: draft.id,
        text: draft.text,
        status: "posted",
        mode: draft.mode,
        at: nowISO(),
      },
      ...snapshot.autoHistory,
    ],
    activity: [
      {
        id: uid("act"),
        kind: "auto_posted",
        title: "Auto draft approved · posted",
        detail: draft.text.slice(0, 80),
        at: nowISO(),
        href: "/auto",
      },
      ...snapshot.activity,
    ],
  };
}

export function mockSkipDraft(snapshot: AppSnapshot, draftId: string): AppSnapshot {
  const draft = snapshot.autoQueue.find((d) => d.id === draftId);
  if (!draft) return snapshot;
  return {
    ...snapshot,
    autoQueue: snapshot.autoQueue.filter((d) => d.id !== draftId),
    autoHistory: [
      {
        id: draft.id,
        text: draft.text,
        status: "skipped",
        mode: draft.mode,
        at: nowISO(),
      },
      ...snapshot.autoHistory,
    ],
  };
}

export function mockEditDraft(
  snapshot: AppSnapshot,
  draftId: string,
  text: string,
): AppSnapshot {
  return {
    ...snapshot,
    autoQueue: snapshot.autoQueue.map((d) =>
      d.id === draftId ? { ...d, text: text.slice(0, 280) } : d,
    ),
  };
}

export function mockEarlyUnlock(snapshot: AppSnapshot): AppSnapshot {
  return {
    ...snapshot,
    auto: {
      ...snapshot.auto,
      reviewBeforePost: false,
      earlyUnlockConfirmed: true,
      dayNumber: Math.max(snapshot.auto.dayNumber, 8),
    },
  };
}

export function mockDismissDay8Banner(snapshot: AppSnapshot): AppSnapshot {
  return {
    ...snapshot,
    auto: { ...snapshot.auto, day8BannerDismissed: true },
  };
}

export function mockSimulateDay8(snapshot: AppSnapshot): AppSnapshot {
  return {
    ...snapshot,
    auto: {
      ...snapshot.auto,
      dayNumber: 8,
      reviewBeforePost: false,
      day8BannerDismissed: false,
    },
  };
}

export function mockUpdateNotifications(
  snapshot: AppSnapshot,
  patch: Partial<NotificationSettings>,
): AppSnapshot {
  return {
    ...snapshot,
    notifications: { ...snapshot.notifications, ...patch },
  };
}

export function mockClearExactHistory(snapshot: AppSnapshot): AppSnapshot {
  return { ...snapshot, exactPosts: [] };
}

export function mockClearAutoHistory(snapshot: AppSnapshot): AppSnapshot {
  return { ...snapshot, autoHistory: [], autoQueue: [] };
}

export function mockClearAlerts(snapshot: AppSnapshot): AppSnapshot {
  return { ...snapshot, alerts: [] };
}

export function mockLoadDemo(): AppSnapshot {
  // Lazy import avoided — caller uses createInitialSnapshot(true)
  throw new Error("Use createInitialSnapshot(true) via context");
}
