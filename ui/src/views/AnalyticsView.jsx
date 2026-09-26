import React, { useState } from "react";
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
import { Card, CardHeader } from "../components/common/Card";
import { PlatformIcon } from "../components/common/PlatformIcon";
import { ANALYTICS_DATA } from "../services/mockData";

export function AnalyticsView({ posts = [] }) {
  const [dateRange, setDateRange] = useState("30d");
  const [selectedPlatform, setSelectedPlatform] = useState("All");

  const overview = ANALYTICS_DATA.overview;
  const velocity = ANALYTICS_DATA.dailyVelocity;
  const platformStats = ANALYTICS_DATA.platformBreakdown;

  // Filter top posts
  const topPosts = posts.filter((p) => p.status === "Published" || p.views > 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
            Performance Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational throughput, audience reach, clicks, and cross-network engagement metrics.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="h-8 text-xs bg-white border border-slate-200 rounded px-2.5 text-slate-700 focus:outline-none focus:border-slate-400"
          >
            <option value="All">All Platforms</option>
            <option value="X">X (Twitter)</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Instagram">Instagram</option>
            <option value="Telegram">Telegram</option>
            <option value="Facebook">Facebook</option>
          </select>

          <div className="flex items-center p-0.5 bg-slate-100 border border-slate-200 rounded-md text-xs">
            {["7d", "30d", "90d"].map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  dateRange === r
                    ? "bg-white text-slate-900 font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 6 Key Operational Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
            Posts Published
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">
            {overview.postsPublished}
          </div>
          <div className="text-[10px] text-emerald-600 mt-1">
            {overview.postsPublishedChange}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
            Total Reach
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">
            {overview.totalReach}
          </div>
          <div className="text-[10px] text-emerald-600 mt-1">
            {overview.totalReachChange}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
            Impressions
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">
            {overview.impressions}
          </div>
          <div className="text-[10px] text-emerald-600 mt-1">
            {overview.impressionsChange}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
            Engagement
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">
            {overview.totalEngagement}
          </div>
          <div className="text-[10px] text-emerald-600 mt-1">
            {overview.totalEngagementChange}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
            Clicks
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">
            {overview.clicks}
          </div>
          <div className="text-[10px] text-emerald-600 mt-1">
            {overview.clicksChange}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
            Engagement Rate
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">
            {overview.avgEngagementRate}
          </div>
          <div className="text-[10px] text-emerald-600 mt-1">
            {overview.avgEngagementRateChange}
          </div>
        </div>
      </div>

      {/* Main Charts: Daily Publishing Velocity & Platform Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Publishing Velocity Bar Chart (7 cols) */}
        <div className="lg:col-span-7">
          <Card padding="md">
            <CardHeader
              title="Publishing Volume & Impressions"
              subtitle="Daily dispatched volume and aggregate impression trends"
            />

            <div className="pt-4">
              <div className="flex items-end justify-between h-44 gap-3 pb-2 px-2 border-b border-slate-100">
                {velocity.map((item) => {
                  const barHeight = `${(item.impressions / 80000) * 100}%`;
                  return (
                    <div
                      key={item.day}
                      className="flex-1 flex flex-col items-center h-full justify-end group"
                    >
                      <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                        {(item.impressions / 1000).toFixed(0)}k
                      </span>
                      <div
                        style={{ height: barHeight }}
                        className="w-full max-w-[32px] bg-slate-800 rounded-t group-hover:bg-blue-600 transition-colors"
                      />
                      <span className="text-xs font-medium text-slate-600 mt-2">
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-slate-800 rounded-sm" /> Impressions per day
                </span>
                <span className="font-mono text-slate-700">Total period: 345,000 views</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Platform Performance Comparison (5 cols) */}
        <div className="lg:col-span-5">
          <Card padding="md">
            <CardHeader
              title="Channel Breakdown"
              subtitle="Audience reach and interaction rates by provider"
            />

            <div className="space-y-3 pt-1 text-xs">
              {platformStats.map((stat) => (
                <div key={stat.platform} className="p-2.5 rounded bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <PlatformIcon platform={stat.platform} className="w-4 h-4 text-slate-700" />
                      <span className="font-semibold text-slate-900">{stat.platform}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-800">{stat.reach} reach</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>{stat.posts} posts published</span>
                    <span className="text-emerald-700 font-medium">{stat.engagement} engagement</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Top Performing Posts Table */}
      <Card padding="md">
        <CardHeader
          title="Top Performing Content"
          subtitle="Highest engagement dispatches across all connected profiles"
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-3">Post Title</th>
                <th className="py-2.5 px-3">Platform</th>
                <th className="py-2.5 px-3">Account</th>
                <th className="py-2.5 px-3 font-mono">Impressions</th>
                <th className="py-2.5 px-3 font-mono">Likes / Reacts</th>
                <th className="py-2.5 px-3 font-mono">Shares</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topPosts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-medium text-slate-900 max-w-sm truncate">
                    {p.title}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <PlatformIcon platform={p.platform} className="w-3.5 h-3.5 text-slate-500" />
                      <span>{p.platform}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                    {p.account}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                    {p.views.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">
                    {p.likes.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">
                    {p.reposts.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
