import { Suspense, lazy, useEffect } from "react";
import { useHostMode } from "@/hooks/use-host-mode";
import { POLL_SHARE_PARAM } from "@/lib/pollShare";
import { useRawStore } from "@/store/useRawStore";
import { awardXP, XP_REWARDS } from "@/lib/userProgress";
import { claimPendingLandingWheelAvatarForUser } from "@/lib/avatarCatalog";
import { unlockCommunity } from "@/lib/communityAccess";
import { joinCommunity } from "@/backend/supabase/controllers/communityController";
import { saveOnboardingIdentities } from "@/backend/supabase/controllers/userController";
import { APP_CANONICAL_HOST, buildCanonicalAppUrl } from "@/lib/canonicalHost";

const LandingShellLazy = lazy(() => import("@/components/landing/LandingShell"));
const DashboardLazy = lazy(() => import("@/pages/Dashboard"));
const OnboardingJourneyLazy = lazy(() =>
  import("@/components/onboarding/OnboardingJourney").then((m) => ({ default: m.OnboardingJourney })),
);
const SharedPollPageLazy = lazy(() =>
  import("@/components/polls/SharedPollPage").then((m) => ({ default: m.SharedPollPage })),
);
const SignupModalLazy = lazy(() =>
  import("@/components/landing/SignupModal").then((m) => ({ default: m.SignupModal })),
);

function DashboardShellFallback() {
  return (
    <main className="min-h-screen bg-raw-black px-4 py-5 text-raw-silver">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <div>
          <div className="h-4 w-20 rounded bg-raw-gold/30" />
          <div className="mt-3 h-8 w-44 rounded bg-raw-charcoal/80" />
        </div>
        <div className="h-10 w-10 rounded-full border border-raw-border bg-raw-charcoal" />
      </div>
      <div className="mx-auto mt-8 grid w-full max-w-6xl gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden min-h-[420px] rounded border border-raw-border/60 bg-raw-charcoal/40 lg:block" />
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="h-48 rounded border border-raw-border/60 bg-raw-charcoal/50" />
          <div className="h-48 rounded border border-raw-border/60 bg-raw-charcoal/40" />
          <div className="h-40 rounded border border-raw-border/60 bg-raw-charcoal/35 sm:col-span-2" />
        </section>
      </div>
    </main>
  );
}

function LandingShellFallback() {
  return (
    <main className="min-h-screen bg-raw-black px-5 py-6 text-raw-silver">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <div className="font-display text-lg text-raw-gold">RAW</div>
        <div className="h-9 w-24 rounded border border-raw-border/60 bg-raw-charcoal/60" />
      </div>
      <section className="mx-auto mt-20 w-full max-w-6xl">
        <div className="h-5 w-28 rounded bg-raw-gold/30" />
        <div className="mt-6 h-12 w-full max-w-2xl rounded bg-raw-charcoal/80" />
        <div className="mt-4 h-12 w-3/4 max-w-xl rounded bg-raw-charcoal/60" />
        <div className="mt-8 h-11 w-36 rounded border border-raw-gold/50 bg-raw-gold/15" />
      </section>
    </main>
  );
}

const Index = () => {

  const {
    user,
    isLoggedIn,
    sessionLoaded,
    polls,
    votedPolls,
    showSignup,
    setShowSignup,
    avatarLevel,
    setAvatarLevel,
    selectAvatarForOnboarding,
    ownedAvatarLevels,
    ownedAvatarIds,
    unlockAvatarLevel,
    markAvatarOwned,
    markAvatarOwnedById,
    avatarPricesByLevel,
    avatarCatalog,
    onboardingStep,
    setOnboardingStep,
    onboardingAnsweredPollIds,
    onboardingPublicUsername,
    onboardingPrivateUsername,
    setOnboardingPublicUsername,
    setOnboardingPrivateUsername,
    markOnboardingPollAnswered,
    onboardingSelectedCommunityIds,
    setOnboardingSelectedCommunityIds,
    onboardingCompleted,
    isOnboardingResolved,
    dailyAnsweredCount,
    dailyPollLimit,
    isDailyPollLimitReached,
    tokenBalance,
    addTokens,
    setTokenBalance,
    unlockExtraPolls,
    completeOnboarding,
    vote,
    signup,
    login,
    logout,
  } = useRawStore();
  const { hostname, isTheRawMe } = useHostMode();
  const sharedPollRef = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get(POLL_SHARE_PARAM)
    : null;

  const joinOnboardingCommunities = async () => {
    if (!user) return;

    for (const communityId of onboardingSelectedCommunityIds) {
      const result = await unlockCommunity(user.id, communityId);
      if (!result.ok && !result.already) {
        throw new Error("Could not save your selected community. Please try again.");
      }
      await joinCommunity(communityId, user.id, user.username);
    }
  };

  useEffect(() => {
    if (!isLoggedIn || !user || !isTheRawMe || typeof window === "undefined") {
      return;
    }

    const targetUrl = buildCanonicalAppUrl(window.location);
    if (window.location.hostname !== APP_CANONICAL_HOST) {
      window.location.replace(targetUrl);
    }
  }, [hostname, isLoggedIn, isTheRawMe, user]);

  // Don't flash the landing page (and its poll popup) while auth is still
  // resolving on refresh. Wait for the session to load first.
  if (!sessionLoaded && !sharedPollRef) {
    return <LandingShellFallback />;
  }

  if (isLoggedIn && user && isTheRawMe) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-raw-black px-6 text-center text-raw-silver/60">
        <div>
          <p className="font-display text-sm uppercase tracking-[0.25em] text-raw-gold/70">Redirecting</p>
          <p className="mt-3 text-sm">Taking you to www.myraw.app...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn && sharedPollRef) {
    return (
      <Suspense fallback={<LandingShellFallback />}>
        <SharedPollPageLazy
          polls={polls}
          shareCode={sharedPollRef}
          votedPolls={votedPolls}
          onVote={vote}
          onSignup={() => setShowSignup(true)}
        />
        <SignupModalLazy
          open={showSignup}
          onClose={() => setShowSignup(false)}
          onSignup={signup}
          onLogin={login}
          source="shared-poll"
        />
      </Suspense>
    );
  }

  if (isLoggedIn && user && !isOnboardingResolved) {
    return <DashboardShellFallback />;
  }

  // Show dashboard when logged in
  if (isLoggedIn && user) {
    if (!onboardingCompleted) {
      return (
        <Suspense fallback={<DashboardShellFallback />}>
        <OnboardingJourneyLazy
          user={user}
          polls={polls}
          avatarIndex={avatarLevel}
          onAvatarChange={selectAvatarForOnboarding}
          ownedAvatarLevels={ownedAvatarLevels}
          ownedAvatarIds={ownedAvatarIds}
          avatarCatalog={avatarCatalog}
          onboardingStep={onboardingStep}
          onboardingAnsweredPollIds={onboardingAnsweredPollIds}
          publicUsername={onboardingPublicUsername}
          privateUsername={onboardingPrivateUsername}
          onSaveUsernames={async (publicUsername, privateUsername) => {
            await saveOnboardingIdentities(publicUsername, privateUsername);
            setOnboardingPublicUsername(publicUsername);
            setOnboardingPrivateUsername(privateUsername);
          }}
          onSetOnboardingStep={setOnboardingStep}
          onMarkPollAnswered={markOnboardingPollAnswered}
          selectedCommunityIds={onboardingSelectedCommunityIds}
          onToggleCommunity={(communityId) => {
            setOnboardingSelectedCommunityIds((previous) => {
              if (previous.includes(communityId)) {
                return previous.filter((id) => id !== communityId);
              }

              if (previous.length >= 2) {
                return previous;
              }

              return [...previous, communityId];
            });
          }}
          onCompleteOnboarding={async () => {
            await joinOnboardingCommunities();
            completeOnboarding();
            void awardXP(user.id, XP_REWARDS.ONBOARDING_COMPLETE);
          }}
          onLogout={logout}
          onClaimLandingWheelAvatar={async () => {
            const result = await claimPendingLandingWheelAvatarForUser(user.id);
            if (result && (result.status === "granted" || result.status === "already_claimed")) {
              markAvatarOwnedById(result.avatarId);
            }
          }}
          markAvatarOwnedById={markAvatarOwnedById}
        />
        </Suspense>
      );
    }

    return (
      <Suspense fallback={<DashboardShellFallback />}>
      <DashboardLazy
        user={user}
        polls={polls}
        votedPolls={votedPolls}
        avatarLevel={avatarLevel}
        setAvatarLevel={setAvatarLevel}
        ownedAvatarLevels={ownedAvatarLevels}
        unlockAvatarLevel={unlockAvatarLevel}
        markAvatarOwned={markAvatarOwned}
        avatarPricesByLevel={avatarPricesByLevel}
        avatarCatalog={avatarCatalog}
        dailyAnsweredCount={dailyAnsweredCount}
        dailyPollLimit={dailyPollLimit}
        isDailyPollLimitReached={isDailyPollLimitReached}
        tokenBalance={tokenBalance}
        addTokens={addTokens}
        setTokenBalance={setTokenBalance}
        unlockExtraPolls={unlockExtraPolls}
        vote={vote}
        onLogout={logout}
      />
      </Suspense>
    );
  }

  return (
    <Suspense
      fallback={<LandingShellFallback />}
    >
      <LandingShellLazy
        user={user}
        isLoggedIn={isLoggedIn}
        showSignup={showSignup}
        setShowSignup={setShowSignup}
        signup={signup}
        login={login}
      />
    </Suspense>
  );
};

export default Index;
