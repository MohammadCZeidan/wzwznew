import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import TokenImage from "@/assets/tokens.webp";
import {
  REQUEST_PACKAGES,
  REQUEST_REASONS,
  submitTokenRequest,
  type RequestReason,
} from "@/lib/tokenRequests";

interface RequestTokensModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Pre-select a dollar tier (e.g. when opened from a specific package). */
  defaultPriceUsd?: number;
  /** Pre-check reasons based on where it was opened from. */
  defaultReasons?: RequestReason[];
}

export function RequestTokensModal({
  isOpen,
  onClose,
  defaultPriceUsd,
  defaultReasons,
}: RequestTokensModalProps) {
  const [priceUsd, setPriceUsd] = useState<number>(defaultPriceUsd ?? REQUEST_PACKAGES[0]);
  const [reasons, setReasons] = useState<Set<RequestReason>>(new Set(defaultReasons ?? []));
  const [note, setNote] = useState("");
  const [reasonsOpen, setReasonsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const reasonsRef = useRef<HTMLDivElement>(null);

  // Reset to a clean state each time the modal is (re)opened.
  useEffect(() => {
    if (!isOpen) return;
    setPriceUsd(defaultPriceUsd && REQUEST_PACKAGES.includes(defaultPriceUsd as never) ? defaultPriceUsd : REQUEST_PACKAGES[0]);
    setReasons(new Set(defaultReasons ?? []));
    setNote("");
    setReasonsOpen(false);
    setSubmitted(false);
  }, [isOpen, defaultPriceUsd, defaultReasons]);

  useEffect(() => {
    if (!reasonsOpen) return;
    function onDocClick(event: MouseEvent) {
      if (reasonsRef.current && event.target instanceof Node && !reasonsRef.current.contains(event.target)) {
        setReasonsOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [reasonsOpen]);

  if (!isOpen) return null;

  const toggleReason = (reason: RequestReason) => {
    setReasons((prev) => {
      const next = new Set(prev);
      if (next.has(reason)) next.delete(reason);
      else next.add(reason);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reasons.size === 0) {
      toast({ title: "Pick a reason", description: "Select at least one reason for requesting tokens." });
      return;
    }
    setIsSubmitting(true);
    try {
      await submitTokenRequest({ priceUsd, reasons: [...reasons], note });
      setSubmitted(true);
    } catch {
      toast({ title: "Couldn't send request", description: "Please try again in a moment." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedLabel =
    reasons.size === 0 ? "Select reasons…" : reasons.size === 1 ? [...reasons][0] : `${reasons.size} reasons selected`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="relative max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-2xl border border-raw-gold/30 bg-raw-surface p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-raw-silver/50 hover:text-raw-silver"
        >
          <X className="h-5 w-5" />
        </button>

        {submitted ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-300">
              <Check className="h-6 w-6" />
            </div>
            <h2 className="mb-2 text-lg font-semibold text-raw-text">Request received</h2>
            <p className="mb-6 text-sm text-raw-silver/60">
              Thanks — we've logged your request for the ${priceUsd} package and will be in touch about getting you tokens.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg border border-raw-gold/50 bg-raw-gold/15 px-4 py-2 text-sm font-medium text-raw-gold hover:bg-raw-gold/25"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="mb-1 flex items-center gap-2">
              <img src={TokenImage} alt="" className="h-5 w-5 object-contain" />
              <h2 className="text-lg font-semibold text-raw-text">Request Tokens</h2>
            </div>
            <p className="mb-5 text-sm text-raw-silver/60">
              Paid top-ups aren't live yet. Tell us which package you'd want and why, and we'll sort you out.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-raw-silver/70">
                  Package
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {REQUEST_PACKAGES.map((price) => (
                    <button
                      key={price}
                      type="button"
                      onClick={() => setPriceUsd(price)}
                      aria-pressed={priceUsd === price}
                      className={`rounded-lg border py-2 text-sm font-semibold transition ${
                        priceUsd === price
                          ? "border-raw-gold/60 bg-raw-gold/15 text-raw-gold"
                          : "border-raw-border/40 bg-raw-black/30 text-raw-silver/70 hover:border-raw-gold/40"
                      }`}
                    >
                      ${price}
                    </button>
                  ))}
                </div>
              </div>

              <div ref={reasonsRef} className="relative">
                <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-raw-silver/70">
                  Reason(s)
                </label>
                <button
                  type="button"
                  onClick={() => setReasonsOpen((o) => !o)}
                  aria-haspopup="listbox"
                  aria-expanded={reasonsOpen}
                  className="flex w-full items-center justify-between rounded-lg border border-raw-border/40 bg-raw-black/40 px-3 py-2 text-left text-sm text-raw-text"
                >
                  <span className={reasons.size === 0 ? "text-raw-silver/40" : ""}>{selectedLabel}</span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-raw-silver/50 transition ${reasonsOpen ? "rotate-180" : ""}`} />
                </button>
                {reasonsOpen && (
                  <div
                    role="listbox"
                    className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-raw-border/50 bg-raw-black p-1 shadow-xl"
                  >
                    {REQUEST_REASONS.map((reason) => {
                      const checked = reasons.has(reason);
                      return (
                        <button
                          key={reason}
                          type="button"
                          role="option"
                          aria-selected={checked}
                          onClick={() => toggleReason(reason)}
                          className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-raw-text hover:bg-raw-surface/60"
                        >
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                              checked ? "border-raw-gold bg-raw-gold/20 text-raw-gold" : "border-raw-border/60"
                            }`}
                          >
                            {checked && <Check className="h-3 w-3" />}
                          </span>
                          {reason}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-raw-silver/70">
                  Anything else? <span className="normal-case text-raw-silver/40">(optional)</span>
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="Tell us more about what you're after…"
                  className="w-full resize-none rounded-lg border border-raw-border/40 bg-raw-black/40 px-3 py-2 text-sm text-raw-text placeholder-raw-silver/30 focus:border-raw-gold/50 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg border border-raw-gold/50 bg-raw-gold/15 px-4 py-2.5 text-sm font-semibold text-raw-gold transition hover:bg-raw-gold/25 disabled:opacity-50"
              >
                {isSubmitting ? "Sending…" : "Request Tokens"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
