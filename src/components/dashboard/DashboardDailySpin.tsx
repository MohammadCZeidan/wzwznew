import { useCallback, useEffect, useMemo, useState } from "react";
import { Gift, Sparkles, Star, Zap, Clock } from "lucide-react";
import { WheelOfFortune, type WheelPrize } from "@/components/wheel/WheelOfFortune";
import { buildSpinPrizes } from "@/lib/spin-prizes";
import { useTheme } from "@/providers/useTheme";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  loadDailySpinPoolFromSupabase,
  readDailySpinAvatarPool,
  type DailySpinAvatarPoolItem,
} from "@/lib/dailySpinAvatarPool";
import { grantDailySpinAvatarOnceForUser } from "@/lib/avatarCatalog";
import { toast } from "@/hooks/use-toast";

const SPIN_COOLDOWN_MS = 24 * 60 * 60 * 1000;

interface DashboardDailySpinProps {
  userId: string;
  isAdmin?: boolean;
  onAwardTokens?: (amount: number) => void;
  onAvatarWon?: (level: number) => void;
}


const PRIZE_WEIGHTS: Partial<Record<string, number>> = {
  "tokens-50": 0.01,
  "try-1": 0.15,
  "try-2": 0.15,
  "try-3": 0.15,
  "try-4": 0.15,
  "tokens-5": 0.10,
  "tokens-5b": 0.10,
  "tokens-5c": 0.10,
  "tokens-10": 0.06,
  "sticker-pack": 0.06,
  "profile-glow": 0.04,
  theme: 0.03,
};

const prizeMessages: Record<string, { title: string; desc: string; icon: typeof Gift; poolLabel: string; rarity: string; poolColor: string }> = {
  "tokens-5": { title: "5 Tokens Won!", desc: "A little extra fuel for unlocks.", icon: Zap, poolLabel: "5 Tokens", rarity: "Common", poolColor: "text-raw-silver/50" },
  "tokens-5b": { title: "5 Tokens Won!", desc: "A little extra fuel for unlocks.", icon: Zap, poolLabel: "5 Tokens", rarity: "Common", poolColor: "text-raw-silver/50" },
  "tokens-10": { title: "10 Tokens Won!", desc: "Nice spin. Spend them on your next unlock.", icon: Star, poolLabel: "10 Tokens", rarity: "Common", poolColor: "text-raw-gold/60" },
  "sticker-pack": { title: "Sticker Pack Unlocked!", desc: "A new reaction pack is queued for your profile.", icon: Star, poolLabel: "Sticker Pack", rarity: "Common", poolColor: "text-raw-gold/60" },
  "profile-glow": { title: "Profile Glow Unlocked!", desc: "A new profile effect is ready for your identity.", icon: Sparkles, poolLabel: "Profile Glow", rarity: "Rare", poolColor: "text-raw-gold/80" },
  "tokens-50": { title: "50 Token Jackpot!", desc: "Big win. The wheel paid out.", icon: Gift, poolLabel: "50 Tokens", rarity: "Jackpot", poolColor: "text-raw-gold" },
  theme: { title: "Avatar Theme Unlocked!", desc: "A new look awaits you in the Marketplace.", icon: Gift, poolLabel: "Avatar Theme", rarity: "Rare", poolColor: "text-raw-gold/80" },
  "try-1": { title: "Not This Time", desc: "The wheel will turn again tomorrow.", icon: Clock, poolLabel: "Try Again", rarity: "Miss", poolColor: "text-raw-silver/45" },
  "try-2": { title: "Not This Time", desc: "The wheel will turn again tomorrow.", icon: Clock, poolLabel: "Try Again", rarity: "Miss", poolColor: "text-raw-silver/45" },
  "try-3": { title: "Not This Time", desc: "The wheel will turn again tomorrow.", icon: Clock, poolLabel: "Try Again", rarity: "Miss", poolColor: "text-raw-silver/45" },
  "try-4": { title: "Not This Time", desc: "The wheel will turn again tomorrow.", icon: Clock, poolLabel: "Try Again", rarity: "Miss", poolColor: "text-raw-silver/45" },
  "tokens-5c": { title: "5 Tokens Won!", desc: "A little extra fuel for unlocks.", icon: Zap, poolLabel: "5 Tokens", rarity: "Common", poolColor: "text-raw-silver/50" },
};

export function DashboardDailySpin({ userId, isAdmin = false, onAwardTokens, onAvatarWon }: DashboardDailySpinProps) {
  const { mode, accent, accentPresets } = useTheme();
  const storageKey = useMemo(() => `raw.daily-spin.${userId}`, [userId]);
  const accentRgb = useMemo(
    () => accentPresets.find((preset) => preset.id === accent)?.rgb ?? "241 196 45",
    [accent, accentPresets],
  );
  // buildSpinPrizes only distinguishes light vs dark; dusk renders as dark.
  const prizes = useMemo(
    () => buildSpinPrizes(mode === "light" ? "light" : "dark", accentRgb),
    [accentRgb, mode],
  );
  const adminRewardOptions = useMemo(
    () => [
      { id: "random", label: "Random (weighted)" },
      { id: "tokens-5", label: "5 Tokens" },
      { id: "tokens-10", label: "10 Tokens" },
      { id: "profile-glow", label: "Profile Glow" },
      { id: "tokens-50", label: "50 Token Jackpot" },
      { id: "theme", label: "Avatar Theme" },
      { id: "sticker-pack", label: "Sticker Pack" },
      { id: "try-1", label: "Try Again" },
    ],
    [],
  );
  const [, setSelectedRewardId] = useState<string | null>(null);
  const [lastSpinAt, setLastSpinAt] = useState<number | null>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return null;
      const parsed = JSON.parse(stored) as { spunAt?: unknown; date?: unknown };
      if (typeof parsed.spunAt === "number") return parsed.spunAt;
      if (typeof parsed.date === "string") {
        const legacyDate = new Date(parsed.date);
        return Number.isNaN(legacyDate.getTime()) ? null : legacyDate.getTime();
      }
      return null;
    } catch {
      return null;
    }
  });
  const [isCooldownActive, setIsCooldownActive] = useState(false);
  const [countdown, setCountdown] = useState("");
  const [prizeModal, setPrizeModal] = useState<WheelPrize | null>(null);
  const [adminSelectedRewardId, setAdminSelectedRewardId] = useState<string>("random");
  const [themeRewardAvatar, setThemeRewardAvatar] = useState<DailySpinAvatarPoolItem | null>(null);
  const [themeRewardPool, setThemeRewardPool] = useState<DailySpinAvatarPoolItem[]>(() => readDailySpinAvatarPool());
  const [isClaimingAvatar, setIsClaimingAvatar] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) {
        setLastSpinAt(null);
        return;
      }
      const parsed = JSON.parse(stored) as { spunAt?: unknown };
      setLastSpinAt(typeof parsed.spunAt === "number" ? parsed.spunAt : null);
    } catch {
      setLastSpinAt(null);
    }
    setSelectedRewardId(null);
  }, [storageKey]);

  useEffect(() => {
    loadDailySpinPoolFromSupabase()
      .then((items) => setThemeRewardPool(items))
      .catch(() => setThemeRewardPool(readDailySpinAvatarPool()));
  }, []);

  const updateCountdown = useCallback(() => {
    if (!lastSpinAt) {
      setCountdown("");
      setIsCooldownActive(false);
      return;
    }

    const diff = lastSpinAt + SPIN_COOLDOWN_MS - Date.now();
    if (diff <= 0) {
      setCountdown("");
      setIsCooldownActive(false);
      return;
    }

    setIsCooldownActive(true);
    const h = Math.floor(diff / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    const s = Math.floor((diff % 60_000) / 1_000);
    setCountdown(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
  }, [lastSpinAt]);

  useEffect(() => {
    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, [updateCountdown]);


  const handleSpinStart = useCallback(() => {
    if (isAdmin) return;
    const spunAt = Date.now();
    setLastSpinAt(spunAt);
    setIsCooldownActive(true);
    try {
      localStorage.setItem(storageKey, JSON.stringify({ spunAt }));
    } catch {
      // noop
    }
  }, [isAdmin, storageKey]);

  const handleSpinEnd = (prize: WheelPrize) => {
    setIsClaimingAvatar(false);
    if (prize.id === "theme") {
      const pool = themeRewardPool.length > 0 ? themeRewardPool : readDailySpinAvatarPool();
      if (pool.length > 0) {
        const randomIndex = Math.floor(Math.random() * pool.length);
        setThemeRewardAvatar(pool[randomIndex]);
      } else {
        setThemeRewardAvatar(null);
      }
    } else {
      setThemeRewardAvatar(null);
    }

    setSelectedRewardId(prize.id);
    setPrizeModal(prize);

    const tokenMatch = prize.id.match(/^tokens-(\d+)/);
    if (tokenMatch && onAwardTokens) {
      onAwardTokens(Number.parseInt(tokenMatch[1], 10));
    }
  };

  const handleClaimPrize = async () => {
    if (prizeModal?.id !== "theme") {
      setPrizeModal(null);
      return;
    }

    if (!themeRewardAvatar) {
      setPrizeModal(null);
      return;
    }

    if (isClaimingAvatar) {
      return;
    }

    setIsClaimingAvatar(true);
    const result = await grantDailySpinAvatarOnceForUser(userId, themeRewardAvatar.id);
    setIsClaimingAvatar(false);

    if (result.status === "unknown_avatar") {
      toast({
        title: "Avatar not available",
        description: "This wheel reward is not in the avatar catalog yet.",
      });
      return;
    }

    onAvatarWon?.(result.level);
    toast({
      title: result.status === "granted" ? "Avatar added" : "Avatar already claimed",
      description: result.status === "granted"
        ? `${themeRewardAvatar.name} is now in your inventory.`
        : "Each user can claim one free wheel avatar.",
    });
    setPrizeModal(null);
  };

  const modalMessage = prizeModal ? prizeMessages[prizeModal.id] : null;
  const jackpotCoins = useMemo(
    () =>
      Array.from({ length: 24 }, (_, index) => ({
        id: index,
        left: (index * 37) % 100,
        delay: (index % 8) * 0.2,
        duration: 3 + (index % 5) * 0.35,
        size: 9 + (index % 4) * 4,
      })),
    [],
  );
  const ModalIcon = modalMessage?.icon ?? Gift;
  const isWin = prizeModal ? !prizeModal.id.startsWith("try") : false;
  const isJackpot = prizeModal?.id === "tokens-50";
  const isSpinDisabled = !isAdmin && isCooldownActive;
  const forcedPrizeId = isAdmin && adminSelectedRewardId !== "random" ? adminSelectedRewardId : null;

  return (
    <div className="space-y-4 sm:space-y-8">

      {isAdmin && (
        <div className="mx-auto flex w-full max-w-md flex-col gap-2 rounded-2xl border border-raw-border/45 bg-raw-surface/35 p-3">
          <p className="text-center text-[10px] font-display uppercase tracking-[0.18em] text-raw-gold/70">Admin Test Controls</p>
          <label className="text-xs text-raw-silver/60" htmlFor="admin-spin-reward-select">Force next reward</label>
          <select
            id="admin-spin-reward-select"
            value={adminSelectedRewardId}
            onChange={(event) => setAdminSelectedRewardId(event.target.value)}
            className="w-full rounded-lg border border-raw-border/55 bg-raw-black/55 px-3 py-2 text-sm text-raw-text outline-none transition-colors focus:border-raw-gold/60"
          >
            {adminRewardOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div
        className={`rounded-2xl border p-3 sm:rounded-[2rem] sm:p-6 md:p-8 ${
          mode === "light"
            ? "border-raw-border/70 bg-[radial-gradient(circle_at_50%_10%,rgba(241,196,45,0.2),rgba(224,231,242,0.96)_58%)]"
            : "border-raw-border/35 bg-[radial-gradient(circle_at_50%_10%,rgba(241,196,45,0.08),rgba(0,0,0,0.8)_48%)]"
        }`}
      >
        <div className="flex justify-center pt-1 sm:pt-2">
          <WheelOfFortune
            prizes={prizes}
            onSpinEnd={handleSpinEnd}
            onSpinStart={handleSpinStart}
            disabled={isSpinDisabled}
            prizeWeights={PRIZE_WEIGHTS}
            forcedPrizeId={forcedPrizeId}
            radius={typeof window !== "undefined" && window.innerWidth < 640 ? 100 : 160}
            disabledLabel={isCooldownActive && !isAdmin ? countdown : undefined}
          />
        </div>
      </div>

      <Dialog open={!!prizeModal} onOpenChange={() => setPrizeModal(null)}>
        {isJackpot && <div className="jackpot-screen-flash pointer-events-none fixed inset-0 z-[45]" />}
        {isJackpot && (
          <div className="pointer-events-none fixed inset-0 z-[49] overflow-hidden">
            {jackpotCoins.map((coin) => (
              <span
                key={coin.id}
                className="jackpot-coin"
                style={{
                  left: `${coin.left}%`,
                  animationDelay: `${coin.delay}s`,
                  animationDuration: `${coin.duration}s`,
                  width: `${coin.size}px`,
                  height: `${coin.size}px`,
                }}
              />
            ))}
          </div>
        )}
        <DialogContent className="z-[60] border-raw-border/40 bg-raw-black/95 backdrop-blur-xl sm:max-w-sm">
          <DialogHeader className="items-center text-center">
            <div
              className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${
                isWin ? "bg-raw-gold/15 shadow-[0_0_30px_rgba(241,196,45,0.2)]" : "bg-raw-surface"
              }`}
            >
              {modalMessage && <ModalIcon className={`h-8 w-8 ${isWin ? "text-raw-gold" : "text-raw-silver/40"}`} />}
            </div>
            <DialogTitle className={`font-display text-xl tracking-wide ${isWin ? "text-raw-gold" : "text-raw-silver/60"}`}>
              {modalMessage?.title}
            </DialogTitle>
            <DialogDescription className="pt-2 text-sm text-raw-silver/40">
              {modalMessage?.desc}
            </DialogDescription>
            {prizeModal?.id === "theme" && themeRewardAvatar && (
              <div className="mt-3 rounded-xl border border-raw-gold/25 bg-raw-gold/10 px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.12em] text-raw-gold/85">Pulled from daily spin pool</p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <img
                    src={themeRewardAvatar.imageSrc}
                    alt={themeRewardAvatar.name}
                    className="h-10 w-10 rounded-lg border border-raw-gold/35 object-cover"
                  />
                  <p className="text-xs text-raw-text">{themeRewardAvatar.name}</p>
                </div>
              </div>
            )}
            {prizeModal?.id === "theme" && !themeRewardAvatar && (
              <p className="mt-2 text-xs text-raw-silver/45">
                No daily spin avatars in pool yet. Add some from Admin by setting target to Daily spin.
              </p>
            )}
          </DialogHeader>
          <button
            onClick={handleClaimPrize}
            disabled={isClaimingAvatar}
            className={`mt-4 w-full rounded-full py-3 text-sm font-display uppercase tracking-[0.15em] transition-all ${
              isWin
                ? "bg-raw-gold text-raw-black hover:bg-raw-gold/90"
                : "border border-raw-border/40 text-raw-silver/50 hover:bg-raw-surface/50"
            } ${isJackpot ? "jackpot-claim-button" : ""}`}
          >
            {isClaimingAvatar ? "Claiming..." : isWin ? "Claim" : "Close"}
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
