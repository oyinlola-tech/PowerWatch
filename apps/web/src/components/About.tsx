import Icon from "./Icon";
import type { GlyphName } from "./glyphs";
import SectionHeading from "./SectionHeading";

const more: { icon: GlyphName; title: string; description: string }[] = [
  {
    icon: "navReports",
    title: "Weekly History",
    description: "Total outage time, uptime percentage and a daily timeline of power on and off.",
  },
  {
    icon: "bellRing",
    title: "Alerts You Control",
    description: "Choose outage alerts, restoration alerts and community reports.",
  },
  {
    icon: "homePin",
    title: "Your Neighborhood",
    description: "Set the primary area you track and manage saved neighborhoods any time.",
  },
];

const card = "relative overflow-hidden rounded-3xl border border-line-light bg-card";

interface CardTextProps {
  icon: GlyphName;
  title: string;
  description: string;
}

const CardText = ({ icon, title, description }: CardTextProps) => (
  <div className="flex items-start gap-4 p-6">
    <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary">
      <Icon name={icon} color="#FCFEFF" />
    </span>
    <div>
      <h3 className="text-base font-semibold leading-6 text-ink">{title}</h3>
      <p className="mt-1 text-sm font-medium leading-5 text-body">{description}</p>
    </div>
  </div>
);

// Bento of the platform, built from the Figma images: the onboarding photo,
// the status and report screens, and the city heatmap from the home screen
const About = () => (
  <section id="about" className="scroll-mt-[72px] bg-card px-4 py-20 sm:px-6">
    <div className="mx-auto max-w-6xl">
      <SectionHeading
        label="About PowerWatch"
        title="Everything you need when the power goes out"
        description="PowerWatch turns reports from people on your street into a clear, live picture of electricity in your area."
      />

      <div className="mt-12 grid gap-4 md:grid-cols-3 md:grid-rows-[auto_auto]">
        {/* Photo */}
        <div className={`${card} min-h-[340px] md:row-span-2`}>
          <img
            src="/images/figma/power-lines.webp"
            alt="Electricity transmission towers and power lines"
            width={700}
            height={400}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#003178] via-[#003178]/50 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6">
            <p className="text-xs font-medium uppercase tracking-[0.6px] text-[#FCBA00]">
              Community powered
            </p>
            <p className="mt-2 text-2xl font-bold leading-tight text-white">
              Your neighbors are your power grid monitor.
            </p>
            <p className="mt-2 text-sm leading-6 text-white/80">
              Every status is confirmed by people in your area, with a confidence score and the
              time of the last update.
            </p>
          </div>
        </div>

        {/* Real-time status */}
        <div className={`${card} flex flex-col`}>
          <CardText
            icon="boltLarge"
            title="Real-time Updates"
            description="Get instant alerts when power goes out or is restored in your grid."
          />
          <div className="mx-6 h-[200px] overflow-hidden rounded-t-2xl border border-b-0 border-line bg-screen">
            <img
              src="/screens/home.webp"
              alt="PowerWatch status card showing Power is Live, confirmed by 124 neighbors"
              width={750}
              height={2654}
              loading="lazy"
              className="block h-auto w-full -translate-y-[14%]"
            />
          </div>
        </div>

        {/* Report */}
        <div className={`${card} flex flex-col`}>
          <CardText
            icon="bullhornLarge"
            title="Report Outages"
            description="Easily log an outage with one tap to help neighbors stay informed."
          />
          <div className="mx-6 h-[200px] overflow-hidden rounded-t-2xl border border-b-0 border-line bg-screen">
            <img
              src="/screens/report.webp"
              alt="PowerWatch asking to confirm a power outage report"
              width={844}
              height={1792}
              loading="lazy"
              className="block h-auto w-full -translate-y-[22%]"
            />
          </div>
        </div>

        {/* Community map */}
        <div className={`${card} md:col-span-2`}>
          <div className="grid items-center md:grid-cols-[1fr_1.3fr]">
            <CardText
              icon="mapLocationLarge"
              title="Community Map"
              description="Visualize outages across the city with our interactive live map."
            />
            <div className="p-4 md:pl-0">
              <img
                src="/images/figma/heatmap.webp"
                alt="City power status heatmap with active areas highlighted"
                width={512}
                height={279}
                loading="lazy"
                className="h-auto w-full rounded-2xl border border-line"
              />
            </div>
          </div>
        </div>
      </div>

      <ul className="mt-4 grid gap-4 sm:grid-cols-3">
        {more.map(({ icon, title, description }) => (
          <li key={title} className="flex items-start gap-3 rounded-2xl border border-line-light p-4">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-tint text-accent">
              <Icon name={icon} color="currentColor" width={18} />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-ink">{title}</h3>
              <p className="mt-1 text-xs leading-5 text-body">{description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default About;
