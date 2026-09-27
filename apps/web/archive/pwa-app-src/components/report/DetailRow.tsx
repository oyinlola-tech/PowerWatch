import type { LucideIcon } from "lucide-react";

interface DetailRowProps {
  icon: LucideIcon;
  label: string;
  value: string;
  subValue?: string;
}

const DetailRow = ({ icon: Icon, label, value, subValue }: DetailRowProps) => (
  <div className="flex items-center gap-3 py-3">
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
      <Icon size={16} className="text-gray-400" />
    </div>

    <div>
      <span className="block text-[10px] font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </span>
      <span className="mt-0.5 block text-sm font-bold text-slate-900">{value}</span>
      {subValue && <span className="block text-xs text-gray-400">{subValue}</span>}
    </div>
  </div>
);

export default DetailRow;