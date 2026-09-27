import SectionHeading from "./SectionHeading";

const screens = [
  {
    src: "/screens/home.webp",
    alt: "PowerWatch home screen with the current electricity status",
    title: "Status at a glance",
    description: "See if power is live, how many neighbors confirmed it, and how recent it is.",
    height: 2654,
  },
  {
    src: "/screens/report.webp",
    alt: "PowerWatch screen confirming a power outage report",
    title: "Report in one tap",
    description: "Your report helps neighbors stay informed.",
    height: 1792,
  },
  {
    src: "/screens/history.webp",
    alt: "PowerWatch weekly history with a daily outage timeline",
    title: "Weekly history",
    description: "Total outage time, uptime and your longest single outage.",
    height: 2526,
  },
  {
    src: "/screens/profile.webp",
    alt: "PowerWatch profile screen with notification preferences",
    title: "Make it yours",
    description: "Manage alerts, neighborhoods and app settings.",
    height: 2406,
  },
];

const Screens = () => (
  <section id="screens" className="scroll-mt-[72px] bg-white py-20">
    <div className="mx-auto max-w-6xl">
      <div className="px-6">
        <SectionHeading
          label="Inside the app"
          title="Built to be clear at a glance"
          description="Every screen is designed to tell you what you need to know in seconds."
        />
      </div>

      <ul className="mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-4 lg:grid lg:grid-cols-4 lg:overflow-visible">
        {screens.map(({ src, alt, title, description, height }) => (
          <li key={src} className="w-[250px] flex-shrink-0 snap-center lg:w-auto">
            <div className="h-[520px] overflow-hidden rounded-3xl border border-line bg-screen shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <img
                src={src}
                alt={alt}
                width={750}
                height={height}
                loading="lazy"
                className="block h-auto w-full"
              />
            </div>
            <h3 className="mt-5 text-center text-base font-semibold text-ink">{title}</h3>
            <p className="mt-1 text-center text-sm leading-5 text-body">{description}</p>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default Screens;
