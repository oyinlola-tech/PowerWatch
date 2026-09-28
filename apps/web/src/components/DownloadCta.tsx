import Icon from "./Icon";
import { AndroidIcon, GooglePlayIcon, StoreButton } from "./StoreButtons";
import { APP_STORE_URL, PLAY_STORE_URL } from "../config/links";
import { useLatestRelease } from "../hooks/useLatestRelease";
import { formatMegabytes, formatReleaseDate } from "../utils/format";

const installSteps = [
  "Allow installs from your browser when prompted (Settings → Install unknown apps).",
  "Open the downloaded file from your notifications or Downloads folder.",
  "Tap Install. PowerWatch will prompt you in-app whenever a new version is ready.",
];

const IosButton = () => (
  <StoreButton
    platform="ios"
    url={APP_STORE_URL}
    icon={<Icon name="apple" color="#FFFFFF" width={22} />}
    caption="Download on the"
    store="App Store"
  />
);

const PlayStoreButton = () => (
  <StoreButton
    platform="android-play"
    url={PLAY_STORE_URL}
    icon={<GooglePlayIcon size={24} />}
    caption="Get it on"
    store="Google Play"
  />
);

// Placeholder shown for the brief moment the release is being fetched, sized
// like the controls it will be replaced by so nothing jumps into place.
const AndroidSkeleton = () => (
  <div aria-hidden="true" className="w-full">
    <div className="mx-auto h-4 w-56 animate-pulse rounded-full bg-white/15" />
    <div className="mx-auto mt-4 h-24 max-w-md animate-pulse rounded-2xl bg-white/10" />
  </div>
);

// Download panel after the cta.gallery "Download" references: centered pitch on a
// gridded brand panel, with the Figma home screen rising out of the bottom edge
const DownloadCta = () => {
  const release = useLatestRelease();

  return (
    <section id="download" className="scroll-mt-[72px] bg-card px-4 py-20 sm:px-6">
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

          <div className="mt-8 flex flex-col items-center gap-4">
            {release.status === "loading" ? (
              <>
                <p role="status" className="sr-only">
                  Checking for the latest Android download…
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <IosButton />
                  <div aria-hidden="true" className="h-14 w-[160px] animate-pulse rounded-3xl bg-white/15 sm:w-[180px]" />
                </div>
                <AndroidSkeleton />
              </>
            ) : release.status === "ready" ? (
              <>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <IosButton />
                  <StoreButton
                    platform="android"
                    url={release.release.downloadUrl}
                    download={release.release.fileName}
                    icon={<AndroidIcon size={24} />}
                    caption="Download for"
                    store="Android (APK)"
                  />
                  {PLAY_STORE_URL && <PlayStoreButton />}
                </div>

                <p className="text-sm text-white/85">
                  Version {release.release.version} · {formatMegabytes(release.release.sizeBytes)}{" "}
                  · Released {formatReleaseDate(release.release.publishedAt)}
                  {release.release.releasePage && (
                    <>
                      {" "}
                      ·{" "}
                      <a
                        href={release.release.releasePage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-white underline decoration-white/40 underline-offset-4 transition hover:decoration-white"
                      >
                        Release notes
                      </a>
                    </>
                  )}
                </p>

                <div className="mx-auto mt-2 max-w-md rounded-2xl border border-white/15 bg-white/10 p-5 text-left">
                  <p className="text-sm font-semibold text-white">How to install</p>
                  <ol className="mt-3 space-y-2 text-sm leading-6 text-white/85">
                    {installSteps.map((step, index) => (
                      <li key={step} className="flex gap-2">
                        <span aria-hidden="true" className="font-semibold text-white">
                          {index + 1}.
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <IosButton />
                <PlayStoreButton />
              </div>
            )}
          </div>

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
};

export default DownloadCta;
