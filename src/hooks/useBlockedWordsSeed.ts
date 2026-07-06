import { useEffect } from "react";
import { seedBlockedWordsFromServer } from "@/lib/inputSecurity";
import { useRawStore } from "@/store/useRawStore";

/**
 * Fetches the current blocked-word list from the server once on mount and
 * seeds the in-memory store so that client-side moderation checks reflect
 * admin-managed terms.  Non-fatal: static env denylist applies if the
 * request fails.
 *
 * Mount this hook anywhere in the authenticated session tree (e.g. App.tsx).
 * Server-side enforcement in api/chat/send.ts is the authoritative gate.
 */
export function useBlockedWordsSeed(): void {
  const { isLoggedIn } = useRawStore();
  useEffect(() => {
    if (!isLoggedIn) return;

    let cancelled = false;
    const load = () => {
      if (cancelled) return;
      seedBlockedWordsFromServer().catch(() => {
        /* non-fatal */
      });
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(load, { timeout: 3000 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(idleId);
      };
    }

    const timeoutId = globalThis.setTimeout(load, 1000);
    return () => {
      cancelled = true;
      globalThis.clearTimeout(timeoutId);
    };
  }, [isLoggedIn]);
}
