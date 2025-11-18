import { useState } from "react";
import { Link } from "react-router-dom";
import { useGoals } from "../hooks/useGoals";
import { Goal } from "../types/goal";

export const GoalsPage: React.FC = () => {
  const { goals, addGoal, updateGoal, deleteGoal, getChecksByGoal } = useGoals();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDescription, setNewGoalDescription] = useState("");

  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");

  const handleAddGoal = () => {
    if (newGoalTitle.trim()) {
      addGoal({
        title: newGoalTitle.trim(),
        description: newGoalDescription.trim(),
      });
      setNewGoalTitle("");
      setNewGoalDescription("");
      setShowAddForm(false);
    }
  };

  const handleCompleteGoal = (id: string) => {
    updateGoal(id, { status: "completed" });
  };

  const handleDeleteGoal = (id: string) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      deleteGoal(id);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-black mb-6">나의 목표</h1>

        {/* 추가 버튼 */}
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-3 bg-black text-white rounded-xl font-semibold mb-6 hover:bg-gray-800 transition-colors"
          >
            + 새 목표 추가하기
          </button>
        )}

        {/* 추가 폼 */}
        {showAddForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-semibold text-gray-800 mb-3">새 목표</h3>
            <input
              type="text"
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              placeholder="목표 제목"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
              onKeyPress={(e) => e.key === "Enter" && handleAddGoal()}
            />
            <textarea
              value={newGoalDescription}
              onChange={(e) => setNewGoalDescription(e.target.value)}
              placeholder="목표 설명 (선택사항)"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddGoal}
                className="flex-1 bg-gray-800 text-white py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                추가하기
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewGoalTitle("");
                  setNewGoalDescription("");
                }}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {/* 진행 중인 목표 */}
        {activeGoals.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              진행 중 ({activeGoals.length})
            </h2>
            <div className="space-y-3">
              {activeGoals.map((goal) => {
                const checks = getChecksByGoal(goal.id);
                return (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    checkCount={checks.length}
                    onComplete={() => handleCompleteGoal(goal.id)}
                    onDelete={() => handleDeleteGoal(goal.id)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* 완료된 목표 */}
        {completedGoals.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              완료됨 ({completedGoals.length})
            </h2>
            <div className="space-y-3">
              {completedGoals.map((goal) => {
                const checks = getChecksByGoal(goal.id);
                return (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    checkCount={checks.length}
                    onComplete={() => updateGoal(goal.id, { status: "active" })}
                    onDelete={() => handleDeleteGoal(goal.id)}
                    isCompleted
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* 빈 상태 */}
        {goals.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">아직 목표가 없습니다</p>
            <p className="text-sm">새 목표를 추가해보세요!</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface GoalCardProps {
  goal: Goal;
  checkCount: number;
  onComplete: () => void;
  onDelete: () => void;
  isCompleted?: boolean;
}

const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  checkCount,
  onComplete,
  onDelete,
  isCompleted = false,
}) => {
  return (
    <div
      className={`p-4 rounded-xl border-2 ${
        isCompleted
          ? "bg-gray-50 border-gray-200"
          : "bg-white border-gray-300 hover:border-gray-400"
      } transition-colors`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3
            className={`font-semibold mb-1 ${
              isCompleted ? "text-gray-500 line-through" : "text-gray-800"
            }`}
          >
            {goal.title}
          </h3>
          {goal.description && (
            <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
          )}
          <p className="text-xs text-gray-500">
            점검 횟수: {checkCount}회
          </p>
        </div>
        <button
          onClick={onDelete}
          className="text-red-500 hover:text-red-700 text-lg ml-2"
        >
          🗑️
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        <Link
          to={`/goals/${goal.id}/check`}
          className="flex-1 py-2 bg-black text-white rounded-lg text-center text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          {isCompleted ? "다시 시작" : "점검하기"}
        </Link>
        {!isCompleted && (
          <button
            onClick={onComplete}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
          >
            완료
          </button>
        )}
      </div>
    </div>
  );
};

