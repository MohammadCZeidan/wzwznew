import { useEffect, useRef, useState } from "react";
import tokenImg from "@/assets/tokens.webp";
import { useRawStore } from "@/store/useRawStore";
import { useTheme } from "@/providers/useTheme";
import { RequestTokensModal } from "@/components/dashboard/RequestTokensModal";

export function TokenBalanceButton() {
  const { tokenBalance: balance } = useRawStore();
  const { mode } = useTheme();
  const [open, setOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isLight = mode === "light";

  function handleClick() {
    setOpen((o) => !o);
  }

  useEffect(() => {
    if (!open) return;
    function onDocClick(event: MouseEvent) {
      if (!wrapperRef.current) return;
      if (event.target instanceof Node && wrapperRef.current.contains(event.target)) return;
      setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={handleClick}
        aria-label="Token balance"
        aria-expanded={open}
        aria-haspopup="menu"
        className="relative flex items-center gap-1.5 rounded-xl border px-2 py-1 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-raw-gold/50"
        style={{
          borderColor: open
            ? isLight ? "rgba(148,163,184,0.55)" : "rgba(250,204,21,0.45)"
            : "transparent",
          background: open
            ? isLight ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.85)"
            : "transparent",
          boxShadow: open
            ? isLight ? "0 6px 16px rgba(15,23,42,0.1)" : "0 0 16px rgba(250,204,21,0.15)"
            : "none",
          backdropFilter: open ? "blur(8px)" : "none",
        }}
      >
        <img
          src={tokenImg}
          alt="Token"
          width={26}
          height={26}
          draggable={false}
          className="shrink-0 select-none object-contain"
          style={{ filter: "drop-shadow(0 0 5px rgba(250,204,21,0.5))" }}
        />
        {open && (
          <span className="font-display text-xs tracking-wide text-raw-gold">
            {balance}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className={`dropdown-in absolute right-0 top-[calc(100%+8px)] z-50 w-64 rounded-2xl border p-3 shadow-xl ${
            isLight ? "border-slate-200 bg-white text-slate-900" : "border-raw-gold/25 bg-raw-black/95 text-raw-text"
          }`}
          style={{
            backdropFilter: "blur(10px)",
            boxShadow: isLight ? "0 12px 28px rgba(15,23,42,0.12)" : "0 0 18px rgba(250,204,21,0.10)",
          }}
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="font-display text-[11px] uppercase tracking-[0.18em] text-raw-gold/75">Tokens</span>
            <span className={`text-[11px] ${isLight ? "text-slate-500" : "text-raw-silver/45"}`}>
              Balance {balance}
            </span>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              setRequestOpen(true);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-raw-gold/45 bg-raw-gold/[0.08] px-3 py-2.5 text-sm font-semibold text-raw-gold transition hover:bg-raw-gold/[0.16] focus:outline-none focus-visible:ring-2 focus-visible:ring-raw-gold/50"
          >
            <img src={tokenImg} alt="" width={18} height={18} className="shrink-0 object-contain" />
            Request Tokens
          </button>
          <p className={`mt-3 text-[10px] leading-relaxed ${isLight ? "text-slate-500" : "text-raw-silver/40"}`}>
            Paid top-ups aren't live yet — request a package and earn free tokens daily from the spin and challenges.
          </p>
        </div>
      )}
      <RequestTokensModal isOpen={requestOpen} onClose={() => setRequestOpen(false)} />
    </div>
  );
}
