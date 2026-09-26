import React from "react";
import { Plus, Search, Menu, Cpu, Bell, CheckCircle2 } from "lucide-react";
import { Button } from "../common/Button";

export function Header({
  currentView,
  onOpenCreatePost,
  onToggleSidebar,
  automationStatus = "Running",
}) {
  const titles = {
    dashboard: "Operations Dashboard",
    posts: "Social Media Posts",
    calendar: "Editorial Calendar",
    queue: "Publishing Queue",
    accounts: "Connected Accounts",
    campaigns: "Campaign Management",
    analytics: "Performance Analytics",
    automation: "Node.js Automation Engine",
    logs: "Operational Activity Logs",
    settings: "Platform Settings",
  };

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
            {titles[currentView] || "Operations"}
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

      {/* Right: Automation status indicator & Create Post CTA */}
      <div className="flex items-center gap-2.5">
        {/* Node.js Automation status pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-xs">
          <Cpu className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-500 text-[11px]">Worker:</span>
          <span className="inline-flex items-center gap-1 font-medium text-slate-700 text-[11px]">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                automationStatus === "Running" ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            {automationStatus}
          </span>
        </div>

        {/* Create Post Action Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={onOpenCreatePost}
          icon={Plus}
        >
          Create Post
        </Button>
      </div>
    </header>
  );
}
