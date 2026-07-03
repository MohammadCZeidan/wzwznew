import { useState } from "react";
import { Ticket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { grantInviteCodes } from "@/lib/api/inviteCodesAdmin";

export function AdminInviteCodesSettings() {
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [count, setCount] = useState("3");
  const [granting, setGranting] = useState(false);

  async function handleGrant() {
    const target = username.trim();
    const amount = Number.parseInt(count, 10);
    if (!target) {
      toast({ title: "Enter a username", description: "Type the username to grant invite codes to." });
      return;
    }
    if (!Number.isInteger(amount) || amount < 1 || amount > 20) {
      toast({ title: "Invalid amount", description: "Enter a number between 1 and 20." });
      return;
    }

    setGranting(true);
    try {
      const codes = await grantInviteCodes(target, amount);
      toast({ title: "Invite codes granted", description: `Gave @${target} ${codes.length} more invite code(s).` });
      setUsername("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      const description = message === "user_not_found" ? "No user with that username." : "Please try again.";
      toast({ title: "Could not grant invite codes", description });
    } finally {
      setGranting(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-raw-border/30 bg-raw-surface/30">
      <div className="border-b border-raw-border/20 px-4 py-3.5">
        <p className="text-sm font-medium text-raw-text">Grant invite codes</p>
        <p className="mt-1 text-xs text-raw-silver/40">Give a user extra founding invite codes beyond their base allotment.</p>
      </div>

      <div className="flex flex-col gap-2 px-4 pb-4 pt-3 sm:flex-row">
        <input
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Username"
          className="min-h-11 flex-1 rounded-xl border border-raw-border/30 bg-raw-black/40 px-3 text-sm text-raw-text placeholder:text-raw-silver/25 focus:border-raw-gold/40 focus:outline-none"
        />
        <input
          type="number"
          min={1}
          max={20}
          value={count}
          onChange={(event) => setCount(event.target.value)}
          className="min-h-11 w-full rounded-xl border border-raw-border/30 bg-raw-black/40 px-3 text-sm text-raw-text focus:border-raw-gold/40 focus:outline-none sm:w-20"
        />
        <button
          type="button"
          onClick={() => void handleGrant()}
          disabled={granting}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-raw-gold px-4 text-sm font-semibold text-raw-ink transition-opacity disabled:opacity-40"
        >
          <Ticket className="h-4 w-4" />
          Grant
        </button>
      </div>
    </div>
  );
}
