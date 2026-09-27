import React, { useState, useMemo, useEffect } from "react";
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
import {
  PageContainer,
  PageHeader,
  Button,
  StatusBadge,
  Badge,
  Card,
  Modal,
  SearchInput,
  EmptyState,
} from "../components/ui";
import { PlatformIcon } from "../components/common/PlatformIcon";
import { useToast } from "../components/common/Toast";

export function ActivityLogsView({ logs = [], onRefresh }) {
  const { addToast } = useToast();
  const [logList, setLogList] = useState(logs);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");
  const [platformFilter, setPlatformFilter] = useState("All");
  const [inspectingLog, setInspectingLog] = useState(null);
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);

  useEffect(() => {
    if (logs) {
      setLogList(logs);
    }
  }, [logs]);

  // Auto-poll live logs when stream is active
  useEffect(() => {
    if (!isLiveStreaming || !onRefresh) return;
    const interval = setInterval(() => {
      onRefresh();
    }, 12000);
    return () => clearInterval(interval);
  }, [isLiveStreaming, onRefresh]);

  const filteredLogs = useMemo(() => {
    return logList.filter((log) => {
      if (
        levelFilter !== "All" &&
        log.level?.toUpperCase() !== levelFilter.toUpperCase()
      ) {
        return false;
      }
      if (
        platformFilter !== "All" &&
        log.platform?.toLowerCase() !== platformFilter.toLowerCase()
      ) {
        return false;
      }

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
    <PageContainer>
      {/* Top Header */}
      <PageHeader
        title="Operational Activity Logs"
        description="Engineering audit trail for Swytchcode webhook events, API dispatches, and background jobs."
        actions={
          <div className="flex items-center gap-2">
            {/* Live stream status */}
            <button
              onClick={() => setIsLiveStreaming(!isLiveStreaming)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-border text-xs text-text-secondary hover:bg-surface-hover transition-colors cursor-pointer"
              title="Toggle periodic background log sync"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isLiveStreaming ? "bg-success animate-pulse" : "bg-text-disabled"
                }`}
              />
              <span>{isLiveStreaming ? "Live Stream: Active" : "Stream: Paused"}</span>
            </button>

            {onRefresh && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onRefresh}
                icon={RotateCw}
              >
                Refresh
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportLogs}
              icon={Download}
            >
              Export Logs
            </Button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <Card className="p-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="flex-1 max-w-sm">
            <SearchInput
              placeholder="Search actions, messages, errors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery("")}
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Level filter */}
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="h-8 text-xs bg-surface border border-border rounded-lg px-2.5 text-text-primary focus:outline-none focus:border-primary"
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
              className="h-8 text-xs bg-surface border border-border rounded-lg px-2.5 text-text-primary focus:outline-none focus:border-primary"
            >
              <option value="All">All Channels</option>
              <option value="X">X (Twitter)</option>
              <option value="Telegram">Telegram</option>
              <option value="Notion">Notion</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Instagram">Instagram</option>
              <option value="Slack">Slack</option>
              <option value="Internal">Internal</option>
            </select>

            {(levelFilter !== "All" || platformFilter !== "All" || searchQuery) && (
              <button
                onClick={() => {
                  setLevelFilter("All");
                  setPlatformFilter("All");
                  setSearchQuery("");
                }}
                className="text-xs text-text-muted hover:text-text-primary underline px-1 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Logs Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-soft text-[11px] font-semibold text-text-muted uppercase tracking-wider font-mono">
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
            <tbody className="divide-y divide-border font-mono text-[11px]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 font-sans">
                    <EmptyState
                      title="No activity logs found"
                      description="Operational dispatches, API retries, and token health logs will display here."
                      action={<Button onClick={onRefresh}>Refresh Logs</Button>}
                    />
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => {
                  const isError = log.level?.toUpperCase() === "ERROR";
                  const isWarn = log.level?.toUpperCase() === "WARN";

                  return (
                    <tr
                      key={log.id || `log-${idx}-${log.timestamp}`}
                      className={`hover:bg-surface-hover transition-colors ${
                        isError ? "bg-danger-soft/40" : isWarn ? "bg-warning-soft/30" : ""
                      }`}
                    >
                      {/* Timestamp */}
                      <td className="px-4 py-3 text-text-muted whitespace-nowrap">
                        {log.timestamp}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3">
                        <span className="px-1.5 py-0.5 rounded bg-surface-soft border border-border text-text-primary font-bold">
                          {log.action}
                        </span>
                      </td>

                      {/* Post */}
                      <td className="px-4 py-3 text-text-primary font-sans font-medium truncate max-w-[220px]">
                        {log.post}
                      </td>

                      {/* Account */}
                      <td className="px-4 py-3 text-text-secondary truncate max-w-[120px]">
                        {log.account}
                      </td>

                      {/* Platform */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-text-secondary font-sans">
                          <PlatformIcon platform={log.platform} className="w-3.5 h-3.5 text-text-muted" />
                          <span>{log.platform}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusBadge status={log.status} />
                      </td>

                      {/* Message Details */}
                      <td className="px-4 py-3 text-text-secondary truncate max-w-sm">
                        {log.message}
                      </td>

                      {/* Inspect */}
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setInspectingLog(log)}
                          className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-soft transition-colors cursor-pointer"
                          title="Inspect Log Entry"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

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
            <div className="grid grid-cols-2 gap-3 text-xs bg-surface-soft p-3 rounded-lg border border-border font-mono">
              <div>
                <span className="text-text-muted">Level:</span> {inspectingLog.level}
              </div>
              <div>
                <span className="text-text-muted">Status:</span> {inspectingLog.status}
              </div>
              <div>
                <span className="text-text-muted">Platform:</span> {inspectingLog.platform}
              </div>
              <div>
                <span className="text-text-muted">Account:</span> {inspectingLog.account}
              </div>
              <div>
                <span className="text-text-muted">Latency:</span> {inspectingLog.latency || "—"}
              </div>
              <div>
                <span className="text-text-muted">Trace ID:</span> {inspectingLog.traceId || inspectingLog.id || `trc_${inspectingLog.id?.slice(-8) || "live"}`}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-text-primary block mb-1">
                Event Message & Stack
              </label>
              <div className="bg-surface-active text-text-primary border border-border p-3.5 rounded-lg font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {inspectingLog.message || "No error stack or diagnostic message recorded."}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-text-primary block mb-1">
                Diagnostic Metadata & Payload
              </label>
              <pre className="bg-surface-soft text-text-secondary p-3 rounded-lg font-mono text-[11px] overflow-x-auto border border-border">
{JSON.stringify(
  inspectingLog.metadata || {
    id: inspectingLog.id,
    action: inspectingLog.action,
    timestamp: inspectingLog.timestamp,
    platform: inspectingLog.platform,
    account: inspectingLog.account,
    target: inspectingLog.post,
    status: inspectingLog.status,
    level: inspectingLog.level,
    ...(inspectingLog.latency ? { latency: inspectingLog.latency } : {}),
  },
  null,
  2
)}
              </pre>
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
}
