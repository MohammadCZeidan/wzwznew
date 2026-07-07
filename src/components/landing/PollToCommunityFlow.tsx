import { useEffect, useRef } from "react";
import { ArrowDownRight, BrainCircuit, LockKeyhole, MessageCircle, UsersRound } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { highlightRawWordmark } from "@/components/ui/highlightRawWordmark";

const flowSteps = [
  {
    title: "Answer quick polls",
    body: "Tap honest answers to low-friction questions. raW reads patterns across choices, not real-world identity.",
    detail: "Poll signal",
    icon: MessageCircle,
  },
  {
    title: "Find people with similar signal",
    body: "Shared answer patterns become taste clusters, so communities start from people who think or feel alike.",
    detail: "Match layer",
    icon: UsersRound,
  },
  {
    title: "Unlock AI insight",
    body: "As more answers build context, raW can explain your patterns and suggest communities that fit your vibe.",
    detail: "Insight engine",
    icon: BrainCircuit,
  },
  {
    title: "Stay private by default",
    body: "No real name, email, phone, or personal data is shown or shared. Username is the only public source.",
    detail: "Privacy rule",
    icon: LockKeyhole,
  },
];

export function PollToCommunityFlow() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    if (!section) return undefined;

    const context = gsap.context(() => {
      cardRefs.current.forEach((card, index) => {
        if (!card) return;

        gsap.fromTo(
          card,
          { autoAlpha: 0.35, y: 42, scale: 0.96 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 82%",
              end: "top 45%",
              scrub: 0.7,
            },
            delay: index * 0.03,
          }
        );
      });
    }, section);

    return () => context.revert();
  }, []);

  return (
    <section ref={sectionRef} className="landing-section relative px-4 py-14 sm:px-6 sm:py-20 md:py-28">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="font-display text-xs uppercase tracking-[0.28em] text-raw-gold/80 sm:text-sm">
            {highlightRawWordmark("How raW connects the dots")}
          </p>
          <h2 className="landing-heading mt-4 max-w-3xl">
            {highlightRawWordmark("Polls become communities, then insights.")}
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-raw-silver/60 sm:text-base">
            {highlightRawWordmark(
              "Every answer is a small anonymous signal. Enough signals help raW match you with people who answer, think, and react like you."
            )}
          </p>
          <div className="mt-8 overflow-hidden rounded-3xl border border-raw-gold/30 bg-raw-black/45 p-5 shadow-[0_24px_90px_rgba(241,196,45,0.08)] backdrop-blur-md">
            <div className="flex items-center justify-between gap-4 text-xs uppercase tracking-[0.24em] text-raw-gold/70">
              <span>Poll data</span>
              <ArrowDownRight className="h-4 w-4" aria-hidden="true" />
              <span>Community fit</span>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-raw-surface/70">
              <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-raw-gold via-amber-200 to-raw-gold/50" />
            </div>
            <p className="mt-4 text-xs leading-relaxed text-raw-silver/50">
              Draft flow: answer, match, join, understand — without exposing real identity.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-5">
          {flowSteps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={step.title}
                ref={(node) => {
                  cardRefs.current[index] = node;
                }}
                className="group relative overflow-hidden rounded-[1.75rem] border border-raw-border/35 bg-raw-surface/[0.16] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.3)] backdrop-blur-md transition duration-500 hover:-translate-y-1 hover:border-raw-gold/45 sm:p-6"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(241,196,45,0.12),transparent_36%)] opacity-0 transition duration-700 group-hover:opacity-100" />
                <div className="relative flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-raw-gold/35 bg-raw-gold/10 text-raw-gold">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-display text-[0.68rem] uppercase tracking-[0.26em] text-raw-gold/65">{step.detail}</p>
                    <h3 className="mt-2 font-display text-xl text-raw-text sm:text-2xl">{highlightRawWordmark(step.title)}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-raw-silver/58 sm:text-base">
                      {highlightRawWordmark(step.body)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
