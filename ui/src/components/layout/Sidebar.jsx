import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  Check,
  LogOut,
  Zap,
  Sparkles,
} from "lucide-react";

export function Sidebar({
  currentView,
  onViewChange,
  isOpen,
  onClose,
  counts = {},
}) {
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState("AI Community Hub");

  const workspaceRef = useRef(null);
  const profileRef = useRef(null);

  // Close popovers when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (workspaceRef.current && !workspaceRef.current.contains(event.target)) {
        setIsWorkspaceMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigate = useNavigate();
  const location = useLocation();

  const workspaces = [
    { id: "ws_prod", name: "AI Community Hub", env: "Production Workspace" },
    { id: "ws_dev", name: "Developer Stream Lab", env: "Staging / Development" },
  ];

  const navigationGroups = [
    {
      label: "MAIN",
      items: [
        { id: "dashboard", label: "Dashboard", path: "/", icon: LayoutDashboard },
        {
          id: "studio",
          label: "AI Studio",
          path: "/studio",
          icon: Sparkles,
          badge: "Gemini",
        },
        {
          id: "posts",
          label: "Posts",
          path: "/posts",
          icon: FileText,
          count: counts?.posts !== undefined ? counts.posts : null,
        },
        {
          id: "queue",
          label: "Queue",
          path: "/queue",
          icon: ListOrdered,
          count: counts?.queue !== undefined ? counts.queue : null,
        },
        { id: "calendar", label: "Calendar", path: "/calendar", icon: Calendar },
      ],
    },
    {
      label: "MANAGEMENT",
      items: [
        {
          id: "accounts",
          label: "Connected Accounts",
          path: "/accounts",
          icon: Users2,
          count: counts?.accounts !== undefined ? counts.accounts : null,
        },
        { id: "campaigns", label: "Campaigns", path: "/campaigns", icon: FolderKanban },
        { id: "analytics", label: "Analytics", path: "/analytics", icon: BarChart3 },
      ],
    },
    {
      label: "SYSTEM",
      items: [
        { id: "automation", label: "Automation", path: "/automation", icon: Cpu, badge: "Daemon" },
        { id: "logs", label: "Activity Logs", path: "/logs", icon: Terminal },
        { id: "design-system", label: "Design System", path: "/design-system", icon: Sparkles, badge: "UI" },
        { id: "settings", label: "Settings", path: "/settings", icon: Settings },
      ],
    },
  ];

  const handleNavClick = (target) => {
    setIsWorkspaceMenuOpen(false);
    setIsProfileMenuOpen(false);
    const item =
      typeof target === "string"
        ? { id: target, path: target === "dashboard" ? "/" : `/${target}` }
        : target;
    if (item.path) {
      navigate(item.path);
    }
    if (onViewChange) {
      onViewChange(item.id);
    }
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-60 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-2xl md:shadow-none" : "-translate-x-full"
        }`}
      >
        {/* Workspace Brand / Header */}
        <div className="p-4 border-b border-slate-200 flex flex-col gap-3 relative" ref={workspaceRef}>
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => handleNavClick("dashboard")}
            >
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

          {/* Interactive Workspace selector dropdown trigger */}
          <button
            type="button"
            onClick={() => setIsWorkspaceMenuOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-2 truncate">
              <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <div className="truncate">
                <div className="text-xs font-medium text-slate-800 truncate">
                  {selectedWorkspace}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  Production Workspace
                </div>
              </div>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 shrink-0 ml-1 transition-transform ${
                isWorkspaceMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Workspace Dropdown Menu */}
          {isWorkspaceMenuOpen && (
            <div className="absolute top-[88px] left-4 right-4 z-50 bg-white border border-slate-200 rounded-lg shadow-lg p-1.5 space-y-1 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Workspace
              </div>
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  type="button"
                  onClick={() => {
                    setSelectedWorkspace(ws.name);
                    setIsWorkspaceMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-left transition-colors cursor-pointer ${
                    selectedWorkspace === ws.name
                      ? "bg-slate-100 text-slate-900 font-medium"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="truncate">
                    <div>{ws.name}</div>
                    <div className="text-[10px] text-slate-400">{ws.env}</div>
                  </div>
                  {selectedWorkspace === ws.name && (
                    <Check className="w-3.5 h-3.5 text-slate-900 shrink-0" />
                  )}
                </button>
              ))}

              <div className="border-t border-slate-100 my-1 pt-1">
                <button
                  type="button"
                  onClick={() => handleNavClick("accounts")}
                  className="w-full text-left px-2 py-1.5 text-[11px] text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded cursor-pointer"
                >
                  Manage Channels & Tokens
                </button>
                <button
                  type="button"
                  onClick={() => handleNavClick("settings")}
                  className="w-full text-left px-2 py-1.5 text-[11px] text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded cursor-pointer"
                >
                  Workspace Settings
                </button>
              </div>
            </div>
          )}
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
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== "/" && location.pathname.startsWith(item.path)) ||
                  currentView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors text-left select-none relative cursor-pointer ${
                      isActive
                        ? "bg-primary-soft text-primary font-semibold"
                        : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary rounded-r" />
                    )}
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? "text-primary" : "text-text-muted"
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.count !== null && item.count !== undefined && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded ${
                          isActive
                            ? "bg-surface text-primary border border-primary-soft font-semibold"
                            : "bg-surface-soft text-text-muted"
                        }`}
                      >
                        {item.count}
                      </span>
                    )}

                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-soft text-primary border border-primary-soft font-medium">
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
        <div className="p-3 border-t border-slate-200 bg-slate-50/50 space-y-3 relative" ref={profileRef}>
          {/* Swytchcode connector pill */}
          <div
            onClick={() => handleNavClick("accounts")}
            className="flex items-center justify-between px-2 py-1.5 rounded bg-emerald-50/80 border border-emerald-200/80 text-[11px] text-emerald-800 cursor-pointer hover:bg-emerald-100/60 transition-colors"
            title="Click to view connected platforms"
          >
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium">Swytchcode API Live</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-mono">Connected</span>
          </div>

          {/* User profile with interactive trigger */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              className="flex items-center gap-2.5 text-left flex-1 min-w-0 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-primary text-text-inverse flex items-center justify-center font-semibold text-xs shrink-0">
                AK
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold text-text-primary leading-tight truncate">
                  Ayush Kumar
                </span>
                <span className="text-[11px] text-text-muted truncate">
                  ayushkumarakt@gmail.com
                </span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleNavClick("settings")}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded hover:bg-slate-100 cursor-pointer"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* Profile Popover Menu */}
          {isProfileMenuOpen && (
            <div className="absolute bottom-[60px] left-3 right-3 z-50 bg-white border border-slate-200 rounded-lg shadow-lg p-2 space-y-1 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2 py-1 border-b border-slate-100 pb-1.5 mb-1">
                <div className="font-semibold text-slate-900">Ayush Kumar</div>
                <div className="text-[10px] text-slate-500 font-mono truncate">ayushkumarakt@gmail.com</div>
              </div>
              <button
                type="button"
                onClick={() => handleNavClick("settings")}
                className="w-full text-left px-2 py-1.5 text-slate-700 hover:bg-slate-50 rounded flex items-center gap-2 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                Settings & API Keys
              </button>
              <button
                type="button"
                onClick={() => handleNavClick("logs")}
                className="w-full text-left px-2 py-1.5 text-slate-700 hover:bg-slate-50 rounded flex items-center gap-2 cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5 text-slate-400" />
                Audit Logs & Traces
              </button>
              <button
                type="button"
                onClick={() => handleNavClick("automation")}
                className="w-full text-left px-2 py-1.5 text-slate-700 hover:bg-slate-50 rounded flex items-center gap-2 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-slate-400" />
                Daemon Automation
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
