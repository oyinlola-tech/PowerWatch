interface SectionHeadingProps {
  label: string;
  title: string;
  description: string;
}

const SectionHeading = ({ label, title, description }: SectionHeadingProps) => (
  <div className="mx-auto max-w-2xl text-center">
    <span className="text-sm font-medium uppercase tracking-[0.7px] text-accent">{label}</span>
    <h2 className="mt-3 text-balance text-[32px] font-bold leading-tight text-ink">{title}</h2>
    <p className="mt-4 text-base leading-7 text-body">{description}</p>
  </div>
);

export default SectionHeading;
