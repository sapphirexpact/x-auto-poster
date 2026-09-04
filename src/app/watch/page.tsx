"use client";

import { useState } from "react";
import { useApp } from "@/lib/context/AppContext";
import {
  Banner,
  Button,
  Card,
  Chip,
  EmptyState,
  FieldLabel,
  Input,
  PageHeader,
} from "@/components/ui";
import { formatPT } from "@/lib/utils/time";
import { WATCH_MAX } from "@/lib/mock/api";

export default function WatchPage() {
  const { state, addWatch, removeWatch, markAlertRead } = useApp();
  const [handle, setHandle] = useState("");
  const [error, setError] = useState<string>();
  const atLimit = state.watches.length >= WATCH_MAX;
  const unread = state.alerts.filter((a) => !a.read).length;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Watch"
        subtitle={`Watching ${state.watches.length}/${WATCH_MAX} · every post · in-app alerts`}
      />

      {atLimit ? (
        <Banner tone="warn" title="Limit reached">
          You&apos;re at {WATCH_MAX}/{WATCH_MAX} watches. Remove one to add another. No
          keyword filters in v1.
        </Banner>
      ) : null}

      {state.notifications.alertsPaused ? (
        <Banner tone="info" title="Alerts paused">
          Account disconnected — watches kept, alerts paused until reconnect.
        </Banner>
      ) : null}

      <Card className="space-y-3">
        <FieldLabel htmlFor="add-watch">Add handle</FieldLabel>
        <div className="flex gap-2">
          <Input
            id="add-watch"
            value={handle}
            onChange={setHandle}
            placeholder="@handle"
          />
          <Button
            disabled={atLimit}
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
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold">
          Watching {state.watches.length}/{WATCH_MAX}
        </h2>
        {state.watches.length === 0 ? (
          <EmptyState>No watches. Add 0–{WATCH_MAX} accounts.</EmptyState>
        ) : (
          <ul className="space-y-3">
            {state.watches.map((w) => (
              <li
                key={w.id}
                className="rounded-xl border border-stone-100 bg-stone-50/70 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">@{w.handle}</p>
                    {w.lastPostText ? (
                      <p className="mt-1 text-sm text-stone-600 line-clamp-2">
                        {w.lastPostText}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-stone-400">No posts yet</p>
                    )}
                    {w.lastPostAt ? (
                      <p className="mt-1 text-[11px] text-stone-400">
                        Last post {formatPT(w.lastPostAt)}
                      </p>
                    ) : null}
                  </div>
                  <Button variant="ghost" onClick={() => removeWatch(w.id)}>
                    Remove
                  </Button>
                </div>
                {w.lastPostUrl ? (
                  <a
                    href={w.lastPostUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-sm font-medium text-teal-800"
                  >
                    Open on X
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Alert inbox</h2>
          {unread > 0 ? <Chip tone="warn">{unread} new</Chip> : <Chip>All read</Chip>}
        </div>
        {state.alerts.length === 0 ? (
          <EmptyState>No alerts yet. New posts from watches land here.</EmptyState>
        ) : (
          <ul className="space-y-3">
            {state.alerts.map((a) => (
              <li
                key={a.id}
                className={`rounded-xl border p-3 ${
                  a.read
                    ? "border-stone-100 bg-white"
                    : "border-teal-100 bg-teal-50/40"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">@{a.handle} posted</p>
                    <p className="mt-1 text-sm text-stone-700">{a.postText}</p>
                    <p className="mt-1 text-[11px] text-stone-400">
                      {formatPT(a.createdAt)}
                    </p>
                  </div>
                  {!a.read ? (
                    <Button variant="ghost" onClick={() => markAlertRead(a.id)}>
                      Mark read
                    </Button>
                  ) : null}
                </div>
                <a
                  href={a.postUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm font-medium text-teal-800"
                >
                  Open on X
                </a>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
