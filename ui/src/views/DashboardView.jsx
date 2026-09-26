import React from "react";
import {
  CalendarClock,
  CheckCircle2,
  AlertTriangle,
  FileEdit,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Clock,
  Play,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import { Card, CardHeader } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { StatusBadge } from "../components/common/Badge";
import { PlatformIcon } from "../components/common/PlatformIcon";

export function DashboardView({
  posts = [],
  queue = [],
  logs = [],
  onNavigate,
  onOpenCreatePost,
}) {
  const scheduledCount = posts.filter((p) => p.status === "Scheduled").length;
  const publishedCount = posts.filter((p) => p.status === "Published").length + 342;
  const failedCount = posts.filter((p) => p.status === "Failed").length;
  const pendingCount = posts.filter((p) => p.status === "Pending Review").length;

  const nextUpcoming = posts
    .filter((p) => p.status === "Scheduled" || p.status === "Pending Review")
    .slice(0, 4);

  const recentLogs = logs.slice(0, 5);

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Operational Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
            Acme Global Workspace
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational Overview & Dispatch Monitor · {formattedDate}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNavigate("automation")}
            icon={Cpu}
          >
            Worker Active
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenCreatePost}
          >
            New Dispatch
          </Button>
        </div>
      </div>

      {/* Primary Metrics: Scheduled, Published, Failed, Pending Review */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Scheduled
            </span>
            <CalendarClock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {scheduledCount}
            </span>
            <span className="text-[11px] text-slate-500">
              Next in 2h 15m
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Queue depth: {queue.length} items</span>
            <button
              onClick={() => onNavigate("queue")}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View Queue
            </button>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Published
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {publishedCount}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">
              +14% this month
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Delivery: 99.4%</span>
            <button
              onClick={() => onNavigate("analytics")}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Metrics
            </button>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Failed
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {failedCount}
            </span>
            {failedCount > 0 ? (
              <span className="text-[11px] text-rose-600 font-medium">
                Action required
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">All clear</span>
            )}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>OAuth Token Error</span>
            <button
              onClick={() => onNavigate("accounts")}
              className="text-rose-600 hover:text-rose-700 font-medium"
            >
              Reconnect
            </button>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Pending Review
            </span>
            <FileEdit className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {pendingCount}
            </span>
            <span className="text-[11px] text-amber-600 font-medium">
              Requires sign-off
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Content approval</span>
            <button
              onClick={() => onNavigate("posts")}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Review
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Section: Operational Activity & Upcoming Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Publishing Velocity & Operational Activity (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Publishing Activity Card */}
          <Card padding="md">
            <CardHeader
              title="Publishing Activity (Last 7 Days)"
              subtitle="Daily dispatched posts across connected networks"
              action={
                <button
                  onClick={() => onNavigate("analytics")}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  Full Report <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              }
            />

            {/* Restrained Operational Bar Chart */}
            <div className="pt-2">
              <div className="flex items-end justify-between h-36 gap-3 pb-2 pt-4 px-2 border-b border-slate-100">
                {[
                  { day: "Mon", count: 14, height: "55%" },
                  { day: "Tue", count: 18, height: "70%" },
                  { day: "Wed", count: 22, height: "85%" },
                  { day: "Thu", count: 26, height: "100%" },
                  { day: "Fri", count: 19, height: "75%" },
                  { day: "Sat", count: 8, height: "30%" },
                  { day: "Sun", count: 11, height: "42%" },
                ].map((item) => (
                  <div
                    key={item.day}
                    className="flex-1 flex flex-col items-center h-full justify-end group"
                  >
                    <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                      {item.count}
                    </span>
                    <div
                      style={{ height: item.height }}
                      className="w-full max-w-[28px] bg-slate-800 rounded-t-sm group-hover:bg-blue-600 transition-colors"
                    />
                    <span className="text-[11px] font-medium text-slate-500 mt-2">
                      {item.day}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-3 px-1">
                <span>Avg: 16.8 posts/day</span>
                <span className="font-mono text-slate-700 font-medium">Total: 118 Dispatched</span>
              </div>
            </div>
          </Card>

          {/* Platform Distribution Card */}
          <Card padding="md">
            <CardHeader
              title="Platform Distribution"
              subtitle="Active distribution across managed networks"
            />
            <div className="space-y-3 pt-1">
              {[
                { name: "LinkedIn", percentage: 42, count: "144 posts", color: "bg-blue-600" },
                { name: "X", percentage: 31, count: "120 posts", color: "bg-slate-900" },
                { name: "Instagram", percentage: 14, count: "42 posts", color: "bg-pink-600" },
                { name: "Telegram", percentage: 8, count: "22 posts", color: "bg-sky-500" },
                { name: "Slack", percentage: 5, count: "14 posts", color: "bg-emerald-600" },
              ].map((p) => (
                <div key={p.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <PlatformIcon platform={p.name} className="w-3.5 h-3.5" />
                      <span className="font-medium text-slate-800">{p.name}</span>
                    </div>
                    <div className="text-slate-500 font-mono text-[11px]">
                      {p.count} ({p.percentage}%)
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${p.color}`}
                      style={{ width: `${p.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Upcoming Posts & Recent Activity (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Upcoming Posts Section */}
          <Card padding="md">
            <CardHeader
              title="Upcoming Dispatches"
              subtitle="Next scheduled in publishing pipeline"
              action={
                <button
                  onClick={() => onNavigate("calendar")}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Calendar
                </button>
              }
            />

            <div className="divide-y divide-slate-100">
              {nextUpcoming.map((post) => (
                <div key={post.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start gap-3">
                  <div className="w-7 h-7 rounded border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 mt-0.5">
                    <PlatformIcon platform={post.platform} className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-semibold text-slate-800 truncate">
                        {post.title}
                      </span>
                      <StatusBadge status={post.status} className="shrink-0" />
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400 font-mono">
                      <span>{post.account}</span>
                      <span>•</span>
                      <span>
                        {new Date(post.scheduledAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Operational Activity Stream */}
          <Card padding="md">
            <CardHeader
              title="Operational Activity"
              subtitle="Real-time CLI and Swytchcode webhook events"
              action={
                <button
                  onClick={() => onNavigate("logs")}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  All Logs
                </button>
              }
            />

            <div className="space-y-2.5">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2 rounded bg-slate-50 border border-slate-100 flex items-start gap-2.5 text-xs"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                      log.status === "Success"
                        ? "bg-emerald-500"
                        : log.status === "Warning"
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-slate-500 font-medium">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {log.timestamp}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-700 font-medium truncate mt-0.5">
                      {log.post}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {log.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
