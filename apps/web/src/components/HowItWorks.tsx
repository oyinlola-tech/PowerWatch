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

        <div className="mt-12 grid items-center gap-8 lg:grid-cols-[1fr_auto] lg:gap-16">
          {/* Phones: a swipeable row of step chips above the phone. Desktop: a vertical list beside it */}
          <div className="min-w-0">
            <div
              role="tablist"
              aria-label="Steps"
              className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:block lg:space-y-2 lg:overflow-visible lg:px-0 lg:pb-0"
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
                    onClick={(event) => {
                      setActive(index);
                      event.currentTarget.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                        inline: "center",
                      });
                    }}
                    className={`flex flex-shrink-0 snap-center items-center gap-3 rounded-2xl border p-2 pr-4 text-left transition lg:w-full lg:items-start lg:gap-4 lg:p-4 ${
                      selected
                        ? "border-primary/30 bg-card shadow-[0_8px_30px_rgba(6,99,234,0.10)]"
                        : "border-line-light bg-card/60 hover:bg-card lg:border-transparent lg:bg-transparent"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-sm font-semibold transition lg:h-10 lg:w-10 lg:text-base ${
                        selected ? "bg-primary text-white" : "bg-tint text-accent"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span>
                      <span className="block whitespace-nowrap text-sm font-semibold text-ink lg:whitespace-normal lg:text-base">
                        {title}
                      </span>
                      <span
                        className={`hidden overflow-hidden text-sm leading-6 text-body transition-all duration-300 lg:block ${
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

            <p className="mx-auto mt-4 max-w-md text-center text-sm leading-6 text-body lg:hidden">
              {step.description}
            </p>
          </div>

          <div
            id={`${id}-panel`}
            role="tabpanel"
            aria-labelledby={`${id}-tab-${active}`}
            className="flex justify-center"
          >
            <div className="relative w-[240px] rounded-[48px] bg-[#1B1C1C] p-[10px] shadow-[0_30px_60px_rgba(0,49,120,0.25)] sm:w-[300px] lg:w-[320px]">
              <div className="relative aspect-[375/812] overflow-hidden rounded-[38px] bg-screen">
                <div className="absolute left-1/2 top-2 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-[#1B1C1C]" />
                <div className="h-9 bg-white" />
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
