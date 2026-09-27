interface StatSummaryCardProps {
  label: string;
  value: string;
  valueColor?: string;
}

const StatSummaryCard = ({ label, value, valueColor = "text-slate-900" }: StatSummaryCardProps) => (
  <div className="flex-1 rounded-2xl border border-gray-200 p-4">
    <span className="block text-xs font-medium text-gray-400">{label}</span>
    <span className={`mt-1 block text-xl font-bold ${valueColor}`}>{value}</span>
  </div>
);

export default StatSummaryCard;