import { Link } from "react-router-dom";
import { BrandName } from "@/components/ui/brand-name";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function Terms() {
  return (
    <div className="min-h-screen bg-raw-black">
      <header className="border-b border-raw-border/30 bg-raw-black/85 px-4 py-4 backdrop-blur-sm sm:px-6">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <Link to="/" className="font-display text-xl tracking-[0.2em] text-raw-text/85">
            <BrandName />
          </Link>
          <Link
            to="/"
            className="shrink-0 rounded-lg border border-raw-border/40 bg-raw-black/35 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-raw-silver/75 transition hover:border-raw-gold/35 hover:text-raw-gold sm:text-xs"
          >
            Back to Home
          </Link>
        </div>
      </header>

      <section className="px-4 py-10 sm:px-6 sm:py-16 md:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-[11px] uppercase tracking-[0.2em] text-raw-gold/75">Legal</p>
          <h1 className="mt-2 font-display text-2xl tracking-wide text-raw-text sm:text-3xl md:text-4xl">Terms of Service</h1>

          <div className="mt-6 space-y-5 text-raw-silver/75 sm:mt-8 sm:space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-raw-text">1. Acceptance of Terms</h2>
              <p className="mt-2 text-sm leading-relaxed">
                By accessing or using raW, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the app.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-raw-text">2. Nature of the Service</h2>
              <p className="mt-2 text-sm leading-relaxed">
                raW is a social platform built around anonymous, username-based participation. Public contributions remain anonymous to other users, though internal identifiers are retained to support safety and legal requirements. Posts may be screened before display, and comments, community messages, and private messages may be restricted or removed through automated detection or user reports.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-raw-text">3. User Responsibilities</h2>
              <p className="mt-2 text-sm leading-relaxed">
                You may not use raW for illegal conduct, child exploitation, harassment, violent or hateful content, non-consensual intimate material, malware distribution, security evasion, or identity misrepresentation. You are solely responsible for your posts and interactions on the platform.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-raw-text">4. Content Moderation</h2>
              <p className="mt-2 text-sm leading-relaxed">
                We may use automated filtering, respond to reports, limit visibility, remove posts, restrict accounts, and refer illegal matters to law enforcement when required or necessary to protect our users. There is no guaranteed response time for reports, though we aim to review them promptly.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-raw-text">5. Child Safety</h2>
              <p className="mt-2 text-sm leading-relaxed">
                We have zero tolerance for sexual content involving minors. Violating material is removed immediately, and involved accounts are closed and may be reported to the relevant authorities as legally required.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-raw-text">6. Appeals</h2>
              <p className="mt-2 text-sm leading-relaxed">
                If you believe a moderation decision on your content or account was made in error, contact us at info@myraw.app to request a review.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-raw-text">7. Account Actions</h2>
              <p className="mt-2 text-sm leading-relaxed">
                We may suspend or terminate accounts for guideline breaches, suspected misuse, or safety concerns. raW is not liable for any loss resulting from account actions taken under these terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-raw-text">8. Intellectual Property</h2>
              <p className="mt-2 text-sm leading-relaxed">
                You retain ownership of the content you create. By posting on raW, you grant us a worldwide, non-exclusive, royalty-free license to use, store, display, and process that content in order to operate and improve the platform.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-raw-text">9. Rewards, Points, and Incentives</h2>
              <p className="mt-2 text-sm leading-relaxed">
                Tokens, rewards, and other incentive programs on raW are optional and offered with no guarantees. We may modify or discontinue these programs at any time. Eligibility depends on internal metrics and fraud safeguards, and any manipulation of these systems may result in forfeiture of rewards or account termination.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-raw-text">10. Disclaimers</h2>
              <p className="mt-2 text-sm leading-relaxed">
                raW is provided "as is" without warranties of any kind. We do not guarantee uninterrupted operation of the app and disclaim responsibility for user-generated content.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-raw-text">11. Limitation of Liability</h2>
              <p className="mt-2 text-sm leading-relaxed">
                To the fullest extent permitted by law, raW excludes liability for indirect, incidental, or consequential damages arising from your use of the app.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-raw-text">12. Changes to the Terms</h2>
              <p className="mt-2 text-sm leading-relaxed">
                We may update these terms at any time. Continued use of raW after changes are posted means you accept the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-raw-text">13. Governing Law</h2>
              <p className="mt-2 text-sm leading-relaxed">
                These terms are governed by and construed in accordance with the laws of the jurisdiction in which raW operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
              </p>
            </section>

            <section className="pt-2">
              <h2 className="font-display text-xl tracking-wide text-raw-text">Community Guidelines</h2>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-raw-text">14. Core Principle</h2>
              <p className="mt-2 text-sm leading-relaxed">
                raW supports free expression while maintaining standards of safety, lawfulness, and courtesy across the platform.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-raw-text">15. Allowed Content</h2>
              <p className="mt-2 text-sm leading-relaxed">
                Lawful sharing of perspectives, opinions, stories, and even debatable or controversial material is welcome and protected.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-raw-text">16. Prohibited Content</h2>
              <p className="mt-2 text-sm leading-relaxed">
                The following is forbidden on raW: child sexual imagery, self-harm promotion, discriminatory harassment, violent material, unlawful activity, promotion of terrorism, revenge imagery, disclosure of others' personal data, deceptive schemes, coordinated attacks, and technical exploitation of the platform.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-raw-text">17. Reporting and Enforcement</h2>
              <p className="mt-2 text-sm leading-relaxed">
                Community members can report violations. After review, we may remove content, issue advisories, suspend accounts, or permanently remove access. Posts may be screened before publication; messages are reviewed after the fact through automated detection or user reports.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-raw-text">18. Transparency</h2>
              <p className="mt-2 text-sm leading-relaxed">
                Enforcement decisions are final, and interpretive authority over these guidelines is retained by raW.
              </p>
            </section>

            <section className="pt-4 border-t border-raw-border/30">
              <p className="text-xs text-raw-silver/50">Last updated: April 2026</p>
            </section>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
