import { MapPin, Pencil } from "lucide-react";

interface DashboardHeaderProps {
  neighborhood: string;
  onChangeNeighborhood: () => void;
}

const DashboardHeader = ({ neighborhood, onChangeNeighborhood }: DashboardHeaderProps) => {
  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <img src="/icon.svg" alt="PowerWatch" className="h-7 w-7 rounded-md" />
          <h1 className="text-lg font-semibold text-slate-700">
            <span className="font-bold">Power</span>Watch
          </h1>
        </div>

        <button className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-[#0663EA]">
          <MapPin size={16} />
        </button>
      </div>

      {/* Neighborhood row */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400">Current Neighborhood</span>

        <button
          onClick={onChangeNeighborhood}
          className="flex items-center gap-1 text-xs font-medium text-[#0663EA]"
        >
          Change
          <Pencil size={12} />
        </button>
      </div>

      <h2 className="mt-1 text-2xl font-bold text-slate-900">{neighborhood}</h2>
    </div>
  );
};

export default DashboardHeader;