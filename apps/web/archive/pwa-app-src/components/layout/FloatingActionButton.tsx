import { Plus } from "lucide-react";

interface FloatingActionButtonProps {
  onClick: () => void;
}

const FloatingActionButton = ({ onClick }: FloatingActionButtonProps) => (
  <button
    onClick={onClick}
    className="fixed bottom-20 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#0663EA] text-white shadow-lg transition hover:bg-blue-700"
  >
    <Plus size={24} />
  </button>
);

export default FloatingActionButton;