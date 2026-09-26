import React from "react";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  ListOrdered,
  Users2,
  FolderKanban,
  BarChart3,
  Cpu,
  Terminal,
  Settings,
  ChevronDown,
  Building2,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export function Sidebar({ currentView, onViewChange, isOpen, onClose }) {
  const navigationGroups = [
    {
      label: "MAIN",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "posts", label: "Posts", icon: FileText, count: 8 },
        { id: "calendar", label: "Calendar", icon: Calendar },
        { id: "queue", label: "Queue", icon: ListOrdered, count: 5 },
      ],
    },
    {
      label: "MANAGEMENT",
      items: [
        { id: "accounts", label: "Accounts", icon: Users2, count: 6 },
        { id: "campaigns", label: "Campaigns", icon: FolderKanban },
        { id: "analytics", label: "Analytics", icon: BarChart3 },
      ],
    },
    {
      label: "SYSTEM",
      items: [
        { id: "automation", label: "Automation", icon: Cpu, badge: "Node.js" },
        { id: "logs", label: "Activity Logs", icon: Terminal },
        { id: "settings", label: "Settings", icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-60 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Workspace Brand / Header */}
        <div className="p-4 border-b border-slate-200 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-slate-900 text-white flex items-center justify-center font-semibold text-xs tracking-wider">
                SO
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-900 tracking-tight leading-none">
                  SocialOps
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  Operations Console
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-600">
              v2.4
            </span>
          </div>

          {/* Workspace selector */}
          <button className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors text-left">
            <div className="flex items-center gap-2 truncate">
              <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <div className="truncate">
                <div className="text-xs font-medium text-slate-800 truncate">
                  Acme Global Corp
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  Production Workspace
                </div>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navigationGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <div className="px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                {group.label}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onViewChange(item.id);
                      if (onClose) onClose();
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors text-left select-none relative ${
                      isActive
                        ? "bg-slate-100 text-slate-900 font-semibold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-slate-900 rounded-r" />
                    )}
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? "text-slate-900" : "text-slate-400"
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.count !== undefined && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded ${
                          isActive
                            ? "bg-white text-slate-800 border border-slate-200"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {item.count}
                      </span>
                    )}

                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Integration Status & User profile */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/50 space-y-3">
          {/* Swytchcode connector pill */}
          <div className="flex items-center justify-between px-2 py-1.5 rounded bg-emerald-50/80 border border-emerald-200/80 text-[11px] text-emerald-800">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium">Swytchcode API Live</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-mono">99.4%</span>
          </div>

          {/* User profile */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-medium text-xs">
                AC
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-800 leading-tight">
                  Alex Chen
                </span>
                <span className="text-[11px] text-slate-400">
                  Lead Social Operator
                </span>
              </div>
            </div>
            <button
              onClick={() => onViewChange("settings")}
              className="text-slate-400 hover:text-slate-600 p-1 rounded"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
