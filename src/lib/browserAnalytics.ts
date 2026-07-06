type ClarityWindow = Window & {
  clarity?: (...args: unknown[]) => void;
};

type AnalyticsWindow = ClarityWindow & {
  dataLayer?: unknown[][];
};

function loadScript(src: string): void {
  const script = document.createElement("script");
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

function initClarity(projectId?: string): void {
  if (!projectId) {
    return;
  }

  const clarityWindow = window as AnalyticsWindow;
  clarityWindow.clarity =
    clarityWindow.clarity ??
    function clarity(...args: unknown[]) {
      const queuedClarity = clarityWindow.clarity as
        | ((...queuedArgs: unknown[]) => void)
        | { q?: unknown[][] };
      const queue =
        "q" in queuedClarity
          ? (queuedClarity.q = queuedClarity.q ?? [])
          : [];
      queue.push(args);
    };

  loadScript(`https://www.clarity.ms/tag/${projectId}`);
}

function initGoogleAnalytics(measurementId?: string): void {
  if (!measurementId) {
    return;
  }

  const analyticsWindow = window as AnalyticsWindow;
  loadScript(`https://www.googletagmanager.com/gtag/js?id=${measurementId}`);

  analyticsWindow.dataLayer = analyticsWindow.dataLayer || [];
  function gtag(...args: unknown[]) {
    analyticsWindow.dataLayer?.push(args);
  }
  gtag("js", new Date());
  gtag("config", measurementId);
}

export function initBrowserAnalytics(): void {
  if (typeof window === "undefined") {
    return;
  }

  initClarity(import.meta.env.VITE_CLARITY_PROJECT_ID);
  initGoogleAnalytics(import.meta.env.VITE_GA_MEASUREMENT_ID);
}
