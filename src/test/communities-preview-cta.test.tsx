import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Communities } from "@/components/landing/Communities";

vi.mock("@/lib/analytics/useTrackSectionView", () => ({
  useTrackSectionView: () => ({ current: null }),
}));

describe("Communities preview CTA", () => {
  it("opens the first anonymous community preview from Try a preview", async () => {
    render(<Communities onSignupClick={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Try a preview" }));

    expect(await screen.findByText("24/7 anonymous room")).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { name: "Late Night Talks" })).toHaveLength(2);
    expect(screen.getByText(/Only username and avatar show/i)).toBeInTheDocument();
  });
});
