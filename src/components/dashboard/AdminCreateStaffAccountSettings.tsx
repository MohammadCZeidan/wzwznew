import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createStaffAccount, type StaffRole } from "@/lib/api/staffAccounts";

export function AdminCreateStaffAccountSettings() {
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<StaffRole>("moderator");
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      toast({ title: "Enter a username", description: "Type a username for the new staff account." });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters." });
      return;
    }

    setCreating(true);
    try {
      await createStaffAccount(trimmedUsername, password, role);
      toast({ title: "Staff account created", description: `@${trimmedUsername} can now sign in as a ${role}.` });
      setUsername("");
      setPassword("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      const description =
        message === "username_taken" ? "That username is already taken."
        : message === "password_too_short" ? "Password must be at least 6 characters."
        : "Please try again.";
      toast({ title: "Could not create account", description });
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-raw-border/30 bg-raw-surface/30">
      <div className="border-b border-raw-border/20 px-4 py-3.5">
        <p className="text-sm font-medium text-raw-text">Create staff account</p>
        <p className="mt-1 text-xs text-raw-silver/40">Create a new moderator or admin login.</p>
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
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          className="min-h-11 flex-1 rounded-xl border border-raw-border/30 bg-raw-black/40 px-3 text-sm text-raw-text placeholder:text-raw-silver/25 focus:border-raw-gold/40 focus:outline-none"
        />
        <select
          value={role}
          onChange={(event) => setRole(event.target.value as StaffRole)}
          className="min-h-11 rounded-xl border border-raw-border/30 bg-raw-black/40 px-3 text-sm text-raw-text focus:border-raw-gold/40 focus:outline-none"
        >
          <option value="moderator">Moderator</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="button"
          onClick={() => void handleCreate()}
          disabled={creating}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-raw-gold px-4 text-sm font-semibold text-raw-ink transition-opacity disabled:opacity-40"
        >
          <UserPlus className="h-4 w-4" />
          Create
        </button>
      </div>
    </div>
  );
}
