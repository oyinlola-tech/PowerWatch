import { useId, useState } from "react";
import SectionHeading from "./SectionHeading";

// One step per Figma screen, in the order a new user sees them
const steps = [
  {
    title: "Create your account",
    description: "Sign up with your name and email, or continue with Google or Apple.",
    src: "/screens/signup.webp",
    alt: "PowerWatch Create Account screen",
    width: 750,
    height: 1857,
  },
  {
    title: "Verify your email",
    description: "Enter the 6-digit code we send to your email address to confirm your account.",
    src: "/screens/verify.webp",
    alt: "PowerWatch Verify your email screen with a 6-digit code",
    width: 750,
    height: 1650,
  },
  {
    title: "Set your monitoring area",
    description: "Choose the primary neighborhood you want to track for outages.",
    src: "/screens/location.webp",
    alt: "Choosing the neighborhood to monitor on a map",
    width: 860,
    height: 1988,
  },
  {
    title: "Choose your alerts",
    description:
      "Turn on outage alerts, restoration alerts and community reports to stay updated.",
    src: "/screens/notifications.webp",
    alt: "PowerWatch notification preferences for outage and restoration alerts",
    width: 750,
    height: 1644,
  },
  {
    title: "Check the status",
    description:
      "See if power is live, how many neighbors confirmed it, and how recent the update is.",
    src: "/screens/home.webp",
    alt: "PowerWatch home screen showing that power is live",
    width: 750,
    height: 2654,
  },
  {
    title: "Report what you see",
    description:
      "Something changed? Report power on or off. Neighbors in your area verify reports to keep them accurate.",
    src: "/screens/report.webp",
    alt: "PowerWatch asking to confirm a power outage report",
    width: 844,
    height: 1792,
  },
];

// Step list on the left drives the phone on the right, using the real Figma screens
const HowItWorks = () => {
  const [active, setActive] = useState(0);
  const id = useId();
  const step = steps[active];

  const select = (index: number) => {
    const next = (index + steps.length) % steps.length;
    setActive(next);
    document.getElementById(`${id}-tab-${next}`)?.focus();
  };

  return (
    <section id="how-it-works" className="scroll-mt-[72px] bg-screen px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          label="How it works"
          title="Set up in minutes"
          description="From download to knowing exactly what is happening with the power on your street."
        />

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-[1fr_auto] lg:gap-16">
          <div
            role="tablist"
            aria-label="Steps"
            aria-orientation="vertical"
            className="space-y-2"
            onKeyDown={(event) => {
              if (event.key === "ArrowDown" || event.key === "ArrowRight") {
                event.preventDefault();
                select(active + 1);
              } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
                event.preventDefault();
                select(active - 1);
              }
            }}
          >
            {steps.map(({ title, description }, index) => {
              const selected = index === active;
              return (
                <button
                  key={title}
                  id={`${id}-tab-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`${id}-panel`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(index)}
                  className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition ${
                    selected
                      ? "border-primary/30 bg-card shadow-[0_8px_30px_rgba(6,99,234,0.10)]"
                      : "border-transparent hover:bg-card/70"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-base font-semibold transition ${
                      selected ? "bg-primary text-white" : "bg-tint text-accent"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span>
                    <span className="block text-base font-semibold text-ink">{title}</span>
                    <span
                      className={`block overflow-hidden text-sm leading-6 text-body transition-all duration-300 ${
                        selected ? "mt-1 max-h-24 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      {description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div
            id={`${id}-panel`}
            role="tabpanel"
            aria-labelledby={`${id}-tab-${active}`}
            className="order-first flex justify-center lg:order-none"
          >
            <div className="relative w-[240px] rounded-[48px] bg-[#1B1C1C] p-[10px] shadow-[0_30px_60px_rgba(0,49,120,0.25)] sm:w-[300px] lg:w-[320px]">
              <div className="relative aspect-[375/812] overflow-hidden rounded-[38px] bg-screen">
                <div className="absolute left-1/2 top-2 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-[#1B1C1C]" />
                <div className="h-9 bg-card" />
                <img
                  key={step.src}
                  src={step.src}
                  alt={step.alt}
                  width={step.width}
                  height={step.height}
                  loading="lazy"
                  className="block h-auto w-full animate-fade-in"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
