import { Zap, Unplug } from "lucide-react";
import type { PowerStatus } from "../../types/dashboard";

interface ReportPowerButtonsProps {
  onReport: (status: PowerStatus) => void;
}

const ReportPowerButtons = ({ onReport }: ReportPowerButtonsProps) => {
  return (
    <div className="mt-8">
      {/* Divider with text - Clean and professional */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-6 text-sm font-medium text-gray-400">
            ⚡ Something changed? Report it now
          </span>
        </div>
      </div>

      {/* Buttons - Premium design */}
      <div className="space-y-3.5">
        {/* Report ON Button */}
        <button
          onClick={() => onReport("on")}
          className="group relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-green-400 to-green-500 text-base font-semibold text-white shadow-md shadow-green-500/25 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/40 active:scale-[0.98]"
        >
          <span className="absolute inset-0 bg-white/0 transition-all duration-300 group-hover:bg-white/10" />
          <Zap size={20} fill="white" className="transition-transform duration-300 group-hover:scale-110" />
          <span>Report Power ON</span>
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-white/60">
            ✓
          </span>
        </button>

        {/* Report OFF Button */}
        <button
          onClick={() => onReport("off")}
          className="group relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-red-400 to-red-500 text-base font-semibold text-white shadow-md shadow-red-500/25 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/40 active:scale-[0.98]"
        >
          <span className="absolute inset-0 bg-white/0 transition-all duration-300 group-hover:bg-white/10" />
          <Unplug size={20} className="transition-transform duration-300 group-hover:scale-110" />
          <span>Report Power OFF</span>
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-white/60">
            ✕
          </span>
        </button>
      </div>
    </div>
  );
};

export default ReportPowerButtons;