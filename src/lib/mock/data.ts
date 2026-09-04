import type {
  ActivityItem,
  AppSnapshot,
  AutoDraft,
  AutoHistoryItem,
  CustomPromptPreset,
  ExactPost,
  WatchAlert,
  WatchTarget,
} from "@/lib/api/types";
import { hoursFromNow, nowISO } from "@/lib/utils/time";

export const CUSTOM_PROMPT_PRESETS: CustomPromptPreset[] = [
  {
    id: "punchy",
    label: "Punchy one-liner",
    prompt: "Write a punchy one-liner about today's internet culture. Keep it under 200 chars.",
  },
  {
    id: "hot-take",
    label: "Friendly hot take",
    prompt: "Share a friendly hot take on tech or markets. No negativity toward people.",
  },
  {
    id: "thread-seed",
    label: "Thread seed",
    prompt: "Draft the opening tweet for a short educational thread. End with a soft hook.",
  },
];

const watches: WatchTarget[] = [
  {
    id: "w1",
    handle: "naval",
    displayName: "Naval",
    addedAt: "2026-08-20T16:00:00.000Z",
    lastPostAt: "2026-09-03T22:10:00.000Z",
    lastPostText: "Desire is a contract you make with yourself to be unhappy until you get what you want.",
    lastPostUrl: "https://x.com/naval/status/1",
  },
  {
    id: "w2",
    handle: "levelsio",
    displayName: "Pieter Levels",
    addedAt: "2026-08-22T18:00:00.000Z",
    lastPostAt: "2026-09-04T01:00:00.000Z",
    lastPostText: "Shipped a tiny update. Shipping > perfection.",
    lastPostUrl: "https://x.com/levelsio/status/2",
  },
];

const alerts: WatchAlert[] = [
  {
    id: "a1",
    watchId: "w2",
    handle: "levelsio",
    kind: "new_post",
    postText: "Shipped a tiny update. Shipping > perfection.",
    postUrl: "https://x.com/levelsio/status/2",
    createdAt: "2026-09-04T01:01:00.000Z",
    read: false,
  },
  {
    id: "a2",
    watchId: "w1",
    handle: "naval",
    kind: "new_post",
    postText: "Desire is a contract you make with yourself to be unhappy until you get what you want.",
    postUrl: "https://x.com/naval/status/1",
    createdAt: "2026-09-03T22:11:00.000Z",
    read: true,
  },
];

const exactPosts: ExactPost[] = [
  {
    id: "p1",
    text: "Hello from X Auto Poster — exact post, no AI gate.",
    status: "posted",
    createdAt: "2026-09-02T15:00:00.000Z",
    postedAt: "2026-09-02T15:00:05.000Z",
    xUrl: "https://x.com/sapphiredemo/status/100",
  },
  {
    id: "p2",
    text: "This one hit a rate limit (mock).",
    status: "failed",
    createdAt: "2026-09-03T12:00:00.000Z",
    errorMessage: "Rate limited by X. Wait a few minutes, then Retry.",
  },
];

const nextDraft: AutoDraft = {
  id: "d1",
  text: "When the meme finds you first — trending mode draft ready for review.",
  mode: "trending_memes",
  status: "pending_review",
  createdAt: nowISO(),
  scheduledFor: hoursFromNow(1),
};

const autoQueue: AutoDraft[] = [
  nextDraft,
  {
    id: "d2",
    text: "Quiet hours respect is free dopamine management.",
    mode: "trending_memes",
    status: "pending_review",
    createdAt: hoursFromNow(-2),
    scheduledFor: hoursFromNow(7),
  },
];

const autoHistory: AutoHistoryItem[] = [
  {
    id: "h1",
    text: "Yesterday's approved meme draft went live.",
    status: "posted",
    mode: "trending_memes",
    at: "2026-09-03T18:30:00.000Z",
  },
  {
    id: "h2",
    text: "Skipped a draft that felt off-brand.",
    status: "skipped",
    mode: "trending_memes",
    at: "2026-09-03T12:00:00.000Z",
  },
];

const activity: ActivityItem[] = [
  {
    id: "act1",
    kind: "watch_alert",
    title: "@levelsio posted",
    detail: "Shipped a tiny update. Shipping > perfection.",
    at: "2026-09-04T01:01:00.000Z",
    href: "/watch",
  },
  {
    id: "act2",
    kind: "auto_draft",
    title: "New auto draft ready",
    detail: "Trending memes · pending review",
    at: nowISO(),
    href: "/auto",
  },
  {
    id: "act3",
    kind: "exact_failed",
    title: "Exact post failed",
    detail: "Rate limited by X",
    at: "2026-09-03T12:00:00.000Z",
    href: "/post",
  },
  {
    id: "act4",
    kind: "exact_posted",
    title: "Exact post published",
    detail: "Hello from X Auto Poster — exact post, no AI gate.",
    at: "2026-09-02T15:00:05.000Z",
  },
];

export function createInitialSnapshot(demoConnected = false): AppSnapshot {
  if (!demoConnected) {
    return {
      auth: {
        status: "disconnected",
        account: null,
        errorMessage: null,
        rateLimitMessage: null,
      },
      onboarding: {
        completed: false,
        step: "connect",
        skippedAfterConnect: false,
      },
      watches: [],
      alerts: [],
      exactPosts: [],
      auto: {
        mode: "trending_memes",
        cadenceHours: 6,
        quietHours: { enabled: true, start: "22:00", end: "07:00" },
        reviewBeforePost: true,
        customPrompt: "",
        dayNumber: 1,
        status: "paused",
        day8BannerDismissed: false,
        earlyUnlockConfirmed: false,
      },
      autoQueue: [],
      autoHistory: [],
      activity: [],
      notifications: {
        watchAlertsInApp: true,
        autoDraftReady: true,
        postFailures: true,
        alertsPaused: false,
      },
      customPromptPresets: CUSTOM_PROMPT_PRESETS,
    };
  }

  return {
    auth: {
      status: "connected",
      account: {
        id: "acc1",
        handle: "sapphiredemo",
        displayName: "Sapphire Demo",
        connectedAt: "2026-08-18T10:00:00.000Z",
      },
      errorMessage: null,
      rateLimitMessage: null,
    },
    onboarding: {
      completed: true,
      step: "done",
      skippedAfterConnect: false,
    },
    watches,
    alerts,
    exactPosts,
    auto: {
      mode: "trending_memes",
      cadenceHours: 6,
      quietHours: { enabled: true, start: "22:00", end: "07:00" },
      reviewBeforePost: true,
      customPrompt: "",
      dayNumber: 3,
      status: "active",
      day8BannerDismissed: false,
      earlyUnlockConfirmed: false,
    },
    autoQueue,
    autoHistory,
    activity,
    notifications: {
      watchAlertsInApp: true,
      autoDraftReady: true,
      postFailures: true,
      alertsPaused: false,
    },
    customPromptPresets: CUSTOM_PROMPT_PRESETS,
  };
}
