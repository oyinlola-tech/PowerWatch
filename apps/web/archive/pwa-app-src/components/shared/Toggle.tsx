interface ToggleProps {
  enabled: boolean;
  onChange: (value: boolean) => void;
}

const Toggle = ({ enabled, onChange }: ToggleProps) => {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
        enabled ? "bg-[#0663EA]" : "bg-gray-300"
      }`}
      role="switch"
      aria-checked={enabled}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
          enabled ? "translate-x-[22px]" : "translate-x-1"
        }`}
      />
    </button>
  );
};

export default Toggle;