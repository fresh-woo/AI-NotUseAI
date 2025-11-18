import { useEffect, useMemo, useState } from "react";
import { usePoints } from "../hooks/usePoints";
import { useGoals } from "../hooks/useGoals";
import { Goal } from "../types/goal";

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  category: "reward" | "badge" | "theme";
}

interface GoalResearchData {
  relatedLink: string;
  keywords: string;
  searchNotes: string;
  mainSummary: string;
  awardedCount: number;
  lastSaved?: number;
}

const shopItems: ShopItem[] = [
  {
    id: "coffee",
    name: "커피 쿠폰",
    description: "카페에서 사용할 수 있는 커피 쿠폰",
    price: 100,
    icon: "☕",
    category: "reward",
  },
  {
    id: "badge-1",
    name: "탐험가 배지",
    description: "10번 이상 검색한 사용자",
    price: 200,
    icon: "🏅",
    category: "badge",
  },
  {
    id: "badge-2",
    name: "학습자 배지",
    description: "목표 점검 5회 이상",
    price: 300,
    icon: "🎓",
    category: "badge",
  },
  {
    id: "theme-dark",
    name: "다크 테마",
    description: "어두운 테마로 변경",
    price: 150,
    icon: "🌙",
    category: "theme",
  },
  {
    id: "premium",
    name: "프리미엄 멤버십",
    description: "1개월 프리미엄 기능 이용",
    price: 500,
    icon: "⭐",
    category: "reward",
  },
];

const RESEARCH_STORAGE_KEY = "goal_research";
const POINTS_PER_RESEARCH_FIELD = 30;
const emptyResearch: GoalResearchData = {
  relatedLink: "",
  keywords: "",
  searchNotes: "",
  mainSummary: "",
  awardedCount: 0,
};

export const ShopPage: React.FC = () => {
  const { stats, spendPoints, transactions, earnPoints } = usePoints();
  const { goals, addGoal, deleteGoal } = useGoals();
  const [purchasedItems, setPurchasedItems] = useState<string[]>(() => {
    const stored = localStorage.getItem("purchased_items");
    return stored ? JSON.parse(stored) : [];
  });
  const [activeTab, setActiveTab] = useState<"shop" | "research">("shop");
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDescription, setNewGoalDescription] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [researchMap, setResearchMap] = useState<
    Record<string, GoalResearchData>
  >(() => {
    const stored = localStorage.getItem(RESEARCH_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error("Failed to parse research data", error);
      }
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem(RESEARCH_STORAGE_KEY, JSON.stringify(researchMap));
  }, [researchMap]);

  useEffect(() => {
    if (goals.length === 0) {
      setSelectedGoalId(null);
      return;
    }
    if (selectedGoalId && goals.some((goal) => goal.id === selectedGoalId)) {
      return;
    }
    setSelectedGoalId(goals[0].id);
  }, [goals, selectedGoalId]);

  useEffect(() => {
    const goalIds = new Set(goals.map((g) => g.id));
    setResearchMap((prev) => {
      const next = { ...prev };
      let changed = false;
      Object.keys(next).forEach((key) => {
        if (!goalIds.has(key)) {
          delete next[key];
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [goals]);

  const purchasedCoupons = useMemo(() => {
    return purchasedItems
      .map((id) => shopItems.find((item) => item.id === id))
      .filter((item): item is ShopItem => !!item && item.category === "reward");
  }, [purchasedItems]);

  const purchaseHistory = transactions
    .filter((t) => t.type === "spend")
    .slice(0, 10);

  const getResearch = (goalId: string): GoalResearchData => {
    return researchMap[goalId] || { ...emptyResearch };
  };

  const handleResearchChange = (
    goalId: string,
    field: keyof Omit<GoalResearchData, "awardedCount" | "lastSaved">,
    value: string
  ) => {
    setResearchMap((prev) => ({
      ...prev,
      [goalId]: {
        ...emptyResearch,
        ...prev[goalId],
        [field]: value,
      },
    }));
  };

  const handleSaveResearch = (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    const current = getResearch(goalId);

    const filledCount = [
      current.relatedLink,
      current.keywords,
      current.searchNotes,
      current.mainSummary,
    ].filter((value) => value && value.trim().length > 0).length;

    const additional = Math.max(filledCount - (current.awardedCount || 0), 0);

    if (additional > 0) {
      const earned = additional * POINTS_PER_RESEARCH_FIELD;
      earnPoints(earned, `"${goal.title}" 연구 정리`);
      alert(`연구 내용을 저장했어요! ${earned} 포인트 획득 🎉`);
    }

    setResearchMap((prev) => ({
      ...prev,
      [goalId]: {
        ...current,
        awardedCount: filledCount,
        lastSaved: Date.now(),
      },
    }));
  };

  const handleAddGoal = () => {
    if (!newGoalTitle.trim()) {
      alert("목표 제목을 입력해주세요.");
      return;
    }
    const created = addGoal({
      title: newGoalTitle.trim(),
      description: newGoalDescription.trim(),
    });
    setNewGoalTitle("");
    setNewGoalDescription("");
    setShowGoalForm(false);
    setSelectedGoalId(created.id);
  };

  const handleDeleteGoal = (goalId: string) => {
    if (confirm("정말 이 목표를 삭제할까요?")) {
      deleteGoal(goalId);
      setResearchMap((prev) => {
        const next = { ...prev };
        delete next[goalId];
        return next;
      });
    }
  };

  const handlePurchase = (item: ShopItem) => {
    if (purchasedItems.includes(item.id)) {
      alert("이미 구매한 아이템입니다.");
      return;
    }

    if (stats.currentBalance < item.price) {
      alert("포인트가 부족합니다.");
      return;
    }

    if (confirm(`${item.name}을(를) ${item.price}포인트로 구매하시겠습니까?`)) {
      const success = spendPoints(item.price, `${item.name} 구매`, item.id);
      if (success) {
        setPurchasedItems((prev) => {
          const next = [...prev, item.id];
          localStorage.setItem("purchased_items", JSON.stringify(next));
          return next;
        });
        alert("구매 완료!");
      }
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-black mb-2">상점</h1>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 rounded-full">
            <span className="text-xl">💰</span>
            <span className="font-semibold text-gray-800">
              보유 포인트: {stats.currentBalance}
            </span>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {[
            { id: "shop", label: "상점" },
            { id: "research", label: "목표 · 검색 기록" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "shop" | "research")}
              className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
                activeTab === tab.id
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "shop" ? (
          <>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-xs text-gray-600 mb-1">총 획득</p>
                <p className="text-lg font-bold text-blue-600">
                  {stats.totalEarned}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <p className="text-xs text-gray-600 mb-1">검색 횟수</p>
                <p className="text-lg font-bold text-green-600">
                  {stats.searchCount}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg text-center">
                <p className="text-xs text-gray-600 mb-1">사용 포인트</p>
                <p className="text-lg font-bold text-purple-600">
                  {stats.totalSpent}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                아이템
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {shopItems.map((item) => {
                  const isPurchased = purchasedItems.includes(item.id);
                  const canAfford = stats.currentBalance >= item.price;

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border-2 ${
                        isPurchased
                          ? "bg-gray-100 border-gray-300"
                          : canAfford
                          ? "bg-white border-gray-300 hover:border-gray-400"
                          : "bg-gray-50 border-gray-200 opacity-60"
                      } transition-colors`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-3xl">{item.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-1">
                            {item.name}
                            {isPurchased && (
                              <span className="ml-2 text-xs text-green-600">
                                ✓ 구매완료
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-800">
                          {item.price} 💰
                        </span>
                        <button
                          onClick={() => handlePurchase(item)}
                          disabled={isPurchased || !canAfford}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            isPurchased
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : canAfford
                              ? "bg-black text-white hover:bg-gray-800"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          {isPurchased
                            ? "구매완료"
                            : canAfford
                            ? "구매하기"
                            : "포인트 부족"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {purchasedCoupons.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  내 쿠폰
                </h2>
                <div className="space-y-3">
                  {purchasedCoupons.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 border border-yellow-200 rounded-xl bg-yellow-50 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.description}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-yellow-700">
                        보관중
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {purchaseHistory.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  구매 내역
                </h2>
                <div className="space-y-2">
                  {purchaseHistory.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="p-3 bg-gray-50 rounded-lg flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.timestamp).toLocaleString(
                            "ko-KR"
                          )}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-red-600">
                        -{transaction.amount} 💰
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <GoalWorkspace
            goals={goals}
            selectedGoalId={selectedGoalId}
            showGoalForm={showGoalForm}
            newGoalTitle={newGoalTitle}
            newGoalDescription={newGoalDescription}
            getResearch={getResearch}
            onSelectGoal={(id) => setSelectedGoalId(id)}
            onToggleForm={() => setShowGoalForm((prev) => !prev)}
            onGoalTitleChange={setNewGoalTitle}
            onGoalDescriptionChange={setNewGoalDescription}
            onAddGoal={handleAddGoal}
            onDeleteGoal={handleDeleteGoal}
            onResearchChange={handleResearchChange}
            onSaveResearch={handleSaveResearch}
          />
        )}
      </div>
    </div>
  );
};

interface GoalWorkspaceProps {
  goals: Goal[];
  selectedGoalId: string | null;
  showGoalForm: boolean;
  newGoalTitle: string;
  newGoalDescription: string;
  getResearch: (goalId: string) => GoalResearchData;
  onSelectGoal: (id: string) => void;
  onToggleForm: () => void;
  onGoalTitleChange: (value: string) => void;
  onGoalDescriptionChange: (value: string) => void;
  onAddGoal: () => void;
  onDeleteGoal: (goalId: string) => void;
  onResearchChange: (
    goalId: string,
    field: keyof Omit<GoalResearchData, "awardedCount" | "lastSaved">,
    value: string
  ) => void;
  onSaveResearch: (goalId: string) => void;
}

const GoalWorkspace: React.FC<GoalWorkspaceProps> = ({
  goals,
  selectedGoalId,
  showGoalForm,
  newGoalTitle,
  newGoalDescription,
  getResearch,
  onSelectGoal,
  onToggleForm,
  onGoalTitleChange,
  onGoalDescriptionChange,
  onAddGoal,
  onDeleteGoal,
  onResearchChange,
  onSaveResearch,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          목표 설정 & 검색 기록
        </h2>
        <button
          onClick={onToggleForm}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          {showGoalForm ? "추가 닫기" : "+ 목표 추가"}
        </button>
      </div>

      {showGoalForm && (
        <div className="p-4 bg-gray-50 rounded-xl space-y-3">
          <input
            type="text"
            value={newGoalTitle}
            onChange={(e) => onGoalTitleChange(e.target.value)}
            placeholder="목표 제목"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <textarea
            value={newGoalDescription}
            onChange={(e) => onGoalDescriptionChange(e.target.value)}
            placeholder="목표 설명 (선택)"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
          />
          <button
            onClick={onAddGoal}
            className="w-full py-2 rounded-lg bg-black text-white font-semibold hover:bg-gray-800 transition-colors"
          >
            목표 저장하기
          </button>
        </div>
      )}

      {goals.length === 0 ? (
        <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-xl">
          아직 설정한 목표가 없습니다. 위의 버튼으로 첫 목표를 추가해보세요!
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {goals.map((goal) => {
              const research = getResearch(goal.id);
              const filledCount = [
                research.relatedLink,
                research.keywords,
                research.searchNotes,
                research.mainSummary,
              ].filter((value) => value && value.trim().length > 0).length;
              const progress = Math.round((filledCount / 4) * 100);

              return (
                <div
                  key={goal.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectGoal(goal.id)}
                  onKeyDown={(e) => e.key === "Enter" && onSelectGoal(goal.id)}
                  className={`p-4 text-left rounded-xl border-2 transition-colors cursor-pointer ${
                    selectedGoalId === goal.id
                      ? "border-black bg-gray-50"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {goal.title}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {progress}% 완료
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteGoal(goal.id);
                      }}
                      className="text-sm text-red-500 hover:text-red-600"
                    >
                      삭제
                    </button>
                  </div>
                  {goal.description && (
                    <p className="text-sm text-gray-600 mb-3">
                      {goal.description}
                    </p>
                  )}
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black transition-all"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedGoalId && (
            <GoalResearchPanel
              goal={goals.find((g) => g.id === selectedGoalId)}
              research={getResearch(selectedGoalId)}
              onChange={onResearchChange}
              onSave={onSaveResearch}
              onDelete={onDeleteGoal}
            />
          )}
        </>
      )}
    </div>
  );
};

interface GoalResearchPanelProps {
  goal?: {
    id: string;
    title: string;
    description?: string;
  };
  research: GoalResearchData;
  onChange: (
    goalId: string,
    field: keyof Omit<GoalResearchData, "awardedCount" | "lastSaved">,
    value: string
  ) => void;
  onSave: (goalId: string) => void;
  onDelete: (goalId: string) => void;
}

const fieldLabels: Record<
  keyof Omit<GoalResearchData, "awardedCount" | "lastSaved">,
  string
> = {
  relatedLink: "연관 링크",
  keywords: "키워드",
  searchNotes: "검색 기록 메모",
  mainSummary: "메인 정리",
};

const GoalResearchPanel: React.FC<GoalResearchPanelProps> = ({
  goal,
  research,
  onChange,
  onSave,
  onDelete,
}) => {
  if (!goal) {
    return null;
  }

  return (
    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{goal.title}</h3>
          {goal.description && (
            <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
          )}
        </div>
        <button
          onClick={() => onDelete(goal.id)}
          className="text-sm text-red-500 font-semibold hover:text-red-600"
        >
          목표 삭제
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {fieldLabels.relatedLink}
          </label>
          <input
            type="url"
            value={research.relatedLink}
            onChange={(e) => onChange(goal.id, "relatedLink", e.target.value)}
            placeholder="참고할 링크를 입력하세요"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {fieldLabels.keywords}
          </label>
          <input
            type="text"
            value={research.keywords}
            onChange={(e) => onChange(goal.id, "keywords", e.target.value)}
            placeholder="예: LLM, prompt engineering, AI design"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-gray-700">
            {fieldLabels.searchNotes}
          </label>
          <textarea
            value={research.searchNotes}
            onChange={(e) => onChange(goal.id, "searchNotes", e.target.value)}
            placeholder="검색했던 기록이나 메모를 자유롭게 작성하세요."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-gray-700">
            {fieldLabels.mainSummary}
          </label>
          <textarea
            value={research.mainSummary}
            onChange={(e) => onChange(goal.id, "mainSummary", e.target.value)}
            placeholder="검색을 통해 얻은 핵심 내용을 정리해보세요."
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="text-xs text-gray-500">
          {research.lastSaved
            ? `마지막 저장: ${new Date(research.lastSaved).toLocaleString(
                "ko-KR"
              )}`
            : "아직 저장하지 않았습니다."}
        </div>
        <button
          onClick={() => onSave(goal.id)}
          className="px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
        >
          저장하고 포인트 받기
        </button>
      </div>
    </div>
  );
};
