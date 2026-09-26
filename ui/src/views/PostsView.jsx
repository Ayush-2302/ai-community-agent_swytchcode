import React, { useState, useMemo } from "react";
import {
  Plus,
  Filter,
  Search,
  Download,
  Upload,
  MoreVertical,
  Play,
  RotateCw,
  Trash2,
  Edit,
  Eye,
  Calendar,
  Layers,
  ArrowUpDown,
  ExternalLink,
} from "lucide-react";
import { Button } from "../components/common/Button";
import { StatusBadge } from "../components/common/Badge";
import { PlatformIcon } from "../components/common/PlatformIcon";
import { EmptyState } from "../components/common/EmptyState";
import { useToast } from "../components/common/Toast";
import { swytchcode } from "../services/swytchcode";

export function PostsView({
  posts = [],
  onOpenCreatePost,
  onUpdatePost,
  onDeletePost,
}) {
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [campaignFilter, setCampaignFilter] = useState("All");
  const [selectedPostIds, setSelectedPostIds] = useState([]);
  const [sortField, setSortField] = useState("scheduledAt");
  const [sortAsc, setSortAsc] = useState(false);
  const [inspectingPost, setInspectingPost] = useState(null);

  // Available campaigns from data
  const campaigns = useMemo(() => {
    const list = Array.from(new Set(posts.map((p) => p.campaign).filter(Boolean)));
    return ["All", ...list];
  }, [posts]);

  // Filtering
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (platformFilter !== "All" && post.platform !== platformFilter) return false;
      if (statusFilter !== "All" && post.status !== statusFilter) return false;
      if (campaignFilter !== "All" && post.campaign !== campaignFilter) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = post.title?.toLowerCase().includes(query);
        const matchesContent = post.content?.toLowerCase().includes(query);
        const matchesAccount = post.account?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesContent && !matchesAccount) return false;
      }

      return true;
    }).sort((a, b) => {
      const aVal = a[sortField] || "";
      const bVal = b[sortField] || "";
      return sortAsc ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  }, [posts, platformFilter, statusFilter, campaignFilter, searchQuery, sortField, sortAsc]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedPostIds(filteredPosts.map((p) => p.id));
    } else {
      setSelectedPostIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedPostIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handlePublishNow = async (post) => {
    addToast({
      type: "info",
      title: "Dispatching Post",
      message: `Triggering immediate dispatch for "${post.title}" via Swytchcode...`,
    });

    try {
      await swytchcode.dispatchPost({
        platform: post.platform,
        content: post.content,
        mediaUrl: post.mediaUrl,
        accountHandle: post.account,
      });

      onUpdatePost({
        ...post,
        status: "Published",
        scheduledAt: new Date().toISOString(),
      });

      addToast({
        type: "success",
        title: "Dispatched",
        message: `Post disptached to ${post.platform} successfully.`,
      });
    } catch (err) {
      addToast({
        type: "error",
        title: "Dispatch Failed",
        message: err.message,
      });
    }
  };

  const handleBatchDelete = () => {
    if (selectedPostIds.length === 0) return;
    selectedPostIds.forEach((id) => onDeletePost(id));
    setSelectedPostIds([]);
    addToast({
      type: "success",
      title: "Batch Action Completed",
      message: `Deleted ${selectedPostIds.length} posts.`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
            Posts
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Central operational queue to manage, schedule, edit, and inspect all social content.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              addToast({
                type: "info",
                title: "Import Posts",
                message: "CSV/JSON batch parser ready. Select template or drag files.",
              });
            }}
            icon={Upload}
          >
            Import
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenCreatePost}
            icon={Plus}
          >
            Create Post
          </Button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by keyword, title, account..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-full pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-300 focus:bg-white text-slate-800 placeholder:text-slate-400 transition-colors"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Platform filter */}
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="h-8 text-xs bg-slate-50 border border-slate-200 rounded px-2.5 text-slate-700 focus:outline-none focus:border-slate-400"
            >
              <option value="All">Platform: All</option>
              <option value="X">X (Twitter)</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Instagram">Instagram</option>
              <option value="Facebook">Facebook</option>
              <option value="Telegram">Telegram</option>
              <option value="Slack">Slack</option>
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 text-xs bg-slate-50 border border-slate-200 rounded px-2.5 text-slate-700 focus:outline-none focus:border-slate-400"
            >
              <option value="All">Status: All</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Published">Published</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Draft">Draft</option>
              <option value="Failed">Failed</option>
              <option value="Paused">Paused</option>
            </select>

            {/* Campaign filter */}
            <select
              value={campaignFilter}
              onChange={(e) => setCampaignFilter(e.target.value)}
              className="h-8 text-xs bg-slate-50 border border-slate-200 rounded px-2.5 text-slate-700 focus:outline-none focus:border-slate-400"
            >
              {campaigns.map((c) => (
                <option key={c} value={c}>
                  Campaign: {c}
                </option>
              ))}
            </select>

            {(platformFilter !== "All" || statusFilter !== "All" || campaignFilter !== "All" || searchQuery) && (
              <button
                onClick={() => {
                  setPlatformFilter("All");
                  setStatusFilter("All");
                  setCampaignFilter("All");
                  setSearchQuery("");
                }}
                className="text-xs text-slate-500 hover:text-slate-800 underline px-1"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Selected Items Batch Toolbar */}
        {selectedPostIds.length > 0 && (
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-100 rounded text-xs text-slate-700">
            <span>{selectedPostIds.length} posts selected</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBatchDelete}
                className="text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="w-8 px-3 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={
                      selectedPostIds.length > 0 &&
                      selectedPostIds.length === filteredPosts.length
                    }
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-slate-900 focus:ring-0"
                  />
                </th>
                <th className="px-3 py-3 min-w-[280px]">Post & Content</th>
                <th className="px-3 py-3">Platform</th>
                <th className="px-3 py-3">Account</th>
                <th
                  className="px-3 py-3 cursor-pointer select-none hover:text-slate-800"
                  onClick={() => {
                    setSortField("scheduledAt");
                    setSortAsc(!sortAsc);
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Scheduled</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Campaign</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8">
                    <EmptyState
                      title="No matching posts found"
                      description="No posts match the current filter or search criteria."
                      actionLabel="Create Post"
                      onAction={onOpenCreatePost}
                    />
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Checkbox */}
                    <td className="w-8 px-3 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedPostIds.includes(post.id)}
                        onChange={() => handleToggleSelect(post.id)}
                        className="rounded border-slate-300 text-slate-900 focus:ring-0"
                      />
                    </td>

                    {/* Post Content */}
                    <td className="px-3 py-3">
                      <div className="flex items-start gap-3">
                        {post.mediaUrl ? (
                          <div className="w-10 h-10 rounded border border-slate-200 overflow-hidden bg-slate-100 shrink-0">
                            <img
                              src={post.mediaUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 text-slate-400">
                            <PlatformIcon platform={post.platform} className="w-4 h-4" />
                          </div>
                        )}
                        <div className="min-w-0 max-w-md">
                          <button
                            onClick={() => setInspectingPost(post)}
                            className="font-medium text-slate-900 hover:text-blue-600 truncate block text-left leading-tight"
                          >
                            {post.title}
                          </button>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {post.content}
                          </p>
                          {post.failureReason && (
                            <p className="text-[10px] text-rose-600 mt-0.5 truncate font-medium">
                              ⚠ {post.failureReason}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Platform */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <PlatformIcon platform={post.platform} className="w-3.5 h-3.5 text-slate-500" />
                        <span>{post.platform}</span>
                      </div>
                    </td>

                    {/* Account */}
                    <td className="px-3 py-3 font-mono text-[11px] text-slate-600 truncate max-w-[140px]">
                      {post.account}
                    </td>

                    {/* Scheduled / Date */}
                    <td className="px-3 py-3 text-slate-600 whitespace-nowrap">
                      <div className="text-[11px] font-mono">
                        {new Date(post.scheduledAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {new Date(post.scheduledAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-3 py-3">
                      <StatusBadge status={post.status} />
                    </td>

                    {/* Campaign */}
                    <td className="px-3 py-3 text-slate-600">
                      {post.campaign ? (
                        <span className="inline-block px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] text-slate-600 truncate max-w-[120px]">
                          {post.campaign}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {post.status !== "Published" && (
                          <button
                            onClick={() => handlePublishNow(post)}
                            className="p-1 rounded text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="Publish immediately via Swytchcode"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => setInspectingPost(post)}
                          className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="Inspect Post"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeletePost(post.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Status Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50/50 border-t border-slate-200 text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-700">{filteredPosts.length}</strong> of{" "}
            {posts.length} total posts
          </span>
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <button
              disabled
              className="px-2 py-0.5 rounded border border-slate-200 text-slate-400 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-2 py-0.5 bg-white border border-slate-200 rounded font-bold text-slate-800">
              1
            </span>
            <button
              disabled
              className="px-2 py-0.5 rounded border border-slate-200 text-slate-400 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Post Inspection Drawer / Modal */}
      {inspectingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
          <div className="bg-white rounded-lg border border-slate-200 max-w-lg w-full p-5 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <PlatformIcon platform={inspectingPost.platform} className="w-4 h-4" />
                  <h3 className="text-sm font-semibold text-slate-900">
                    {inspectingPost.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Account: {inspectingPost.account} · ID: {inspectingPost.id}
                </p>
              </div>
              <StatusBadge status={inspectingPost.status} />
            </div>

            <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed p-3 bg-slate-50 rounded border border-slate-100">
              {inspectingPost.content}
            </div>

            {inspectingPost.mediaUrl && (
              <div className="rounded border border-slate-200 overflow-hidden max-h-48 bg-slate-100">
                <img
                  src={inspectingPost.mediaUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100">
              <div>
                <span className="text-slate-400">Scheduled:</span>{" "}
                {new Date(inspectingPost.scheduledAt).toLocaleString()}
              </div>
              <div>
                <span className="text-slate-400">Campaign:</span>{" "}
                {inspectingPost.campaign || "None"}
              </div>
              <div>
                <span className="text-slate-400">Tags:</span>{" "}
                {inspectingPost.tags?.join(", ") || "None"}
              </div>
              <div>
                <span className="text-slate-400">Swytchcode ID:</span> sc_live_3881
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setInspectingPost(null)}
              >
                Close
              </Button>
              {inspectingPost.status !== "Published" && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    handlePublishNow(inspectingPost);
                    setInspectingPost(null);
                  }}
                  icon={Play}
                >
                  Publish Now
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
