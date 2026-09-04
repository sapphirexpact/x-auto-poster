"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useApp } from "@/lib/context/AppContext";
import { BottomNav } from "./BottomNav";
import { Banner, Button } from "./ui";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { state, connect } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!state.onboarding.completed && !pathname?.startsWith("/onboarding")) {
      router.replace("/onboarding");
    }
  }, [state.onboarding.completed, pathname, router]);

  const showChrome = !pathname?.startsWith("/onboarding");

  return (
    <div className="min-h-dvh bg-stone-50 text-stone-900">
      <div className="mx-auto min-h-dvh max-w-lg px-4 pb-28 pt-5">
        {showChrome && state.auth.errorMessage ? (
          <Banner
            tone="error"
            title="Reconnect required"
            action={
              <Button variant="danger" onClick={connect}>
                Reconnect X
              </Button>
            }
          >
            {state.auth.errorMessage}
          </Banner>
        ) : null}
        {showChrome && state.auth.rateLimitMessage ? (
          <Banner tone="warn" title="Rate limit">
            {state.auth.rateLimitMessage}
          </Banner>
        ) : null}
        {children}
      </div>
      {showChrome ? <BottomNav /> : null}
    </div>
  );
}
