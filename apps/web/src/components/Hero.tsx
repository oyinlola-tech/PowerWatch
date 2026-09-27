import Icon from "./Icon";
import type { GlyphName } from "./glyphs";
import StoreButtons from "./StoreButtons";

// Copy and the three highlights come from the Figma onboarding screens
const highlights: { icon: GlyphName; label: string }[] = [
  { icon: "boltSmall", label: "Real-time Updates" },
  { icon: "bullhorn", label: "Report Outages" },
  { icon: "mapLocation", label: "Community Map" },
];

// Layout after supahero.io references: an announcement pill, a centered headline
// with the brand mark set inline, feature chips, then the product on a panel below
const Hero = () => (
  <section id="top" className="relative overflow-hidden bg-screen">
    {/* Faint grid that fades out towards the edges */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(6,99,234,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,99,234,0.07)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(70%_60%_at_50%_30%,black,transparent)]"
    />

    <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pt-14 text-center sm:px-6 md:pt-20">
      <a
        href="#how-it-works"
        className="inline-flex items-center gap-2 rounded-full border border-line bg-white py-1 pl-1 pr-3 text-xs font-medium text-ink shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition hover:border-primary/40"
      >
        <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-white">
          New
        </span>
        Set up in minutes on Android and iPhone
        <Icon name="arrowRight" color="#0663EA" width={12} />
      </a>

      <h1 className="mt-6 max-w-4xl text-[40px] font-bold leading-[1.08] tracking-[-0.02em] text-ink sm:text-[56px] md:text-[68px]">
        Stay informed{" "}
        <img
          src="/brand/favicon.png"
          alt=""
          width={64}
          height={64}
          className="mx-1 inline-block h-[0.9em] w-auto -rotate-6 rounded-[0.22em] align-[-0.12em] shadow-[0_8px_24px_rgba(6,99,234,0.35)]"
        />{" "}
        during power outages
      </h1>

      <p className="mt-5 max-w-xl text-base leading-7 text-body sm:text-lg sm:leading-8">
        Join your community in tracking real-time power status and reporting outages in your
        neighborhood.
      </p>

      <StoreButtons className="mt-8 justify-center" />

      <ul className="mt-7 flex flex-wrap items-center justify-center gap-2">
        {highlights.map(({ icon, label }) => (
          <li
            key={label}
            className="flex items-center gap-2 rounded-full border border-line-light bg-white py-1 pl-1 pr-3 text-xs font-medium text-ink"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
              <Icon name={icon} color="#FCFEFF" width={11} />
            </span>
            {label}
          </li>
        ))}
      </ul>

      {/* Product panel: Figma phone mockups rising out of a blue stage */}
      <div
        className="relative mt-14 h-[330px] w-full overflow-hidden rounded-t-[32px] sm:h-[420px] md:mt-16 md:h-[500px]"
        style={{
          backgroundImage:
            "radial-gradient(120% 100% at 50% 0%, #0663EA 0%, #0450C4 55%, #003178 100%)",
        }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:48px_48px]"
        />
        <img
          src="/mockups/phone-a.webp"
          alt="Choosing the neighborhood to monitor in PowerWatch"
          width={702}
          height={1400}
          className="absolute left-1/2 top-24 hidden h-auto w-[230px] -translate-x-[155%] -rotate-[6deg] drop-shadow-2xl sm:block md:w-[280px]"
        />
        <img
          src="/mockups/phone-history.webp"
          alt="PowerWatch weekly history with a daily outage timeline"
          width={702}
          height={1400}
          className="absolute left-1/2 top-24 hidden h-auto w-[230px] translate-x-[55%] rotate-[6deg] drop-shadow-2xl sm:block md:w-[280px]"
        />
        <img
          src="/mockups/phone-b.webp"
          alt="PowerWatch home screen showing that power is live"
          width={697}
          height={1400}
          className="absolute left-1/2 top-10 h-auto w-[250px] -translate-x-1/2 drop-shadow-2xl sm:w-[280px] md:w-[330px]"
        />
      </div>
    </div>
  </section>
);

export default Hero;
