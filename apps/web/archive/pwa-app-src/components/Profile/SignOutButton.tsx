import { LogOut } from "lucide-react";

interface SignOutButtonProps {
  onSignOut: () => void;
}

const SignOutButton = ({ onSignOut }: SignOutButtonProps) => (
  <button
    onClick={onSignOut}
    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-200 text-sm font-semibold text-red-500 transition hover:bg-red-50"
  >
    <LogOut size={16} />
    Sign Out
  </button>
);

export default SignOutButton;