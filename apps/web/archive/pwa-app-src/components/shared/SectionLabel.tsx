interface SectionLabelProps {
  children: string;
}

const SectionLabel = ({ children }: SectionLabelProps) => (
  <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#0663EA]">
    {children}
  </h3>
);

export default SectionLabel;