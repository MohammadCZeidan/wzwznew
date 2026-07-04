import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RequestTokensModal } from "@/components/dashboard/RequestTokensModal";

const mocks = vi.hoisted(() => ({
  submitTokenRequest: vi.fn(async () => undefined),
  toast: vi.fn(),
}));

vi.mock("@/lib/tokenRequests", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/tokenRequests")>();
  return { ...actual, submitTokenRequest: mocks.submitTokenRequest };
});

vi.mock("@/hooks/use-toast", () => ({ toast: mocks.toast }));
vi.mock("@/assets/tokens.webp", () => ({ default: "token.webp" }));

describe("RequestTokensModal", () => {
  beforeEach(() => {
    mocks.submitTokenRequest.mockClear();
    mocks.toast.mockClear();
  });

  it("blocks submit until at least one reason is chosen", async () => {
    render(<RequestTokensModal isOpen onClose={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: "Request Tokens" }));

    expect(mocks.submitTokenRequest).not.toHaveBeenCalled();
    expect(mocks.toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Pick a reason" }),
    );
  });

  it("submits the selected package + reasons and shows a success state", async () => {
    render(<RequestTokensModal isOpen onClose={() => {}} />);

    // Pick the $20 tier.
    fireEvent.click(screen.getByRole("button", { name: "$20" }));

    // Open the reasons dropdown and select one.
    fireEvent.click(screen.getByRole("button", { name: /select reasons/i }));
    fireEvent.click(screen.getByRole("option", { name: "Buying an avatar" }));

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Request Tokens" }));
    });

    expect(mocks.submitTokenRequest).toHaveBeenCalledWith({
      priceUsd: 20,
      reasons: ["Buying an avatar"],
      note: "",
    });
    await waitFor(() => expect(screen.getByText("Request received")).toBeTruthy());
  });
});
