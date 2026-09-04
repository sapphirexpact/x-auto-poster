"use client";

import Link from "next/link";
import { useApp } from "@/lib/context/AppContext";
import {
  Banner,
  Button,
  Card,
  Chip,
  EmptyState,
  PageHeader,
  TextArea,
} from "@/components/ui";
import { formatPT } from "@/lib/utils/time";
import { WATCH_MAX } from "@/lib/mock/api";
import { useState } from "react";

export default function HomePage() {
  const {
    state,
    updateAuto,
    approveDraft,
    skipDraft,
    editDraft,
  } = useApp();
  const next = state.autoQueue.find((d) => d.status === "pending_review") ?? null;
  const [editing, setEditing] = useState(false);
  const [draftText, setDraftText] = useState(next?.text ?? "");

  const account = state.auth.account;
  const autoPaused = state.auto.status === "paused";

  return (
    <div className="space-y-4">
      <PageHeader
        title="Home"
        subtitle="One account · exact posts · watches · auto drafts"
        action={
          account ? (
            <div className="rounded-full bg-stone-900 px-3 py-1.5 text-xs font-medium text-white">
              @{account.handle}
            </div>
          ) : (
            <Chip tone="warn">Not connected</Chip>
          )
        }
      />

      {state.onboarding.skippedAfterConnect && autoPaused ? (
        <Banner tone="info" title="Auto is paused">
          You skipped setup. Enable Auto when you&apos;re ready.
        </Banner>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <Link
          href="/post"
          className="rounded-2xl bg-stone-900 px-3 py-4 text-center text-sm font-semibold text-white"
        >
          Write a post
        </Link>
        <Card className="!p-3">
          <p className="text-xs text-stone-500">Auto status</p>
          <p className="mt-1 text-sm font-semibold">
            {autoPaused ? "Paused" : "Active"} · Day {state.auto.dayNumber}
          </p>
          <div className="mt-2 flex gap-1">
            <Button
              variant="secondary"
              className="flex-1 !py-1.5 !text-xs"
              onClick={() =>
                updateAuto({ status: autoPaused ? "active" : "paused" })
              }
            >
              {autoPaused ? "Resume" : "Pause"}
            </Button>
            <Link
              href="/auto"
              className="flex flex-1 items-center justify-center rounded-xl bg-stone-100 px-2 py-1.5 text-xs font-medium text-stone-800"
            >
              Edit
            </Link>
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Next auto-draft</h2>
          {next ? <Chip tone="warn">Review</Chip> : <Chip>None</Chip>}
        </div>
        {next ? (
          <div className="space-y-3">
            {editing ? (
              <TextArea value={draftText} onChange={setDraftText} />
            ) : (
              <p className="text-sm text-stone-800">{next.text}</p>
            )}
            <p className="text-xs text-stone-500">
              {next.scheduledFor
                ? `Scheduled ${formatPT(next.scheduledFor)}`
                : `Created ${formatPT(next.createdAt)}`}
            </p>
            <div className="flex flex-wrap gap-2">
              {editing ? (
                <Button
                  onClick={() => {
                    editDraft(next.id, draftText);
                    setEditing(false);
                  }}
                >
                  Save
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setDraftText(next.text);
                    setEditing(true);
                  }}
                >
                  Edit
                </Button>
              )}
              <Button variant="ghost" onClick={() => skipDraft(next.id)}>
                Skip
              </Button>
              <Button variant="accent" onClick={() => approveDraft(next.id)}>
                Approve
              </Button>
            </div>
          </div>
        ) : (
          <EmptyState>No draft waiting. Auto will queue the next one.</EmptyState>
        )}
      </Card>

      <Card>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Watch</h2>
          <Link href="/watch" className="text-xs font-medium text-teal-800">
            {state.watches.length}/{WATCH_MAX} · Open
          </Link>
        </div>
        {state.watches.length === 0 ? (
          <EmptyState>No watches yet. Add up to {WATCH_MAX} handles.</EmptyState>
        ) : (
          <div className="flex flex-wrap gap-2">
            {state.watches.map((w) => (
              <Chip key={w.id}>@{w.handle}</Chip>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold">Recent activity</h2>
        {state.activity.length === 0 ? (
          <EmptyState>Nothing yet.</EmptyState>
        ) : (
          <ul className="space-y-3">
            {state.activity.slice(0, 8).map((a) => (
              <li key={a.id} className="border-b border-stone-100 pb-2 last:border-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{a.title}</p>
                    {a.detail ? (
                      <p className="text-xs text-stone-500 line-clamp-2">{a.detail}</p>
                    ) : null}
                  </div>
                  <time className="shrink-0 text-[11px] text-stone-400">
                    {formatPT(a.at)}
                  </time>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
