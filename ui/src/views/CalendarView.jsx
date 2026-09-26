import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Filter,
} from "lucide-react";
import { Button } from "../components/common/Button";
import { PlatformIcon } from "../components/common/PlatformIcon";

export function CalendarView({ posts = [], onOpenCreatePost }) {
  const [viewMode, setViewMode] = useState("month"); // 'month' | 'week' | 'day'
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 26)); // September 2026
  const [selectedPlatform, setSelectedPlatform] = useState("All");

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === "month") {
      setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    } else if (viewMode === "week") {
      setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 3600 * 1000));
    } else {
      setCurrentDate(new Date(currentDate.getTime() - 24 * 3600 * 1000));
    }
  };

  const handleNext = () => {
    if (viewMode === "month") {
      setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    } else if (viewMode === "week") {
      setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 3600 * 1000));
    } else {
      setCurrentDate(new Date(currentDate.getTime() + 24 * 3600 * 1000));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 8, 26));
  };

  // Calendar calculations for month view
  const monthDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        date: prevMonthDays - i,
        month: currentMonth - 1,
        year: currentYear,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDaysInMonth; i++) {
      days.push({
        date: i,
        month: currentMonth,
        year: currentYear,
        isCurrentMonth: true,
      });
    }

    // Next month padding to fill grid (42 days)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: i,
        month: currentMonth + 1,
        year: currentYear,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Posts map by day
  const postsByDateString = useMemo(() => {
    const map = {};
    posts.forEach((p) => {
      if (selectedPlatform !== "All" && p.platform !== selectedPlatform) return;
      const d = new Date(p.scheduledAt);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(p);
    });
    return map;
  }, [posts, selectedPlatform]);

  return (
    <div className="space-y-4">
      {/* Calendar Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
            Editorial Calendar
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualize, balance, and schedule publication slots across all connected channels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Platform filter */}
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="h-8 text-xs bg-white border border-slate-200 rounded px-2.5 text-slate-700 focus:outline-none focus:border-slate-400"
          >
            <option value="All">All Platforms</option>
            <option value="X">X (Twitter)</option>
            <option value="Telegram">Telegram</option>
            <option value="Notion">Notion</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Instagram">Instagram</option>
            <option value="Facebook">Facebook</option>
            <option value="Slack">Slack</option>
          </select>

          {/* View mode toggle */}
          <div className="flex items-center p-0.5 bg-slate-100 border border-slate-200 rounded-md text-xs">
            <button
              onClick={() => setViewMode("month")}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                viewMode === "month"
                  ? "bg-white text-slate-900 shadow-none font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                viewMode === "week"
                  ? "bg-white text-slate-900 shadow-none font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode("day")}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                viewMode === "day"
                  ? "bg-white text-slate-900 shadow-none font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Day
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenCreatePost}
            icon={Plus}
          >
            Schedule
          </Button>
        </div>
      </div>

      {/* Date Navigation & Month Title */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleToday}>
            Today
          </Button>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <span className="text-sm font-semibold text-slate-900 ml-2">
            {monthNames[currentMonth]} {currentYear}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> Scheduled
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Published
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Pending
          </span>
        </div>
      </div>

      {/* Month Calendar Grid */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-none">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/70 text-center py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* 6 Rows of 7 Days */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
          {monthDays.map((cell, idx) => {
            const key = `${cell.year}-${cell.month}-${cell.date}`;
            const dayPosts = postsByDateString[key] || [];
            const isToday = cell.date === 26 && cell.month === 8 && cell.year === 2026;

            return (
              <div
                key={idx}
                className={`min-h-[105px] p-1.5 flex flex-col justify-between transition-colors ${
                  cell.isCurrentMonth
                    ? "bg-white hover:bg-slate-50/60"
                    : "bg-slate-50/40 text-slate-400"
                } ${isToday ? "ring-1 ring-inset ring-blue-500 bg-blue-50/20" : ""}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-mono font-medium rounded-full w-5 h-5 flex items-center justify-center ${
                      isToday
                        ? "bg-blue-600 text-white font-bold"
                        : cell.isCurrentMonth
                        ? "text-slate-700"
                        : "text-slate-400"
                    }`}
                  >
                    {cell.date}
                  </span>
                  {dayPosts.length > 0 && (
                    <span className="text-[10px] font-mono text-slate-400">
                      {dayPosts.length} post{dayPosts.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {/* Day posts compact list */}
                <div className="space-y-1 flex-1 overflow-hidden">
                  {dayPosts.slice(0, 3).map((p) => {
                    const statusDot =
                      p.status === "Published"
                        ? "bg-emerald-500"
                        : p.status === "Scheduled"
                        ? "bg-blue-500"
                        : "bg-amber-500";

                    return (
                      <div
                        key={p.id}
                        className="px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-800 flex items-center gap-1.5 truncate group cursor-pointer hover:border-slate-300"
                        title={`${p.title} (${p.platform} · ${p.status})`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot}`} />
                        <PlatformIcon platform={p.platform} className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">
                          {typeof p.title === "object"
                            ? p.title?.caption || p.title?.title || JSON.stringify(p.title)
                            : p.title}
                        </span>
                      </div>
                    );
                  })}
                  {dayPosts.length > 3 && (
                    <div className="text-[10px] text-slate-500 font-mono px-1">
                      +{dayPosts.length - 3} more
                    </div>
                  )}
                </div>

                {/* Quick add hover trigger */}
                <button
                  onClick={() => onOpenCreatePost(new Date(cell.year, cell.month, cell.date).toISOString().split("T")[0])}
                  className="opacity-0 group-hover:opacity-100 hover:opacity-100 text-[10px] text-slate-400 hover:text-blue-600 self-end pt-1 flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
