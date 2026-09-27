import { Lightbulb } from "lucide-react";
import type { PowerStatusData } from "../../types/dashboard";

interface PowerStatusCardProps {
  data: PowerStatusData;
}

const PowerStatusCard = ({ data }: PowerStatusCardProps) => {
  const isOn = data.status === "on";
  const accent = isOn ? "#22C55E" : "#EF4444";
  // const bgLight = isOn ? "bg-green-50" : "bg-red-50";

  return (
    <div className={`relative mt-8 rounded-2xl border-2 p-7 shadow-lg transition-all hover:shadow-xl ${
      isOn ? "border-green-200 bg-white" : "border-red-200 bg-white"
    }`}>
      {/* Top accent bar */}
      <div 
        className="absolute left-0 right-0 top-0 h-1.5 rounded-t-2xl"
        style={{ backgroundColor: accent }}
      />

      {/* Status badge */}
      <div className="flex justify-center pt-1">
        <div
          className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider ${
            isOn ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          <span 
            className={`h-2 w-2 rounded-full animate-pulse ${
              isOn ? "bg-green-500" : "bg-red-500"
            }`}
          />
          Electricity Status: {isOn ? "On" : "Off"}
        </div>
      </div>

      {/* Icon with background circle */}
      <div className="mt-6 flex justify-center">
        <div
          className="relative flex h-28 w-28 items-center justify-center rounded-full transition-all duration-300 hover:scale-105"
          style={{ backgroundColor: `${accent}20` }}
        >
          {/* Inner circle */}
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full"
            style={{ backgroundColor: accent }}
          >
            <Lightbulb size={32} className="text-white" fill="white" />
          </div>
          {/* Pulsing ring effect */}
          <div 
            className="absolute inset-0 rounded-full border-2 opacity-30 animate-ping"
            style={{ borderColor: accent }}
          />
        </div>
      </div>

      {/* Text - Much bigger */}
      <h3 className="mt-5 text-center text-4xl font-extrabold text-slate-900">
        {isOn ? "Power is Live" : "Power is Out"}
      </h3>
      <p className="mt-2 text-center text-sm text-gray-500">
        Confirmed by <span className="font-semibold text-slate-700">{data.confirmedByCount}</span> neighbors
      </p>

      {/* Stats - With more spacing */}
      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-200 pt-5">
        <div className="text-center">
          <span className="block text-xs font-medium uppercase tracking-wider text-gray-400">
            Confidence
          </span>
          <span className="mt-1.5 block text-xl font-bold text-slate-800">
            {data.confidence}%
          </span>
        </div>
        <div className="relative text-center">
          <div className="absolute left-0 top-1/2 h-10 w-px -translate-y-1/2 bg-gray-200" />
          <span className="block text-xs font-medium uppercase tracking-wider text-gray-400">
            Last Update
          </span>
          <span className="mt-1.5 block text-xl font-bold text-slate-800">
            {data.lastUpdate}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PowerStatusCard;