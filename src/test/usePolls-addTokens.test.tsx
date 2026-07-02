import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePolls } from "@/store/usePolls";

vi.mock("@/lib/api/polls", () => ({
  fetchPolls: vi.fn().mockResolvedValue([]),
  submitPollVote: vi.fn(),
}));

// The server has no token-mint endpoint (api/users/[userId]/tokens.ts
// explicitly rejects a client "add" action) — fetchTokenBalance always
// returns the same unchanged balance here, simulating that reality.
vi.mock("@/lib/api/tokens", () => ({
  fetchTokenBalance: vi.fn().mockResolvedValue(100),
  spendTokens: vi.fn(),
}));

function renderUsePolls(userId = "user-1") {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return renderHook(() => usePolls(true, userId), {
    wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
  });
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.clearAllMocks();
});

// Regression test: addTokens() must actually increase the balance for
// logged-in users. A prior change replaced the local increment with a
// server resync, which silently dropped every reward (challenge tokens,
// theme-unlock refunds) since the server can't credit tokens client-side.
describe("usePolls — addTokens", () => {
  it("increases tokenBalance for a logged-in user instead of re-syncing an unchanged server value", async () => {
    const { result } = renderUsePolls();

    await waitFor(() => expect(result.current.tokenBalance).toBe(100));

    act(() => {
      result.current.addTokens(20);
    });

    await waitFor(() => expect(result.current.tokenBalance).toBe(120));
  });
});
