import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGoals } from "../hooks/useGoals";
import { usePoints } from "../hooks/usePoints";
import { UserTopic } from "../types/topic";

interface TopicManagePageProps {
  userTopics: UserTopic[];
  onUpdateUserTopic: (id: string, updates: Partial<UserTopic>) => void;
}

interface GoalResearchData {
  relatedLink: string;
  keywords: string;
  searchNotes: string;
  mainSummary: string;
  awardedCount: number;
  lastSaved?: number;
  history?: Array<{
    timestamp: number;
    data: Omit<GoalResearchData, "awardedCount" | "lastSaved" | "history">;
  }>;
}

const RESEARCH_STORAGE_KEY = "goal_research";
const POINTS_PER_RESEARCH_FIELD = 30;
const emptyResearch: Omit<GoalResearchData, "history"> = {
  relatedLink: "",
  keywords: "",
  searchNotes: "",
  mainSummary: "",
  awardedCount: 0,
};

export const TopicManagePage: React.FC<TopicManagePageProps> = ({
  userTopics,
  onUpdateUserTopic,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addGoal, updateGoal, getGoal } = useGoals();
  const { earnPoints } = usePoints();

  const topic = useMemo(
    () => userTopics.find((t) => t.id === id),
    [userTopics, id]
  );

  const [goalTitle, setGoalTitle] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [research, setResearch] = useState<Omit<GoalResearchData, "history">>({
    ...emptyResearch,
  });
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!topic) {
      navigate("/topics");
      return;
    }

    // 목표 정보 로드
    if (topic.goalId) {
      const goal = getGoal(topic.goalId);
      if (goal) {
        setGoalTitle(goal.title);
        setGoalDescription(goal.description || "");
      }
    } else {
      setGoalTitle("");
      setGoalDescription("");
    }

    // 연구 데이터 로드
    if (topic.goalId) {
      const stored = localStorage.getItem(RESEARCH_STORAGE_KEY);
      if (stored) {
        try {
          const researchMap: Record<string, GoalResearchData> =
            JSON.parse(stored);
          const topicResearch = researchMap[topic.goalId];
          if (topicResearch) {
            setResearch({
              relatedLink: topicResearch.relatedLink || "",
              keywords: topicResearch.keywords || "",
              searchNotes: topicResearch.searchNotes || "",
              mainSummary: topicResearch.mainSummary || "",
              awardedCount: topicResearch.awardedCount || 0,
              lastSaved: topicResearch.lastSaved,
            });
          }
        } catch (error) {
          console.error("Failed to load research data", error);
        }
      }
    }
  }, [topic, getGoal, navigate]);

  const handleSaveGoal = () => {
    if (!topic) return;

    if (!goalTitle.trim()) {
      alert("목표 제목을 입력해주세요.");
      return;
    }

    if (topic.goalId) {
      // 기존 목표 업데이트
      updateGoal(topic.goalId, {
        title: goalTitle.trim(),
        description: goalDescription.trim(),
      });
    } else {
      // 새 목표 생성
      const newGoal = addGoal({
        title: goalTitle.trim(),
        description: goalDescription.trim(),
        topicId: topic.id,
      });
      onUpdateUserTopic(topic.id, { goalId: newGoal.id });
    }
    alert("목표가 저장되었습니다!");
  };

  const handleResearchChange = (
    field: keyof Omit<
      GoalResearchData,
      "awardedCount" | "lastSaved" | "history"
    >,
    value: string
  ) => {
    setResearch((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveResearch = () => {
    if (!topic || !topic.goalId) {
      alert("먼저 목표를 저장해주세요.");
      return;
    }

    const filledCount = [
      research.relatedLink,
      research.keywords,
      research.searchNotes,
      research.mainSummary,
    ].filter((value) => value && value.trim().length > 0).length;

    const additional = Math.max(filledCount - (research.awardedCount || 0), 0);

    // 히스토리에 현재 상태 저장
    const stored = localStorage.getItem(RESEARCH_STORAGE_KEY);
    let researchMap: Record<string, GoalResearchData> = {};
    if (stored) {
      try {
        researchMap = JSON.parse(stored);
      } catch (error) {
        console.error("Failed to parse research data", error);
      }
    }

    const currentHistory = researchMap[topic.goalId]?.history || [];
    const newHistoryEntry = {
      timestamp: Date.now(),
      data: {
        relatedLink: research.relatedLink,
        keywords: research.keywords,
        searchNotes: research.searchNotes,
        mainSummary: research.mainSummary,
      },
    };

    const updatedResearch: GoalResearchData = {
      ...research,
      awardedCount: filledCount,
      lastSaved: Date.now(),
      history: [newHistoryEntry, ...currentHistory].slice(0, 10), // 최근 10개만 저장
    };

    researchMap[topic.goalId] = updatedResearch;
    localStorage.setItem(RESEARCH_STORAGE_KEY, JSON.stringify(researchMap));

    if (additional > 0) {
      const earned = additional * POINTS_PER_RESEARCH_FIELD;
      earnPoints(earned, `"${topic.name}" 연구 정리`);
      alert(`연구 내용을 저장했어요! ${earned} 포인트 획득 🎉`);
    } else {
      alert("연구 내용이 저장되었습니다!");
    }

    setResearch(updatedResearch);
  };

  const filledCount = useMemo(() => {
    return [
      research.relatedLink,
      research.keywords,
      research.searchNotes,
      research.mainSummary,
    ].filter((value) => value && value.trim().length > 0).length;
  }, [research]);

  const progress = useMemo(() => {
    return Math.round((filledCount / 4) * 100);
  }, [filledCount]);

  if (!topic) {
    return null;
  }

  const researchHistory = (() => {
    const stored = localStorage.getItem(RESEARCH_STORAGE_KEY);
    if (stored && topic.goalId) {
      try {
        const researchMap: Record<string, GoalResearchData> =
          JSON.parse(stored);
        return researchMap[topic.goalId]?.history || [];
      } catch {
        return [];
      }
    }
    return [];
  })();

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/topics")}
            className="text-gray-700 text-xl"
          >
            ←
          </button>
          <h1 className="text-xl font-bold text-black">주제 관리</h1>
          <div className="w-8" />
        </div>

        {/* Topic Info */}
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{topic.icon}</span>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">
                {topic.name}
              </h2>
              <p className="text-sm text-gray-500">
                생성일: {new Date(topic.createdAt).toLocaleDateString("ko-KR")}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">작성 진행도</p>
              <p className="text-lg font-bold text-gray-900">
                {filledCount}/4 필드 작성됨
              </p>
            </div>
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-black transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          {research.lastSaved && (
            <p className="text-xs text-gray-500 mt-2">
              마지막 저장:{" "}
              {new Date(research.lastSaved).toLocaleString("ko-KR")}
            </p>
          )}
        </div>

        {/* Goal Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">목표 설정</h3>
          <div className="p-4 bg-gray-50 rounded-xl space-y-3">
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
            <button
              onClick={handleSaveGoal}
              className="w-full py-2 rounded-lg bg-black text-white font-semibold hover:bg-gray-800 transition-colors"
            >
              목표 저장하기
            </button>
          </div>
        </div>

        {/* Research Section */}
        {topic.goalId && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">검색 기록</h3>
              {researchHistory.length > 0 && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  {showHistory ? "기록 닫기" : "이전 기록 보기"}
                </button>
              )}
            </div>

            {showHistory && researchHistory.length > 0 && (
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-3 max-h-60 overflow-y-auto">
                <h4 className="text-sm font-semibold text-gray-900">
                  저장 기록 ({researchHistory.length}개)
                </h4>
                {researchHistory.map((entry, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-lg border border-blue-100"
                  >
                    <p className="text-xs text-gray-500 mb-2">
                      {new Date(entry.timestamp).toLocaleString("ko-KR")}
                    </p>
                    <div className="space-y-1 text-sm text-gray-700">
                      {entry.data.relatedLink && (
                        <p>
                          <span className="font-medium">링크:</span>{" "}
                          {entry.data.relatedLink}
                        </p>
                      )}
                      {entry.data.keywords && (
                        <p>
                          <span className="font-medium">키워드:</span>{" "}
                          {entry.data.keywords}
                        </p>
                      )}
                      {entry.data.searchNotes && (
                        <p>
                          <span className="font-medium">메모:</span>{" "}
                          {entry.data.searchNotes.substring(0, 100)}
                          {entry.data.searchNotes.length > 100 && "..."}
                        </p>
                      )}
                      {entry.data.mainSummary && (
                        <p>
                          <span className="font-medium">정리:</span>{" "}
                          {entry.data.mainSummary.substring(0, 100)}
                          {entry.data.mainSummary.length > 100 && "..."}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="p-4 bg-gray-50 rounded-xl space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  연관 링크
                </label>
                <input
                  type="url"
                  value={research.relatedLink}
                  onChange={(e) =>
                    handleResearchChange("relatedLink", e.target.value)
                  }
                  placeholder="참고할 링크를 입력하세요"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  키워드
                </label>
                <input
                  type="text"
                  value={research.keywords}
                  onChange={(e) =>
                    handleResearchChange("keywords", e.target.value)
                  }
                  placeholder="예: LLM, prompt engineering, AI design"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  검색 기록 메모
                </label>
                <textarea
                  value={research.searchNotes}
                  onChange={(e) =>
                    handleResearchChange("searchNotes", e.target.value)
                  }
                  placeholder="검색했던 기록이나 메모를 자유롭게 작성하세요."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  메인 정리
                </label>
                <textarea
                  value={research.mainSummary}
                  onChange={(e) =>
                    handleResearchChange("mainSummary", e.target.value)
                  }
                  placeholder="검색을 통해 얻은 핵심 내용을 정리해보세요."
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
                />
              </div>
              <button
                onClick={handleSaveResearch}
                className="w-full py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
              >
                저장하고 포인트 받기
              </button>
            </div>
          </div>
        )}

        {!topic.goalId && (
          <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200 text-center">
            <p className="text-sm text-gray-700">
              목표를 먼저 저장하면 검색 기록을 작성할 수 있어요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
