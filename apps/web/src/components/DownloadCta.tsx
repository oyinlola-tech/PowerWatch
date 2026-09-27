import StoreButtons from "./StoreButtons";

// Download panel after the cta.gallery "Download" references: centered pitch on a
// gridded brand panel, with the Figma home screen rising out of the bottom edge
const DownloadCta = () => (
  <section id="download" className="scroll-mt-[72px] bg-white px-4 py-20 sm:px-6">
    <div
      className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] px-6 pt-14 text-center md:pt-20"
      style={{
        backgroundImage:
          "radial-gradient(90% 80% at 50% 100%, #3B8BFF 0%, #0663EA 45%, #0450C4 100%)",
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.09)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.09)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
      />

      <div className="relative">
        <img
          src="/brand/emblem.png"
          alt=""
          width={773}
          height={512}
          loading="lazy"
          className="mx-auto h-10 w-auto"
        />
        <h2 className="mx-auto mt-6 max-w-2xl text-[34px] font-bold leading-[1.1] tracking-[-0.02em] text-white sm:text-[48px]">
          Know the moment your power comes back
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-[#FCFEFF]/85">
          Download PowerWatch and get instant alerts when power goes out or is restored in your
          grid.
        </p>

        <StoreButtons className="mt-8 justify-center" />

        <div className="mx-auto mt-12 h-[260px] w-[260px] overflow-hidden sm:h-[320px] sm:w-[320px]">
          <img
            src="/mockups/phone-b.webp"
            alt="PowerWatch home screen showing that power is live"
            width={697}
            height={1400}
            loading="lazy"
            className="h-auto w-full drop-shadow-2xl"
          />
        </div>
      </div>
    </div>
  </section>
);

export default DownloadCta;
