import { Link, useLocation } from "react-router-dom";
import { usePoints } from "../hooks/usePoints";

const navItems = [
  { path: "/", label: "홈", icon: "🏠" },
  { path: "/topics", label: "주제", icon: "🗂️" },
  { path: "/shop", label: "상점", icon: "🛒" },
];

export const Navigation: React.FC = () => {
  const location = useLocation();
  const { stats } = usePoints();

  const isActive = (path: string) => location.pathname === path;

  return (
    <footer>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="flex items-center justify-around px-4 py-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                isActive(item.path) ? "text-black bg-gray-100" : "text-gray-500"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-50 rounded-full">
            <span className="text-lg">💰</span>
            <span className="font-semibold text-gray-800">
              {stats.currentBalance}
            </span>
          </div>
        </div>
      </nav>
    </footer>
  );
};
