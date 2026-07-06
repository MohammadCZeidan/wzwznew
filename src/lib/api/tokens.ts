export async function fetchTokenBalance(userId: string): Promise<number> {
  const response = await fetch(`/api/users/${encodeURIComponent(userId)}/tokens`, {
    credentials: "same-origin",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch token balance");
  }

  const payload = (await response.json()) as { balance?: unknown };
  const balance = Number(payload.balance);
  if (!Number.isFinite(balance)) throw new Error("Invalid token balance response");
  return balance;
}

export async function spendTokens(userId: string, amount: number): Promise<number> {
  const response = await fetch(`/api/users/${encodeURIComponent(userId)}/tokens`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ amount }),
  });

  const payload = (await response.json().catch(() => null)) as { balance?: unknown; error?: string } | null;
  if (!response.ok) {
    throw new Error(payload?.error ?? "Failed to spend tokens");
  }

  const balance = Number(payload?.balance);
  if (!Number.isFinite(balance)) throw new Error("Invalid token spend response");
  return balance;
}

export interface ClaimChallengeRewardResult {
  awarded: boolean;
  xp: number;
  level: number;
  leveledUp: boolean;
  tokenBalance: number;
}

export async function claimChallengeReward(
  userId: string,
  source: string,
  claimKey: string,
  xpAmount: number,
  tokenAmount: number
): Promise<ClaimChallengeRewardResult> {
  const response = await fetch(`/api/users/${encodeURIComponent(userId)}/tokens`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({
      action: "claim_challenge_reward",
      source,
      claimKey,
      xpAmount,
      tokenAmount,
    }),
  });

  const payload = (await response.json().catch(() => null)) as {
    awarded?: unknown;
    xp?: unknown;
    level?: unknown;
    leveledUp?: unknown;
    tokenBalance?: unknown;
    error?: string;
  } | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? "Failed to claim challenge reward");
  }

  const xp = Number(payload?.xp);
  const level = Number(payload?.level);
  const tokenBalance = Number(payload?.tokenBalance);
  if (!Number.isFinite(xp) || !Number.isFinite(level) || !Number.isFinite(tokenBalance)) {
    throw new Error("Invalid challenge reward response");
  }

  return {
    awarded: payload?.awarded === true,
    xp,
    level,
    leveledUp: payload?.leveledUp === true,
    tokenBalance,
  };
}
