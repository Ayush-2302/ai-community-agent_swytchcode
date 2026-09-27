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
    "/design-system": "Design System Showcase & Tokens",
  };

  const activeTitle =
    titles[location.pathname] ||
    titles[`/${currentView}`] ||
    titles[currentView] ||
    "SocialOps Operations";

  return (
    <header className="sticky top-0 z-30 h-14 bg-surface border-b border-border px-4 md:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile menu toggle & page title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="md:hidden text-text-muted hover:text-text-primary p-1.5 rounded-md hover:bg-surface-hover"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted font-medium hidden sm:inline">
            SocialOps /
          </span>
          <h1 className="text-sm md:text-base font-semibold text-text-primary tracking-tight">
            {activeTitle}
          </h1>
        </div>
      </div>

      {/* Center: Search input */}
      <div className="hidden lg:flex items-center max-w-xs w-full">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search posts, logs, accounts... (Cmd+K)"
            className="h-8 w-full pl-8 pr-3 text-xs bg-surface-soft border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:bg-surface text-text-primary placeholder:text-text-disabled transition-colors"
          />
        </div>
      </div>

      {/* Right: Live Status & CTAs */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Subtle Database Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-soft border border-border text-xs text-text-secondary">
          <Database className="w-3.5 h-3.5 text-text-muted" />
          <span className="text-[11px] font-mono text-text-primary font-medium">
            {recordCount} Records
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
        </div>

        {/* AI Studio Fast Navigation CTA */}
        <button
          type="button"
          onClick={() => navigate("/studio")}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md text-primary bg-primary-soft hover:bg-primary-soft/80 border border-primary-soft transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
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
