import { Home, History, Settings, MapPinHouse } from "lucide-react";

type NavItem = "dashboard" | "history" | "settings" | "maps";

interface BottomNavProps {
  active: NavItem;
  onNavigate: (item: NavItem) => void;
}

const navItems: { id: NavItem; label: string; icon: typeof Home }[] = [
  { id: "dashboard", label: "Home", icon: Home },
  { id: "history", label: "History", icon: History },
  { id: "maps", label: "Maps", icon: MapPinHouse },
  { id: "settings", label: "Settings", icon: Settings },
];

const BottomNav = ({ active, onNavigate }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 flex justify-around border-t border-gray-100 bg-white py-2">
      {navItems.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className="flex flex-col items-center gap-1 px-4 py-1"
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                isActive ? "bg-[#0663EA]" : ""
              }`}
            >
              <Icon size={16} className={isActive ? "text-white" : "text-gray-400"} />
            </div>
            <span className={`text-[10px] font-medium ${isActive ? "text-[#0663EA]" : "text-gray-400"}`}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;