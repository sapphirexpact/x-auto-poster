"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type {
  AppSnapshot,
  CreateExactPostRequest,
  NotificationSettings,
  OnboardingState,
  UpdateAutoSettingsRequest,
} from "@/lib/api/types";
import { createInitialSnapshot } from "@/lib/mock/data";
import * as mock from "@/lib/mock/api";

type AppContextValue = {
  state: AppSnapshot;
  connect: () => void;
  disconnect: () => void;
  simulateAuthError: () => void;
  skipOnboarding: () => void;
  setOnboardingStep: (step: OnboardingState["step"]) => void;
  applyAutoDefaults: () => void;
  createExactPost: (req: CreateExactPostRequest) => void;
  retryPost: (postId: string) => void;
  addWatch: (handle: string) => string | undefined;
  removeWatch: (watchId: string) => void;
  markAlertRead: (alertId: string) => void;
  updateAuto: (patch: UpdateAutoSettingsRequest) => void;
  approveDraft: (draftId: string) => void;
  skipDraft: (draftId: string) => void;
  editDraft: (draftId: string, text: string) => void;
  earlyUnlock: () => void;
  dismissDay8Banner: () => void;
  simulateDay8: () => void;
  updateNotifications: (patch: Partial<NotificationSettings>) => void;
  clearExactHistory: () => void;
  clearAutoHistory: () => void;
  clearAlerts: () => void;
  loadDemo: () => void;
  resetFresh: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEY = "xap-milestone1-state";

function loadState(): AppSnapshot {
  if (typeof window === "undefined") return createInitialSnapshot(false);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AppSnapshot;
  } catch {
    /* ignore */
  }
  return createInitialSnapshot(false);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppSnapshot>(() => createInitialSnapshot(false));
  const [hydrated, setHydrated] = useState(false);

  React.useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, hydrated]);

  const connect = useCallback(() => setState((s) => mock.mockConnect(s)), []);
  const disconnect = useCallback(() => setState((s) => mock.mockDisconnect(s)), []);
  const simulateAuthError = useCallback(
    () => setState((s) => mock.mockSimulateAuthError(s)),
    [],
  );
  const skipOnboarding = useCallback(
    () => setState((s) => mock.mockSkipOnboarding(s)),
    [],
  );
  const setOnboardingStep = useCallback(
    (step: OnboardingState["step"]) =>
      setState((s) => mock.mockCompleteOnboardingStep(s, step)),
    [],
  );
  const applyAutoDefaults = useCallback(
    () => setState((s) => mock.mockApplyAutoDefaults(s)),
    [],
  );
  const createExactPost = useCallback(
    (req: CreateExactPostRequest) =>
      setState((s) => mock.mockCreateExactPost(s, req)),
    [],
  );
  const retryPost = useCallback(
    (postId: string) => setState((s) => mock.mockRetryPost(s, postId)),
    [],
  );
  const addWatch = useCallback((handle: string) => {
    let error: string | undefined;
    setState((s) => {
      const res = mock.mockAddWatch(s, { handle });
      error = res.error;
      return res.snapshot;
    });
    return error;
  }, []);
  const removeWatch = useCallback(
    (watchId: string) => setState((s) => mock.mockRemoveWatch(s, watchId)),
    [],
  );
  const markAlertRead = useCallback(
    (alertId: string) => setState((s) => mock.mockMarkAlertRead(s, alertId)),
    [],
  );
  const updateAuto = useCallback(
    (patch: UpdateAutoSettingsRequest) =>
      setState((s) => mock.mockUpdateAuto(s, patch)),
    [],
  );
  const approveDraft = useCallback(
    (draftId: string) => setState((s) => mock.mockApproveDraft(s, draftId)),
    [],
  );
  const skipDraft = useCallback(
    (draftId: string) => setState((s) => mock.mockSkipDraft(s, draftId)),
    [],
  );
  const editDraft = useCallback(
    (draftId: string, text: string) =>
      setState((s) => mock.mockEditDraft(s, draftId, text)),
    [],
  );
  const earlyUnlock = useCallback(
    () => setState((s) => mock.mockEarlyUnlock(s)),
    [],
  );
  const dismissDay8Banner = useCallback(
    () => setState((s) => mock.mockDismissDay8Banner(s)),
    [],
  );
  const simulateDay8 = useCallback(
    () => setState((s) => mock.mockSimulateDay8(s)),
    [],
  );
  const updateNotifications = useCallback(
    (patch: Partial<NotificationSettings>) =>
      setState((s) => mock.mockUpdateNotifications(s, patch)),
    [],
  );
  const clearExactHistory = useCallback(
    () => setState((s) => mock.mockClearExactHistory(s)),
    [],
  );
  const clearAutoHistory = useCallback(
    () => setState((s) => mock.mockClearAutoHistory(s)),
    [],
  );
  const clearAlerts = useCallback(
    () => setState((s) => mock.mockClearAlerts(s)),
    [],
  );
  const loadDemo = useCallback(() => setState(createInitialSnapshot(true)), []);
  const resetFresh = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(createInitialSnapshot(false));
  }, []);

  const value = useMemo(
    () => ({
      state,
      connect,
      disconnect,
      simulateAuthError,
      skipOnboarding,
      setOnboardingStep,
      applyAutoDefaults,
      createExactPost,
      retryPost,
      addWatch,
      removeWatch,
      markAlertRead,
      updateAuto,
      approveDraft,
      skipDraft,
      editDraft,
      earlyUnlock,
      dismissDay8Banner,
      simulateDay8,
      updateNotifications,
      clearExactHistory,
      clearAutoHistory,
      clearAlerts,
      loadDemo,
      resetFresh,
    }),
    [
      state,
      connect,
      disconnect,
      simulateAuthError,
      skipOnboarding,
      setOnboardingStep,
      applyAutoDefaults,
      createExactPost,
      retryPost,
      addWatch,
      removeWatch,
      markAlertRead,
      updateAuto,
      approveDraft,
      skipDraft,
      editDraft,
      earlyUnlock,
      dismissDay8Banner,
      simulateDay8,
      updateNotifications,
      clearExactHistory,
      clearAutoHistory,
      clearAlerts,
      loadDemo,
      resetFresh,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
