import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Check, X } from "lucide-react";
import TokenImage from "@/assets/tokens.webp";
import { PACKAGES } from "@/lib/wallet-packages";
import { submitTokenRequest } from "@/backend/supabase/controllers/tokenRequestController";

interface RequestTokensContextValue {
  /**
   * Open the request-tokens popup, optionally pre-selecting a package and
   * showing a reason banner (e.g. "You don't have enough tokens…").
   */
  openRequestTokens: (initialPackageId?: string, reason?: string) => void;
}

const RequestTokensContext = createContext<RequestTokensContextValue | null>(null);

/**
 * Returns `openRequestTokens`. Safe to call outside a provider (no-op), so
 * shared components can use it without crashing when rendered standalone.
 */
export function useRequestTokens(): RequestTokensContextValue {
  return useContext(RequestTokensContext) ?? { openRequestTokens: () => {} };
}

export function RequestTokensProvider({
  userId,
  username,
  children,
}: {
  userId: string;
  username: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [initialPackageId, setInitialPackageId] = useState<string | undefined>();
  const [reason, setReason] = useState<string | undefined>();

  const openRequestTokens = useCallback((packageId?: string, why?: string) => {
    setInitialPackageId(packageId);
    setReason(why);
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ openRequestTokens }), [openRequestTokens]);

  return (
    <RequestTokensContext.Provider value={value}>
      {children}
      {open && (
        <RequestTokensModal
          userId={userId}
          username={username}
          initialPackageId={initialPackageId}
          reason={reason}
          onClose={() => setOpen(false)}
        />
      )}
    </RequestTokensContext.Provider>
  );
}

function RequestTokensModal({
  userId,
  username,
  initialPackageId,
  reason,
  onClose,
}: {
  userId: string;
  username: string;
  initialPackageId?: string;
  reason?: string;
  onClose: () => void;
}) {
  const [packageId, setPackageId] = useState(initialPackageId ?? PACKAGES[0].id);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selected = PACKAGES.find((p) => p.id === packageId) ?? PACKAGES[0];

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await submitTokenRequest({
        userId,
        username,
        tokens: selected.tokens,
        priceUsd: selected.price,
        note: reason,
      });
      setSubmitted(true);
    } catch {
      setError("Couldn't send your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center p-0 sm:items-center sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-raw-gold/30 bg-raw-black sm:max-h-[90vh] sm:rounded-3xl">
        <div className="p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-display text-lg tracking-wide text-raw-text">
              {reason ? "Not enough tokens" : "Request tokens"}
            </h3>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-raw-border/40 text-raw-silver/60 transition hover:border-raw-gold/40 hover:text-raw-text"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {!submitted && reason && (
            <p className="mb-4 rounded-xl border border-raw-gold/25 bg-raw-gold/5 px-4 py-3 text-sm text-raw-silver/70">
              {reason} Pick a package below to request more.
            </p>
          )}

          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-raw-gold/40 bg-raw-gold/10 text-raw-gold">
                <Check className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-raw-text">Request sent</p>
              <p className="text-xs leading-relaxed text-raw-silver/50">
                Your request for {selected.tokens.toLocaleString()} tokens
                (${selected.price.toFixed(2)}) was sent to an admin. They&apos;ll add the
                tokens to your balance once approved.
              </p>
              <button
                onClick={onClose}
                className="mt-2 w-full rounded-xl bg-raw-gold/90 px-8 py-3 text-sm font-semibold text-raw-ink transition hover:bg-raw-gold"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <label
                htmlFor="request-tokens-package"
                className="mb-2 block text-xs uppercase tracking-[0.2em] text-raw-silver/50"
              >
                Choose a package
              </label>
              <select
                id="request-tokens-package"
                value={packageId}
                onChange={(e) => setPackageId(e.target.value)}
                className="w-full rounded-xl border border-raw-border/40 bg-raw-surface/30 px-4 py-3 text-sm text-raw-text outline-none transition focus:border-raw-gold/50"
              >
                {PACKAGES.map((pkg) => (
                  <option key={pkg.id} value={pkg.id} className="bg-raw-black text-raw-text">
                    {pkg.tokens.toLocaleString()} tokens — ${pkg.price.toFixed(2)} ({pkg.label})
                  </option>
                ))}
              </select>

              <div className="mt-5 rounded-xl border border-raw-gold/25 bg-raw-gold/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-raw-silver/50">Order Summary</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={TokenImage} alt="Token" className="h-5 w-5 object-contain" />
                    <span className="font-display text-lg text-raw-text">
                      {selected.tokens.toLocaleString()} tokens
                    </span>
                  </div>
                  <span className="font-display text-lg text-raw-gold">${selected.price.toFixed(2)}</span>
                </div>
              </div>

              {error && (
                <p className="mt-3 text-center text-xs text-red-400">{error}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-raw-gold/90 px-8 py-3.5 text-sm font-semibold text-raw-ink transition hover:bg-raw-gold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Sending…" : "Request tokens"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
