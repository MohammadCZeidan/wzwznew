import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import LandingShell from "@/components/landing/LandingShell";
import { ThemeProvider } from "@/providers/ThemeProvider";

vi.mock("@/components/landing/Navbar", () => ({
  Navbar: () => <nav data-testid="navbar" />,
}));
vi.mock("@/components/ui/LaunchCountdown", () => ({
  LaunchCountdown: () => <div data-testid="launch-countdown" />,
}));
vi.mock("@/components/ui/perforated-background", () => ({
  default: () => <div data-testid="perforated-background" />,
}));
vi.mock("@/components/ui/matrix-background", () => ({
  default: () => <div data-testid="matrix-background" />,
}));
vi.mock("@/components/landing/GlobeHero", () => ({
  GlobeHero: () => <section data-testid="globe-hero">Globe hero</section>,
}));
vi.mock("@/components/landing/ProblemSection", () => ({
  ProblemSection: () => <section data-testid="problem-section" />,
}));
vi.mock("@/components/landing/LandingPollsSection", () => ({
  LandingPollsSection: () => <section data-testid="landing-polls-section" />,
}));
vi.mock("@/components/landing/Communities", () => ({
  Communities: () => <section data-testid="communities-section" />,
}));
vi.mock("@/components/landing/AvatarShowcaseSection", () => ({
  AvatarShowcaseSection: () => <section data-testid="avatar-showcase-section" />,
}));
vi.mock("@/components/landing/PersonalityInsightsSection", () => ({
  PersonalityInsightsSection: () => <section data-testid="personality-insights-section" />,
}));
vi.mock("@/components/landing/FAQSection", () => ({
  FAQSection: () => <section data-testid="faq-section" />,
}));
vi.mock("@/components/landing/LandingFooter", () => ({
  LandingFooter: () => <footer data-testid="landing-footer" />,
}));
vi.mock("@/components/landing/SignupModal", () => ({
  SignupModal: () => null,
}));
vi.mock("@/components/landing/PollShowcase", () => ({
  PollShowcase: ({ onResolved }: { onResolved?: () => void }) => (
    <button type="button" onClick={onResolved} data-testid="close-poll-showcase">
      Close poll showcase
    </button>
  ),
}));

const baseProps = {
  user: null,
  isLoggedIn: false,
  showSignup: false,
  setShowSignup: vi.fn(),
  signup: vi.fn(),
  login: vi.fn(),
};

describe("LandingShell", () => {
  it("keeps landing content gated until the poll showcase resolves, then renders without an error boundary crash", async () => {
    window.sessionStorage.clear();
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(
      <ThemeProvider>
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <LandingShell {...baseProps} />
        </MemoryRouter>
      </ThemeProvider>
    );

    expect(screen.queryByTestId("globe-hero")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("close-poll-showcase"));

    expect(await screen.findByText("Your place.")).toBeInTheDocument();
    expect(screen.getByTestId("matrix-background")).toBeInTheDocument();

    await waitFor(() => {
      expect(consoleError).not.toHaveBeenCalled();
    });

    consoleError.mockRestore();
  });
});
