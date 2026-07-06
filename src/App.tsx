import { Suspense, lazy, useEffect, useRef } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { RouteSeo } from "@/components/seo/RouteSeo";
import { useBlockedWordsSeed } from "@/hooks/useBlockedWordsSeed";
import { logRouteLoad } from "@/lib/devPerf";

const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const FAQ = lazy(() => import("./pages/FAQ"));
const WhyDonate = lazy(() => import("./pages/WhyDonate"));
const AskAI = lazy(() => import("./pages/AskAI"));
const Security = lazy(() => import("./pages/Security"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const PollsExplained = lazy(() => import("./pages/PollsExplained"));
const CommunitiesExplained = lazy(() => import("./pages/CommunitiesExplained"));
const PitchSelector = lazy(() => import("./pages/PitchSelector"));
const PitchV1 = lazy(() => import("./pages/PitchV1"));
const PitchV2 = lazy(() => import("./pages/PitchV2"));
const TestPollOnboarding = import.meta.env.DEV
  ? lazy(() => import("./pages/_TestPollOnboarding"))
  : null;

const routeFallback = (
  <main className="min-h-screen bg-raw-black px-5 py-6 text-raw-silver">
    <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
      <div className="font-display text-lg text-raw-gold">RAW</div>
      <div className="h-8 w-24 rounded border border-raw-border/60 bg-raw-charcoal/60" />
    </div>
    <section className="mx-auto mt-16 w-full max-w-6xl">
      <div className="h-5 w-24 rounded bg-raw-gold/30" />
      <div className="mt-5 h-10 w-full max-w-xl rounded bg-raw-charcoal/80" />
      <div className="mt-3 h-10 w-4/5 max-w-lg rounded bg-raw-charcoal/60" />
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="h-28 rounded border border-raw-border/50 bg-raw-charcoal/50" />
        <div className="h-28 rounded border border-raw-border/50 bg-raw-charcoal/40" />
        <div className="h-28 rounded border border-raw-border/50 bg-raw-charcoal/30" />
      </div>
    </section>
  </main>
);

function ModerationInit() {
  useBlockedWordsSeed();
  return null;
}

function RoutePerfLogger() {
  const location = useLocation();
  const routeStartRef = useRef(typeof performance !== "undefined" ? performance.now() : 0);

  useEffect(() => {
    logRouteLoad(location.pathname, routeStartRef.current);
    routeStartRef.current = typeof performance !== "undefined" ? performance.now() : 0;
  }, [location.pathname]);

  return null;
}

const App = () => (
  <ErrorBoundary>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ModerationInit />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AnalyticsProvider>
            <RouteSeo />
            <RoutePerfLogger />
            <Suspense fallback={routeFallback}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<Index />} />
                <Route path="/dashboard/communities/:communityId" element={<Index />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/why-donate" element={<WhyDonate />} />
                <Route path="/polls-explained" element={<PollsExplained />} />
                <Route path="/communities-explained" element={<CommunitiesExplained />} />
                <Route path="/ask" element={<AskAI />} />
                <Route path="/security" element={<Security />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/pitch" element={<PitchSelector />} />
                <Route path="/pitch-v1" element={<PitchV1 />} />
                <Route path="/pitch-v2" element={<PitchV2 />} />
                {TestPollOnboarding && (
                  <Route path="/__test/poll-onboarding" element={<TestPollOnboarding />} />
                )}
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AnalyticsProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
