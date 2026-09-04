"use client";

import { useApp } from "@/lib/context/AppContext";
import {
  Banner,
  Button,
  Card,
  Chip,
  EmptyState,
  FieldLabel,
  PageHeader,
  TextArea,
  Toggle,
} from "@/components/ui";
import type { AutoMode } from "@/lib/api/types";
import { formatPT } from "@/lib/utils/time";

const MODES: { id: AutoMode; label: string; blurb: string }[] = [
  {
    id: "trending_memes",
    label: "Trending memes",
    blurb: "Default · light cultural drafts",
  },
  { id: "crypto", label: "Crypto", blurb: "Market-aware, non-spammy" },
  {
    id: "custom_prompts",
    label: "Custom prompts",
    blurb: "Free-text + presets",
  },
];

export default function AutoPage() {
  const {
    state,
    updateAuto,
    approveDraft,
    skipDraft,
    earlyUnlock,
    dismissDay8Banner,
    simulateDay8,
  } = useApp();
  const { auto } = state;
  const showDay8 =
    auto.dayNumber >= 8 &&
    !auto.reviewBeforePost &&
    !auto.day8BannerDismissed;
  const canEarlyUnlock =
    auto.dayNumber < 8 && auto.reviewBeforePost && !auto.earlyUnlockConfirmed;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Auto"
        subtitle={`Day ${auto.dayNumber} · cadence ${auto.cadenceHours}h · times in PT`}
        action={
          <Button
            variant={auto.status === "paused" ? "accent" : "secondary"}
            onClick={() =>
              updateAuto({
                status: auto.status === "paused" ? "active" : "paused",
              })
            }
          >
            {auto.status === "paused" ? "Resume" : "Pause"}
          </Button>
        }
      />

      {auto.status === "paused" ? (
        <Banner tone="warn" title="Auto paused">
          Kill switch pauses Auto only — exact Post and Watch still work.
        </Banner>
      ) : null}

      {showDay8 ? (
        <Banner
          tone="success"
          title="Day 8 · full auto unlocked"
          action={
            <Button variant="secondary" onClick={dismissDay8Banner}>
              Got it
            </Button>
          }
        >
          Review-before-post is now off. Drafts can publish on cadence without
          approval.
        </Banner>
      ) : null}

      <Card className="space-y-3">
        <h2 className="text-sm font-semibold">Mode</h2>
        <div className="space-y-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => updateAuto({ mode: m.id })}
              className={`flex w-full items-start justify-between rounded-xl border px-3 py-2.5 text-left ${
                auto.mode === m.id
                  ? "border-teal-600 bg-teal-50"
                  : "border-stone-200 bg-white"
              }`}
            >
              <span>
                <span className="block text-sm font-medium">{m.label}</span>
                <span className="block text-xs text-stone-500">{m.blurb}</span>
              </span>
              {auto.mode === m.id ? <Chip tone="good">Selected</Chip> : null}
            </button>
          ))}
        </div>

        {auto.mode === "custom_prompts" ? (
          <div className="space-y-2">
            <FieldLabel>Custom prompt</FieldLabel>
            <TextArea
              value={auto.customPrompt}
              onChange={(v) => updateAuto({ customPrompt: v })}
              placeholder="Describe the voice and topics…"
            />
            <div className="flex flex-wrap gap-2">
              {state.customPromptPresets.map((p) => (
                <Button
                  key={p.id}
                  variant="secondary"
                  className="!text-xs"
                  onClick={() => updateAuto({ customPrompt: p.prompt })}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>
        ) : null}
      </Card>

      <Card className="space-y-3">
        <h2 className="text-sm font-semibold">Cadence & quiet hours</h2>
        <label className="block text-sm">
          Every {auto.cadenceHours} hours
          <input
            type="range"
            min={1}
            max={24}
            value={auto.cadenceHours}
            onChange={(e) =>
              updateAuto({ cadenceHours: Number(e.target.value) })
            }
            className="mt-2 w-full"
          />
        </label>
        <Toggle
          checked={auto.quietHours.enabled}
          onChange={(enabled) =>
            updateAuto({
              quietHours: { ...auto.quietHours, enabled },
            })
          }
          label="Quiet hours"
          description={`${auto.quietHours.start}–${auto.quietHours.end} America/Los_Angeles (PT)`}
        />
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-stone-600">
            Start
            <input
              type="time"
              value={auto.quietHours.start}
              onChange={(e) =>
                updateAuto({
                  quietHours: { ...auto.quietHours, start: e.target.value },
                })
              }
              className="mt-1 w-full rounded-xl border border-stone-200 px-2 py-2 text-sm"
            />
          </label>
          <label className="text-xs text-stone-600">
            End
            <input
              type="time"
              value={auto.quietHours.end}
              onChange={(e) =>
                updateAuto({
                  quietHours: { ...auto.quietHours, end: e.target.value },
                })
              }
              className="mt-1 w-full rounded-xl border border-stone-200 px-2 py-2 text-sm"
            />
          </label>
        </div>
      </Card>

      <Card className="space-y-3">
        <Toggle
          checked={auto.reviewBeforePost}
          onChange={(reviewBeforePost) => updateAuto({ reviewBeforePost })}
          label="Review before post"
          description="ON for days 1–7 by default"
        />
        {canEarlyUnlock ? (
          <Button
            variant="secondary"
            onClick={() => {
              if (
                window.confirm(
                  "Unlock full auto early? Drafts will post without review.",
                )
              ) {
                earlyUnlock();
              }
            }}
          >
            Early unlock full auto…
          </Button>
        ) : null}
        <Button variant="ghost" className="!text-xs" onClick={simulateDay8}>
          (Demo) Jump to Day 8
        </Button>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold">Queue</h2>
        {state.autoQueue.length === 0 ? (
          <EmptyState>Queue empty.</EmptyState>
        ) : (
          <ul className="space-y-3">
            {state.autoQueue.map((d) => (
              <li key={d.id} className="rounded-xl bg-stone-50 p-3">
                <div className="mb-1 flex justify-between gap-2">
                  <Chip tone="warn">{d.status.replace("_", " ")}</Chip>
                  <span className="text-[11px] text-stone-400">
                    {d.scheduledFor
                      ? formatPT(d.scheduledFor)
                      : formatPT(d.createdAt)}
                  </span>
                </div>
                <p className="text-sm">{d.text}</p>
                <div className="mt-2 flex gap-2">
                  <Button variant="accent" onClick={() => approveDraft(d.id)}>
                    Approve
                  </Button>
                  <Button variant="ghost" onClick={() => skipDraft(d.id)}>
                    Skip
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold">History</h2>
        {state.autoHistory.length === 0 ? (
          <EmptyState>No auto history yet.</EmptyState>
        ) : (
          <ul className="space-y-2">
            {state.autoHistory.map((h) => (
              <li
                key={h.id}
                className="flex items-start justify-between gap-2 border-b border-stone-100 pb-2 text-sm"
              >
                <div>
                  <Chip
                    tone={
                      h.status === "posted"
                        ? "good"
                        : h.status === "skipped"
                          ? "neutral"
                          : "bad"
                    }
                  >
                    {h.status}
                  </Chip>
                  <p className="mt-1 text-stone-700">{h.text}</p>
                </div>
                <time className="shrink-0 text-[11px] text-stone-400">
                  {formatPT(h.at)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
