import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plus, Search, Menu, Cpu, Bell, CheckCircle2, Sparkles, Database } from "lucide-react";
import { Button } from "../common/Button";

export function Header({
  currentView,
  onOpenCreatePost,
  onToggleSidebar,
  automationStatus = "Running",
  recordCount = 47,
  isBackendConnected = true,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const titles = {
    "/": "Overview & Operations",
    "/studio": "AI Creation Studio",
    "/posts": "Content Feed & Posts",
    "/calendar": "Editorial Calendar",
    "/queue": "Publishing Queue",
    "/accounts": "Connected Accounts",
    "/campaigns": "Campaign Management",
    "/analytics": "Performance Analytics",
    "/automation": "Node.js Automation Daemon",
    "/logs": "Operational Activity Logs",
    "/settings": "Platform Settings",
  };

  const activeTitle =
    titles[location.pathname] ||
    titles[`/${currentView}`] ||
    titles[currentView] ||
    "SocialOps Operations";

  return (
    <header className="sticky top-0 z-30 h-14 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile menu toggle & page title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="md:hidden text-slate-500 hover:text-slate-700 p-1.5 rounded-md hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            SocialOps /
          </span>
          <h1 className="text-sm md:text-base font-semibold text-slate-900 tracking-tight">
            {activeTitle}
          </h1>
        </div>
      </div>

      {/* Center: Search input */}
      <div className="hidden lg:flex items-center max-w-xs w-full">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search posts, logs, accounts... (Cmd+K)"
            className="h-8 w-full pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-300 focus:bg-white text-slate-800 placeholder:text-slate-400 transition-colors"
          />
        </div>
      </div>

      {/* Right: Live Status & CTAs */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Subtle Database Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-xs text-slate-600">
          <Database className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] font-mono text-slate-700">
            {recordCount} Records
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
        </div>

        {/* AI Studio Fast Navigation CTA */}
        <button
          type="button"
          onClick={() => navigate("/studio")}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-violet-600" />
          <span className="hidden md:inline">AI Studio</span>
        </button>

        {/* Create Post Action Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={onOpenCreatePost}
          icon={Plus}
          className="text-xs"
        >
          <span className="hidden sm:inline">Create Post</span>
        </Button>
      </div>
    </header>
  );
}
