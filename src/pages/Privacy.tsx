import { Link } from "react-router-dom";
import { BrandName } from "@/components/ui/brand-name";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function Privacy() {
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
          <h1 className="mt-2 font-display text-2xl tracking-wide text-raw-text sm:text-3xl md:text-4xl">Privacy Policy</h1>

          <div className="mt-6 space-y-5 text-raw-silver/75 sm:mt-8 sm:space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-raw-text">1. Overview</h2>
              <p className="mt-2 text-sm leading-relaxed">
                This Privacy Policy explains how raW collects, uses, discloses, and safeguards information when you use our app. raW enables anonymous public interaction while collecting certain data to operate the app, ensure safety, prevent abuse, and comply with legal obligations. By using raW, you consent to this data collection.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-raw-text">2. Information We Collect</h2>
              <p className="mt-2 text-sm leading-relaxed">
                We collect information you provide directly and information gathered automatically as you use the app.
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>• Posts, comments, messages, reports, and support communications you submit</li>
                <li>• Public content is anonymous to other users but associated with internal identifiers for safety and moderation</li>
                <li>• Device identifiers and device information (model, OS version, app version, language, timezone)</li>
                <li>• Network data and security signals used to detect abuse, bots, tampering, and suspicious activity</li>
                <li>• Approximate location derived from IP or device signals; precise location requires your explicit permission</li>
                <li>• Details related to any content you report or that is reported about you</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-raw-text">3. How We Use Your Information</h2>
              <p className="mt-2 text-sm leading-relaxed">
                We use this information to operate and improve raW, maintain security, detect and prevent fraud and abuse, enforce our community guidelines, comply with legal obligations, and power features like matching, recommendations, and trend analysis across engagement data.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-raw-text">4. Monitoring and Moderation</h2>
              <p className="mt-2 text-sm leading-relaxed">
                Automated systems and user reports are used to detect violations in content and communications. Public posts may be automatically screened before broader visibility. Messages are retained to provide the service and may be processed for safety and abuse prevention. We maintain zero tolerance for child sexual abuse material and sexual content involving minors, with disclosure to authorities where legally required.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-raw-text">5. Legal Compliance and Law Enforcement</h2>
              <p className="mt-2 text-sm leading-relaxed">
                We may disclose information if required by law, legal process, or governmental request, or where necessary to protect user safety, prevent illegal activity, or protect our rights. We do not proactively share user data with law enforcement except as required by law or valid legal requests.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-raw-text">6. Data Retention</h2>
              <p className="mt-2 text-sm leading-relaxed">
                We retain information only as long as necessary to provide the service, fulfill legal obligations, resolve disputes, and enforce our agreements. Some data may persist for safety, security, and compliance purposes even after account deletion.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-raw-text">7. Data Security</h2>
              <p className="mt-2 text-sm leading-relaxed">
                We use reasonable technical and organizational measures to protect your information against unauthorized access and misuse, though no system is completely secure.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-raw-text">8. Sharing of Information</h2>
              <p className="mt-2 text-sm leading-relaxed">
                We may share data with service providers, moderation vendors, legal authorities when mandated, and business partners in aggregated form. We do not sell personal data to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-raw-text">9. Children's Privacy</h2>
              <p className="mt-2 text-sm leading-relaxed">
                raW is not intended for users under the age of 13 (or the minimum age required by local law). We do not knowingly collect data from children, and we will delete such information if we become aware of it.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-raw-text">10. Your Rights</h2>
              <p className="mt-2 text-sm leading-relaxed">
                Depending on your location, you may access, correct, or delete your personal data through the app or by contacting us. You can request deletion of your account and associated data at any time.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-raw-text">11. Contact Us</h2>
              <p className="mt-2 text-sm leading-relaxed">
                If you have questions about this Privacy Policy or our privacy practices, please contact us at info@myraw.app or via WhatsApp.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-raw-text">12. Changes to This Policy</h2>
              <p className="mt-2 text-sm leading-relaxed">
                We may update this Privacy Policy from time to time. Continued use of raW after updates are posted constitutes acceptance of the updated policy.
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
