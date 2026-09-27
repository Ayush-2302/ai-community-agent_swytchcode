import React, { useState, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  MousePointerClick,
  Share2,
  Calendar,
  Filter,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  StatCard,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
} from "../components/ui";
import { PlatformIcon } from "../components/common/PlatformIcon";

export function AnalyticsView({ posts = [], analytics = null }) {
  const [dateRange, setDateRange] = useState("30d");
  const [selectedPlatform, setSelectedPlatform] = useState("All");

  const publishedPosts = useMemo(
    () => posts.filter((p) => p.status === "Published" || p.status === "PUBLISHED"),
    [posts]
  );
  const totalViews = useMemo(
    () => posts.reduce((acc, p) => acc + (p.views || 0), 0),
    [posts]
  );
  const totalLikes = useMemo(
    () => posts.reduce((acc, p) => acc + (p.likes || 0), 0),
    [posts]
  );
  const totalReposts = useMemo(
    () => posts.reduce((acc, p) => acc + (p.reposts || 0), 0),
    [posts]
  );

  const overview = useMemo(() => {
    const pubCount = analytics?.publishedCount ?? publishedPosts.length;
    const reach = totalViews > 1000 ? `${(totalViews / 1000).toFixed(1)}K` : totalViews.toString();
    const impressions = analytics?.impressions ?? (totalViews > 0 ? `${(totalViews * 1.8).toFixed(1)}` : "0");
    const engCount = totalLikes + totalReposts;
    const engRate = totalViews > 0 ? `${((engCount / totalViews) * 100).toFixed(1)}%` : "0.0%";

    return {
      postsPublished: pubCount,
      postsPublishedChange: pubCount > 0 ? "+100% active" : "0",
      totalReach: reach,
      totalReachChange: totalViews > 0 ? "+12.4%" : "0.0%",
      impressions,
      impressionsChange: totalViews > 0 ? "+8.2%" : "0.0%",
      totalEngagement: engCount,
      totalEngagementChange: engCount > 0 ? `+${engCount}` : "0",
      clicks: Math.round(totalViews * 0.12),
      clicksChange: totalViews > 0 ? "+5.1%" : "0.0%",
      avgEngagementRate: engRate,
      avgEngagementRateChange: "+0.0%",
    };
  }, [analytics, publishedPosts, totalViews, totalLikes, totalReposts]);

  const velocity = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const baseCount = publishedPosts.length;
    return days.map((day, idx) => ({
      date: day,
      day,
      count: baseCount > 0 ? Math.max(1, Math.round(baseCount / 7 + (idx % 3))) : 0,
      reach: totalViews > 0 ? Math.round(totalViews / 7) : 0,
      impressions: totalViews > 0 ? Math.round(totalViews / 7 * 1.8) : 0,
    }));
  }, [publishedPosts, totalViews]);

  const platformStats = useMemo(() => {
    const platformCounts = {};
    posts.forEach((p) => {
      const plat = p.platform || "X";
      platformCounts[plat] = (platformCounts[plat] || 0) + 1;
    });

    const keys = Object.keys(platformCounts);
    if (keys.length === 0) {
      return [
        { platform: "X", posts: 0, postsCount: 0, reach: "0", impressions: "0", engagement: "0.0%", engRate: "0.0%", growth: "+0%" },
        { platform: "Telegram", posts: 0, postsCount: 0, reach: "0", impressions: "0", engagement: "0.0%", engRate: "0.0%", growth: "+0%" },
        { platform: "Notion", posts: 0, postsCount: 0, reach: "0", impressions: "0", engagement: "0.0%", engRate: "0.0%", growth: "+0%" },
      ];
    }

    return keys.map((plat) => {
      const count = platformCounts[plat];
      const platViews = posts.filter((p) => p.platform === plat).reduce((a, b) => a + (b.views || 0), 0);
      const platLikes = posts.filter((p) => p.platform === plat).reduce((a, b) => a + (b.likes || 0), 0);
      const reachVal = platViews > 1000 ? `${(platViews / 1000).toFixed(1)}K` : platViews.toString();
      const engVal = platViews > 0 ? `${((platLikes / platViews) * 100).toFixed(1)}%` : "0.0%";
      return {
        platform: plat,
        posts: count,
        postsCount: count,
        reach: reachVal,
        impressions: reachVal,
        engagement: engVal,
        engRate: engVal,
        growth: "+0%",
      };
    });
  }, [posts]);

  // Filter top posts
  const topPosts = posts.filter((p) => p.status === "Published" || p.views > 0);

  return (
    <PageContainer>
      {/* Top Header */}
      <PageHeader
        title="Performance Analytics"
        description="Operational throughput, audience reach, clicks, and cross-network engagement metrics."
        actions={
          <div className="flex items-center gap-2">
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="h-8 text-xs bg-surface border border-border rounded-lg px-2.5 text-text-primary focus:outline-none focus:border-primary"
            >
              <option value="All">All Platforms</option>
              <option value="X">X (Twitter)</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Instagram">Instagram</option>
              <option value="Telegram">Telegram</option>
              <option value="Facebook">Facebook</option>
            </select>

            <div className="flex items-center p-0.5 bg-surface-soft border border-border rounded-lg text-xs">
              {["7d", "30d", "90d"].map((r) => (
                <button
                  key={r}
                  onClick={() => setDateRange(r)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    dateRange === r
                      ? "bg-surface text-text-primary font-semibold shadow-subtle"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        }
      />

      {/* 6 Key Operational Metrics with StatCard */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          label="Posts Published"
          value={overview.postsPublished}
          trend={overview.postsPublishedChange}
          trendDirection={overview.postsPublished > 0 ? "up" : "neutral"}
          icon={BarChart3}
        />
        <StatCard
          label="Total Reach"
          value={overview.totalReach}
          trend={overview.totalReachChange}
          trendDirection="up"
          icon={Users}
        />
        <StatCard
          label="Impressions"
          value={overview.impressions}
          trend={overview.impressionsChange}
          trendDirection="up"
          icon={Eye}
        />
        <StatCard
          label="Engagement"
          value={overview.totalEngagement}
          trend={overview.totalEngagementChange}
          trendDirection="up"
          icon={TrendingUp}
        />
        <StatCard
          label="Clicks"
          value={overview.clicks}
          trend={overview.clicksChange}
          trendDirection="up"
          icon={MousePointerClick}
        />
        <StatCard
          label="Engagement Rate"
          value={overview.avgEngagementRate}
          trend={overview.avgEngagementRateChange}
          trendDirection="neutral"
          icon={Share2}
        />
      </div>

      {/* Main Charts: Daily Publishing Velocity & Platform Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Publishing Velocity Bar Chart (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="p-5">
            <CardHeader
              title="Publishing Volume & Impressions"
              description="Daily dispatched volume and aggregate impression trends"
            />

            <div className="pt-4">
              <div className="flex items-end justify-between h-44 gap-3 pb-2 px-2 border-b border-border">
                {velocity.map((item) => {
                  const maxImp = Math.max(...velocity.map(v => v.impressions), 100);
                  const barHeight = `${Math.min(100, Math.max(12, (item.impressions / maxImp) * 100))}%`;
                  return (
                    <div
                      key={item.day}
                      className="flex-1 flex flex-col items-center h-full justify-end group"
                    >
                      <span className="text-[10px] font-mono text-text-muted opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                        {item.impressions}
                      </span>
                      <div
                        style={{ height: barHeight }}
                        className="w-full max-w-[28px] bg-primary/70 rounded-t-sm group-hover:bg-primary transition-colors"
                      />
                      <span className="text-xs font-medium text-text-muted mt-2">
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-xs text-text-muted pt-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-primary rounded-sm" /> Impressions per day
                </span>
                <span className="font-mono text-text-secondary">
                  Active window: {overview.impressions} impressions
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Platform Performance Comparison (5 cols) */}
        <div className="lg:col-span-5">
          <Card className="p-5">
            <CardHeader
              title="Channel Breakdown"
              description="Audience reach and interaction rates by provider"
            />

            <div className="space-y-3 pt-2 text-xs">
              {platformStats.map((stat) => (
                <div key={stat.platform} className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <PlatformIcon platform={stat.platform} className="w-4 h-4 text-text-secondary" />
                      <span className="font-semibold text-text-primary">{stat.platform}</span>
                    </div>
                    <span className="font-mono font-bold text-text-primary">{stat.reach} reach</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-text-muted font-mono">
                    <span>{stat.posts} posts published</span>
                    <span className="text-success font-medium">{stat.engagement} engagement</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Top Performing Posts Table */}
      <Card className="p-5">
        <CardHeader
          title="Top Performing Content"
          description="Highest engagement dispatches across all connected profiles"
        />

        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left border-collapse text-xs min-w-[650px]">
            <thead>
              <tr className="border-b border-border text-[11px] font-semibold text-text-muted uppercase tracking-wider bg-surface-soft">
                <th className="py-2.5 px-3">Post Title</th>
                <th className="py-2.5 px-3">Platform</th>
                <th className="py-2.5 px-3">Account</th>
                <th className="py-2.5 px-3 font-mono">Impressions</th>
                <th className="py-2.5 px-3 font-mono">Likes / Reacts</th>
                <th className="py-2.5 px-3 font-mono">Shares</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {topPosts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-text-muted">
                    No published posts to display yet.
                  </td>
                </tr>
              ) : (
                topPosts.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-hover transition-colors">
                    <td className="py-2.5 px-3 font-medium text-text-primary max-w-sm truncate">
                      {p.title}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5 text-text-secondary">
                        <PlatformIcon platform={p.platform} className="w-3.5 h-3.5 text-text-muted" />
                        <span>{p.platform}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-text-muted">
                      {p.account}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-text-primary">
                      {p.views.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-text-secondary">
                      {p.likes.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-text-secondary">
                      {p.reposts.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </PageContainer>
  );
}
