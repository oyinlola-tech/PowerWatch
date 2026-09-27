import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  onBack?: () => void;
}

const PageHeader = ({ onBack }: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
      <button
        onClick={onBack ?? (() => navigate(-1))}
        className="flex h-9 w-9 items-center justify-center rounded-full text-slate-700 transition hover:bg-gray-50"
      >
        <ArrowLeft size={18} />
      </button>

      <div className="flex items-center gap-2">
        <img src="/icon.svg" alt="PowerWatch" className="h-6 w-6 rounded-md" />
        <span className="text-base font-semibold text-slate-700">
          <span className="font-bold">Power</span>Watch
        </span>
      </div>
    </div>
  );
};

export default PageHeader;