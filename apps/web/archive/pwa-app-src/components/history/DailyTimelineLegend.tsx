const DailyTimelineLegend = () => (
  <div className="flex items-center gap-4">
    <div className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full bg-green-500" />
      <span className="text-xs font-medium text-gray-500">ON</span>
    </div>
    <div className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full bg-red-500" />
      <span className="text-xs font-medium text-gray-500">OFF</span>
    </div>
  </div>
);

export default DailyTimelineLegend;