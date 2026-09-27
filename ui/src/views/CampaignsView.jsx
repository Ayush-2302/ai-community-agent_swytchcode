import React, { useState, useEffect, useMemo } from "react";
import {
  FolderKanban,
  Plus,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  Button,
  StatusBadge,
  Badge,
  Card,
  Modal,
  Input,
  Textarea,
  EmptyState,
} from "../components/ui";
import { PlatformIcon } from "../components/common/PlatformIcon";
import { useToast } from "../components/common/Toast";

export function CampaignsView({ posts = [], campaigns = [], onOpenCreatePost }) {
  const { addToast } = useToast();

  const derivedCampaigns = useMemo(() => {
    if (campaigns && campaigns.length > 0) return campaigns;
    const campaignMap = {};
    posts.forEach((p) => {
      const rawCamp = typeof p.campaign === "object" ? p.campaign?.name || p.campaign?.caption || "General" : p.campaign;
      const name = rawCamp || "General";
      if (!campaignMap[name]) {
        campaignMap[name] = {
          id: `cmp_${name.toLowerCase().replace(/\s+/g, "_")}`,
          name,
          description: `Campaign initiative for ${name}`,
          platforms: [],
          postsCount: 0,
          publishedCount: 0,
          startDate: "Ongoing",
          endDate: "2026-12-31",
          status: "Active",
          impressions: "0",
          engagementRate: "0.0%",
        };
      }
      campaignMap[name].postsCount++;
      if (p.status === "Published" || p.status === "PUBLISHED") {
        campaignMap[name].publishedCount++;
      }
      if (p.platform && !campaignMap[name].platforms.includes(p.platform)) {
        campaignMap[name].platforms.push(p.platform);
      }
    });
    return Object.values(campaignMap);
  }, [campaigns, posts]);

  const [campaignList, setCampaignList] = useState(derivedCampaigns);

  useEffect(() => {
    setCampaignList(derivedCampaigns);
  }, [derivedCampaigns]);
  const [activeCampaignDetail, setActiveCampaignDetail] = useState(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // New campaign state
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [startDate, setStartDate] = useState("2026-10-01");
  const [endDate, setEndDate] = useState("2026-12-31");

  const handleCreateCampaign = () => {
    if (!newTitle.trim()) {
      addToast({
        type: "error",
        title: "Title required",
        message: "Please enter a campaign name.",
      });
      return;
    }

    const newCamp = {
      id: `cmp_${Date.now()}`,
      name: newTitle.trim(),
      description: newDesc.trim() || "Operational social campaign.",
      platforms: ["X", "LinkedIn"],
      postsCount: 0,
      publishedCount: 0,
      startDate,
      endDate,
      status: "Active",
      impressions: "0",
      engagementRate: "0%",
    };

    setCampaignList((prev) => [newCamp, ...prev]);
    setIsNewModalOpen(false);
    setNewTitle("");
    setNewDesc("");

    addToast({
      type: "success",
      title: "Campaign Created",
      message: `"${newCamp.name}" added to active campaigns.`,
    });
  };

  const getCampaignPosts = (campaignName) => {
    return posts.filter((p) => p.campaign === campaignName);
  };

  return (
    <PageContainer>
      {/* Top Header */}
      <PageHeader
        title="Campaigns"
        description="Group, track, and aggregate performance across multi-channel initiatives."
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsNewModalOpen(true)}
            icon={Plus}
          >
            New Campaign
          </Button>
        }
      />

      {/* Campaigns Grid */}
      {campaignList.length === 0 ? (
        <Card className="p-10">
          <EmptyState
            title="No campaigns found"
            description="Create your first campaign or tag posts with a campaign name to track aggregate performance."
            action={<Button onClick={() => setIsNewModalOpen(true)}>New Campaign</Button>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaignList.map((cmp) => {
            const associatedPosts = getCampaignPosts(cmp.name);

            return (
              <Card key={cmp.id} className="p-5 flex flex-col justify-between hover:border-border-hover transition-colors">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary leading-snug">
                        {cmp.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-text-muted mt-0.5 font-mono">
                        <span>{cmp.startDate}</span>
                        <span>→</span>
                        <span>{cmp.endDate}</span>
                      </div>
                    </div>
                    <StatusBadge status={cmp.status} />
                  </div>

                  <p className="text-xs text-text-secondary line-clamp-2 mb-4 leading-relaxed">
                    {cmp.description}
                  </p>

                  {/* Channels & metrics pill row */}
                  <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border text-xs">
                    <div className="flex items-center gap-1.5 text-text-muted">
                      <span className="text-[11px]">Channels:</span>
                      <div className="flex items-center gap-1">
                        {cmp.platforms.map((plat) => (
                          <div
                            key={plat}
                            className="w-5 h-5 rounded border border-border bg-surface-soft flex items-center justify-center text-text-secondary"
                            title={plat}
                          >
                            <PlatformIcon platform={plat} className="w-3 h-3" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-[11px] text-text-secondary font-mono">
                      <span className="font-semibold text-text-primary">{cmp.postsCount}</span> Posts
                    </div>

                    <div className="text-[11px] text-text-secondary font-mono">
                      <span className="font-semibold text-text-primary">{cmp.impressions}</span> Impressions
                    </div>

                    <div className="text-[11px] text-success font-mono font-medium ml-auto">
                      {cmp.engagementRate} Engagement
                    </div>
                  </div>
                </div>

                {/* Footer action */}
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-text-muted">
                    {associatedPosts.length} posts linked in workspace
                  </span>
                  <button
                    onClick={() => setActiveCampaignDetail(cmp)}
                    className="text-xs text-primary hover:text-primary-hover font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    View Associated Posts <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Associated Posts Modal */}
      {activeCampaignDetail && (
        <Modal
          isOpen={Boolean(activeCampaignDetail)}
          onClose={() => setActiveCampaignDetail(null)}
          title={`Campaign: ${activeCampaignDetail.name}`}
          description={`${activeCampaignDetail.description} (${activeCampaignDetail.startDate} – ${activeCampaignDetail.endDate})`}
          maxWidth="max-w-3xl"
          footer={
            <Button variant="ghost" size="sm" onClick={() => setActiveCampaignDetail(null)}>
              Close
            </Button>
          }
        >
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Linked Posts ({getCampaignPosts(activeCampaignDetail.name).length})
            </h4>

            {getCampaignPosts(activeCampaignDetail.name).length === 0 ? (
              <div className="p-6 text-center text-xs text-text-muted border border-dashed border-border rounded-lg bg-surface-soft">
                No posts currently linked to this campaign. You can assign campaigns inside the Post Composer.
              </div>
            ) : (
              <div className="divide-y divide-border border border-border rounded-lg overflow-hidden bg-surface">
                {getCampaignPosts(activeCampaignDetail.name).map((post) => (
                  <div key={post.id} className="p-3 bg-surface hover:bg-surface-hover flex items-center justify-between text-xs transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-4">
                      <PlatformIcon platform={post.platform} className="w-4 h-4 text-text-muted shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium text-text-primary truncate">{post.title}</div>
                        <div className="text-[11px] text-text-muted font-mono">{post.account} · {new Date(post.scheduledAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <StatusBadge status={post.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* New Campaign Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Create Campaign"
        description="Establish a coordinated multi-channel campaign group."
        maxWidth="max-w-md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsNewModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateCampaign}>
              Save Campaign
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Campaign Name"
            placeholder="e.g. Q4 Infrastructure Launch"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />

          <Textarea
            label="Description"
            placeholder="Objectives, target audience, and key messaging..."
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            rows={3}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
