import StoreButtons from "./StoreButtons";

const links = [
  { href: "#about", label: "About" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#screens", label: "Screens" },
  { href: "#faq", label: "FAQ" },
  { href: "#download", label: "Download" },
];

// Centered app footer after the footer.design references: one line of pitch,
// store buttons, a row of links, and the wordmark set huge and cut off at the bottom
const Footer = () => (
  <footer className="relative overflow-hidden border-t border-line-light bg-screen px-4 pt-20 sm:px-6">
    <div className="relative mx-auto flex max-w-6xl flex-col items-center text-center">
      <img
        src="/brand/favicon.png"
        alt=""
        width={64}
        height={64}
        loading="lazy"
        className="h-12 w-12 rounded-2xl"
      />
      <p className="mt-6 max-w-xl text-[28px] font-bold leading-tight tracking-[-0.02em] text-ink sm:text-[36px]">
        Monitoring your energy in real-time
      </p>

      <StoreButtons className="mt-8 justify-center" />

      <nav aria-label="Footer" className="mt-10">
        <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3">
          {links.map(({ href, label }) => (
            <li key={href}>
              <a href={href} className="text-sm font-medium text-body transition hover:text-primary">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-12 flex w-full flex-col items-center justify-between gap-3 border-t border-line pt-6 text-xs text-muted sm:flex-row">
        <p>© {new Date().getFullYear()} PowerWatch. All rights reserved.</p>
        <a href="#top" className="transition hover:text-primary">
          Back to top ↑
        </a>
      </div>
    </div>

    {/* Wordmark, faded and cropped by the page edge */}
    <p
      aria-hidden="true"
      className="pointer-events-none mt-4 select-none whitespace-nowrap bg-gradient-to-b from-primary/25 to-primary/0 bg-clip-text text-center text-[21vw] font-bold leading-[0.8] tracking-[-0.04em] text-transparent xl:text-[260px]"
    >
      Power<span className="font-medium">Watch</span>
    </p>
  </footer>
);

export default Footer;
