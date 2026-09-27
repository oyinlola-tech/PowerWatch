import Icon from "./Icon";
import StoreButtons from "./StoreButtons";

// Download panel: brand blue, lightning bolts behind a phone rising from the bottom edge
const DownloadCta = () => (
  <section id="download" className="scroll-mt-[72px] bg-screen px-6 py-20">
    <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-primary">
      {/* Bolts */}
      <div className="pointer-events-none absolute -right-10 -top-24 rotate-[14deg] opacity-95 md:right-40">
        <Icon name="boltLarge" color="#FCBA00" width={300} />
      </div>
      <div className="pointer-events-none absolute -bottom-40 right-[-120px] rotate-[14deg] opacity-95 md:right-[-40px]">
        <Icon name="boltLarge" color="#FCBA00" width={340} />
      </div>

      <div className="relative grid items-end gap-10 px-8 pt-12 md:grid-cols-2 md:px-16 md:pt-16">
        <div className="pb-4 md:pb-16">
          <img
            src="/brand/emblem.png"
            alt=""
            width={773}
            height={512}
            loading="lazy"
            className="h-12 w-auto"
          />

          <h2 className="mt-6 text-[36px] font-bold leading-[1.1] text-white sm:text-[44px]">
            Download PowerWatch
          </h2>
          <p className="mt-4 max-w-md text-base leading-7 text-[#FCFEFF]/85">
            Monitoring your energy in real-time. Get instant alerts when power goes out or is
            restored in your grid.
          </p>

          <StoreButtons className="mt-8" />
        </div>

        <div className="flex justify-center md:justify-end">
          <img
            src="/mockups/phone-report.webp"
            alt="Confirming a power report in PowerWatch"
            width={702}
            height={1400}
            loading="lazy"
            className="-mb-[260px] h-auto w-[260px] drop-shadow-2xl md:-mb-[240px] md:w-[300px]"
          />
        </div>
      </div>
    </div>
  </section>
);

export default DownloadCta;
