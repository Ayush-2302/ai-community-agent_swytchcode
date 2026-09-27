import React, { useState } from "react";
import { Modal, Button, Input, Textarea, Select, Badge } from "../ui";
import { PlatformIcon } from "../common/PlatformIcon";
import { RealisticPlatformPreview } from "./RealisticPlatformPreview";
import { useToast } from "../common/Toast";
import { swytchcode } from "../../services/swytchcode";
import { socialApi } from "../../api/socialApi";
import { Image, Calendar, Clock, Layers, Sparkles, Send, Globe, Upload } from "lucide-react";

export function CreatePostModal({ isOpen, onClose, onPostCreated, initialDate = null }) {
  const { addToast } = useToast();

  const [selectedPlatforms, setSelectedPlatforms] = useState(["X"]);
  const [selectedAccount, setSelectedAccount] = useState("@developer_stream");
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [campaign, setCampaign] = useState("Developer Community");
  const [tags, setTags] = useState("AI, Developer, Swytchcode");
  const [schedulingMode, setSchedulingMode] = useState(initialDate ? "schedule" : "queue"); // 'now' | 'schedule' | 'queue'
  const [scheduleDate, setScheduleDate] = useState(
    initialDate || new Date().toISOString().split("T")[0]
  );
  const [scheduleTime, setScheduleTime] = useState("14:30");
  const [timezone, setTimezone] = useState("UTC (GMT+00:00)");
  const [previewPlatform, setPreviewPlatform] = useState("X");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availablePlatforms = [
    { id: "X", label: "X (Twitter)", limit: 280, defaultAccount: "@developer_stream" },
    { id: "Telegram", label: "Telegram", limit: 4096, defaultAccount: "Chat ID: 8330458164 (@BeingA_07)" },
    { id: "Notion", label: "Notion", limit: 2000, defaultAccount: "Notion AI Community Hub" },
    { id: "LinkedIn", label: "LinkedIn", limit: 3000, defaultAccount: "dotenvcoder" },
    { id: "Instagram", label: "Instagram", limit: 2200, defaultAccount: "kanhacode" },
    { id: "Facebook", label: "Facebook", limit: 5000, defaultAccount: "Facebook Page" },
    { id: "Slack", label: "Slack", limit: 4000, defaultAccount: "#announcements" },
  ];

  const currentPlatformMeta = availablePlatforms.find((p) => p.id === previewPlatform) || availablePlatforms[0];
  const charLimit = currentPlatformMeta.limit;
  const charsRemaining = charLimit - content.length;
  const isOverLimit = charsRemaining < 0;

  const togglePlatform = (platformId) => {
    setSelectedPlatforms((prev) => {
      if (prev.includes(platformId)) {
        if (prev.length === 1) return prev; // keep at least 1
        return prev.filter((p) => p !== platformId);
      } else {
        const next = [...prev, platformId];
        setPreviewPlatform(platformId);
        return next;
      }
    });
  };

  const sampleImages = [
    { label: "Cloud Infra", url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80" },
    { label: "Team Demo", url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" },
    { label: "Analytics", url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80" },
  ];

  const handleSubmit = async (isDraft = false) => {
    if (!content.trim() && !mediaUrl) {
      addToast({
        type: "error",
        title: "Content required",
        message: "Please enter text or attach an image to create this post.",
      });
      return;
    }

    if (isOverLimit) {
      addToast({
        type: "error",
        title: "Character limit exceeded",
        message: `Content exceeds the ${charLimit} limit for ${previewPlatform}.`,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const scheduledIso = schedulingMode === "schedule"
        ? new Date(`${scheduleDate}T${scheduleTime}:00Z`).toISOString()
        : schedulingMode === "now"
        ? new Date().toISOString()
        : new Date(Date.now() + 4 * 3600 * 1000).toISOString();

      const newPost = {
        id: `post_${Date.now()}`,
        title: content.slice(0, 45).trim() + (content.length > 45 ? "..." : ""),
        content,
        platform: selectedPlatforms[0],
        platforms: selectedPlatforms,
        account: selectedAccount,
        scheduledAt: scheduledIso,
        status: isDraft
          ? "Draft"
          : schedulingMode === "now"
          ? "Published"
          : "Scheduled",
        campaign,
        mediaUrl: mediaUrl || null,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        views: 0,
        likes: 0,
        reposts: 0,
        createdAt: new Date().toISOString(),
      };

      // Dispatch via Swytchcode multi-channel runtime if publishing immediately
      let publishResults = null;
      if (schedulingMode === "now" && !isDraft) {
        try {
          publishResults = await socialApi.omniPublish({
            content,
            platforms: selectedPlatforms,
            mediaUrl,
          });
        } catch (publishErr) {
          console.warn("[CreatePostModal] OmniPublish error:", publishErr);
        }
      }

      onPostCreated(newPost);

      const targetList = selectedPlatforms.join(", ");
      addToast({
        type: "success",
        title: isDraft ? "Draft Saved" : schedulingMode === "now" ? "Post Dispatched" : "Post Scheduled",
        message: isDraft
          ? "Post has been saved to your drafts."
          : schedulingMode === "now"
          ? `Dispatched successfully to ${targetList} via Swytchcode live runtime.`
          : `Post scheduled for ${new Date(scheduledIso).toLocaleDateString()} at ${scheduleTime}.`,
      });

      onClose();
    } catch (err) {
      addToast({
        type: "error",
        title: "Operation Failed",
        message: err.message || "Failed to create post. Check operational logs.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Social Post"
      description="Compose, configure multi-channel delivery, and preview post rendering."
      maxWidth="max-w-5xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
          >
            Save Draft
          </Button>
          <Button
            variant="primary"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting || isOverLimit}
            icon={schedulingMode === "now" ? Send : Calendar}
          >
            {isSubmitting
              ? "Processing..."
              : schedulingMode === "now"
              ? "Publish Now"
              : schedulingMode === "queue"
              ? "Add to Queue"
              : "Schedule Post"}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Editor & Configuration (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Target Platforms */}
          <div>
            <label className="text-xs font-semibold text-text-primary block mb-1.5">
              Target Platforms
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availablePlatforms.map((p) => {
                const isSelected = selectedPlatforms.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePlatform(p.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs transition-all flex-1 min-w-[64px] cursor-pointer ${
                      isSelected
                        ? "bg-primary-soft text-primary font-semibold border-primary/40 shadow-subtle"
                        : "bg-surface border-border text-text-secondary hover:bg-surface-soft"
                    }`}
                  >
                    <PlatformIcon platform={p.id} className="w-4 h-4 mb-1" />
                    <span className="text-[11px] truncate">{p.id}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Account & Campaign Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Publishing Account"
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              options={[
                { value: "@developer_stream", label: "X (Twitter) - @developer_stream" },
                { value: "Chat ID: 8330458164", label: "Telegram - @BeingA_07 (8330458164)" },
                { value: "Notion AI Community Hub", label: "Notion - AI Community Hub" },
                { value: "dotenvcoder", label: "LinkedIn - dotenvcoder" },
                { value: "kanhacode", label: "Instagram - kanhacode" },
                { value: "#announcements", label: "Announcements (#announcements)" },
              ]}
            />

            <Select
              label="Link Campaign"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              options={[
                { value: "Q3 Engineering", label: "Q3 Engineering Highlights" },
                { value: "Customer Stories", label: "Customer Stories & Enterprise ROI" },
                { value: "Hiring 2026", label: "Hiring & Culture 2026" },
                { value: "Developer Community", label: "Developer Community Sprint" },
                { value: "Unassigned", label: "None / Standalone Post" },
              ]}
            />
          </div>

          {/* Post Content Editor */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-text-primary">
                Post Content
              </label>
              <div
                className={`text-[11px] font-mono ${
                  isOverLimit
                    ? "text-danger font-bold"
                    : charsRemaining < 20
                    ? "text-warning font-semibold"
                    : "text-text-muted"
                }`}
              >
                {charsRemaining} chars left ({previewPlatform})
              </div>
            </div>
            <textarea
              rows={5}
              placeholder="What do you want to publish? Share announcements, links, releases, or insights..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={`w-full rounded-lg border text-sm text-text-primary bg-surface placeholder:text-text-muted p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${
                isOverLimit ? "border-danger focus:ring-danger/20" : "border-border"
              }`}
            />
          </div>

          {/* Media Attachment */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-primary block">
              Media Attachment (Optional)
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Paste public image or video URL (https://...)"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                containerClassName="flex-1"
              />
              {mediaUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMediaUrl("")}
                  className="text-xs"
                >
                  Clear
                </Button>
              )}
            </div>

            {/* Quick Sample Presets */}
            <div className="flex items-center gap-2 pt-1 text-[11px] text-text-muted">
              <span>Sample media:</span>
              {sampleImages.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setMediaUrl(s.url)}
                  className="px-2 py-0.5 rounded-md bg-surface-soft hover:bg-primary-soft hover:text-primary text-text-secondary text-[10px] transition-colors cursor-pointer border border-border"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scheduling & Delivery Strategy */}
          <div className="pt-2 border-t border-border">
            <label className="text-xs font-semibold text-text-primary block mb-2">
              Delivery Schedule
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setSchedulingMode("queue")}
                className={`py-2 px-3 rounded-lg border text-xs font-medium text-center transition-all cursor-pointer ${
                  schedulingMode === "queue"
                    ? "bg-primary-soft text-primary font-semibold border-primary/40 shadow-subtle"
                    : "bg-surface border-border text-text-secondary hover:bg-surface-soft"
                }`}
              >
                Add to Queue
              </button>
              <button
                type="button"
                onClick={() => setSchedulingMode("schedule")}
                className={`py-2 px-3 rounded-lg border text-xs font-medium text-center transition-all cursor-pointer ${
                  schedulingMode === "schedule"
                    ? "bg-primary-soft text-primary font-semibold border-primary/40 shadow-subtle"
                    : "bg-surface border-border text-text-secondary hover:bg-surface-soft"
                }`}
              >
                Specific Time
              </button>
              <button
                type="button"
                onClick={() => setSchedulingMode("now")}
                className={`py-2 px-3 rounded-lg border text-xs font-medium text-center transition-all cursor-pointer ${
                  schedulingMode === "now"
                    ? "bg-primary-soft text-primary font-semibold border-primary/40 shadow-subtle"
                    : "bg-surface border-border text-text-secondary hover:bg-surface-soft"
                }`}
              >
                Publish Now
              </button>
            </div>

            {schedulingMode === "schedule" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-surface-soft rounded-lg border border-border text-xs">
                <Input
                  label="Date"
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                />
                <Input
                  label="Time"
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                />
                <Select
                  label="Timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  options={[
                    { value: "UTC (GMT+00:00)", label: "UTC (GMT+00:00)" },
                    { value: "US/Eastern (EST)", label: "US/Eastern (EST)" },
                    { value: "US/Pacific (PST)", label: "US/Pacific (PST)" },
                    { value: "Asia/Kolkata (IST)", label: "Asia/Kolkata (IST)" },
                  ]}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Platform Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="text-xs font-semibold text-text-primary">
              Live Channel Preview
            </span>

            {/* Switch platform preview tabs */}
            <div className="flex items-center gap-1">
              {selectedPlatforms.map((plat) => (
                <button
                  key={plat}
                  type="button"
                  onClick={() => setPreviewPlatform(plat)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    previewPlatform === plat
                      ? "bg-primary-soft text-primary font-semibold border border-primary/30"
                      : "bg-surface-soft text-text-muted hover:text-text-primary hover:bg-surface"
                  }`}
                >
                  {plat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 bg-surface-soft p-3 rounded-lg border border-border overflow-y-auto">
            <RealisticPlatformPreview
              platform={previewPlatform}
              content={content}
              mediaUrl={mediaUrl}
              account={selectedAccount}
            />
          </div>

          {/* Delivery Note */}
          <div className="text-[11px] text-text-muted bg-surface p-2.5 rounded-lg border border-border">
            Dispatches via Swytchcode Router to verified platform endpoints. Media is hosted and cached automatically on CDN.
          </div>
        </div>
      </div>
    </Modal>
  );
}
