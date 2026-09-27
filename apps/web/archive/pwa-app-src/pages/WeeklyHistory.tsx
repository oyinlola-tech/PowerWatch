import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/layout/PageHeader";
import StatSummaryCard from "../components/history/StatSummaryCard";
import LongestOutageCard from "../components/history/LongestOutageCard";
import DailyTimelineLegend from "../components/history/DailyTimelineLegend";
import DayTimelineCard from "../components/history/DayTimelineCard";
import FloatingActionButton from "../components/layout/FloatingActionButton";
import BottomNav from "../components/layout/BottomNav";
import type { DayRecord } from "../types/history";

// Replace with data fetched from your backend
const mockHistory: DayRecord[] = [
  {
    id: "1",
    label: "Today, June 14",
    offMinutesLabel: "0h 45m Off",
    isOutageDay: true,
    segments: [{ startMinute: 1290, endMinute: 1335 }],
  },
  {
    id: "2",
    label: "Yesterday, June 13",
    offMinutesLabel: "0h 00m Off",
    isOutageDay: false,
    segments: [],
  },
  {
    id: "3",
    label: "Tuesday, June 12",
    offMinutesLabel: "5h 20m Off",
    isOutageDay: true,
    segments: [{ startMinute: 120, endMinute: 440 }],
  },
  {
    id: "4",
    label: "Monday, June 11",
    offMinutesLabel: "1h 10m Off",
    isOutageDay: true,
    segments: [{ startMinute: 1000, endMinute: 1070 }],
  },
  {
    id: "5",
    label: "Sunday, June 10",
    offMinutesLabel: "0h 00m Off",
    isOutageDay: false,
    segments: [],
  },
];

const WeeklyHistory = () => {
  const navigate = useNavigate();
  const [history] = useState<DayRecord[]>(mockHistory);

  return (
    <main className="min-h-screen bg-white px-6 py-6 pb-24">
      <div className="mx-auto max-w-md">
        <PageHeader />

        {/* Title row */}
        <div className="mt-5 flex items-end justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Weekly History</h2>
          <span className="text-xs text-gray-400">Last 7 Days</span>
        </div>

        {/* Summary stats */}
        <div className="mt-4 flex gap-3">
          <StatSummaryCard label="Total Outage Time" value="12h 45m" valueColor="text-red-500" />
          <StatSummaryCard label="Uptime Percentage" value="92.4%" valueColor="text-[#0663EA]" />
        </div>

        <LongestOutageCard duration="5h 20m" day="Tuesday" />

        {/* Daily timeline */}
        <div className="mt-6 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Daily Timeline</h3>
          <DailyTimelineLegend />
        </div>

        {history.map((record) => (
          <DayTimelineCard key={record.id} record={record} />
        ))}

        {/* Load more */}
        <button className="mt-4 h-12 w-full rounded-xl border border-gray-200 text-sm font-medium text-[#0663EA] transition hover:bg-gray-50">
          Load 30 Day History
        </button>
      </div>

      <FloatingActionButton onClick={() => navigate("/report")} />

      <BottomNav active="history" onNavigate={(item) => navigate(`/${item === "dashboard" ? "" : item}`)} />
    </main>
  );
};

export default WeeklyHistory;