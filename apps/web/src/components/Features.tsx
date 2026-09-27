import Icon from "./Icon";
import type { GlyphName } from "./glyphs";
import SectionHeading from "./SectionHeading";

interface Feature {
  icon: GlyphName;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: "boltLarge",
    title: "Real-time Updates",
    description: "Get instant alerts when power goes out or is restored in your grid.",
  },
  {
    icon: "bullhornLarge",
    title: "Report Outages",
    description: "Easily log an outage with one tap to help neighbors stay informed.",
  },
  {
    icon: "mapLocationLarge",
    title: "Community Map",
    description: "Visualize outages across the city with our interactive live map.",
  },
  {
    icon: "navReports",
    title: "Weekly History",
    description:
      "See total outage time, uptime percentage and a daily timeline of when power was on and off.",
  },
  {
    icon: "bellRing",
    title: "Alerts You Control",
    description:
      "Choose outage alerts, restoration alerts and community reports to match how you want to be notified.",
  },
  {
    icon: "homePin",
    title: "Your Neighborhood",
    description:
      "Set the primary area you want to track and manage your saved neighborhoods any time.",
  },
];

const Features = () => (
  <section id="features" className="scroll-mt-[72px] bg-white px-6 py-20">
    <div className="mx-auto max-w-6xl">
      <SectionHeading
        label="Features"
        title="Everything you need when the power goes out"
        description="PowerWatch turns reports from people on your street into a clear, live picture of electricity in your area."
      />

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon, title, description }) => (
          <div
            key={title}
            className="flex items-start gap-4 rounded-lg border border-line-light p-4"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary">
              <Icon name={icon} color="#FCFEFF" />
            </div>

            <div>
              <h3 className="text-base leading-6 text-black">{title}</h3>
              <p className="text-sm font-medium leading-5 text-body">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
