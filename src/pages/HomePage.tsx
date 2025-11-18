import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePoints } from "../hooks/usePoints";

export const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { addSearchPoint } = usePoints();
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      return;
    }
    const query = searchQuery.trim();
    const searchLink = `https://www.google.com/search?q=${encodeURIComponent(
      query
    )}`;
    window.open(searchLink, "_blank");
    addSearchPoint(query);
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-white pb-20 flex flex-col">
      <header className="px-5 pt-8 pb-10 bg-gradient-to-b from-gray-900 to-gray-800 text-white rounded-b-[32px] shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <h1 className="text-3xl font-bold leading-snug">
            오늘의 호기심을
            <br />
            선호 주제와 함께 채워보세요.
          </h1>
          <p className="text-sm uppercase text-gray-400 sm:text-right ">
            상우 선희 규범 승식 웨린 더파
          </p>
        </div>
        <p className="text-sm text-gray-300 mb-6">
          관심 주제를 고르고 목표를 설정하면, 검색 기록을 기반으로 포인트를 모아
          상점에서 사용할 수 있어요.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/topics/select")}
            className="w-full sm:w-auto px-6 py-3 bg-white text-gray-900 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
          >
            선호 주제 고르기
          </button>
          <Link
            to="/shop"
            className="w-full sm:w-auto px-6 py-3 border border-white/40 text-white rounded-2xl font-semibold text-center hover:bg-white/10 transition-colors"
          >
            상점 둘러보기
          </Link>
        </div>
      </header>

      <main className="flex-1 px-5 py-8 space-y-10">
        <section>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                주제 검색하기
              </h2>
              <span className="text-xs text-gray-500">
                원하는 키워드로 즉시 찾아보세요
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="예: 생성형 AI, 디자인 시스템, LLM 프롬프트"
                className="flex-1 px-5 py-3 border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
              <button
                onClick={handleSearch}
                className="w-full sm:w-auto px-6 py-3 bg-gray-900 text-white rounded-2xl font-semibold hover:bg-black transition-colors"
              >
                검색
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              지금 시작해볼까요?
            </h2>
            <Link
              to="/topics"
              className="text-sm text-gray-500 hover:text-gray-800 font-medium"
            >
              전체 보기 →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <article className="p-4 rounded-2xl border border-gray-100 shadow-sm bg-white">
              <span className="text-3xl mb-3 block">🗂️</span>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                선호 주제 관리
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                TopicCard를 통해 관심 있는 분야만 골라 탐색하고 정리할 수
                있어요.
              </p>
              <button
                onClick={() => navigate("/topics/select")}
                className="text-sm font-semibold text-gray-900"
              >
                선호 주제 선택하기 →
              </button>
            </article>
            <article className="p-4 rounded-2xl border border-gray-100 shadow-sm bg-white">
              <span className="text-3xl mb-3 block">🎁</span>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                포인트 모아서 보상받기
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                목표를 설정하고 검색 기록을 채우면 활동량에 맞게 포인트를
                드려요.
              </p>
              <Link to="/shop" className="text-sm font-semibold text-gray-900">
                상점 바로가기 →
              </Link>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
};
