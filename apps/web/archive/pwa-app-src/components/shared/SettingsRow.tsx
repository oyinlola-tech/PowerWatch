import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface SettingsRowProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  subtitleColor?: string;
  onClick?: () => void;
  right: ReactNode;
}

const SettingsRow = ({
  icon: Icon,
  title,
  subtitle,
  subtitleColor = "text-gray-400",
  onClick,
  right,
}: SettingsRowProps) => {
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      onClick={onClick}
      className={`flex w-full items-center justify-between py-3.5 text-left ${
        onClick ? "transition hover:bg-gray-50" : ""
      }`}
    >
      <div className="flex items-center gap-3 pr-3">
        <Icon size={18} className="flex-shrink-0 text-gray-400" />
        <div>
          <span className="block text-sm font-semibold text-slate-800">{title}</span>
          {subtitle && (
            <span className={`block text-xs ${subtitleColor}`}>{subtitle}</span>
          )}
        </div>
      </div>

      <div className="flex-shrink-0">{right}</div>
    </Wrapper>
  );
};

export default SettingsRow;