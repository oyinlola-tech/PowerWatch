import type { ActivityReport } from "../../types/dashboard";
import { User } from 'lucide-react';

interface ActivityListItemProps {
  report: ActivityReport;
}

const ActivityListItem = ({ report }: ActivityListItemProps) => {
  const isOn = report.status === "on";

  return (
    <div className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-gray-50/80">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* User Icon */}
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#0663EA]/10">
          <User size={14} className="text-[#0663EA]" />
        </div>
        
        {/* Text Content */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-900 truncate">
            Neighbor reported{' '}
            <span className={`font-semibold ${isOn ? 'text-green-600' : 'text-red-600'}`}>
              {isOn ? 'ON' : 'OFF'}
            </span>
          </p>
          <p className="text-xs text-gray-500 truncate">{report.location}</p>
        </div>
      </div>
      
      {/* Timestamp */}
      <span className="flex-shrink-0 text-xs text-gray-400 ml-2">
        {report.timestamp}
      </span>
    </div>
  );
};

export default ActivityListItem;