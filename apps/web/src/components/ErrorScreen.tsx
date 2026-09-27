import type { ReactNode } from "react";
import Logo from "./Logo";

interface ErrorScreenProps {
  /** Huge word behind the phone, e.g. "404" */
  backdrop: string;
  /** Short apology in the top corner */
  note: string;
  title: string;
  description: string;
  actions: ReactNode;
}

// Shared by the 404 page and the error fallback. After the 404s.design references:
// a huge grey code with the Figma splash-screen phone standing in front of it
const ErrorScreen = ({ backdrop, note, title, description, actions }: ErrorScreenProps) => (
  <main
    className="relative flex min-h-screen flex-col overflow-hidden bg-screen px-4 py-6 sm:px-8"
    style={{
      backgroundImage:
        "radial-gradient(50% 45% at 50% 45%, rgba(6, 99, 234, 0.10) 0%, rgba(251, 254, 255, 0) 100%)",
    }}
  >
    <header className="flex items-center justify-between gap-4">
      <a href="/" aria-label="PowerWatch home">
        <Logo height={28} />
      </a>
      <p className="hidden max-w-xs text-right text-sm font-medium leading-5 text-ink sm:block">
        {note}
      </p>
    </header>

    <div className="relative my-auto flex items-center justify-center py-10">
      <span
        aria-hidden="true"
        className="select-none text-[40vw] font-bold leading-none tracking-[-0.06em] text-line sm:text-[34vw] lg:text-[420px]"
      >
        {backdrop}
      </span>
      <img
        src="/mockups/phone-splash.webp"
        alt="PowerWatch splash screen"
        width={1100}
        height={1368}
        className="absolute left-1/2 top-1/2 h-auto w-[34vw] max-w-[360px] sm:w-[40vw] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_40px_40px_rgba(0,49,120,0.25)]"
      />
    </div>

    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-[34px] font-bold leading-none tracking-[-0.02em] text-ink sm:text-[56px]">
          {title}
        </h1>
        <p className="mt-3 max-w-md text-sm font-medium leading-6 text-body">{description}</p>
      </div>
      <div className="flex flex-wrap gap-3">{actions}</div>
    </div>
  </main>
);

export const errorButton =
  "inline-flex h-14 items-center justify-center rounded-3xl bg-primary px-8 text-base font-semibold text-white transition hover:opacity-85";

export const errorButtonSecondary =
  "inline-flex h-14 items-center justify-center rounded-3xl border border-line bg-soft px-8 text-base font-semibold text-accent transition hover:opacity-85";

export default ErrorScreen;
