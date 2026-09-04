"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context/AppContext";
import { Banner, Button, Card, FieldLabel, Input, PageHeader } from "@/components/ui";
import { WATCH_MAX } from "@/lib/mock/api";
import { useState } from "react";

export default function OnboardingPage() {
  const {
    state,
    connect,
    applyAutoDefaults,
    skipOnboarding,
    setOnboardingStep,
    addWatch,
    removeWatch,
  } = useApp();
  const router = useRouter();
  const [handle, setHandle] = useState("");
  const [error, setError] = useState<string>();

  const finish = () => {
    setOnboardingStep("done");
    router.replace("/home");
  };

  const skipToHome = () => {
    skipOnboarding();
    router.replace("/home");
  };

  if (state.onboarding.completed) {
    return (
      <div>
        <PageHeader title="You're set" subtitle="Onboarding already completed." />
        <Button onClick={() => router.replace("/home")}>Go to Home</Button>
      </div>
    );
  }

  const step = state.onboarding.step;
  const steps = ["connect", "auto_defaults", "watches"] as const;
  const stepIndex = steps.indexOf(step as (typeof steps)[number]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Welcome"
        subtitle="Connect one X account, then optionally tune Auto and Watches."
      />

      <ol className="flex gap-2" aria-label="Onboarding progress">
        {steps.map((s, i) => (
          <li
            key={s}
            className={`h-1.5 flex-1 rounded-full ${
              stepIndex >= i ? "bg-teal-600" : "bg-stone-200"
            }`}
          />
        ))}
      </ol>

      {step === "connect" ? (
        <Card className="space-y-3">
          <h2 className="text-base font-semibold">1 · Connect X</h2>
          <p className="text-sm text-stone-600">
            Milestone 1 supports exactly one connected X account (mock OAuth).
          </p>
          <Button variant="accent" onClick={connect} className="w-full">
            Connect with X
          </Button>
          {state.auth.status === "connected" ? (
            <Banner tone="success" title={`Connected @${state.auth.account?.handle}`}>
              Continue to Auto defaults, or skip setup.
            </Banner>
          ) : null}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              disabled={state.auth.status !== "connected"}
              onClick={() => setOnboardingStep("auto_defaults")}
            >
              Continue
            </Button>
            <Button
              variant="ghost"
              className="flex-1"
              disabled={state.auth.status !== "connected"}
              onClick={skipToHome}
            >
              Skip setup
            </Button>
          </div>
          <p className="text-xs text-stone-500">
            Skip after connect applies defaults and keeps Auto paused until you enable it.
          </p>
        </Card>
      ) : null}

      {step === "auto_defaults" ? (
        <Card className="space-y-3">
          <h2 className="text-base font-semibold">2 · Auto defaults</h2>
          <ul className="space-y-1.5 text-sm text-stone-600">
            <li>· Mode: Trending memes</li>
            <li>· Cadence: every 6 hours</li>
            <li>· Review-before-post: ON (days 1–7)</li>
            <li>· Quiet hours: 22:00–07:00 PT</li>
          </ul>
          <Button variant="accent" className="w-full" onClick={() => applyAutoDefaults()}>
            Apply defaults & continue
          </Button>
          <Button variant="ghost" className="w-full" onClick={skipToHome}>
            Skip — pause Auto
          </Button>
        </Card>
      ) : null}

      {step === "watches" ? (
        <Card className="space-y-3">
          <h2 className="text-base font-semibold">3 · Add watches (0–{WATCH_MAX})</h2>
          <p className="text-sm text-stone-600">
            Notify on every new post. No keyword filters. Skippable.
          </p>
          <FieldLabel htmlFor="watch-handle">X handle</FieldLabel>
          <div className="flex gap-2">
            <Input
              id="watch-handle"
              value={handle}
              onChange={setHandle}
              placeholder="@handle"
            />
            <Button
              onClick={() => {
                const err = addWatch(handle);
                setError(err);
                if (!err) setHandle("");
              }}
            >
              Add
            </Button>
          </div>
          {error ? (
            <p className="text-sm text-rose-700" role="alert">
              {error}
            </p>
          ) : null}
          <ul className="space-y-2">
            {state.watches.map((w) => (
              <li
                key={w.id}
                className="flex items-center justify-between rounded-xl bg-stone-50 px-3 py-2 text-sm"
              >
                <span>@{w.handle}</span>
                <Button variant="ghost" onClick={() => removeWatch(w.id)}>
                  Remove
                </Button>
              </li>
            ))}
          </ul>
          <p className="text-xs text-stone-500">
            Watching {state.watches.length}/{WATCH_MAX}
          </p>
          <Button variant="accent" className="w-full" onClick={finish}>
            Finish
          </Button>
          <Button variant="ghost" className="w-full" onClick={finish}>
            Skip watches
          </Button>
        </Card>
      ) : null}
    </div>
  );
}
