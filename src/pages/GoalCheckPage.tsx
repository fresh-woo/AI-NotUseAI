import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGoals } from "../hooks/useGoals";
import { usePoints } from "../hooks/usePoints";

export const GoalCheckPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getGoal, addCheck, getChecksByGoal } = useGoals();
  const { addCheckPoint } = usePoints();

  const [content, setContent] = useState("");
  const [rating, setRating] = useState(3);

  const goal = id ? getGoal(id) : null;
  const checks = id ? getChecksByGoal(id) : [];

  useEffect(() => {
    if (!goal) {
      navigate("/goals");
    }
  }, [goal, navigate]);

  if (!goal) {
    return null;
  }

  const handleSubmit = () => {
    if (content.trim() && id) {
      const check = addCheck({
        goalId: id,
        content: content.trim(),
        rating,
      });

      // 포인트 지급
      addCheckPoint(id, rating);

      alert(`점검이 완료되었습니다!\n획득 포인트: ${50 + (rating - 3) * 10}점`);
      navigate("/goals");
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="px-4 py-6">
        {/* 헤더 */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/goals")}
            className="text-gray-700 text-xl mb-4"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold text-black mb-2">{goal.title}</h1>
          {goal.description && (
            <p className="text-gray-600">{goal.description}</p>
          )}
        </div>

        {/* 점검 기록 */}
        {checks.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              이전 점검 기록 ({checks.length})
            </h2>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {checks.map((check) => (
                <div
                  key={check.id}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">
                      {new Date(check.checkDate).toLocaleDateString("ko-KR")}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">
                        {"⭐".repeat(check.rating)}
                      </span>
                      <span className="text-xs text-gray-600">
                        {check.rating}/5
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{check.content}</p>
                  {check.pointsEarned > 0 && (
                    <p className="text-xs text-yellow-600 mt-1">
                      +{check.pointsEarned} 포인트
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 점검 폼 */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h2 className="font-semibold text-gray-800 mb-4">오늘의 점검</h2>

          {/* 평가 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              얼마나 잘 알아봤나요? ({rating}/5)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-3xl transition-transform hover:scale-110 ${
                    star <= rating ? "text-yellow-500" : "text-gray-300"
                  }`}
                >
                  ⭐
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {rating <= 2 && "조금 더 노력해봐요! 💪"}
              {rating === 3 && "괜찮아요! 👍"}
              {rating >= 4 && "훌륭해요! 🎉"}
            </p>
          </div>

          {/* 내용 입력 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              오늘 무엇을 배웠나요?
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="예: 오늘은 React Router에 대해 배웠습니다. 라우팅의 기본 개념과 useNavigate, useParams 같은 훅들을 사용하는 방법을 익혔습니다."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
            />
          </div>

          {/* 포인트 정보 */}
          <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">획득 예상 포인트:</span>{" "}
              {50 + (rating - 3) * 10}점
            </p>
            <p className="text-xs text-gray-500 mt-1">
              기본 50점 + 평가 보너스 {Math.max((rating - 3) * 10, 0)}점
            </p>
          </div>

          {/* 제출 버튼 */}
          <button
            onClick={handleSubmit}
            disabled={!content.trim()}
            className="w-full py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            점검 완료하기
          </button>
        </div>
      </div>
    </div>
  );
};

