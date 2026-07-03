import { useState } from "react";
import { Ban, Clock, ShieldCheck, TriangleAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { moderateUser, type ModerationAction } from "@/lib/api/userModeration";

const TIMEOUT_PRESETS: Array<{ label: string; minutes: number }> = [
  { label: "10 min", minutes: 10 },
  { label: "1 hour", minutes: 60 },
  { label: "24 hours", minutes: 60 * 24 },
];

export function AdminUserModerationSettings() {
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  async function runAction(action: ModerationAction, minutes?: number, label?: string) {
    const target = username.trim();
    if (!target) {
      toast({ title: "Enter a username", description: "Type the username to moderate first." });
      return;
    }

    const key = `${action}-${minutes ?? ""}`;
    setPendingAction(key);
    try {
      await moderateUser(target, action, minutes);
      toast({ title: label ?? "Action applied", description: `@${target} has been ${label?.toLowerCase() ?? "updated"}.` });
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      const description =
        message === "user_not_found" ? "No user with that username."
        : message === "cannot_moderate_staff" ? "Admins and moderators can't be moderated."
        : "Please try again.";
      toast({ title: "Action failed", description });
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-raw-border/30 bg-raw-surface/30">
      <div className="border-b border-raw-border/20 px-4 py-3.5">
        <p className="text-sm font-medium text-raw-text">Moderate a user</p>
        <p className="mt-1 text-xs text-raw-silver/40">Warn, time out, ban, or unban by username.</p>
      </div>

      <div className="space-y-4 px-4 pb-4 pt-3">
        <input
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Username"
          className="min-h-11 w-full rounded-xl border border-raw-border/30 bg-raw-black/40 px-3 text-sm text-raw-text placeholder:text-raw-silver/25 focus:border-raw-gold/40 focus:outline-none"
        />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void runAction("warn", undefined, "Warned")}
            disabled={pendingAction !== null}
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-300 transition-colors hover:bg-amber-500/15 disabled:opacity-40"
          >
            <TriangleAlert className="h-3.5 w-3.5" />
            Warn
          </button>

          {TIMEOUT_PRESETS.map((preset) => (
            <button
              key={preset.minutes}
              type="button"
              onClick={() => void runAction("timeout", preset.minutes, `Timed out for ${preset.label}`)}
              disabled={pendingAction !== null}
              className="inline-flex items-center gap-1.5 rounded-xl border border-raw-gold/25 bg-raw-gold/10 px-3 py-2 text-xs text-raw-gold transition-colors hover:bg-raw-gold/15 disabled:opacity-40"
            >
              <Clock className="h-3.5 w-3.5" />
              Timeout {preset.label}
            </button>
          ))}

          <button
            type="button"
            onClick={() => void runAction("ban", undefined, "Banned")}
            disabled={pendingAction !== null}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-300 transition-colors hover:bg-red-500/15 disabled:opacity-40"
          >
            <Ban className="h-3.5 w-3.5" />
            Ban
          </button>

          <button
            type="button"
            onClick={() => void runAction("unban", undefined, "Unbanned")}
            disabled={pendingAction !== null}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300 transition-colors hover:bg-emerald-500/15 disabled:opacity-40"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Unban
          </button>
        </div>
      </div>
    </div>
  );
}
