import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

const links = [
  { href: "#about", label: "About" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#screens", label: "Screens" },
  { href: "#faq", label: "FAQ" },
];

const Navbar = () => (
  <header className="sticky top-0 z-50 border-b border-line-light bg-card/85 backdrop-blur-md">
    <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
      <a href="#top" aria-label="PowerWatch home">
        {/* Very narrow phones get the icon only so the actions still fit */}
        <span className="max-[359px]:hidden">
          <Logo />
        </span>
        <img
          src="/brand/favicon.png"
          alt=""
          width={64}
          height={64}
          className="hidden h-9 w-9 rounded-lg max-[359px]:block"
        />
      </a>

      <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
        {links.map(({ href, label }) => (
          <a
            key={href}
            href={href}
            className="text-sm font-medium text-ink/70 transition hover:text-accent"
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />
        <a
          href="#download"
          className="flex h-11 items-center rounded-3xl bg-primary px-5 text-sm sm:h-12 sm:px-6 sm:text-base font-semibold text-white transition hover:opacity-85"
        >
          Download
        </a>
      </div>
    </div>
  </header>
);

export default Navbar;
