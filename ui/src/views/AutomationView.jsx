import React, { useState } from "react";
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
import { Button } from "../components/common/Button";
import { StatusBadge } from "../components/common/Badge";
import { Card, CardHeader } from "../components/common/Card";
import { Modal } from "../components/common/Modal";
import { useToast } from "../components/common/Toast";
import { AUTOMATION_JOBS } from "../services/mockData";

export function AutomationView({ onNavigate }) {
  const { addToast } = useToast();
  const [jobs, setJobs] = useState(AUTOMATION_JOBS);
  const [daemonStatus, setDaemonStatus] = useState("Running");
  const [runningJobId, setRunningJobId] = useState(null);
  const [terminalOutput, setTerminalOutput] = useState(null);

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
      `[${timestamp}] [env] NODE_ENV=production SWYTCHCODE_WORKSPACE=ws_acme_social_ops`,
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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
            Node.js Automation Engine
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor background cron daemons, CLI job runners, and autonomous dispatcher workers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={daemonStatus === "Running" ? "secondary" : "accent"}
            size="sm"
            onClick={handleToggleDaemon}
            icon={daemonStatus === "Running" ? Pause : Play}
          >
            {daemonStatus === "Running" ? "Pause Daemon" : "Resume Daemon"}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNavigate("logs")}
            icon={Terminal}
          >
            Live Logs
          </Button>
        </div>
      </div>

      {/* Daemon Architecture Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium uppercase tracking-wider">Engine State</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                daemonStatus === "Running" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
            <span className="text-lg font-bold font-mono text-slate-900">
              {daemonStatus}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">
            PID: 49204 · Node v24.18.0
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium uppercase tracking-wider">System Uptime</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-lg font-bold font-mono text-slate-900 mt-1">
            99.98%
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">
            18 days, 4 hours continuous
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium uppercase tracking-wider">Worker Memory</span>
            <Server className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-lg font-bold font-mono text-slate-900 mt-1">
            78.4 MB
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">
            Heap limit: 512 MB
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium uppercase tracking-wider">Cron Jobs</span>
            <Cpu className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-lg font-bold font-mono text-slate-900 mt-1">
            5 Registered
          </div>
          <div className="text-[10px] text-emerald-600 font-mono mt-1">
            4 healthy, 1 warning
          </div>
        </div>
      </div>

      {/* Automation Jobs Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-none">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Registered Automation Jobs
          </span>
          <span className="text-xs font-mono text-slate-500">
            Node.js CLI Execution Environment
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3">Job Name</th>
                <th className="px-4 py-3">Command (CLI)</th>
                <th className="px-4 py-3">Schedule</th>
                <th className="px-4 py-3">Last Execution</th>
                <th className="px-4 py-3">Next Execution</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Job Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Job Name */}
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-900">{job.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Avg: {job.avgDuration} · {job.executionsToday} runs today
                    </div>
                  </td>

                  {/* Command */}
                  <td className="px-4 py-3.5 font-mono text-[11px] text-slate-700">
                    <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200">
                      {job.command}
                    </span>
                  </td>

                  {/* Schedule */}
                  <td className="px-4 py-3.5 text-slate-600">
                    {job.schedule}
                  </td>

                  {/* Last Execution */}
                  <td className="px-4 py-3.5 font-mono text-[11px] text-slate-600">
                    {job.lastExecution}
                  </td>

                  {/* Next Execution */}
                  <td className="px-4 py-3.5 font-mono text-[11px] text-slate-500">
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
                        className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
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
      </div>

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
            <div className="bg-slate-900 text-slate-100 p-4 rounded-md font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-800">
              {terminalOutput.logs}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Status: Finished 0 errors</span>
              <span>Process Exit: 0 (OK)</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
