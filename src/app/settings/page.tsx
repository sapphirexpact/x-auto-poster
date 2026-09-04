"use client";

import { useApp } from "@/lib/context/AppContext";
import {
  Banner,
  Button,
  Card,
  Chip,
  PageHeader,
  Toggle,
} from "@/components/ui";
import { formatPT } from "@/lib/utils/time";

export default function SettingsPage() {
  const {
    state,
    connect,
    disconnect,
    simulateAuthError,
    updateAuto,
    updateNotifications,
    clearExactHistory,
    clearAutoHistory,
    clearAlerts,
    loadDemo,
    resetFresh,
  } = useApp();

  return (
    <div className="space-y-4">
      <PageHeader title="Settings" subtitle="Account, notifications, danger zone" />

      <Card className="space-y-3">
        <h2 className="text-sm font-semibold">X account</h2>
        {state.auth.account ? (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">@{state.auth.account.handle}</p>
                <p className="text-xs text-stone-500">
                  Connected {formatPT(state.auth.account.connectedAt)}
                </p>
              </div>
              <Chip
                tone={
                  state.auth.status === "connected"
                    ? "good"
                    : state.auth.status === "error"
                      ? "bad"
                      : "warn"
                }
              >
                {state.auth.status}
              </Chip>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={connect}>
                Reconnect
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  if (
                    window.confirm(
                      "Disconnect? Watches are kept; alerts pause; Auto pauses.",
                    )
                  ) {
                    disconnect();
                  }
                }}
              >
                Disconnect
              </Button>
              <Button variant="ghost" onClick={simulateAuthError}>
                (Demo) Auth error
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-stone-600">No account connected.</p>
            <Button variant="accent" onClick={connect}>
              Connect with X
            </Button>
          </>
        )}
        <p className="text-xs text-stone-500">
          Product lock: one connected X account. Disconnect keeps watches and
          pauses alerts.
        </p>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-sm font-semibold">Notifications</h2>
        <Toggle
          checked={state.notifications.watchAlertsInApp}
          onChange={(watchAlertsInApp) => updateNotifications({ watchAlertsInApp })}
          label="Watch alerts in-app"
          description="Default for Milestone 1"
        />
        <Toggle
          checked={state.notifications.autoDraftReady}
          onChange={(autoDraftReady) => updateNotifications({ autoDraftReady })}
          label="Auto draft ready"
        />
        <Toggle
          checked={state.notifications.postFailures}
          onChange={(postFailures) => updateNotifications({ postFailures })}
          label="Post failures"
        />
        {state.notifications.alertsPaused ? (
          <Banner tone="info" title="Alerts paused">
            Reconnect to resume watch alerts.
          </Banner>
        ) : null}
      </Card>

      <Card className="space-y-3">
        <h2 className="text-sm font-semibold">Review gate (mirror)</h2>
        <Toggle
          checked={state.auto.reviewBeforePost}
          onChange={(reviewBeforePost) => updateAuto({ reviewBeforePost })}
          label="Review before post (Auto)"
          description="Exact Post always skips this gate"
        />
      </Card>

      <Card className="space-y-3">
        <h2 className="text-sm font-semibold text-rose-800">Danger zone</h2>
        <p className="text-xs text-stone-500">
          Clears are local mock data only.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              if (window.confirm("Clear exact post history?")) clearExactHistory();
            }}
          >
            Clear exact history
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              if (window.confirm("Clear auto queue & history?")) clearAutoHistory();
            }}
          >
            Clear auto history
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              if (window.confirm("Clear alert inbox?")) clearAlerts();
            }}
          >
            Clear alerts
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (window.confirm("Reset all local mock state?")) resetFresh();
            }}
          >
            Reset app
          </Button>
        </div>
      </Card>

      <Card className="space-y-2">
        <h2 className="text-sm font-semibold">Demo</h2>
        <Button variant="secondary" onClick={loadDemo}>
          Load demo connected state
        </Button>
      </Card>
    </div>
  );
}
