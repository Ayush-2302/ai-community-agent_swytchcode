import React, { useState, useEffect } from "react";
import {
  Cpu,
  Play,
  Pause,
  RotateCw,
  Terminal,
  Clock,
  AlertCircle,
  CheckCircle2,
  Server,
  Activity,
  Code,
  FileCode,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  StatCard,
  Card,
  Button,
  StatusBadge,
  Badge,
  Modal,
} from "../components/ui";
import { useToast } from "../components/common/Toast";
import { AUTOMATION_JOBS } from "../services/mockData";
import { socialApi } from "../api/socialApi";

export function AutomationView({ onNavigate }) {
  const { addToast } = useToast();
  const [jobs, setJobs] = useState(AUTOMATION_JOBS);
  const [daemonStatus, setDaemonStatus] = useState("Running");
  const [runningJobId, setRunningJobId] = useState(null);
  const [terminalOutput, setTerminalOutput] = useState(null);

  useEffect(() => {
    async function checkStatus() {
      try {
        const daemon = await socialApi.getAutomationStatus();
        if (daemon) {
          setDaemonStatus(daemon.status || "Running");
        }
      } catch (e) {
        // ignore
      }
    }
    checkStatus();
  }, []);

  const handleToggleDaemon = () => {
    const nextStatus = daemonStatus === "Running" ? "Paused" : "Running";
    setDaemonStatus(nextStatus);
    addToast({
      type: nextStatus === "Running" ? "success" : "warning",
      title: `Node.js Daemon ${nextStatus}`,
      message: `Background worker queue processing is now ${nextStatus.toLowerCase()}.`,
    });
  };

  const handleRunNow = async (job) => {
    setRunningJobId(job.id);
    addToast({
      type: "info",
      title: "Executing Job",
      message: `Triggered command: "${job.command}"...`,
    });

    // Simulate CLI runner execution
    await new Promise((r) => setTimeout(r, 1200));

    const timestamp = new Date().toLocaleTimeString();
    const simulatedLog = [
      `[${timestamp}] [node-runner] Spawning process: ${job.command}`,
      `[${timestamp}] [env] NODE_ENV=production SWYTCHCODE_WORKSPACE=ws_ai_community_ops`,
      `[${timestamp}] [worker] Connected to Swytchcode Router & local queue DB`,
      `[${timestamp}] [info] Processing batch execution for ${job.name}`,
      `[${timestamp}] [success] Dispatched 0 errors. Process completed with exit code 0.`,
      `[${timestamp}] [metrics] Execution time: 418ms | RSS memory: 84.2MB`,
    ].join("\n");

    setJobs((prev) =>
      prev.map((j) =>
        j.id === job.id
          ? {
              ...j,
              lastExecution: "Just now (Exit 0)",
              executionsToday: j.executionsToday + 1,
            }
      : j
      )
    );

    setRunningJobId(null);
    setTerminalOutput({ job, logs: simulatedLog });

    addToast({
      type: "success",
      title: "Job Executed Successfully",
      message: `${job.name} finished in 418ms (Exit code 0).`,
    });
  };

  const handleToggleJob = (id) => {
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === id) {
          const next = j.status === "Running" ? "Paused" : "Running";
          return { ...j, status: next };
        }
        return j;
      })
    );
  };

  return (
    <PageContainer>
      {/* Top Header */}
      <PageHeader
        title="Node.js Automation Engine"
        description="Monitor background cron daemons, CLI job runners, and autonomous dispatcher workers."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={daemonStatus === "Running" ? "secondary" : "primary"}
              size="sm"
              onClick={handleToggleDaemon}
              icon={daemonStatus === "Running" ? Pause : Play}
            >
              {daemonStatus === "Running" ? "Pause Daemon" : "Resume Daemon"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate("logs")}
              icon={Terminal}
            >
              Live Logs
            </Button>
          </div>
        }
      />

      {/* Daemon Architecture Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Engine State"
          value={daemonStatus}
          description="PID: 49204 · Node v24.18.0"
          icon={Activity}
          iconVariant={daemonStatus === "Running" ? "success" : "warning"}
        />

        <StatCard
          label="System Uptime"
          value="99.98%"
          description="18 days, 4 hours continuous"
          icon={Clock}
          iconVariant="primary"
        />

        <StatCard
          label="Worker Memory"
          value="78.4 MB"
          description="Heap limit: 512 MB"
          icon={Server}
          iconVariant="info"
        />

        <StatCard
          label="Cron Jobs"
          value="5 Registered"
          trend="4 healthy, 1 warning"
          trendDirection="up"
          icon={Cpu}
          iconVariant="neutral"
        />
      </div>

      {/* Automation Jobs Table */}
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-surface-soft flex items-center justify-between">
          <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">
            Registered Automation Jobs
          </span>
          <span className="text-xs font-mono text-text-muted">
            Node.js CLI Execution Environment
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-soft text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                <th className="px-4 py-3">Job Name</th>
                <th className="px-4 py-3">Command (CLI)</th>
                <th className="px-4 py-3">Schedule</th>
                <th className="px-4 py-3">Last Execution</th>
                <th className="px-4 py-3">Next Execution</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Job Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-surface-hover transition-colors">
                  {/* Job Name */}
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-text-primary">{job.name}</div>
                    <div className="text-[10px] text-text-muted font-mono mt-0.5">
                      Avg: {job.avgDuration} · {job.executionsToday} runs today
                    </div>
                  </td>

                  {/* Command */}
                  <td className="px-4 py-3.5 font-mono text-[11px] text-text-secondary">
                    <span className="px-2 py-1 rounded-md bg-surface-soft border border-border">
                      {job.command}
                    </span>
                  </td>

                  {/* Schedule */}
                  <td className="px-4 py-3.5 text-text-secondary">
                    {job.schedule}
                  </td>

                  {/* Last Execution */}
                  <td className="px-4 py-3.5 font-mono text-[11px] text-text-secondary">
                    {job.lastExecution}
                  </td>

                  {/* Next Execution */}
                  <td className="px-4 py-3.5 font-mono text-[11px] text-text-muted">
                    {job.nextExecution}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    <StatusBadge status={job.status} />
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRunNow(job)}
                        disabled={runningJobId === job.id}
                        icon={Play}
                      >
                        {runningJobId === job.id ? "Running..." : "Run Now"}
                      </Button>
                      <button
                        onClick={() => handleToggleJob(job.id)}
                        className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-soft transition-colors cursor-pointer"
                        title={job.status === "Running" ? "Pause" : "Resume"}
                      >
                        {job.status === "Running" ? (
                          <Pause className="w-3.5 h-3.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Interactive CLI Terminal Output Modal */}
      {terminalOutput && (
        <Modal
          isOpen={Boolean(terminalOutput)}
          onClose={() => setTerminalOutput(null)}
          title={`Job Output: ${terminalOutput.job.name}`}
          description={`CLI Execution Result: ${terminalOutput.job.command}`}
          maxWidth="max-w-2xl"
          footer={
            <Button variant="ghost" size="sm" onClick={() => setTerminalOutput(null)}>
              Close
            </Button>
          }
        >
          <div className="space-y-3">
            <div className="bg-surface-active text-text-primary p-4 rounded-lg font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed border border-border">
              {terminalOutput.logs}
            </div>
            <div className="flex items-center justify-between text-xs text-text-muted font-mono">
              <span>Status: Finished 0 errors</span>
              <span>Process Exit: 0 (OK)</span>
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
}
