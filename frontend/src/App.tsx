import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TopicSelection } from "./components/TopicSelection";
import { Navigation } from "./components/Navigation";
import { ShopPage } from "./pages/ShopPage";
import { HomePage } from "./pages/HomePage";
import { Sidebar } from "./components/Sidebar";
import { TopicPage } from "./pages/TopicPage";
import { TopicManagePage } from "./pages/TopicManagePage";
import { UserTopic } from "./types/topic";

const USER_TOPICS_KEY = "user_topics";

function App() {
  const [userTopics, setUserTopics] = useState<UserTopic[]>(() => {
    const stored = localStorage.getItem(USER_TOPICS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error("Failed to parse stored user topics", error);
      }
    }
    return [];
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(USER_TOPICS_KEY, JSON.stringify(userTopics));
  }, [userTopics]);

  const handleAddUserTopic = (topic: UserTopic) => {
    setUserTopics((prev) => [...prev, topic]);
  };

  const handleDeleteUserTopic = (id: string) => {
    setUserTopics((prev) => prev.filter((topic) => topic.id !== id));
  };

  const handleUpdateUserTopic = (id: string, updates: Partial<UserTopic>) => {
    setUserTopics((prev) =>
      prev.map((topic) => (topic.id === id ? { ...topic, ...updates } : topic))
    );
  };

  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/topics"
            element={
              <TopicPage
                userTopics={userTopics}
                onDeleteUserTopic={handleDeleteUserTopic}
                onOpenSidebar={() => setIsSidebarOpen(true)}
              />
            }
          />
          <Route
            path="/topics/select"
            element={
              <TopicSelection
                userTopics={userTopics}
                onAddUserTopic={handleAddUserTopic}
                onDeleteUserTopic={handleDeleteUserTopic}
                onOpenSidebar={() => setIsSidebarOpen(true)}
              />
            }
          />
          <Route path="/shop" element={<ShopPage />} />
          <Route
            path="/topics/:id/manage"
            element={
              <TopicManagePage
                userTopics={userTopics}
                onUpdateUserTopic={handleUpdateUserTopic}
              />
            }
          />
        </Routes>
        <Navigation />
        <button
          onClick={() => setIsSidebarOpen(true)}
          aria-label="내 주제 사이드바 열기"
          className="bottom-24 right-4 z-40 flex items-center gap-2 px-4 py-3 rounded-2xl bg-black text-white shadow-lg hover:bg-gray-800 transition-colors"
        >
          <span className="text-lg">📂</span>
          <span className="text-sm font-semibold">내 주제</span>
        </button>
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          userTopics={userTopics}
          onDeleteUserTopic={handleDeleteUserTopic}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
