import { Link, useLocation } from "react-router-dom";
import { UserTopic } from "../types/topic";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userTopics: UserTopic[];
  onDeleteUserTopic: (id: string) => void;
}

const navItems = [
  { path: "/", label: "홈", icon: "🏠" },
  { path: "/topics", label: "주제 관리", icon: "📚" },
  { path: "/topics/select", label: "주제 선택", icon: "🗂️" },
  { path: "/shop", label: "상점", icon: "🛒" },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  userTopics,
  onDeleteUserTopic,
}) => {
  const location = useLocation();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-bold text-black">내 주제</h2>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-4 border-b">
            <p className="text-xs font-semibold text-gray-500 mb-3">
              바로가기
            </p>
            <div className="space-y-2">
              {navItems.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors ${
                      active
                        ? "border-gray-900 text-gray-900 bg-gray-50"
                        : "border-gray-200 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {userTopics.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <p>추가한 주제가 없습니다.</p>
                <p className="text-sm mt-2">주제를 추가해보세요!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {userTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-2xl">{topic.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {topic.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {topic.link}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteUserTopic(topic.id)}
                      className="ml-2 text-red-500 hover:text-red-700 text-lg"
                      title="삭제"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
