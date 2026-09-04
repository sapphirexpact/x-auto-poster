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
  TextArea,
} from "@/components/ui";
import { formatPT, fromDatetimeLocalValue, hoursFromNow, toDatetimeLocalValue } from "@/lib/utils/time";

export default function PostPage() {
  const { state, createExactPost, retryPost } = useApp();
  const [text, setText] = useState("");
  const [schedule, setSchedule] = useState(false);
  const [when, setWhen] = useState(toDatetimeLocalValue(hoursFromNow(2)));

  const submit = (scheduled: boolean) => {
    createExactPost({
      text,
      scheduledFor: scheduled ? fromDatetimeLocalValue(when) : undefined,
    });
    setText("");
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Post"
        subtitle="Exact text-only posts · skips AI review gate"
      />

      <Banner tone="info" title="Exact-only">
        What you type is what gets posted. No AI rewrite or review gate on this tab.
      </Banner>

      <Card className="space-y-3">
        <FieldLabel htmlFor="compose">Compose</FieldLabel>
        <TextArea
          id="compose"
          value={text}
          onChange={setText}
          placeholder="Write your exact post…"
        />
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input
            type="checkbox"
            checked={schedule}
            onChange={(e) => setSchedule(e.target.checked)}
            className="rounded border-stone-300"
          />
          Schedule (PT)
        </label>
        {schedule ? (
          <Input
            id="when"
            type="datetime-local"
            value={when}
            onChange={setWhen}
          />
        ) : null}
        <div className="flex gap-2">
          <Button
            variant="accent"
            className="flex-1"
            disabled={!text.trim() || state.auth.status !== "connected"}
            onClick={() => submit(false)}
          >
            Post now
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            disabled={!text.trim() || !schedule || state.auth.status !== "connected"}
            onClick={() => submit(true)}
          >
            Schedule
          </Button>
        </div>
        {state.auth.status !== "connected" ? (
          <p className="text-xs text-rose-700">Connect an X account to post.</p>
        ) : null}
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold">Exact history</h2>
        {state.exactPosts.length === 0 ? (
          <EmptyState>No exact posts yet.</EmptyState>
        ) : (
          <ul className="space-y-3">
            {state.exactPosts.map((p) => (
              <li
                key={p.id}
                className="rounded-xl border border-stone-100 bg-stone-50/80 p-3"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <Chip
                    tone={
                      p.status === "posted"
                        ? "good"
                        : p.status === "failed"
                          ? "bad"
                          : "warn"
                    }
                  >
                    {p.status}
                  </Chip>
                  <time className="text-[11px] text-stone-400">
                    {formatPT(p.postedAt ?? p.scheduledFor ?? p.createdAt)}
                  </time>
                </div>
                <p className="text-sm text-stone-800">{p.text}</p>
                {p.errorMessage ? (
                  <p className="mt-2 text-sm font-medium text-rose-700" role="alert">
                    {p.errorMessage}
                  </p>
                ) : null}
                <div className="mt-2 flex gap-2">
                  {p.status === "failed" ? (
                    <Button variant="secondary" onClick={() => retryPost(p.id)}>
                      Retry
                    </Button>
                  ) : null}
                  {p.xUrl ? (
                    <a
                      href={p.xUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl px-3 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50"
                    >
                      Open on X
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
