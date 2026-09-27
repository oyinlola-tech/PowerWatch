import type { DayRecord } from "../../types/history";
import DayTimelineBar from "./DayTimelineBar";

interface DayTimelineCardProps {
  record: DayRecord;
}

const DayTimelineCard = ({ record }: DayTimelineCardProps) => (
  <div className="mt-3 rounded-2xl border border-gray-200 p-4">
    <div className="flex items-center justify-between">
      <span className="text-sm font-semibold text-slate-800">{record.label}</span>
      <span className={`text-xs font-bold ${record.isOutageDay ? "text-red-500" : "text-green-500"}`}>
        {record.offMinutesLabel}
      </span>
    </div>

    <div className="mt-3">
      <DayTimelineBar segments={record.segments} />
    </div>
  </div>
);

export default DayTimelineCard;