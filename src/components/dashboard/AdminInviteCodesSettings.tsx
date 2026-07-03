import { useState } from "react";
import { Sparkles, Ticket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { grantInviteCodes } from "@/lib/api/inviteCodesAdmin";

const MAX_GRANT = 100;

interface AdminInviteCodesSettingsProps {
  currentUsername: string;
}

export function AdminInviteCodesSettings({ currentUsername }: AdminInviteCodesSettingsProps) {
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [count, setCount] = useState("3");
  const [selfCount, setSelfCount] = useState("10");
  const [granting, setGranting] = useState(false);
  const [grantingSelf, setGrantingSelf] = useState(false);

  async function runGrant(target: string, amount: number, onDone: () => void) {
    if (!Number.isInteger(amount) || amount < 1 || amount > MAX_GRANT) {
      toast({ title: "Invalid amount", description: `Enter a number between 1 and ${MAX_GRANT}.` });
      return;
    }
    try {
      const codes = await grantInviteCodes(target, amount);
      toast({ title: "Invite codes granted", description: `@${target} now has ${codes.length} more invite code(s) to send out.` });
      onDone();
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      const description = message === "user_not_found" ? "No user with that username." : "Please try again.";
      toast({ title: "Could not grant invite codes", description });
    }
  }

  async function handleGrantSelf() {
    setGrantingSelf(true);
    await runGrant(currentUsername, Number.parseInt(selfCount, 10), () => {});
    setGrantingSelf(false);
  }

  async function handleGrant() {
    const target = username.trim();
    if (!target) {
      toast({ title: "Enter a username", description: "Type the username to grant invite codes to." });
      return;
    }
    setGranting(true);
    await runGrant(target, Number.parseInt(count, 10), () => setUsername(""));
    setGranting(false);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-raw-border/30 bg-raw-surface/30">
      <div className="border-b border-raw-border/20 px-4 py-3.5">
        <p className="text-sm font-medium text-raw-text">Grant invite codes</p>
        <p className="mt-1 text-xs text-raw-silver/40">Give a user extra founding invite codes beyond their base allotment.</p>
      </div>

      <div className="flex flex-col gap-2 border-b border-raw-border/20 px-4 py-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <p className="text-sm font-medium text-raw-text">Generate for yourself</p>
          <p className="mt-0.5 text-xs text-raw-silver/40">Create a batch of invite codes on @{currentUsername} to send out.</p>
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            min={1}
            max={MAX_GRANT}
            value={selfCount}
            onChange={(event) => setSelfCount(event.target.value)}
            className="min-h-11 w-20 rounded-xl border border-raw-border/30 bg-raw-black/40 px-3 text-sm text-raw-text focus:border-raw-gold/40 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => void handleGrantSelf()}
            disabled={grantingSelf}
            className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-raw-gold px-4 text-sm font-semibold text-raw-ink transition-opacity disabled:opacity-40"
          >
            <Sparkles className="h-4 w-4" />
            Generate
          </button>
        </div>
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
          max={MAX_GRANT}
          value={count}
          onChange={(event) => setCount(event.target.value)}
          className="min-h-11 w-full rounded-xl border border-raw-border/30 bg-raw-black/40 px-3 text-sm text-raw-text focus:border-raw-gold/40 focus:outline-none sm:w-20"
        />
        <button
          type="button"
          onClick={() => void handleGrant()}
          disabled={granting}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-raw-border/30 bg-raw-black/40 px-4 text-sm font-semibold text-raw-text transition-opacity hover:border-raw-gold/40 disabled:opacity-40"
        >
          <Ticket className="h-4 w-4" />
          Grant to user
        </button>
      </div>
    </div>
  );
}
