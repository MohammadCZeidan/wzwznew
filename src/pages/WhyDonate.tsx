import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, ArrowDown, CheckCircle2, HeartHandshake, ServerCog, ShieldCheck } from "lucide-react";
import { BrandName } from "@/components/ui/brand-name";
import { submitDonationInterest } from "@/backend/supabase/controllers/donationInterestController";
import { moderateUserText, getUserTextModerationMessage } from "@/lib/inputSecurity";
import { useToast } from "@/hooks/use-toast";

/* Word-by-word scroll scrub: each word fades 0.12 -> 1 as the paragraph
   crosses the viewport. Falls back to fully visible for reduced motion. */
function ScrubWord({
  children,
  progress,
  range,
  trailingSpace,
}: {
  children: string;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  range: [number, number];
  trailingSpace: boolean;
}) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  return (
    <motion.span style={{ opacity }} className="inline-block">
      {children}
      {trailingSpace ? "\u00A0" : null}
    </motion.span>
  );
}

function ManifestoScrub({ text }: { text: string }) {
  const targetRef = useRef<HTMLParagraphElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: targetRef, offset: ["start 0.85", "end 0.45"] });
  const words = text.trim().split(/\s+/);

  if (prefersReducedMotion) {
    return <p className="text-xl leading-relaxed text-raw-text sm:text-2xl sm:leading-relaxed md:text-3xl md:leading-relaxed">{text}</p>;
  }

  return (
    <p ref={targetRef} className="text-xl leading-relaxed text-raw-text sm:text-2xl sm:leading-relaxed md:text-3xl md:leading-relaxed">
      {words.map((word, index) => (
        <ScrubWord
          key={`${word}-${index}`}
          progress={scrollYProgress}
          range={[index / words.length, Math.min(1, (index + 1.5) / words.length)]}
          trailingSpace={index < words.length - 1}
        >
          {word}
        </ScrubWord>
      ))}
    </p>
  );
}

const cardReveal = {
  initial: { opacity: 0, scale: 0.94, y: 24 },
  whileInView: { opacity: 1, scale: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

export default function WhyDonate() {
  const navigate = useNavigate();
  const supportRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameMod = moderateUserText(name);
    if (!nameMod.allowed) {
      toast({ title: "Name blocked", description: getUserTextModerationMessage(nameMod) });
      return;
    }
    setSubmitting(true);
    try {
      await submitDonationInterest(nameMod.text, email, phone);
      setSubmitted(true);
    } catch {
      toast({ title: "Something went wrong", description: "Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-raw-black">
      {/* Floating glass nav */}
      <nav className="sticky top-0 z-40 border-b border-raw-border/40 bg-raw-black/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <button
            type="button"
            onClick={() => {
              window.sessionStorage.setItem("raw.skip-poll-showcase-once", "1");
              navigate(-1);
            }}
            className="flex items-center gap-2 text-raw-silver/60 transition-colors hover:text-raw-text"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back</span>
          </button>
          <span className="font-display text-sm tracking-[0.2em]"><BrandName /></span>
          <button
            type="button"
            onClick={() => supportRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="rounded-full border border-raw-gold/40 bg-raw-gold/10 px-4 py-1.5 text-xs font-semibold text-raw-gold transition hover:bg-raw-gold/20"
          >
            Support
          </button>
        </div>
      </nav>

      {/* Attention — cinematic center hero */}
      <section className="relative flex min-h-[72vh] items-center justify-center overflow-hidden px-4 py-32 sm:px-6 md:py-40">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_35%,rgb(var(--raw-accent)/0.14),transparent_70%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(rgba(255,255,255,0.14)_0.6px,transparent_0.6px)] [background-size:9px_9px]" />

        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-5xl text-center"
        >
          <h1 className="font-display text-[clamp(2.4rem,5.2vw,4.6rem)] leading-[1.08] tracking-tight text-raw-text">
            Honesty is rare online.
            <br />
            <span className="text-raw-gold">Help us keep a place for it.</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-raw-silver/65 sm:text-lg">
            <BrandName /> is where people say what they actually think — anonymously, without ads
            watching and without an algorithm selling them. Independence like that isn't free. It's funded by people who believe in it.
          </p>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => supportRef.current?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-raw-gold px-9 py-3.5 text-base font-semibold text-raw-black transition hover:bg-raw-gold/90"
            >
              Support the movement
              <ArrowDown className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-raw-border/70 px-9 py-3.5 text-base font-medium text-raw-text transition hover:border-raw-gold/50 hover:text-raw-gold"
            >
              Explore <span className="ml-1.5"><BrandName /></span>
            </button>
          </div>
        </motion.div>
      </section>

      {/* Interest — gapless bento: lg 3x3 (A4+B1+C1+D1+E2=9), sm 4x2 (A2,B1,C1,D2,E2=8) */}
      <section className="px-4 py-32 sm:px-6 md:py-48">
        <div className="mx-auto grid w-full max-w-6xl auto-rows-[minmax(160px,auto)] grid-flow-dense grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <motion.article
            {...cardReveal}
            className="group relative overflow-hidden rounded-3xl border border-raw-gold/25 bg-gradient-to-br from-raw-gold/[0.09] via-raw-black/60 to-raw-black p-8 sm:col-span-2 sm:p-10 lg:row-span-2"
          >
            <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(rgba(255,255,255,0.12)_0.6px,transparent_0.6px)] [background-size:8px_8px]" />
            <h2 className="relative font-display text-2xl leading-snug text-raw-text sm:text-3xl md:text-4xl md:leading-snug">
              Built for the people behind
              <span
                aria-hidden
                className="mx-2 inline-block h-9 w-20 rounded-full border border-raw-gold/40 bg-raw-black bg-[url('/avatars/1.webp')] bg-cover bg-center align-middle grayscale transition duration-700 ease-out group-hover:grayscale-0 sm:h-11 sm:w-24"
              />
              the masks.
            </h2>
            <p className="relative mt-6 max-w-xl text-sm leading-relaxed text-raw-silver/65 sm:text-base">
              Social platforms reward performance, not honesty. People are more connected than ever —
              and still feel unseen. <BrandName /> starts with a question instead of a feed: answer
              anonymously, see how everyone really thinks, and find the room where your truth makes sense.
            </p>
            <p className="relative mt-6 text-sm font-medium text-raw-gold/80">
              That only works if no advertiser owns the room.
            </p>
          </motion.article>

          <motion.article {...cardReveal} className="relative overflow-hidden rounded-3xl border border-raw-border/40 bg-raw-black/50 p-7">
            <p className="font-display text-5xl text-raw-gold">100%</p>
            <p className="mt-3 text-sm leading-relaxed text-raw-silver/65">
              anonymous. No email, no phone, no real name — a username and your honesty.
            </p>
          </motion.article>

          <motion.article {...cardReveal} className="relative overflow-hidden rounded-3xl border border-raw-border/40 bg-raw-black/50 p-7">
            <p className="font-display text-5xl text-raw-gold">0</p>
            <p className="mt-3 text-sm leading-relaxed text-raw-silver/65">
              ads. Zero data sold. Nothing about you is the product — which is exactly why we ask for support instead.
            </p>
          </motion.article>

          <motion.article {...cardReveal} className="relative overflow-hidden rounded-3xl border border-raw-border/40 bg-raw-black/50 p-7 sm:col-span-2 lg:col-span-1">
            <div className="flex flex-col gap-4">
              {[
                { Icon: ServerCog, label: "Keeping the servers on" },
                { Icon: ShieldCheck, label: "Safety and human moderation" },
                { Icon: HeartHandshake, label: "Staying independent and ad-free" },
              ].map(({ Icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-raw-gold/30 bg-raw-gold/10">
                    <Icon className="h-4 w-4 text-raw-gold" />
                  </span>
                  <p className="text-sm text-raw-silver/70">{label}</p>
                </div>
              ))}
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-raw-gold/60">Where support goes</p>
            </div>
          </motion.article>

          <motion.article
            {...cardReveal}
            className="relative flex items-center overflow-hidden rounded-3xl border border-raw-gold/20 bg-gradient-to-r from-raw-gold/[0.07] to-transparent p-8 sm:col-span-2"
          >
            <blockquote className="font-display text-lg leading-relaxed text-raw-text sm:text-xl">
              "The internet is full of people. But most still don't know where they belong."
            </blockquote>
          </motion.article>
        </div>
      </section>

      {/* Desire — scroll-scrubbed manifesto */}
      <section className="px-4 py-32 sm:px-6 md:py-48">
        <div className="mx-auto w-full max-w-4xl">
          <ManifestoScrub text="Loneliness is a global health issue, and the polished internet makes it worse. We believe the cure starts small: one anonymous answer, one honest thread, one moment of realizing you are not the only one. Your support keeps that space open for the people who need it most — with no ads, no trackers, and no one to answer to except the community itself." />
        </div>
      </section>

      {/* Action — support / funding contact */}
      <section ref={supportRef} className="px-4 pb-32 pt-8 sm:px-6 md:pb-48">
        <motion.div
          {...cardReveal}
          className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-raw-gold/35 bg-gradient-to-b from-raw-gold/[0.1] to-transparent p-8 sm:p-12"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-raw-gold/70 to-transparent" />
          <h2 className="font-display text-3xl leading-tight text-raw-text sm:text-4xl">
            Fund the honest internet.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-raw-silver/65 sm:text-base">
            Whether it's a one-time donation, monthly backing, or a bigger conversation about funding
            the movement — leave your details and a human (not a bot) will reach out.
          </p>

          {submitted ? (
            <div className="mt-10 flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 className="h-10 w-10 text-raw-gold" />
              <p className="text-lg font-semibold text-raw-text">Message received — thank you!</p>
              <p className="text-sm text-raw-silver/60">We'll be in touch shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-10 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="donate-name" className="mb-1.5 block text-sm font-medium text-raw-silver/80">
                  Name
                </label>
                <input
                  id="donate-name"
                  type="text"
                  required
                  maxLength={80}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-xl border border-raw-border/40 bg-raw-black/60 px-4 py-3 text-sm text-raw-text placeholder-raw-silver/35 outline-none transition focus:border-raw-gold/60 focus:ring-1 focus:ring-raw-gold/30"
                />
              </div>

              <div>
                <label htmlFor="donate-email" className="mb-1.5 block text-sm font-medium text-raw-silver/80">
                  Email
                </label>
                <input
                  id="donate-email"
                  type="email"
                  required
                  maxLength={254}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-raw-border/40 bg-raw-black/60 px-4 py-3 text-sm text-raw-text placeholder-raw-silver/35 outline-none transition focus:border-raw-gold/60 focus:ring-1 focus:ring-raw-gold/30"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="donate-phone" className="mb-1.5 block text-sm font-medium text-raw-silver/80">
                  Phone <span className="text-raw-silver/40">(optional)</span>
                </label>
                <input
                  id="donate-phone"
                  type="tel"
                  maxLength={30}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full rounded-xl border border-raw-border/40 bg-raw-black/60 px-4 py-3 text-sm text-raw-text placeholder-raw-silver/35 outline-none transition focus:border-raw-gold/60 focus:ring-1 focus:ring-raw-gold/30"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-raw-gold px-10 py-3.5 text-base font-semibold text-raw-black transition hover:bg-raw-gold/90 disabled:opacity-60 sm:col-span-2 sm:justify-self-start"
              >
                {submitting ? "Sending…" : "Back the movement"}
              </button>
            </form>
          )}
        </motion.div>
      </section>
    </main>
  );
}
