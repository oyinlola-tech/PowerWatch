import Footer from "./Footer";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { contactSection, LEGAL_LAST_UPDATED } from "../content/legal";
import type { LegalContact, LegalDocument } from "../content/legal";

const CONTACT: LegalContact = {
  name: import.meta.env.VITE_LEGAL_NAME || undefined,
  address: import.meta.env.VITE_LEGAL_ADDRESS || undefined,
  email: import.meta.env.VITE_SUPPORT_EMAIL || undefined,
  dataProtectionEmail: import.meta.env.VITE_DATA_PROTECTION_EMAIL || undefined,
};

const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

interface LegalPageProps {
  document: LegalDocument;
  related: { label: string; href: string };
}

// Public copy of the in-app Privacy Policy / Terms & Conditions (app stores
// require a web address for these). Wording: src/content/legal.ts.
const LegalPage = ({ document, related }: LegalPageProps) => {
  const sections = [...document.sections, contactSection(CONTACT)];

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line-light bg-card/85 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <a href="/" aria-label="PowerWatch home">
            <Logo />
          </a>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <a
              href="/"
              className="flex h-11 items-center rounded-3xl border border-line px-5 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent sm:h-12"
            >
              Back to home
            </a>
          </div>
        </div>
      </header>

      <main id="top" className="px-4 pb-24 pt-12 sm:px-6 sm:pt-16">
        <article className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-accent">Legal</p>
          <h1 className="mt-3 text-[32px] font-bold leading-tight tracking-[-0.02em] text-ink sm:text-[44px]">
            {document.title}
          </h1>
          <p className="mt-3 text-sm text-muted">Last updated: {LEGAL_LAST_UPDATED}</p>

          <p className="mt-8 rounded-xl border-l-4 border-primary bg-primary/5 p-5 text-base leading-7 text-body dark:bg-accent/10">
            {document.summary}
          </p>

          {/* Contents */}
          <nav aria-label="Contents" className="mt-10 rounded-2xl border border-line bg-card p-6">
            <p className="text-sm font-semibold text-ink">Contents</p>
            <ol className="mt-3 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
              {sections.map((section, index) => (
                <li key={section.heading}>
                  <a href={`#${slug(section.heading)}`} className="text-body transition hover:text-accent">
                    {index + 1}. {section.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="mt-12 space-y-12">
            {sections.map((section, index) => (
              <section key={section.heading} id={slug(section.heading)} className="scroll-mt-24">
                <h2 className="text-xl font-bold text-ink sm:text-2xl">
                  {index + 1}. {section.heading}
                </h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="mt-4 text-base leading-7 text-body">
                    {paragraph}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="mt-4 space-y-3">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3 text-base leading-7 text-body">
                        <span aria-hidden="true" className="mt-[11px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary dark:bg-accent" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
            <a href={related.href} className="text-base font-semibold text-accent hover:underline">
              Read our {related.label} →
            </a>
            <a href="#top" className="text-sm text-muted transition hover:text-accent">
              Back to top ↑
            </a>
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
};

export default LegalPage;
