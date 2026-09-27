import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { RefreshCw, Database } from "lucide-react";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { ToastProvider, useToast } from "./components/common/Toast";
import { CreatePostModal } from "./components/composer/CreatePostModal";

import { DashboardView } from "./views/DashboardView";
import { AiStudioView } from "./views/AiStudioView";
import { PostsView } from "./views/PostsView";
import { CalendarView } from "./views/CalendarView";
import { QueueView } from "./views/QueueView";
import { AccountsView } from "./views/AccountsView";
import { CampaignsView } from "./views/CampaignsView";
import { AnalyticsView } from "./views/AnalyticsView";
import { AutomationView } from "./views/AutomationView";
import { ActivityLogsView } from "./views/ActivityLogsView";
import { SettingsView } from "./views/SettingsView";
import { DesignSystemView } from "./views/DesignSystemView";

import { socialApi, normalizePost } from "./api/socialApi";

function MainApp() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [createPostInitialDate, setCreatePostInitialDate] = useState(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Core platform operational state from live MongoDB
  const [posts, setPosts] = useState(() => {
    try {
      const saved = localStorage.getItem("socialops_posts");
      if (saved && !saved.includes("post_101") && !saved.includes("Acme Engineering")) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.map(normalizePost) : [];
      }
      return [];
    } catch {
      return [];
    }
  });

  const [queue, setQueue] = useState(() => {
    try {
      const saved = localStorage.getItem("socialops_queue");
      if (saved && !saved.includes("post_101")) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.map(normalizePost) : [];
      }
      return [];
    } catch {
      return [];
    }
  });

  const [logs, setLogs] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  // Clear stale mock data from previous sessions
  useEffect(() => {
    try {
      const saved = localStorage.getItem("socialops_posts");
      if (saved && (saved.includes("post_101") || saved.includes("Acme Engineering"))) {
        localStorage.removeItem("socialops_posts");
        localStorage.removeItem("socialops_queue");
        localStorage.removeItem("socialops_logs");
      }
    } catch {
      // ignore
    }
  }, []);

  // Primary data sync from backend MongoDB
  const syncWithBackend = useCallback(async (isManual = false) => {
    if (isManual) setIsLoading(true);
    try {
      const [fetchedPosts, fetchedQueue, fetchedLogs, fetchedAccounts, fetchedCampaigns, fetchedAnalytics] =
        await Promise.allSettled([
          socialApi.getPosts(),
          socialApi.getQueue(),
          socialApi.getLogs(),
          socialApi.getAccounts(),
          socialApi.getCampaigns(),
          socialApi.getAnalytics(),
        ]);

      let hasBackendData = false;

      if (fetchedPosts.status === "fulfilled" && fetchedPosts.value && fetchedPosts.value.length > 0) {
        setPosts(fetchedPosts.value);
        hasBackendData = true;
      }

      if (fetchedQueue.status === "fulfilled" && fetchedQueue.value) {
        setQueue(fetchedQueue.value);
      }

      if (fetchedLogs.status === "fulfilled" && fetchedLogs.value) {
        setLogs(fetchedLogs.value);
      }

      if (fetchedAccounts.status === "fulfilled" && fetchedAccounts.value) {
        setAccounts(fetchedAccounts.value);
      }

      if (fetchedCampaigns.status === "fulfilled" && fetchedCampaigns.value) {
        setCampaigns(fetchedCampaigns.value);
      }

      if (fetchedAnalytics.status === "fulfilled" && fetchedAnalytics.value) {
        setAnalytics(fetchedAnalytics.value);
      }

      setIsBackendConnected(hasBackendData);

      if (isManual) {
        addToast({
          type: "success",
          title: "Database Synchronized",
          message: `Loaded ${fetchedPosts.value?.length || posts.length} posts from MongoDB Atlas.`,
        });
      }
    } catch (err) {
      console.warn("Backend sync failed:", err.message);
      setIsBackendConnected(false);
      if (isManual) {
        addToast({
          type: "error",
          title: "Sync Error",
          message: "Could not refresh from MongoDB. Check backend port 3000.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [addToast, posts.length]);

  // Initial load
  useEffect(() => {
    syncWithBackend(false);
  }, [syncWithBackend]);

  // Local storage persistence
  useEffect(() => {
    if (posts && posts.length > 0) {
      localStorage.setItem("socialops_posts", JSON.stringify(posts));
    }
  }, [posts]);

  useEffect(() => {
    if (queue && queue.length > 0) {
      localStorage.setItem("socialops_queue", JSON.stringify(queue));
    }
  }, [queue]);

  // Post creation handler
  const handlePostCreated = async (newPost) => {
    setPosts((prev) => [newPost, ...prev]);

    if (newPost.status === "Scheduled") {
      const newQueueItem = {
        queueOrder: queue.length + 1,
        id: newPost.id,
        title: newPost.title,
        platform: newPost.platform,
        account: newPost.account,
        publishTime: new Date(newPost.scheduledAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        timeRemaining: "Scheduled",
        status: newPost.status,
      };
      setQueue((prev) => [...prev, newQueueItem]);
    }

    try {
      const savedDoc = await socialApi.createPost(newPost);
      if (savedDoc) {
        setPosts((prev) => prev.map((p) => (p.id === newPost.id ? savedDoc : p)));
      }
    } catch (err) {
      console.warn("Failed to persist post to MongoDB:", err.message);
    }
  };

  const handleUpdatePost = (updatedPost) => {
    setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
  };

  const handleDeletePost = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleUpdateQueue = (newQueue) => {
    setQueue(newQueue);
  };

  const handleOpenCreateWithDate = (dateStr) => {
    setCreatePostInitialDate(dateStr);
    setIsCreatePostOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 antialiased font-sans">
      {/* Primary Sidebar with clean routing navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        counts={{
          posts: posts.length,
          queue: queue.length,
          accounts: accounts.length,
        }}
      />

      {/* Main Content Area (offset by 240px desktop sidebar) */}
      <div className="md:pl-60 flex flex-col min-h-screen flex-1 w-full overflow-x-hidden">
        {/* Sleek Top Header */}
        <Header
          onOpenCreatePost={() => handleOpenCreateWithDate(null)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          automationStatus={isBackendConnected ? "MongoDB Active" : "Local Sync"}
          recordCount={posts.length}
          isBackendConnected={isBackendConnected}
        />

        {/* Operational Page Routing */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
          <Routes>
            <Route
              path="/"
              element={
                <DashboardView
                  posts={posts}
                  queue={queue}
                  logs={logs}
                  onNavigate={(view) => navigate(view === "dashboard" ? "/" : `/${view}`)}
                  onOpenCreatePost={() => handleOpenCreateWithDate(null)}
                />
              }
            />

            {/* Brand New Clean AI Creation Studio */}
            <Route
              path="/studio"
              element={<AiStudioView onPostCreated={handlePostCreated} />}
            />

            <Route
              path="/posts"
              element={
                <PostsView
                  posts={posts}
                  onOpenCreatePost={() => handleOpenCreateWithDate(null)}
                  onUpdatePost={handleUpdatePost}
                  onDeletePost={handleDeletePost}
                />
              }
            />

            <Route
              path="/queue"
              element={
                <QueueView
                  queue={queue}
                  onUpdateQueue={handleUpdateQueue}
                  onOpenCreatePost={() => handleOpenCreateWithDate(null)}
                />
              }
            />

            <Route
              path="/calendar"
              element={
                <CalendarView
                  posts={posts}
                  onOpenCreatePost={handleOpenCreateWithDate}
                />
              }
            />

            <Route
              path="/accounts"
              element={
                <AccountsView
                  accounts={accounts}
                  onRefresh={() => syncWithBackend(true)}
                />
              }
            />

            <Route
              path="/campaigns"
              element={
                <CampaignsView
                  posts={posts}
                  campaigns={campaigns}
                  onOpenCreatePost={() => handleOpenCreateWithDate(null)}
                />
              }
            />

            <Route
              path="/analytics"
              element={
                <AnalyticsView
                  posts={posts}
                  analytics={analytics}
                />
              }
            />

            <Route
              path="/automation"
              element={
                <AutomationView
                  onNavigate={(view) => navigate(view === "dashboard" ? "/" : `/${view}`)}
                />
              }
            />

            <Route
              path="/logs"
              element={
                <ActivityLogsView
                  logs={logs}
                  onRefresh={() => syncWithBackend(true)}
                />
              }
            />

            <Route path="/settings" element={<SettingsView />} />
            <Route path="/design-system" element={<DesignSystemView />} />

            {/* Fallback to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Quick Focused Post Composer Modal */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onPostCreated={handlePostCreated}
        initialDate={createPostInitialDate}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </BrowserRouter>
  );
}
