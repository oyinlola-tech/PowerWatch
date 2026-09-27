import type { ActivityReport } from "../../types/dashboard";
import ActivityListItem from "./ActivityListItem";


interface NeighborhoodActivityProps {
  reports: ActivityReport[];
  onSeeHistory: () => void;
}

const NeighborhoodActivity = ({ reports, onSeeHistory }: NeighborhoodActivityProps) => {
  return (
    <div className="mt-6">
      {/* Header - Simple as design */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900">Neighborhood Activity</h3>
        <button 
          onClick={onSeeHistory} 
          className="text-xs font-medium text-[#0663EA] hover:underline"
        >
          See History
        </button>
      </div>

      {/* Activity list */}
      <div className="mt-3 divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white">
        {reports.map((report) => (
          <ActivityListItem key={report.id} report={report} />
        ))}
      </div>
    </div>
  );
};

export default NeighborhoodActivity;