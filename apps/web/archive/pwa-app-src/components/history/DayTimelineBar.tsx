import type{ OutageSegment } from "../../types/history";

interface DayTimelineBarProps {
  segments: OutageSegment[];
}

const MINUTES_IN_DAY = 24 * 60;

const DayTimelineBar = ({ segments }: DayTimelineBarProps) => {
  return (
    <div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-green-500">
        {segments.map((segment, index) => {
          const left = (segment.startMinute / MINUTES_IN_DAY) * 100;
          const width = ((segment.endMinute - segment.startMinute) / MINUTES_IN_DAY) * 100;

          return (
            <div
              key={index}
              className="absolute top-0 h-full bg-red-500"
              style={{ left: `${left}%`, width: `${width}%` }}
            />
          );
        })}
      </div>

      <div className="mt-1.5 flex justify-between text-[10px] text-gray-400">
        <span>00:00</span>
        <span>12:00</span>
        <span>23:59</span>
      </div>
    </div>
  );
};

export default DayTimelineBar;