import React from "react";
import {
  CalendarClock,
  CheckCircle2,
  AlertTriangle,
  FileEdit,
  ArrowUpRight,
  Sparkles,
  Cpu,
  Layers,
  BarChart3,
  Calendar,
  Send,
  Plus,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  Card,
  CardHeader,
  Button,
  StatusBadge,
  Badge,
  StatCard,
} from "../components/ui";
import { PlatformIcon } from "../components/common/PlatformIcon";

export function DashboardView({
  posts = [],
  queue = [],
  logs = [],
  analytics = null,
  onNavigate,
  onOpenCreatePost,
}) {
  const scheduledCount = posts.filter(
    (p) => p.status === "Scheduled" || p.status === "SCHEDULED"
  ).length;
  const publishedCount =
    analytics?.publishedCount ??
    posts.filter((p) => p.status === "Published" || p.status === "PUBLISHED").length;
  const failedCount = posts.filter(
    (p) => p.status === "Failed" || p.status === "FAILED"
  ).length;
  const pendingCount = posts.filter(
    (p) =>
      p.status === "Pending Review" ||
      p.status === "PENDING" ||
      p.status === "Draft"
  ).length;

  const platformDistribution = React.useMemo(() => {
    const counts = {};
    posts.forEach((p) => {
      const plat = p.platform || "X";
      counts[plat] = (counts[plat] || 0) + 1;
    });

    const colors = {
      X: "bg-text-primary",
      Twitter: "bg-text-primary",
      Telegram: "bg-info",
      Notion: "bg-text-secondary",
      LinkedIn: "bg-primary",
      Instagram: "bg-primary-hover",
      Facebook: "bg-primary",
      Slack: "bg-success",
    };

    const keys = Object.keys(counts);
    if (keys.length === 0) {
      return [
        { name: "X", percentage: 0, count: "0 posts", color: colors.X },
        { name: "Telegram", percentage: 0, count: "0 posts", color: colors.Telegram },
        { name: "Notion", percentage: 0, count: "0 posts", color: colors.Notion },
      ];
    }

    return keys.map((plat) => {
      const cnt = counts[plat];
      const pct = Math.round((cnt / posts.length) * 100);
      return {
        name: plat,
        percentage: pct,
        count: `${cnt} post${cnt === 1 ? "" : "s"}`,
        color: colors[plat] || "bg-primary",
      };
    });
  }, [posts]);

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
    <PageContainer>
      {/* Operational Greeting Header */}
      <PageHeader
        title="AI Community Workspace"
        description={`Operational Overview & Dispatch Monitor · ${formattedDate}`}
        actions={
          <>
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
              icon={Plus}
            >
              New Dispatch
            </Button>
          </>
        }
      />

      {/* AI Studio Hero Banner - Clean, Light, Premium */}
      <Card
        padding="md"
        className="bg-primary-soft/50 border-primary-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="primary" dot size="sm">
              AI Studio Active
            </Badge>
            <span className="text-xs text-text-muted">
              Gemini 2.5 Flash &bull; Media Engine &bull; Swytchcode Live
            </span>
          </div>
          <h3 className="text-base font-semibold text-text-primary tracking-tight">
            Autonomous Multi-Channel Content Generation
          </h3>
          <p className="text-xs text-text-secondary max-w-xl leading-relaxed">
            Generate platform-native content with Gemini, select curated visual media, and syndicate to X, Telegram, and Notion in one click.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => onNavigate("studio")}
          icon={Sparkles}
          className="shrink-0"
        >
          Launch AI Studio
        </Button>
      </Card>

      {/* Primary Metrics: Scheduled, Published, Failed, Pending Review */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Scheduled"
          value={scheduledCount}
          subtitle={`Queue depth: ${queue.length} items`}
          icon={CalendarClock}
          iconVariant="primary"
          onClick={() => onNavigate("queue")}
        />

        <StatCard
          title="Published"
          value={publishedCount}
          change="+14% this month"
          trend="up"
          subtitle="Delivery: 99.4%"
          icon={CheckCircle2}
          iconVariant="success"
          onClick={() => onNavigate("analytics")}
        />

        <StatCard
          title="Failed"
          value={failedCount}
          change={failedCount > 0 ? "Action required" : "All clear"}
          trend={failedCount > 0 ? "down" : "neutral"}
          subtitle={failedCount > 0 ? "Authentication or rate limit error" : "No failed dispatches"}
          icon={AlertTriangle}
          iconVariant={failedCount > 0 ? "warning" : "neutral"}
          onClick={() => onNavigate("accounts")}
        />

        <StatCard
          title="Pending Review"
          value={pendingCount}
          subtitle="Content approval pipeline"
          icon={FileEdit}
          iconVariant="neutral"
          onClick={() => onNavigate("posts")}
        />
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
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => onNavigate("analytics")}
                  rightIcon={ArrowUpRight}
                >
                  Full Report
                </Button>
              }
            />

            {/* Restrained Operational Bar Chart */}
            <div className="pt-2">
              <div className="flex items-end justify-between h-36 gap-3 pb-2 pt-4 px-2 border-b border-border-light">
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
                    <span className="text-[10px] font-mono text-text-muted opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                      {item.count}
                    </span>
                    <div
                      style={{ height: item.height }}
                      className="w-full max-w-[28px] bg-primary/70 rounded-t-sm group-hover:bg-primary transition-colors"
                    />
                    <span className="text-[11px] font-medium text-text-muted mt-2">
                      {item.day}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-text-muted pt-3 px-1">
                <span>Avg: 16.8 posts/day</span>
                <span className="font-mono text-text-primary font-medium">Total: 118 Dispatched</span>
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
              {platformDistribution.map((p) => (
                <div key={p.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <PlatformIcon platform={p.name} className="w-3.5 h-3.5" />
                      <span className="font-medium text-text-primary">{p.name}</span>
                    </div>
                    <div className="text-text-muted font-mono text-[11px]">
                      {p.count} ({p.percentage}%)
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-surface-soft rounded-full overflow-hidden border border-border-light">
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
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => onNavigate("calendar")}
                >
                  Calendar
                </Button>
              }
            />

            <div className="divide-y divide-border-light">
              {nextUpcoming.map((post) => (
                <div key={post.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-md border border-border bg-surface-soft flex items-center justify-center shrink-0 mt-0.5">
                    <PlatformIcon platform={post.platform} className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-semibold text-text-primary truncate">
                        {typeof post.title === "object"
                          ? post.title?.caption || post.title?.title || JSON.stringify(post.title)
                          : post.title}
                      </span>
                      <StatusBadge status={post.status} className="shrink-0" />
                    </div>
                    <p className="text-[11px] text-text-secondary line-clamp-1">
                      {typeof post.content === "object"
                        ? post.content?.caption || post.content?.text || JSON.stringify(post.content)
                        : post.content}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-text-muted font-mono">
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
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => onNavigate("logs")}
                >
                  All Logs
                </Button>
              }
            />

            <div className="space-y-2.5">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-md bg-surface-soft border border-border-light flex items-start gap-2.5 text-xs"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                      log.status === "Success"
                        ? "bg-success"
                        : log.status === "Warning"
                        ? "bg-warning"
                        : "bg-danger"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-text-muted font-medium">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-text-muted font-mono">
                        {log.timestamp}
                      </span>
                    </div>
                    <div className="text-[11px] text-text-primary font-medium truncate mt-0.5">
                      {log.post}
                    </div>
                    <div className="text-[10px] text-text-secondary truncate">
                      {log.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

export default DashboardView;
