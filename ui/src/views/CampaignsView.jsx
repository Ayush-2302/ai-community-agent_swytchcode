import React, { useState } from "react";
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
import { Button } from "../components/common/Button";
import { StatusBadge } from "../components/common/Badge";
import { PlatformIcon } from "../components/common/PlatformIcon";
import { Card, CardHeader } from "../components/common/Card";
import { Modal } from "../components/common/Modal";
import { Input, Textarea } from "../components/common/Input";
import { useToast } from "../components/common/Toast";
import { CAMPAIGNS } from "../services/mockData";

export function CampaignsView({ posts = [], onOpenCreatePost }) {
  const { addToast } = useToast();
  const [campaignList, setCampaignList] = useState(CAMPAIGNS);
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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
            Campaigns
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Group, track, and aggregate performance across multi-channel initiatives.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsNewModalOpen(true)}
          icon={Plus}
        >
          New Campaign
        </Button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campaignList.map((cmp) => {
          const associatedPosts = getCampaignPosts(cmp.name);

          return (
            <Card key={cmp.id} padding="md" className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                      {cmp.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5 font-mono">
                      <span>{cmp.startDate}</span>
                      <span>→</span>
                      <span>{cmp.endDate}</span>
                    </div>
                  </div>
                  <StatusBadge status={cmp.status} />
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                  {cmp.description}
                </p>

                {/* Platforms & metrics pill row */}
                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <span className="text-[11px] text-slate-400">Channels:</span>
                    <div className="flex items-center gap-1">
                      {cmp.platforms.map((plat) => (
                        <div
                          key={plat}
                          className="w-5 h-5 rounded border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-700"
                          title={plat}
                        >
                          <PlatformIcon platform={plat} className="w-3 h-3" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 font-mono">
                    <span className="font-semibold text-slate-900">{cmp.postsCount}</span> Posts
                  </div>

                  <div className="text-[11px] text-slate-600 font-mono">
                    <span className="font-semibold text-slate-900">{cmp.impressions}</span> Impressions
                  </div>

                  <div className="text-[11px] text-emerald-600 font-mono font-medium ml-auto">
                    {cmp.engagementRate} Engagement
                  </div>
                </div>
              </div>

              {/* Footer action */}
              <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {associatedPosts.length} posts linked in workspace
                </span>
                <button
                  onClick={() => setActiveCampaignDetail(cmp)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  View Associated Posts <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

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
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Linked Posts ({getCampaignPosts(activeCampaignDetail.name).length})
            </h4>

            {getCampaignPosts(activeCampaignDetail.name).length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 border border-dashed rounded-md">
                No posts currently linked to this campaign. You can assign campaigns inside the Post Composer.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-md overflow-hidden">
                {getCampaignPosts(activeCampaignDetail.name).map((post) => (
                  <div key={post.id} className="p-3 bg-white flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-4">
                      <PlatformIcon platform={post.platform} className="w-4 h-4 text-slate-500 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium text-slate-900 truncate">{post.title}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{post.account} · {new Date(post.scheduledAt).toLocaleDateString()}</div>
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
    </div>
  );
}
