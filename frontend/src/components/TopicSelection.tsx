import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Topic, SelectedTopic, UserTopic } from "../types/topic";
import { topics } from "../data/topics";
import { TopicCard } from "./TopicCard";
import { usePoints } from "../hooks/usePoints";
import { useGoals } from "../hooks/useGoals";

interface TopicSelectionProps {
  userTopics: UserTopic[];
  onAddUserTopic: (topic: UserTopic) => void;
  onDeleteUserTopic: (id: string) => void;
  onOpenSidebar: () => void;
}

const isUserCreatedTopic = (topic: Topic | UserTopic): topic is UserTopic => {
  return "isUserCreated" in topic;
};

export const TopicSelection: React.FC<TopicSelectionProps> = ({
  userTopics,
  onAddUserTopic,
  onDeleteUserTopic,
  onOpenSidebar,
}) => {
  const [selectedTopics, setSelectedTopics] = useState<
    Map<string, SelectedTopic>
  >(new Map());
  const [showAddTopicForm, setShowAddTopicForm] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicIcon, setNewTopicIcon] = useState("📌");
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [searchKeywords, setSearchKeywords] = useState("");
  const [searchSummary, setSearchSummary] = useState("");
  const [activeTab, setActiveTab] = useState<"topic" | "goal" | "research">(
    "topic"
  );

  const { addSearchPoint, earnPoints } = usePoints();
  const { addGoal, deleteGoal } = useGoals();
  const navigate = useNavigate();

  const completionSections = useMemo(
    () => [goalTitle.trim(), searchKeywords.trim(), searchSummary.trim()],
    [goalTitle, searchKeywords, searchSummary]
  );
  const completionRatio =
    (completionSections.filter(Boolean).length / completionSections.length) *
    100;

  const handleTopicClick = (topic: Topic | UserTopic) => {
    const newSelected = new Map(selectedTopics);

    if (newSelected.has(topic.id)) {
      // 이미 선택된 경우 제거
      newSelected.delete(topic.id);
      // 순서 재정렬
      const sorted = Array.from(newSelected.values())
        .sort((a, b) => a.order - b.order)
        .map((t, index) => ({ ...t, order: index + 1 }));
      setSelectedTopics(new Map(sorted.map((t) => [t.id, t])));
    } else {
      // 새로 선택
      const order = newSelected.size + 1;
      newSelected.set(topic.id, { ...topic, order });
      setSelectedTopics(newSelected);
    }
  };

  const handleAddUserTopic = () => {
    if (!newTopicName.trim()) {
      return;
    }

    const baseTopicName = newTopicName.trim();
    let linkedGoalId: string | undefined;

    if (goalTitle.trim()) {
      const createdGoal = addGoal({
        title: goalTitle.trim(),
        description: goalDescription.trim(),
      });
      linkedGoalId = createdGoal.id;
    }

    const userTopic: UserTopic = {
      id: `user-${Date.now()}`,
      name: baseTopicName,
      icon: newTopicIcon,
      link: `https://www.google.com/search?q=${encodeURIComponent(
        baseTopicName
      )}`,
      isUserCreated: true,
      createdAt: Date.now(),
      goalId: linkedGoalId,
      keywords: searchKeywords.trim() || undefined,
      findings: searchSummary.trim() || undefined,
    };

    onAddUserTopic(userTopic);

    const filledCount = completionSections.filter(Boolean).length;
    if (filledCount > 0) {
      const earned = filledCount * 30;
      earnPoints(earned, `"${baseTopicName}" 계획 작성`);
      alert(`주제와 목표를 저장했어요! ${earned} 포인트 획득 🎉`);
    }

    setNewTopicName("");
    setNewTopicIcon("📌");
    setGoalTitle("");
    setGoalDescription("");
    setSearchKeywords("");
    setSearchSummary("");
    setActiveTab("topic");
    setShowAddTopicForm(false);
  };

  const handleDeleteUserTopic = (id: string) => {
    const target = userTopics.find((topic) => topic.id === id);
    if (target?.goalId) {
      deleteGoal(target.goalId);
    }
    onDeleteUserTopic(id);
    // 선택된 주제에서도 제거
    const newSelected = new Map(selectedTopics);
    if (newSelected.has(id)) {
      newSelected.delete(id);
      const sorted = Array.from(newSelected.values())
        .sort((a, b) => a.order - b.order)
        .map((t, index) => ({ ...t, order: index + 1 }));
      setSelectedTopics(new Map(sorted.map((t) => [t.id, t])));
    }
  };

  const handleNext = () => {
    if (selectedTopics.size === 0) {
      alert("최소 하나의 주제를 선택해주세요.");
      return;
    }

    // 선택된 주제들의 링크를 새 탭에서 열기
    const sortedTopics = Array.from(selectedTopics.values()).sort(
      (a, b) => a.order - b.order
    );

    sortedTopics.forEach((topic, index) => {
      setTimeout(() => {
        window.open(topic.link, "_blank");
        // 검색 포인트 지급
        addSearchPoint(topic.name);
      }, index * 300); // 각 링크를 0.3초 간격으로 열기
    });
  };

  // 모든 토픽 (기본 + 사용자 추가)
  const allTopics = [...topics, ...userTopics];

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      {/* Header */}
      <header className="w-full px-4 pt-4 pb-2 flex-shrink-0">
        <div className="flex items-center justify-between gap-4 mb-4">
          <button
            onClick={() => navigate("/")}
            className="text-gray-700 text-xl"
          >
            ←
          </button>
          {/* Hamburger Menu Button */}
          <button
            onClick={onOpenSidebar}
            className="text-gray-700 text-xl p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="메뉴"
          >
            ☰
          </button>
        </div>
      </header>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-black text-center mb-8">
          어떤 주제에 관심 있으신가요?
        </h1>

        {/* Topic Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {allTopics.map((topic) => {
            const selected = selectedTopics.get(topic.id);
            const userCreated = isUserCreatedTopic(topic);
            return (
              <TopicCard
                key={topic.id}
                topic={topic}
                isSelected={!!selected}
                order={selected?.order}
                onClick={() => handleTopicClick(topic)}
                onDelete={
                  userCreated
                    ? () => handleDeleteUserTopic(topic.id)
                    : undefined
                }
              />
            );
          })}

          {/* Add Topic Button */}
          <button
            onClick={() => {
              setShowAddTopicForm(!showAddTopicForm);
            }}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl p-4 min-h-[100px] bg-white border-2 border-dashed border-gray-300 text-gray-500 hover:border-gray-400 transition-all"
          >
            <span className="text-2xl">+</span>
            <span className="text-xs font-medium">주제 · 목표 추가하기</span>
          </button>
        </div>

        {/* Add Topic Form */}
        {showAddTopicForm && (
          <div className="mb-4 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">새 주제 설계</h3>
              <span className="text-xs text-gray-500">
                채운 정도: {Math.round(completionRatio)}%
              </span>
            </div>

            <div className="flex gap-1 mb-4">
              {[
                { id: "topic", label: "주제" },
                { id: "goal", label: "목표" },
                { id: "research", label: "검색 기록" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(tab.id as "topic" | "goal" | "research")
                  }
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-white text-gray-900 shadow"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {activeTab === "topic" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      아이콘 선택
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        "📌",
                        "⭐",
                        "❤️",
                        "🔥",
                        "💡",
                        "🎯",
                        "🌟",
                        "✨",
                        "🎨",
                        "🚀",
                      ].map((icon) => (
                        <button
                          key={icon}
                          onClick={() => setNewTopicIcon(icon)}
                          className={`text-2xl p-2 rounded-lg border-2 transition-colors ${
                            newTopicIcon === icon
                              ? "border-gray-800 bg-gray-100"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    placeholder="주제 이름을 입력하세요"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                    onKeyDown={(e) => e.key === "Enter" && handleAddUserTopic()}
                  />
                </>
              )}

              {activeTab === "goal" && (
                <>
                  <input
                    type="text"
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    placeholder="이 주제로 이루고 싶은 목표"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                  <textarea
                    value={goalDescription}
                    onChange={(e) => setGoalDescription(e.target.value)}
                    placeholder="목표 상세 설명이나 체크포인트를 적어보세요."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
                  />
                </>
              )}

              {activeTab === "research" && (
                <>
                  <textarea
                    value={searchKeywords}
                    onChange={(e) => setSearchKeywords(e.target.value)}
                    placeholder="관련 검색어를 적어보세요 (쉼표로 구분)"
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
                  />
                  <textarea
                    value={searchSummary}
                    onChange={(e) => setSearchSummary(e.target.value)}
                    placeholder="검색 결과나 수집한 정보, 링크 등을 기록하세요."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
                  />
                </>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleAddUserTopic}
                  disabled={!newTopicName.trim()}
                  className="flex-1 bg-gray-800 text-white py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  저장하기
                </button>
                <button
                  onClick={() => {
                    setShowAddTopicForm(false);
                    setNewTopicName("");
                    setNewTopicIcon("📌");
                    setGoalTitle("");
                    setGoalDescription("");
                    setSearchKeywords("");
                    setSearchSummary("");
                    setActiveTab("topic");
                  }}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Info Text */}
        <p className="text-sm text-gray-500 text-center mb-6">
          관심 주제는 나중에 다시 수정할 수 있어요!
        </p>
      </div>

      {/* Bottom Button */}
      <div className="px-4 pb-6 pt-4 flex-shrink-0">
        <button
          onClick={handleNext}
          className="w-full bg-black text-white py-4 rounded-2xl font-semibold text-lg hover:bg-gray-800 transition-colors"
        >
          다음
        </button>
      </div>
    </div>
  );
};
