import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { track } from "@/lib/analytics";
import { setClient } from "@/lib/analytics/client";
import { initBrowserAnalytics } from "@/lib/browserAnalytics";
import { installGlobalCrashAlerts } from "@/lib/crashAlerts";
import { initSentry } from "@/lib/sentry";
import { ensureOneSignalInit, isOneSignalServiceWorker } from "@/lib/onesignal";
import { logAppBoot, markAppBootStart } from "@/lib/devPerf";
import App from "./App.tsx";
import "./index.css";
import "./styles/raw-reveal-button.css";
import posthog from "posthog-js";

const appBootStart = markAppBootStart();
const queryClient = new QueryClient();
let monitoringStarted = false;

function runAfterFirstPaint(callback: () => void) {
  if (typeof window === "undefined") {
    callback();
    return;
  }

  window.requestAnimationFrame(() => {
    window.setTimeout(callback, 0);
  });
}

function initMonitoringAndAnalytics() {
  if (monitoringStarted) return;
  monitoringStarted = true;

  initSentry();
  initBrowserAnalytics();
  installGlobalCrashAlerts();

  const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
  if (posthogKey) {
    posthog.init(posthogKey, {
      api_host: import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com",
      defaults: "2026-01-30",
      capture_pageview: false,
      capture_pageleave: false,
      autocapture: false,
      disable_session_recording: true,
      person_profiles: "identified_only",
    });

    setClient({
      capture: (name, properties) => {
        posthog.capture(name, properties);
      },
      identify: (userId, traits) => {
        posthog.identify(userId, traits);
      },
      alias: (newId, previousId) => {
        posthog.alias(newId, previousId);
      },
      reset: () => {
        posthog.reset();
      },
      group: (groupType, groupKey, traits) => {
        posthog.group(groupType, groupKey, traits);
      },
      register: (props) => {
        posthog.register(props);
      },
      get_distinct_id: () => posthog.get_distinct_id(),
    });
  }

  if (typeof window !== "undefined" && import.meta.env.DEV) {
    const params = new URLSearchParams(window.location.search);
    if (params.get("analytics_test") === "1") {
      track("diagnostics_probe_fired", {
        source: "query_param",
        mode: import.meta.env.MODE,
      });
    }
  }

  void ensureOneSignalInit().catch(() => {
    // SDK may be blocked or unavailable; consent hook will retry on demand.
  });
}

if (typeof window !== "undefined") {
  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    const message = typeof args[0] === "string" ? args[0] : "";
    if (message.includes("THREE.THREE.Clock: This module has been deprecated")) {
      return;
    }
    originalWarn(...args);
  };
}

const shouldEnableSpeedInsights = import.meta.env.PROD;
const SERVICE_WORKER_CLEANUP_RELOAD_KEY = "raw.sw-cleanup-reloaded";

function cleanupLegacyServiceWorkers() {
  if (!("serviceWorker" in navigator) || !import.meta.env.PROD) return;

  const hadController = Boolean(navigator.serviceWorker.controller);

  navigator.serviceWorker.getRegistrations()
    .then((registrations) =>
      Promise.all(
        registrations
          .filter((registration) => !isOneSignalServiceWorker(registration))
          .map((registration) => registration.unregister()),
      ),
    )
    .then((results) => {
      if (!hadController || !results.some(Boolean)) return;

      try {
        if (window.sessionStorage.getItem(SERVICE_WORKER_CLEANUP_RELOAD_KEY) === "1") return;
        window.sessionStorage.setItem(SERVICE_WORKER_CLEANUP_RELOAD_KEY, "1");
      } catch {
        // If sessionStorage is unavailable, avoid a reload loop.
        return;
      }

      window.location.reload();
    })
    .catch(() => {
      // no-op: app works even if service worker cleanup is unavailable.
    });
}

cleanupLegacyServiceWorkers();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
        {shouldEnableSpeedInsights ? <SpeedInsights /> : null}
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);

runAfterFirstPaint(() => {
  initMonitoringAndAnalytics();
  logAppBoot(appBootStart);
});
