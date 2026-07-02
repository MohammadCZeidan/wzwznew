import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DashboardChallenges } from "@/components/dashboard/DashboardChallenges";

vi.mock("@/lib/userProgress", () => ({
  loadUserXPClaimKeys: vi.fn().mockResolvedValue([]),
  loadLocalLoginDays: vi.fn().mockReturnValue([]),
}));

vi.mock("@/hooks/use-toast", () => ({ toast: vi.fn() }));

let mode = "dark";
vi.mock("@/providers/useTheme", () => ({
  useTheme: () => ({ mode }),
}));

afterEach(() => {
  cleanup();
  mode = "dark";
});

// Regression test for the illegible Claim button reported in light mode:
// text-emerald-100 (near-white) on the pale emerald/off-white light-mode
// card was unreadable. See DashboardChallenges.tsx's Claim button.
describe("DashboardChallenges — Claim button contrast", () => {
  it("uses a dark emerald text color in light mode", () => {
    mode = "light";
    render(
      <DashboardChallenges
        userId="user-1"
        avatarLevel={1}
        pollsAnswered={0}
        dailyAnsweredCount={7}
        dailyPollLimit={7}
      />,
    );
    const claimButton = screen.getAllByRole("button", { name: /claim/i })[0];
    expect(claimButton.className).toContain("text-emerald-800");
    expect(claimButton.className).not.toContain("text-emerald-100");
  });

  it("keeps the light near-white text color in dark mode", () => {
    mode = "dark";
    render(
      <DashboardChallenges
        userId="user-1"
        avatarLevel={1}
        pollsAnswered={0}
        dailyAnsweredCount={7}
        dailyPollLimit={7}
      />,
    );
    const claimButton = screen.getAllByRole("button", { name: /claim/i })[0];
    expect(claimButton.className).toContain("text-emerald-100");
    expect(claimButton.className).not.toContain("text-emerald-800");
  });
});
