import { Timer } from "lucide-react";

interface LongestOutageCardProps {
  duration: string;
  day: string;
}

const LongestOutageCard = ({ duration, day }: LongestOutageCardProps) => (
  <div className="mt-4 flex items-center justify-between rounded-2xl bg-blue-50 p-4">
    <div>
      <span className="block text-xs font-medium text-[#0663EA]/70">Longest Single Outage</span>
      <span className="mt-1 block text-lg font-bold text-slate-900">
        {duration} <span className="text-sm font-medium text-gray-400">({day})</span>
      </span>
    </div>

    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white">
      <Timer size={18} className="text-[#0663EA]" />
    </div>
  </div>
);

export default LongestOutageCard;