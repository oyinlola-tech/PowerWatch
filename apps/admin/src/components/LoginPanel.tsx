import Icon, { type IconName } from "./Icon";

const FACTS: { icon: IconName; text: string }[] = [
  { icon: "status", text: "Live power status for every tracked state, LGA, town and neighborhood." },
  { icon: "broadcast", text: "Moderate reports and send broadcast alerts the moment it matters." },
  { icon: "clock", text: "Sessions live only in this browser tab — closing it signs you out." },
];

/**
 * Brand half of the sign-in screen. Collapses to a compact header (logo row only) below the
 * `lg` breakpoint; the headline, facts and status card only appear on the full-height desktop
 * panel so the mobile layout stays short and puts the form first.
 */
export default function LoginPanel() {
  return (
    <div className="relative isolate flex h-full flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0663EA] to-[#1B3A4B] px-5 py-5 text-white dark:from-[#043064] dark:to-[#0a1830] sm:px-8 sm:py-6 lg:px-12 lg:py-10">
      {/* Subtle grid texture, pure CSS so nothing here needs a network image */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:36px_36px]"
      />
      <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <img
        src="/brand/favicon.png"
        alt=""
        aria-hidden
        width={256}
        height={256}
        className="pointer-events-none absolute -bottom-12 -right-12 h-44 w-44 rotate-6 opacity-[0.08] lg:h-64 lg:w-64"
      />

      <div className="relative flex items-center justify-between gap-3">
        <img
          src="/brand/logo-horizontal-dark.png"
          alt="PowerWatch"
          width={1526}
          height={334}
          style={{ height: 26, width: "auto" }}
          className="max-w-none"
        />
        <span className="rounded-md bg-white/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide">Admin</span>
      </div>

      <div className="relative hidden lg:block">
        <h2 className="max-w-sm text-3xl font-bold leading-tight">The admin console behind PowerWatch.</h2>
        <p className="mt-3 max-w-sm text-sm text-white/80">
          Sign in to moderate reports, manage neighborhoods and follow live outage status across Nigeria.
        </p>

        <ul className="mt-8 space-y-4">
          {FACTS.map((fact) => (
            <li key={fact.text} className="flex items-start gap-3 text-sm text-white/85">
              <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white/15">
                <Icon name={fact.icon} size={15} />
              </span>
              <span>{fact.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative hidden w-fit items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm lg:flex">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-white">
          <span className="h-2 w-2 rounded-full bg-power-on" aria-hidden />
          ON
        </span>
        <span className="h-4 w-px bg-white/25" aria-hidden />
        <span className="flex items-center gap-1.5 text-xs font-semibold text-white/70">
          <span className="h-2 w-2 rounded-full bg-power-off" aria-hidden />
          OFF
        </span>
        <span className="ml-1 text-xs text-white/60">— what every report tells your neighbors</span>
      </div>
    </div>
  );
}
