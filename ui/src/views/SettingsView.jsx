import React, { useState } from "react";
import {
  Settings,
  Key,
  Globe,
  Sliders,
  Bell,
  Cpu,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Save,
  RefreshCw,
  Terminal,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  Card,
  Button,
  Input,
  Select,
  Badge,
} from "../components/ui";
import { PlatformIcon } from "../components/common/PlatformIcon";
import { useToast } from "../components/common/Toast";
import { swytchcode } from "../services/swytchcode";

export function SettingsView() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("api"); // default to api/integrations to showcase Swytchcode!

  // Swytchcode API config state
  const [apiKey, setApiKey] = useState(swytchcode.config.apiKey);
  const [workspaceId, setWorkspaceId] = useState(swytchcode.config.workspaceId);
  const [baseUrl, setBaseUrl] = useState(swytchcode.config.baseUrl);
  const [environment, setEnvironment] = useState(swytchcode.config.environment);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState(null);

  // General Settings state
  const [workspaceName, setWorkspaceName] = useState("AI Community Hub");
  const [orgSlug, setOrgSlug] = useState("ai-community");
  const [defaultTimezone, setDefaultTimezone] = useState("UTC (GMT+00:00)");
  const [requireApproval, setRequireApproval] = useState(true);
  const [autoRetry, setAutoRetry] = useState(true);

  // Automation Daemon state
  const [workerConcurrency, setWorkerConcurrency] = useState("4");
  const [pollIntervalSeconds, setPollIntervalSeconds] = useState("30");
  const [slackWebhookUrl, setSlackWebhookUrl] = useState("https://hooks.slack.com/services/T00/B00/XXXX");

  const tabs = [
    { id: "api", label: "API / Integrations", icon: Key },
    { id: "general", label: "General & Workspace", icon: Globe },
    { id: "publishing", label: "Publishing Defaults", icon: Sliders },
    { id: "scheduling", label: "Scheduling & Slots", icon: Layers },
    { id: "automation", label: "Automation Daemon", icon: Cpu },
    { id: "notifications", label: "Notifications & Alerts", icon: Bell },
    { id: "permissions", label: "Users & Permissions", icon: Shield },
  ];

  const handleTestSwytchcode = async () => {
    setIsTestingConnection(true);
    setConnectionTestResult(null);

    try {
      const res = await swytchcode.testConnection();
      setConnectionTestResult(res);
      addToast({
        type: "success",
        title: "Swytchcode Connected",
        message: `Validated workspace ${res.workspace} in ${res.latency}ms. All 7 channels online.`,
      });
    } catch (err) {
      setConnectionTestResult({ success: false, error: err.message });
      addToast({
        type: "error",
        title: "Connection Failed",
        message: err.message,
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSaveApiSettings = () => {
    swytchcode.saveConfig({
      apiKey,
      workspaceId,
      baseUrl,
      environment,
    });

    addToast({
      type: "success",
      title: "Settings Saved",
      message: "Swytchcode API and environment parameters updated.",
    });
  };

  return (
    <PageContainer>
      {/* Top Header */}
      <PageHeader
        title="Platform Settings"
        description="Configure API credentials, delivery infrastructure, scheduling slots, and automation limits."
      />

      {/* Settings Layout: Sidebar Tabs + Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Settings Navigation Sidebar (3 cols) */}
        <Card className="md:col-span-3 space-y-1 p-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                  isActive
                    ? "bg-primary-soft text-primary font-semibold"
                    : "text-text-secondary hover:bg-surface-soft hover:text-text-primary"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </Card>

        {/* Settings Form Pane (9 cols) */}
        <div className="md:col-span-9">
          {/* Tab 1: API / Integrations (Swytchcode Integration) */}
          {activeTab === "api" && (
            <Card className="p-6 space-y-6">
              <div className="border-b border-border pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">
                      Swytchcode API Integration
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Unified gateway connecting X, Telegram, Slack, Notion, Resend, and LinkedIn APIs.
                    </p>
                  </div>
                  <Badge variant="success" size="sm" dot>
                    Active Gateway
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Swytchcode API Key"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    helperText="Stored locally and vaulted via HTTPS headers."
                  />

                  <Input
                    label="Workspace Identifier"
                    value={workspaceId}
                    onChange={(e) => setWorkspaceId(e.target.value)}
                    helperText="Organization slug registered on Swytchcode."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="API Base Endpoint URL"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                  />

                  <Select
                    label="Environment Mode"
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value)}
                    options={[
                      { value: "sandbox", label: "Sandbox (Offline simulation & testing)" },
                      { value: "live", label: "Live Production (Direct external API calls)" },
                    ]}
                  />
                </div>

                {/* Connection Ping Box */}
                <div className="p-3.5 bg-surface-soft border border-border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-semibold text-text-primary block">
                      Connection Health & Diagnostic Ping
                    </span>
                    <span className="text-text-muted text-[11px]">
                      Pings Swytchcode endpoints and verifies all 7 provider channel webhooks.
                    </span>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleTestSwytchcode}
                    disabled={isTestingConnection}
                    icon={RefreshCw}
                  >
                    {isTestingConnection ? "Pinging..." : "Test Connection"}
                  </Button>
                </div>

                {/* Connection Test Diagnostics */}
                {connectionTestResult && (
                  <div className="p-3 bg-success-soft border border-success/30 rounded-lg text-xs text-text-primary space-y-1 font-mono">
                    <div className="flex items-center gap-1.5 font-bold text-success">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      Swytchcode Gateway Healthy (HTTP 200 OK)
                    </div>
                    <div className="text-[11px] text-text-secondary">
                      Workspace: {connectionTestResult.workspace} | Mode: {connectionTestResult.environment} | Latency: {connectionTestResult.latency}ms
                    </div>
                    <div className="text-[11px] text-text-secondary">
                      Providers Active: {connectionTestResult.channelsOnline?.join(", ")}
                    </div>
                  </div>
                )}

                {/* Integrated Providers Grid */}
                <div>
                  <label className="text-xs font-semibold text-text-primary block mb-2">
                    Managed Platform Providers
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {[
                      { name: "X (Twitter)", status: "Operational", ping: "42ms" },
                      { name: "Telegram Bot", status: "Operational", ping: "28ms" },
                      { name: "Slack Webhooks", status: "Operational", ping: "15ms" },
                      { name: "Notion Sync", status: "Operational", ping: "64ms" },
                      { name: "Resend Email", status: "Operational", ping: "38ms" },
                      { name: "LinkedIn Marketing", status: "Operational", ping: "89ms" },
                    ].map((p) => (
                      <div key={p.name} className="p-2.5 rounded-lg bg-surface border border-border">
                        <div className="flex items-center gap-1.5 mb-1">
                          <PlatformIcon platform={p.name} className="w-3.5 h-3.5 text-text-secondary" />
                          <span className="font-semibold text-text-primary text-[11px]">{p.name}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-text-muted font-mono">
                          <span className="text-success font-medium">● {p.status}</span>
                          <span>{p.ping}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex justify-end">
                  <Button variant="primary" size="sm" onClick={handleSaveApiSettings} icon={Save}>
                    Save API Configuration
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Tab 2: General & Workspace */}
          {activeTab === "general" && (
            <Card className="p-6 space-y-4">
              <div className="border-b border-border pb-3">
                <h3 className="text-sm font-semibold text-text-primary">
                  Workspace Profile
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  General organizational settings and default localization.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Workspace Name"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                />
                <Input
                  label="Organization URL Slug"
                  value={orgSlug}
                  onChange={(e) => setOrgSlug(e.target.value)}
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => addToast({ type: "success", title: "Saved", message: "Workspace updated." })}
                >
                  Save Changes
                </Button>
              </div>
            </Card>
          )}

          {/* Tab 3: Publishing Defaults */}
          {activeTab === "publishing" && (
            <Card className="p-6 space-y-4">
              <div className="border-b border-border pb-3">
                <h3 className="text-sm font-semibold text-text-primary">
                  Publishing & Quality Safeguards
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Enforce operational checks before content dispatches.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <label className="flex items-start gap-2.5 p-3 rounded-lg border border-border cursor-pointer hover:bg-surface-soft transition-colors">
                  <input
                    type="checkbox"
                    checked={requireApproval}
                    onChange={(e) => setRequireApproval(e.target.checked)}
                    className="mt-0.5 rounded text-primary focus:ring-primary/20 accent-primary"
                  />
                  <div>
                    <span className="font-semibold text-text-primary block">Require Operator Review</span>
                    <span className="text-text-muted text-[11px]">Posts created by junior team members or automated bots enter 'Pending Review' first.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-lg border border-border cursor-pointer hover:bg-surface-soft transition-colors">
                  <input
                    type="checkbox"
                    checked={autoRetry}
                    onChange={(e) => setAutoRetry(e.target.checked)}
                    className="mt-0.5 rounded text-primary focus:ring-primary/20 accent-primary"
                  />
                  <div>
                    <span className="font-semibold text-text-primary block">Automatic Exponential Backoff Retry</span>
                    <span className="text-text-muted text-[11px]">Automatically re-attempt dispatches failed due to transient rate limits or timeout errors (up to 3 times).</span>
                  </div>
                </label>
              </div>
            </Card>
          )}

          {/* Tab 4: Scheduling & Slots */}
          {activeTab === "scheduling" && (
            <Card className="p-6 space-y-4">
              <div className="border-b border-border pb-3">
                <h3 className="text-sm font-semibold text-text-primary">
                  Publishing Slots & Timezone
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Define automated queue intervals and timezone offsets.
                </p>
              </div>

              <Select
                label="Primary Operating Timezone"
                value={defaultTimezone}
                onChange={(e) => setDefaultTimezone(e.target.value)}
                options={[
                  { value: "UTC (GMT+00:00)", label: "UTC (GMT+00:00)" },
                  { value: "US/Eastern (EST)", label: "US/Eastern (EST)" },
                  { value: "US/Pacific (PST)", label: "US/Pacific (PST)" },
                  { value: "Asia/Kolkata (IST)", label: "Asia/Kolkata (IST)" },
                ]}
              />

              <div className="space-y-1.5 text-xs">
                <span className="font-medium text-text-primary block">Default Daily Publishing Slots (UTC)</span>
                <div className="flex flex-wrap gap-2 pt-1 font-mono text-xs">
                  {["09:00 AM", "01:00 PM", "05:00 PM", "09:00 PM"].map((time) => (
                    <span key={time} className="px-2.5 py-1 rounded-md bg-surface-soft border border-border text-text-primary font-semibold">
                      {time}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Tab 5: Automation Daemon */}
          {activeTab === "automation" && (
            <Card className="p-6 space-y-4">
              <div className="border-b border-border pb-3">
                <h3 className="text-sm font-semibold text-text-primary">
                  Node.js Daemon Limits
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Process concurrency, queue poll delays, and resource quotas.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Worker Concurrency Threads"
                  value={workerConcurrency}
                  onChange={(e) => setWorkerConcurrency(e.target.value)}
                />
                <Input
                  label="Queue Poller Frequency (Seconds)"
                  value={pollIntervalSeconds}
                  onChange={(e) => setPollIntervalSeconds(e.target.value)}
                />
              </div>
            </Card>
          )}

          {/* Tab 6: Notifications & Alerts */}
          {activeTab === "notifications" && (
            <Card className="p-6 space-y-4">
              <div className="border-b border-border pb-3">
                <h3 className="text-sm font-semibold text-text-primary">
                  Operational Alerts
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Route error notices, token expiration warnings, and queue pause events.
                </p>
              </div>

              <Input
                label="Slack Error Alert Webhook"
                value={slackWebhookUrl}
                onChange={(e) => setSlackWebhookUrl(e.target.value)}
                helperText="Post instant failure alerts to an operations channel."
              />
            </Card>
          )}

          {/* Tab 7: Users & Permissions */}
          {activeTab === "permissions" && (
            <Card className="p-6 space-y-4">
              <div className="border-b border-border pb-3">
                <h3 className="text-sm font-semibold text-text-primary">
                  Team Members & RBAC
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Manage operators, approvers, and integration admins.
                </p>
              </div>

              <div className="divide-y divide-border text-xs">
                {[
                  { name: "Ayush Kumar", email: "ayushkumarakt@gmail.com", role: "Primary Admin & Owner" },
                  { name: "dotenvcoder", email: "dotenvcoder@gmail.com", role: "LinkedIn & X Operator" },
                  { name: "kanhacode", email: "ankithelpadi143ayush@gmail.com", role: "Instagram & Reel Pipeline" },
                ].map((user) => (
                  <div key={user.email} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-text-primary">{user.name}</div>
                      <div className="text-text-muted font-mono text-[11px]">{user.email}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-surface-soft text-text-secondary font-medium border border-border">
                      {user.role}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
