import React, { useState, useMemo } from "react";
import {
  Terminal,
  Search,
  Filter,
  Download,
  RotateCw,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Eye,
} from "lucide-react";
import { Button } from "../components/common/Button";
import { StatusBadge } from "../components/common/Badge";
import { PlatformIcon } from "../components/common/PlatformIcon";
import { Modal } from "../components/common/Modal";
import { useToast } from "../components/common/Toast";
import { ACTIVITY_LOGS } from "../services/mockData";

export function ActivityLogsView({ logs = ACTIVITY_LOGS }) {
  const { addToast } = useToast();
  const [logList, setLogList] = useState(logs);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");
  const [platformFilter, setPlatformFilter] = useState("All");
  const [inspectingLog, setInspectingLog] = useState(null);
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);

  const filteredLogs = useMemo(() => {
    return logList.filter((log) => {
      if (levelFilter !== "All" && log.level !== levelFilter) return false;
      if (platformFilter !== "All" && log.platform !== platformFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesAction = log.action?.toLowerCase().includes(q);
        const matchesPost = log.post?.toLowerCase().includes(q);
        const matchesMsg = log.message?.toLowerCase().includes(q);
        const matchesAcc = log.account?.toLowerCase().includes(q);
        if (!matchesAction && !matchesPost && !matchesMsg && !matchesAcc) return false;
      }

      return true;
    });
  }, [logList, levelFilter, platformFilter, searchQuery]);

  const handleExportLogs = () => {
    const jsonStr = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `socialops_activity_logs_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    addToast({
      type: "success",
      title: "Logs Exported",
      message: `Exported ${filteredLogs.length} activity records.`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
            Operational Activity Logs
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Engineering audit trail for Swytchcode webhook events, API dispatches, and background jobs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Live stream status */}
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-xs text-slate-700 hover:bg-slate-100"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isLiveStreaming ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
              }`}
            />
            <span>{isLiveStreaming ? "Live Stream: Active" : "Stream: Paused"}</span>
          </button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportLogs}
            icon={Download}
          >
            Export Logs
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search actions, messages, errors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-full pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-300 focus:bg-white text-slate-800 placeholder:text-slate-400 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Level filter */}
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="h-8 text-xs bg-slate-50 border border-slate-200 rounded px-2.5 text-slate-700 focus:outline-none focus:border-slate-400"
            >
              <option value="All">Level: All</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARN</option>
              <option value="ERROR">ERROR</option>
            </select>

            {/* Platform filter */}
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="h-8 text-xs bg-slate-50 border border-slate-200 rounded px-2.5 text-slate-700 focus:outline-none focus:border-slate-400"
            >
              <option value="All">All Channels</option>
              <option value="X">X (Twitter)</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Instagram">Instagram</option>
              <option value="Slack">Slack</option>
              <option value="Telegram">Telegram</option>
              <option value="Internal">Internal</option>
            </select>

            {(levelFilter !== "All" || platformFilter !== "All" || searchQuery) && (
              <button
                onClick={() => {
                  setLevelFilter("All");
                  setPlatformFilter("All");
                  setSearchQuery("");
                }}
                className="text-xs text-slate-500 hover:text-slate-800 underline px-1"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3 min-w-[200px]">Post / Subject</th>
                <th className="px-4 py-3">Account</th>
                <th className="px-4 py-3">Platform</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 min-w-[320px]">Message Details</th>
                <th className="px-4 py-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredLogs.map((log) => {
                const isError = log.level === "ERROR";
                const isWarn = log.level === "WARN";

                return (
                  <tr
                    key={log.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      isError ? "bg-rose-50/30" : isWarn ? "bg-amber-50/20" : ""
                    }`}
                  >
                    {/* Timestamp */}
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 font-bold">
                        {log.action}
                      </span>
                    </td>

                    {/* Post */}
                    <td className="px-4 py-3 text-slate-900 font-sans font-medium truncate max-w-[220px]">
                      {log.post}
                    </td>

                    {/* Account */}
                    <td className="px-4 py-3 text-slate-600 truncate max-w-[120px]">
                      {log.account}
                    </td>

                    {/* Platform */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-slate-700 font-sans">
                        <PlatformIcon platform={log.platform} className="w-3.5 h-3.5 text-slate-500" />
                        <span>{log.platform}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge status={log.status} />
                    </td>

                    {/* Message Details */}
                    <td className="px-4 py-3 text-slate-600 truncate max-w-sm">
                      {log.message}
                    </td>

                    {/* Inspect */}
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setInspectingLog(log)}
                        className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                        title="Inspect Log Entry"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Inspection Modal */}
      {inspectingLog && (
        <Modal
          isOpen={Boolean(inspectingLog)}
          onClose={() => setInspectingLog(null)}
          title={`Log Details: ${inspectingLog.action}`}
          description={`Logged at ${inspectingLog.timestamp} · ID: ${inspectingLog.id}`}
          maxWidth="max-w-2xl"
          footer={
            <Button variant="ghost" size="sm" onClick={() => setInspectingLog(null)}>
              Close
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded border border-slate-200 font-mono">
              <div>
                <span className="text-slate-400">Level:</span> {inspectingLog.level}
              </div>
              <div>
                <span className="text-slate-400">Status:</span> {inspectingLog.status}
              </div>
              <div>
                <span className="text-slate-400">Platform:</span> {inspectingLog.platform}
              </div>
              <div>
                <span className="text-slate-400">Account:</span> {inspectingLog.account}
              </div>
              <div>
                <span className="text-slate-400">Latency:</span> {inspectingLog.latency || "82ms"}
              </div>
              <div>
                <span className="text-slate-400">Trace ID:</span> trc_88921a9
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Event Message & Stack
              </label>
              <div className="bg-slate-900 text-slate-100 p-3.5 rounded font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {inspectingLog.message}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                HTTP Payload / Diagnostic Metadata
              </label>
              <pre className="bg-slate-50 text-slate-800 p-3 rounded font-mono text-[11px] overflow-x-auto border border-slate-200">
{JSON.stringify(
  {
    event: inspectingLog.action,
    timestamp: inspectingLog.timestamp,
    client: "Swytchcode-Node-SDK/1.4",
    headers: {
      "user-agent": "socialops-worker-daemon",
      "x-swytchcode-workspace": "ws_acme_social_ops",
      "x-forwarded-for": "10.240.0.1"
    },
    target: inspectingLog.post
  },
  null,
  2
)}
              </pre>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
