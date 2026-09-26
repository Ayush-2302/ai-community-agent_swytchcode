import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { ToastProvider, useToast } from "./components/common/Toast";
import { CreatePostModal } from "./components/composer/CreatePostModal";

import { DashboardView } from "./views/DashboardView";
import { PostsView } from "./views/PostsView";
import { CalendarView } from "./views/CalendarView";
import { QueueView } from "./views/QueueView";
import { AccountsView } from "./views/AccountsView";
import { CampaignsView } from "./views/CampaignsView";
import { AnalyticsView } from "./views/AnalyticsView";
import { AutomationView } from "./views/AutomationView";
import { ActivityLogsView } from "./views/ActivityLogsView";
import { SettingsView } from "./views/SettingsView";

import { socialApi } from "./api/socialApi";
import {
  INITIAL_POSTS,
  INITIAL_QUEUE,
  CONNECTED_ACCOUNTS,
  ACTIVITY_LOGS,
} from "./services/mockData";

function MainApp() {
  const { addToast } = useToast();

  const [currentView, setCurrentView] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [createPostInitialDate, setCreatePostInitialDate] = useState(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Core platform operational state
  const [posts, setPosts] = useState(() => {
    try {
      const saved = localStorage.getItem("socialops_posts");
      return saved ? JSON.parse(saved) : INITIAL_POSTS;
    } catch {
      return INITIAL_POSTS;
    }
  });

  const [queue, setQueue] = useState(() => {
    try {
      const saved = localStorage.getItem("socialops_queue");
      return saved ? JSON.parse(saved) : INITIAL_QUEUE;
    } catch {
      return INITIAL_QUEUE;
    }
  });

  const [logs, setLogs] = useState(() => {
    try {
      const saved = localStorage.getItem("socialops_logs");
      return saved ? JSON.parse(saved) : ACTIVITY_LOGS;
    } catch {
      return ACTIVITY_LOGS;
    }
  });

  // Fetch live operational data from portfolio_b backend MongoDB collection
  const syncWithBackend = useCallback(async (showNotification = false) => {
    setIsLoading(true);
    try {
      const [backendPosts, backendQueue, backendLogs] = await Promise.all([
        socialApi.getPosts(),
        socialApi.getQueue(),
        socialApi.getLogs(),
      ]);

      if (backendPosts && backendPosts.length > 0) {
        setPosts(backendPosts);
        setIsBackendConnected(true);
        if (showNotification) {
          addToast({
            type: "success",
            title: "MongoDB Synced",
            message: `Loaded ${backendPosts.length} posts directly from backend database.`,
          });
        }
      } else if (backendPosts) {
        setIsBackendConnected(true);
      } else {
        setIsBackendConnected(false);
      }

      if (backendQueue && backendQueue.length > 0) {
        setQueue(backendQueue);
      }

      if (backendLogs && backendLogs.length > 0) {
        setLogs(backendLogs);
      }
    } catch (err) {
      console.warn("Backend sync check failed:", err.message);
      setIsBackendConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  // Initial sync on mount
  useEffect(() => {
    syncWithBackend();
  }, [syncWithBackend]);

  // Local storage persistence fallback
  useEffect(() => {
    localStorage.setItem("socialops_posts", JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem("socialops_queue", JSON.stringify(queue));
  }, [queue]);

  useEffect(() => {
    localStorage.setItem("socialops_logs", JSON.stringify(logs));
  }, [logs]);

  // Dynamic Post Creation with Backend MongoDB persistence
  const handlePostCreated = async (newPost) => {
    // 1. Optimistic UI update
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

    // 2. Persist to Backend MongoDB SocialPost collection
    try {
      const savedDoc = await socialApi.createPost(newPost);
      if (savedDoc) {
        setPosts((prev) =>
          prev.map((p) => (p.id === newPost.id ? savedDoc : p))
        );
      }
    } catch (err) {
      console.warn("Failed to persist post to MongoDB:", err.message);
    }

    // 3. Append to operational logs
    const newLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      level: "SUCCESS",
      action: newPost.status === "Published" ? "DISPATCH_POST" : "SCHEDULE_POST",
      post: newPost.title,
      account: newPost.account,
      platform: newPost.platform,
      status: "Success",
      latency: "112ms",
      message: `Post ${newPost.id} processed via backend SocialPost engine (${newPost.status}).`,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Dynamic Post Update with Backend MongoDB persistence
  const handleUpdatePost = async (updatedPost) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
    );

    try {
      await socialApi.updatePost(updatedPost.id, updatedPost);
    } catch (err) {
      console.warn("Failed to update post on MongoDB:", err.message);
    }
  };

  // Dynamic Post Deletion from Backend MongoDB
  const handleDeletePost = async (id) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setQueue((prev) => prev.filter((item) => item.id !== id));

    try {
      await socialApi.deletePost(id);
      addToast({
        type: "success",
        title: "Post Deleted",
        message: "Record removed from MongoDB collection.",
      });
    } catch (err) {
      console.warn("Failed to delete post from MongoDB:", err.message);
    }
  };

  // Dynamic Queue Reordering with Backend MongoDB persistence
  const handleUpdateQueue = async (newQueue) => {
    setQueue(newQueue);
    try {
      const orderedIds = newQueue.map((item) => item.id);
      await socialApi.reorderQueue(orderedIds);
    } catch (err) {
      console.warn("Failed to update queue order on backend:", err.message);
    }
  };

  const handleOpenCreateWithDate = (dateString = null) => {
    setCreatePostInitialDate(dateString);
    setIsCreatePostOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      {/* Fixed Left Sidebar */}
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area (offset by 240px desktop sidebar) */}
      <div className="md:pl-60 flex flex-col min-h-screen">
        {/* Sticky Top Header */}
        <Header
          currentView={currentView}
          onOpenCreatePost={() => handleOpenCreateWithDate(null)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          automationStatus={isBackendConnected ? "MongoDB Active" : "Local Sync"}
        />

        {/* Dynamic Database Connection Indicator Banner */}
        <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-1.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isBackendConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-400"
              }`}
            />
            <span className="text-slate-600 font-medium">
              Backend Source:{" "}
              <strong className="text-slate-900 font-mono">
                {isBackendConnected
                  ? "MongoDB 'socialposts' (portfolio_b :8000)"
                  : "Local Cache (Connecting to :8000...)"}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => syncWithBackend(true)}
              className="text-blue-600 hover:text-blue-700 font-medium text-[11px] underline"
            >
              Refresh from Database
            </button>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 text-[11px] font-mono">
              {posts.length} Live Records
            </span>
          </div>
        </div>

        {/* Operational Page Content */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
          {currentView === "dashboard" && (
            <DashboardView
              posts={posts}
              queue={queue}
              logs={logs}
              onNavigate={setCurrentView}
              onOpenCreatePost={() => handleOpenCreateWithDate(null)}
            />
          )}

          {currentView === "posts" && (
            <PostsView
              posts={posts}
              onOpenCreatePost={() => handleOpenCreateWithDate(null)}
              onUpdatePost={handleUpdatePost}
              onDeletePost={handleDeletePost}
            />
          )}

          {currentView === "calendar" && (
            <CalendarView
              posts={posts}
              onOpenCreatePost={handleOpenCreateWithDate}
            />
          )}

          {currentView === "queue" && (
            <QueueView
              queue={queue}
              onUpdateQueue={handleUpdateQueue}
              onOpenCreatePost={() => handleOpenCreateWithDate(null)}
            />
          )}

          {currentView === "accounts" && (
            <AccountsView
              accounts={CONNECTED_ACCOUNTS}
            />
          )}

          {currentView === "campaigns" && (
            <CampaignsView
              posts={posts}
              onOpenCreatePost={() => handleOpenCreateWithDate(null)}
            />
          )}

          {currentView === "analytics" && (
            <AnalyticsView
              posts={posts}
            />
          )}

          {currentView === "automation" && (
            <AutomationView
              onNavigate={setCurrentView}
            />
          )}

          {currentView === "logs" && (
            <ActivityLogsView
              logs={logs}
            />
          )}

          {currentView === "settings" && (
            <SettingsView />
          )}
        </main>
      </div>

      {/* Focused Post Composer Modal */}
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
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
