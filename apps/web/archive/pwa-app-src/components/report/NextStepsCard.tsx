import { Pencil } from "lucide-react";

const NextStepsCard = () => (
  <div>
    <span className="mt-6 block text-sm font-bold text-slate-900">Next Steps</span>

    <div className="mt-2 flex items-start gap-3 rounded-xl bg-gray-50 p-4 border border-gray-100">
      <Pencil size={16} className="mt-0.5 flex-shrink-0 text-gray-400" />
      <p className="text-xs leading-5 text-gray-500">
        Your report has been shared. Community members in your area will verify
        this report shortly to ensure live accuracy.
      </p>
    </div>
  </div>
);

export default NextStepsCard;