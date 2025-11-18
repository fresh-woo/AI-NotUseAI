import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { TopicCard } from "../components/TopicCard";
import { UserTopic } from "../types/topic";

interface TopicPageProps {
  userTopics: UserTopic[];
  onDeleteUserTopic: (id: string) => void;
  onOpenSidebar: () => void;
}

export const TopicPage: React.FC<TopicPageProps> = ({
  userTopics,
  onDeleteUserTopic,
  onOpenSidebar,
}) => {
  const navigate = useNavigate();

  const sortedTopics = useMemo(
    () =>
      [...userTopics].sort((a, b) => {
        return (b.createdAt ?? 0) - (a.createdAt ?? 0);
      }),
    [userTopics]
  );

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black mb-1">
              내 주제 관리
            </h1>
            <p className="text-sm text-gray-500">
              관심 주제를 관리하고 바로 검색하거나 삭제할 수 있어요.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onOpenSidebar}
              className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              사이드바 열기
            </button>
            <button
              onClick={() => navigate("/topics/select")}
              className="px-4 py-2 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              주제 선택하러 가기
            </button>
          </div>
        </div>

        {sortedTopics.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-lg font-semibold text-gray-800 mb-2">
              아직 저장된 주제가 없어요
            </p>
            <p className="text-sm text-gray-500 mb-6">
              관심 있는 주제를 선택해서 나만의 학습 공간을 채워보세요.
            </p>
            <button
              onClick={() => navigate("/topics/select")}
              className="px-6 py-3 rounded-xl bg-black text-white font-semibold hover:bg-gray-800 transition-colors"
            >
              지금 추가하러 가기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                저장된 주제 ({sortedTopics.length})
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {sortedTopics.map((topic) => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  onClick={() => window.open(topic.link, "_blank")}
                  onDelete={() => onDeleteUserTopic(topic.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

