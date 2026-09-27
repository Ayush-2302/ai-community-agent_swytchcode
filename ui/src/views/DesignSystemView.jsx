import React, { useState } from "react";
import {
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Share2,
  Trash2,
  Send,
  Plus,
} from "lucide-react";

import {
  PageContainer,
  PageHeader,
  Section,
  Button,
  Input,
  Textarea,
  Select,
  Checkbox,
  Switch,
  SearchInput,
  FormField,
  Badge,
  StatusBadge,
  PriorityBadge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  StatCard,
  Alert,
  Tabs,
  Modal,
  ConfirmDialog,
  DataTable,
  EmptyState,
  LoadingState,
  ErrorState,
  Skeleton,
} from "../components/ui";

export function DesignSystemView() {
  const [activeTab, setActiveTab] = useState("overview");
  const [inputValue, setInputValue] = useState("");
  const [searchVal, setSearchVal] = useState("");
  const [checkboxVal, setCheckboxVal] = useState(true);
  const [switchVal, setSwitchVal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [tableSortField, setTableSortField] = useState("name");
  const [tableSortAsc, setTableSortAsc] = useState(true);
  const [selectedTableIds, setSelectedTableIds] = useState(["row_1"]);

  const sampleTableData = [
    {
      id: "row_1",
      name: "Q4 Developer Community Kickoff",
      platform: "X & LinkedIn",
      status: "PUBLISHED",
      priority: "HIGH",
      reach: "14.2K",
      date: "2026-09-26",
    },
    {
      id: "row_2",
      name: "Swytchcode Autonomous Kernel v2.5",
      platform: "Telegram & Notion",
      status: "SCHEDULED",
      priority: "CRITICAL",
      reach: "—",
      date: "2026-09-27",
    },
    {
      id: "row_3",
      name: "Agentic Workflows Best Practices",
      platform: "LinkedIn",
      status: "PENDING",
      priority: "MEDIUM",
      reach: "—",
      date: "2026-09-28",
    },
    {
      id: "row_4",
      name: "Legacy Integration Deprecation Notice",
      platform: "X",
      status: "FAILED",
      priority: "LOW",
      reach: "—",
      date: "2026-09-25",
    },
  ];

  const tableColumns = [
    {
      key: "name",
      header: "Campaign / Post",
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-medium text-text-primary block leading-tight">
            {row.name}
          </span>
          <span className="text-[11px] text-text-muted">{row.platform}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "priority",
      header: "Priority",
      sortable: true,
      render: (row) => <PriorityBadge priority={row.priority} />,
    },
    {
      key: "reach",
      header: "Reach",
      align: "right",
      render: (row) => <span className="font-mono text-text-secondary">{row.reach}</span>,
    },
    {
      key: "date",
      header: "Scheduled",
      render: (row) => <span className="font-mono text-text-muted">{row.date}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="xs">
            Inspect
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="SocialOps Design System"
        description="Unified, premium design tokens, layout primitives, and reusable components built for enterprise-grade social operations."
        badge={<Badge variant="primary" dot>v2.0 Living System</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={Layers}
              onClick={() => setIsConfirmOpen(true)}
            >
              Test Confirm Dialog
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Sparkles}
              onClick={() => setIsModalOpen(true)}
            >
              Open Sample Modal
            </Button>
          </div>
        }
      />

      {/* Tabs Navigation */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: "overview", label: "Overview & Foundations" },
          { id: "buttons-badges", label: "Buttons & Badges" },
          { id: "forms", label: "Form System" },
          { id: "cards-data", label: "Cards & Tables" },
          { id: "feedback", label: "Feedback & Modals" },
        ]}
      />

      {/* 1. OVERVIEW & FOUNDATIONS TAB */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Color Tokens Palette */}
          <Section
            title="1. Semantic Color System"
            description="All application views consume semantic tokens mapped directly via CSS variables."
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <div className="p-3 rounded-lg border border-border bg-surface">
                <div className="w-full h-10 rounded bg-primary mb-2 shadow-subtle" />
                <span className="text-xs font-semibold text-text-primary block">Primary</span>
                <span className="text-[10px] text-text-muted font-mono">var(--primary)</span>
              </div>

              <div className="p-3 rounded-lg border border-border bg-surface">
                <div className="w-full h-10 rounded bg-primary-soft border border-primary-soft mb-2" />
                <span className="text-xs font-semibold text-text-primary block">Primary Soft</span>
                <span className="text-[10px] text-text-muted font-mono">var(--primary-soft)</span>
              </div>

              <div className="p-3 rounded-lg border border-border bg-surface">
                <div className="w-full h-10 rounded bg-surface border border-border mb-2" />
                <span className="text-xs font-semibold text-text-primary block">Surface</span>
                <span className="text-[10px] text-text-muted font-mono">var(--surface)</span>
              </div>

              <div className="p-3 rounded-lg border border-border bg-surface">
                <div className="w-full h-10 rounded bg-surface-soft border border-border mb-2" />
                <span className="text-xs font-semibold text-text-primary block">Surface Soft</span>
                <span className="text-[10px] text-text-muted font-mono">var(--surface-soft)</span>
              </div>

              <div className="p-3 rounded-lg border border-border bg-surface">
                <div className="w-full h-10 rounded bg-success mb-2" />
                <span className="text-xs font-semibold text-text-primary block">Success</span>
                <span className="text-[10px] text-text-muted font-mono">var(--success)</span>
              </div>

              <div className="p-3 rounded-lg border border-border bg-surface">
                <div className="w-full h-10 rounded bg-warning mb-2" />
                <span className="text-xs font-semibold text-text-primary block">Warning</span>
                <span className="text-[10px] text-text-muted font-mono">var(--warning)</span>
              </div>

              <div className="p-3 rounded-lg border border-border bg-surface">
                <div className="w-full h-10 rounded bg-danger mb-2" />
                <span className="text-xs font-semibold text-text-primary block">Danger</span>
                <span className="text-[10px] text-text-muted font-mono">var(--danger)</span>
              </div>

              <div className="p-3 rounded-lg border border-border bg-surface">
                <div className="w-full h-10 rounded bg-info mb-2" />
                <span className="text-xs font-semibold text-text-primary block">Info</span>
                <span className="text-[10px] text-text-muted font-mono">var(--info)</span>
              </div>
            </div>
          </Section>

          {/* Typography Scale */}
          <Section
            title="2. Typography Hierarchy"
            description="Predictable typography hierarchy replacing arbitrary pixel font sizes."
          >
            <Card padding="md" className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-border-light pb-3">
                <span className="text-xs font-mono text-text-muted w-32 shrink-0">Display / 2XL</span>
                <h1 className="text-2xl font-bold text-text-primary">Autonomous Social Media Orchestration</h1>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-border-light pb-3">
                <span className="text-xs font-mono text-text-muted w-32 shrink-0">Heading 1 / XL</span>
                <h1 className="text-xl font-semibold text-text-primary">Multi-Channel Operations Dashboard</h1>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-border-light pb-3">
                <span className="text-xs font-mono text-text-muted w-32 shrink-0">Heading 2 / Base</span>
                <h2 className="text-base font-semibold text-text-primary">Campaign Performance & Delivery Matrix</h2>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-border-light pb-3">
                <span className="text-xs font-mono text-text-muted w-32 shrink-0">Body / SM</span>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Real-time pipeline monitoring dispatches to X, Telegram, LinkedIn, and Notion via canonical tool contracts.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <span className="text-xs font-mono text-text-muted w-32 shrink-0">Caption / XS</span>
                <p className="text-xs text-text-muted">
                  Updated 2 minutes ago • MongoDB Atlas connected • Rate limit 300/300
                </p>
              </div>
            </Card>
          </Section>
        </div>
      )}

      {/* 2. BUTTONS & BADGES TAB */}
      {activeTab === "buttons-badges" && (
        <div className="space-y-8">
          <Section
            title="Button Variants & Sizes"
            description="Consistent button primitives with loading states, left/right icons, and accessible focus states."
          >
            <Card padding="md" className="space-y-6">
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Variants
                </h4>
                <div className="flex items-center gap-3 flex-wrap">
                  <Button variant="primary" icon={Send}>Primary</Button>
                  <Button variant="secondary" icon={Layers}>Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger" icon={Trash2}>Danger</Button>
                  <Button variant="link">Link Button</Button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Sizes & States
                </h4>
                <div className="flex items-center gap-3 flex-wrap">
                  <Button size="xs" variant="primary">Size XS</Button>
                  <Button size="sm" variant="primary">Size SM</Button>
                  <Button size="md" variant="primary">Size MD</Button>
                  <Button size="lg" variant="primary">Size LG</Button>
                  <Button size="sm" variant="primary" isLoading>Loading</Button>
                  <Button size="sm" variant="secondary" disabled>Disabled</Button>
                </div>
              </div>
            </Card>
          </Section>

          <Section
            title="Badges & Status Indicators"
            description="Centralized STATUS_CONFIG and PRIORITY_CONFIG drive status indicators."
          >
            <Card padding="md" className="space-y-6">
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Standard Badges
                </h4>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <Badge variant="neutral">Neutral</Badge>
                  <Badge variant="primary" dot>Primary</Badge>
                  <Badge variant="success" dot>Success</Badge>
                  <Badge variant="warning" dot>Warning</Badge>
                  <Badge variant="danger" dot>Danger</Badge>
                  <Badge variant="info" dot>Info</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Status Badges (Automatic config resolution)
                </h4>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <StatusBadge status="PUBLISHED" />
                  <StatusBadge status="SCHEDULED" />
                  <StatusBadge status="PENDING" />
                  <StatusBadge status="FAILED" />
                  <StatusBadge status="RUNNING" />
                  <StatusBadge status="CONNECTED" />
                  <StatusBadge status="PAUSED" />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Priority Badges
                </h4>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <PriorityBadge priority="LOW" />
                  <PriorityBadge priority="MEDIUM" />
                  <PriorityBadge priority="HIGH" />
                  <PriorityBadge priority="CRITICAL" />
                </div>
              </div>
            </Card>
          </Section>
        </div>
      )}

      {/* 3. FORMS TAB */}
      {activeTab === "forms" && (
        <div className="space-y-8">
          <Section
            title="Standard Form System"
            description="Accessible input, textarea, select, switch, checkbox, and search controls."
          >
            <Card padding="lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Campaign Name"
                  required
                  placeholder="e.g. Q4 Global AI Developer Summit"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  description="A distinct title to organize scheduled posts."
                />

                <Select
                  label="Target Primary Channel"
                  required
                  options={[
                    { value: "x", label: "X (Twitter) Feed" },
                    { value: "telegram", label: "Telegram Community Channel" },
                    { value: "linkedin", label: "LinkedIn Company Profile" },
                    { value: "notion", label: "Notion Architecture Vault" },
                  ]}
                />

                <SearchInput
                  placeholder="Filter by keyword or author..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                />

                <Input
                  label="Input with Error State"
                  placeholder="invalid input"
                  value="bad_url_format"
                  error="Please enter a valid HTTPS URL."
                />

                <div className="md:col-span-2">
                  <Textarea
                    label="Post Content (Draft)"
                    required
                    placeholder="Enter social post copy or generate via AI Studio..."
                    rows={3}
                    description="Preview changes live across connected channel preview cards."
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <Checkbox
                    label="Auto-archive copy to Notion"
                    description="Calls Swytchcode notion.page.create upon successful publishing."
                    checked={checkboxVal}
                    onChange={(e) => setCheckboxVal(e.target.checked)}
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <Switch
                    label="Enable Automation Daemon Scheduler"
                    description="Executes scheduled posts at regular cron intervals."
                    checked={switchVal}
                    onChange={setSwitchVal}
                  />
                </div>
              </div>
            </Card>
          </Section>
        </div>
      )}

      {/* 4. CARDS & TABLES TAB */}
      {activeTab === "cards-data" && (
        <div className="space-y-8">
          <Section
            title="Dashboard Metric Cards"
            description="Consistently styled metric cards with change indicators and semantic icon containers."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Audience Reach"
                value="142.8K"
                change="+12.4%"
                trend="up"
                subtitle="vs. previous 30 days"
                icon={Share2}
                iconVariant="primary"
              />
              <StatCard
                title="Published Posts"
                value="284"
                change="+8"
                trend="up"
                subtitle="All channels active"
                icon={Send}
                iconVariant="success"
              />
              <StatCard
                title="Pending Review"
                value="14"
                change="Needs Action"
                trend="neutral"
                subtitle="3 high priority drafts"
                icon={AlertTriangle}
                iconVariant="warning"
              />
              <StatCard
                title="Failed Dispatches"
                value="2"
                change="-50%"
                trend="down"
                subtitle="Rate limit resolved"
                icon={AlertCircle}
                iconVariant="neutral"
              />
            </div>
          </Section>

          <Section
            title="Standardized Data Table"
            description="Complete with multi-row selection, sorting, pagination, and empty/loading states."
          >
            <DataTable
              columns={tableColumns}
              data={sampleTableData}
              selectedIds={selectedTableIds}
              onSelectRow={(id) => {
                setSelectedTableIds((prev) =>
                  prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
                );
              }}
              onSelectAll={() => {
                if (selectedTableIds.length === sampleTableData.length) {
                  setSelectedTableIds([]);
                } else {
                  setSelectedTableIds(sampleTableData.map((d) => d.id));
                }
              }}
              sortField={tableSortField}
              sortAsc={tableSortAsc}
              onSort={(field) => {
                setTableSortField(field);
                setTableSortAsc(!tableSortAsc);
              }}
              pagination={{
                currentPage: 1,
                totalPages: 4,
                totalCount: 16,
                onPageChange: (p) => console.log("Go to page", p),
              }}
            />
          </Section>
        </div>
      )}

      {/* 5. FEEDBACK & MODALS TAB */}
      {activeTab === "feedback" && (
        <div className="space-y-8">
          <Section
            title="Semantic Alerts"
            description="Clean, non-intrusive alert banners using semantic design tokens."
          >
            <div className="space-y-3">
              <Alert variant="info" title="System Synchronization Active">
                Real-time MongoDB Atlas telemetry stream connected on port 3000.
              </Alert>
              <Alert variant="success" title="Post Published Successfully">
                Cross-channel syndication completed via Swytchcode Kernel.
              </Alert>
              <Alert variant="warning" title="Rate Limit Threshold Nearing">
                X API account 1 has used 260 of 300 available requests for the current hour.
              </Alert>
              <Alert variant="danger" title="Authentication Refresh Required">
                Meta Graph token expired for Instagram Channel. Please reconnect credentials.
              </Alert>
            </div>
          </Section>

          <Section
            title="States (Loading, Empty, Error, Skeleton)"
            description="Unified feedback placeholders across all dashboard views."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EmptyState
                title="No active campaigns found"
                description="Create your first coordinated marketing campaign to track multi-channel ROI."
                actionLabel="Create Campaign"
                onAction={() => setIsModalOpen(true)}
              />

              <ErrorState
                title="Failed to fetch account metrics"
                message="Swytchcode Provider responded with 503 Service Unavailable."
                onRetry={() => console.log("Retrying...")}
              />
            </div>
          </Section>
        </div>
      )}

      {/* Interactive Modal Demo */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule New Post"
        description="Configure target platforms, schedule timing, and dispatch payload."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Send}
              onClick={() => {
                setIsModalOpen(false);
              }}
            >
              Confirm Schedule
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Post Title" placeholder="e.g. Weekly DevRel Pulse" />
          <Textarea label="Caption Text" placeholder="Write social message..." rows={3} />
          <Alert variant="info">
            Posts scheduled within the next 15 minutes will be queued immediately.
          </Alert>
        </div>
      </Modal>

      {/* Interactive Confirm Dialog Demo */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          setIsConfirmOpen(false);
        }}
        title="Delete Post Draft?"
        message="This draft will be permanently removed from the scheduling database. This action cannot be undone."
        confirmLabel="Delete Draft"
        variant="danger"
      />
    </PageContainer>
  );
}

export default DesignSystemView;
