import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SignupModal } from "@/components/landing/SignupModal";

const mocks = vi.hoisted(() => ({
  submitInviteWaitlistRequest: vi.fn(async () => undefined),
  track: vi.fn(),
}));

vi.mock("@/backend/supabase/controllers/inviteWaitlistController", () => ({
  submitInviteWaitlistRequest: mocks.submitInviteWaitlistRequest,
}));

vi.mock("@/lib/analytics", () => ({
  track: mocks.track,
}));

describe("SignupModal invite waitlist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lets visitors request an invite without a code using any contact method", async () => {
    render(
      <SignupModal
        open
        onClose={vi.fn()}
        onSignup={vi.fn()}
        onLogin={vi.fn()}
        source="landing_test"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /no code\? request to join the waitlist/i }));
    fireEvent.change(screen.getByPlaceholderText("@instagram, WhatsApp, email..."), {
      target: { value: "@raw_friend" },
    });
    fireEvent.change(screen.getByPlaceholderText("Optional note"), {
      target: { value: "DM me when code ready" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Request Waitlist" }));

    await waitFor(() => {
      expect(mocks.submitInviteWaitlistRequest).toHaveBeenCalledWith({
        contact: "@raw_friend",
        note: "DM me when code ready",
        source: "landing_test",
      });
    });
    expect(await screen.findByText(/request sent/i)).toBeInTheDocument();
  });
});
