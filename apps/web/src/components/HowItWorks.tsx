import SectionHeading from "./SectionHeading";

const steps = [
  {
    title: "Create your account",
    description: "Sign up with your email, Google or Apple, then verify with a 6-digit code.",
  },
  {
    title: "Set your monitoring area",
    description: "Choose the primary neighborhood you want to track for outages.",
  },
  {
    title: "Stay updated",
    description:
      "Get notified immediately when there is a change in your neighborhood's power status.",
  },
  {
    title: "Report what you see",
    description:
      "Something changed? Report power on or off. Community members in your area verify reports to ensure live accuracy.",
  },
];

const HowItWorks = () => (
  <section id="how-it-works" className="scroll-mt-[72px] bg-screen px-6 py-20">
    <div className="mx-auto max-w-6xl">
      <SectionHeading
        label="How it works"
        title="Set up in minutes"
        description="From download to knowing exactly what is happening with the power on your street."
      />

      <div className="mt-12 grid items-center gap-10 lg:grid-cols-[1fr_auto_1fr]">
        <ol className="space-y-4">
          {steps.slice(0, 2).map(({ title, description }, index) => (
            <Step key={title} number={index + 1} title={title} description={description} />
          ))}
        </ol>

        <div className="flex justify-center gap-4">
          <img
            src="/mockups/phone-b.webp"
            alt="Choosing the neighborhood to monitor in PowerWatch"
            width={697}
            height={1400}
            loading="lazy"
            className="h-auto w-[170px] sm:w-[210px]"
          />
          <img
            src="/mockups/phone-a.webp"
            alt="PowerWatch home screen showing that power is live"
            width={702}
            height={1400}
            loading="lazy"
            className="h-auto w-[170px] sm:w-[210px]"
          />
        </div>

        <ol className="space-y-4" start={3}>
          {steps.slice(2).map(({ title, description }, index) => (
            <Step key={title} number={index + 3} title={title} description={description} />
          ))}
        </ol>
      </div>
    </div>
  </section>
);

interface StepProps {
  number: number;
  title: string;
  description: string;
}

const Step = ({ number, title, description }: StepProps) => (
  <li className="flex items-start gap-4 rounded-xl border border-line bg-white p-4">
    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-base font-semibold text-white">
      {number}
    </span>
    <div>
      <h3 className="text-sm font-medium text-black">{title}</h3>
      <p className="mt-1 text-xs leading-4 text-[#6B7280]">{description}</p>
    </div>
  </li>
);

export default HowItWorks;
