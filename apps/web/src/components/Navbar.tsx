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
    <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-6">
      <a href="#top" aria-label="PowerWatch home">
        <Logo />
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

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <a
          href="#download"
          className="flex h-12 items-center rounded-3xl bg-primary px-6 text-base font-semibold text-white transition hover:opacity-85"
        >
          Download
        </a>
      </div>
    </div>
  </header>
);

export default Navbar;
