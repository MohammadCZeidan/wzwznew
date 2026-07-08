import { beforeEach, describe, expect, it, vi } from "vitest";

const { supabaseMock } = vi.hoisted(() => ({
  supabaseMock: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

vi.mock("@/backend/supabase/client", () => ({
  supabase: supabaseMock,
}));

import { fetchCommunityPolls } from "@/backend/supabase/controllers/communityPollController";
import { fetchWaitlistSummary } from "@/backend/supabase/controllers/waitlistController";

describe("aggregate Supabase fetches", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads waitlist counts from the aggregate RPC", async () => {
    supabaseMock.rpc.mockResolvedValueOnce({
      data: [
        { community_id: "locked", waitlist_count: 12, joined: true },
        { community_id: "other", waitlist_count: "3", joined: false },
      ],
      error: null,
    });

    const summary = await fetchWaitlistSummary("user-1");

    expect(supabaseMock.rpc).toHaveBeenCalledWith("get_waitlist_summary", { p_user_id: "user-1" });
    expect(summary.counts).toEqual({ locked: 12, other: 3 });
    expect(Array.from(summary.joinedCommunityIds)).toEqual(["locked"]);
  });

  it("falls back to waitlist rows while the aggregate RPC is rolling out", async () => {
    supabaseMock.rpc.mockResolvedValueOnce({ data: null, error: { code: "PGRST202" } });

    const select = vi.fn().mockResolvedValue({
      data: [
        { community_id: "locked", user_id: "user-1" },
        { community_id: "locked", user_id: "user-2" },
      ],
      error: null,
    });
    supabaseMock.from.mockReturnValueOnce({ select });

    const summary = await fetchWaitlistSummary("user-1");

    expect(supabaseMock.from).toHaveBeenCalledWith("community_waitlist");
    expect(summary.counts).toEqual({ locked: 2 });
    expect(Array.from(summary.joinedCommunityIds)).toEqual(["locked"]);
  });

  it("loads community polls from the aggregate RPC without raw vote rows", async () => {
    supabaseMock.rpc.mockResolvedValueOnce({
      data: [
        {
          id: "poll-1",
          community_id: "community-1",
          question: "Best idea?",
          created_by_user_id: "user-a",
          created_by_username: "host",
          created_at: "2026-01-01T00:00:00.000Z",
          options: [
            { id: "option-a", text: "A", votes: 4 },
            { id: "option-b", text: "B", votes: "2" },
          ],
          total_votes: "6",
          user_vote_option_id: "option-b",
        },
      ],
      error: null,
    });

    const polls = await fetchCommunityPolls("community-1", "user-a");

    expect(supabaseMock.rpc).toHaveBeenCalledWith("get_community_poll_summaries", {
      p_community_id: "community-1",
      p_user_id: "user-a",
      p_limit: 25,
    });
    expect(polls).toEqual([
      {
        id: "poll-1",
        communityId: "community-1",
        question: "Best idea?",
        createdByUserId: "user-a",
        createdByUsername: "host",
        createdAt: "2026-01-01T00:00:00.000Z",
        options: [
          { id: "option-a", text: "A", votes: 4 },
          { id: "option-b", text: "B", votes: 2 },
        ],
        userVoteOptionId: "option-b",
        totalVotes: 6,
      },
    ]);
  });

  it("falls back to capped community poll rows while the aggregate RPC is rolling out", async () => {
    supabaseMock.rpc.mockResolvedValueOnce({ data: null, error: { code: "PGRST202" } });

    const limit = vi.fn().mockResolvedValue({
      data: [
        {
          id: "poll-1",
          community_id: "community-1",
          question: "Best idea?",
          created_by_user_id: "user-a",
          created_by_username: "host",
          created_at: "2026-01-01T00:00:00.000Z",
          community_poll_options: [
            { id: "option-b", community_poll_id: "poll-1", label: "B", position: 1 },
            { id: "option-a", community_poll_id: "poll-1", label: "A", position: 0 },
          ],
          community_poll_votes: [
            { id: "vote-1", community_poll_id: "poll-1", option_id: "option-a", user_id: "user-a", created_at: "2026-01-01T00:00:00.000Z" },
            { id: "vote-2", community_poll_id: "poll-1", option_id: "option-a", user_id: "user-b", created_at: "2026-01-01T00:00:00.000Z" },
          ],
        },
      ],
      error: null,
    });
    const order = vi.fn().mockReturnValue({ limit });
    const eq = vi.fn().mockReturnValue({ order });
    const select = vi.fn().mockReturnValue({ eq });
    supabaseMock.from.mockReturnValueOnce({ select });

    const polls = await fetchCommunityPolls("community-1", "user-a");

    expect(supabaseMock.from).toHaveBeenCalledWith("community_polls");
    expect(limit).toHaveBeenCalledWith(25);
    expect(polls[0]?.options).toEqual([
      { id: "option-a", text: "A", votes: 2 },
      { id: "option-b", text: "B", votes: 0 },
    ]);
    expect(polls[0]?.userVoteOptionId).toBe("option-a");
  });
});
