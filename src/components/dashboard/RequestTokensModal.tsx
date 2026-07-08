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

interface RequestTokensContextValue {
  /** Open the request-tokens popup, optionally pre-selecting a package. */
  openRequestTokens: (initialPackageId?: string) => void;
}

const RequestTokensContext = createContext<RequestTokensContextValue | null>(null);

/**
 * Returns `openRequestTokens`. Safe to call outside a provider (no-op), so
 * shared components can use it without crashing when rendered standalone.
 */
export function useRequestTokens(): RequestTokensContextValue {
  return useContext(RequestTokensContext) ?? { openRequestTokens: () => {} };
}

export function RequestTokensProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [initialPackageId, setInitialPackageId] = useState<string | undefined>();

  const openRequestTokens = useCallback((packageId?: string) => {
    setInitialPackageId(packageId);
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ openRequestTokens }), [openRequestTokens]);

  return (
    <RequestTokensContext.Provider value={value}>
      {children}
      {open && (
        <RequestTokensModal
          initialPackageId={initialPackageId}
          onClose={() => setOpen(false)}
        />
      )}
    </RequestTokensContext.Provider>
  );
}

function RequestTokensModal({
  initialPackageId,
  onClose,
}: {
  initialPackageId?: string;
  onClose: () => void;
}) {
  const [packageId, setPackageId] = useState(initialPackageId ?? PACKAGES[0].id);
  const [submitted, setSubmitted] = useState(false);
  const selected = PACKAGES.find((p) => p.id === packageId) ?? PACKAGES[0];

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
            <h3 className="font-display text-lg tracking-wide text-raw-text">Request tokens</h3>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-raw-border/40 text-raw-silver/60 transition hover:border-raw-gold/40 hover:text-raw-text"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-raw-gold/40 bg-raw-gold/10 text-raw-gold">
                <Check className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-raw-text">Request received</p>
              <p className="text-xs leading-relaxed text-raw-silver/50">
                We&apos;ll reach out about your {selected.tokens.toLocaleString()} token
                (${selected.price.toFixed(2)}) request. Payments aren&apos;t live yet.
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

              <button
                onClick={() => setSubmitted(true)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-raw-gold/90 px-8 py-3.5 text-sm font-semibold text-raw-ink transition hover:bg-raw-gold"
              >
                Request tokens
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
