export interface OutageSegment {
  startMinute: number; // 0–1439, minutes since midnight
  endMinute: number;
}

export interface DayRecord {
  id: string;
  label: string; // "Today, June 14"
  offMinutesLabel: string; // "0h 45m Off"
  isOutageDay: boolean; // drives red vs green label color
  segments: OutageSegment[];
}