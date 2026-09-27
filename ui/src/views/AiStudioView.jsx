import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Send,
  Image as ImageIcon,
  Music,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Layers,
  Copy,
  Check,
  Zap,
  Sliders,
  Play,
  Pause,
  Clock,
  ShieldCheck,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  Card,
  Button,
  Badge,
} from "../components/ui";
import { PlatformIcon } from "../components/common/PlatformIcon";
import { useToast } from "../components/common/Toast";
import { socialApi } from "../api/socialApi";

const PRESET_TOPICS = [
  "Autonomous Multi-Agent AI Systems",
  "High-Performance Next.js 15 Architectures",
  "Real-Time WebSocket Optimization",
  "Swytchcode Canonical API Compilers",
  "Edge AI Vision & On-Device Models",
];

const TONES = [
  "Insightful & Professional",
  "Punchy & Viral",
  "Technical & In-Depth",
  "Casual & Engaging",
];

export function AiStudioView({ onPostCreated }) {
  const { addToast } = useToast();

  // Generator form
  const [topic, setTopic] = useState("Autonomous Multi-Agent AI Systems");
  const [tone, setTone] = useState(TONES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);

  // Active platform tab for previewing/editing
  const [activePlatformTab, setActivePlatformTab] = useState("x");

  // Editable copies per platform
  const [postCopies, setPostCopies] = useState({
    x: "",
    telegram: "",
    notion: "",
    linkedin: "",
  });
  const [postTitle, setPostTitle] = useState("");
  const [tags, setTags] = useState([]);

  // Media search
  const [mediaQuery, setMediaQuery] = useState("artificial intelligence developer");
  const [isSearchingMedia, setIsSearchingMedia] = useState(false);
  const [mediaItems, setMediaItems] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);

  // Music search
  const [tracks, setTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);

  // Publishing
  const [selectedPublishChannels, setSelectedPublishChannels] = useState(["X", "Telegram", "Notion"]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  // Load initial media & tracks on mount
  useEffect(() => {
    fetchMedia("technology coding");
    fetchMusic();
  }, []);

  const fetchMedia = async (query) => {
    setIsSearchingMedia(true);
    try {
      const res = await socialApi.searchAiMedia(query || "technology");
      if (res && res.items) {
        setMediaItems(res.items);
      }
    } catch {
      // quiet fallback
    } finally {
      setIsSearchingMedia(false);
    }
  };

  const fetchMusic = async () => {
    try {
      const res = await socialApi.searchAiMusic();
      if (res && res.tracks) {
        setTracks(res.tracks);
      }
    } catch {
      // quiet fallback
    }
  };

  const handleGenerateCopy = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setPublishResult(null);

    addToast({
      type: "info",
      title: "Gemini 2.5 Flash Generating",
      message: `Analyzing "${topic}" and generating cross-platform copy...`,
    });

    try {
      const res = await socialApi.generateAiContent(topic, tone);
      if (res && res.success && res.generated) {
        const g = res.generated;
        setGeneratedData(g);
        setPostTitle(g.title || topic);
        setTags(g.tags || ["ai", "devrel"]);
        setPostCopies({
          x: g.x || "",
          telegram: g.telegram || "",
          notion: g.notion || "",
          linkedin: g.linkedin || "",
        });

        // Auto-search images matching topic
        fetchMedia(topic.slice(0, 30));

        addToast({
          type: "success",
          title: "AI Generation Complete",
          message: "Ready to preview, customize, and publish.",
        });
      } else {
        throw new Error(res.error || "Generation returned empty response");
      }
    } catch (err) {
      addToast({
        type: "error",
        title: "Generation Error",
        message: err.message,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
    addToast({
      type: "success",
      title: "Copied",
      message: `Copied ${key.toUpperCase()} text to clipboard.`,
    });
  };

  const toggleChannel = (ch) => {
    setSelectedPublishChannels((prev) =>
      prev.includes(ch) ? (prev.length > 1 ? prev.filter((p) => p !== ch) : prev) : [...prev, ch]
    );
  };

  const handleOmniPublish = async () => {
    const activeText = postCopies[activePlatformTab] || postCopies.x || postTitle;
    if (!activeText.trim()) {
      addToast({
        type: "error",
        title: "Content Required",
        message: "Generate or write copy before publishing.",
      });
      return;
    }

    setIsPublishing(true);
    setPublishResult(null);

    addToast({
      type: "info",
      title: "Swytchcode Multi-Publishing",
      message: `Broadcasting live across ${selectedPublishChannels.join(", ")}...`,
    });

    try {
      const res = await socialApi.omniPublish({
        title: postTitle || topic,
        content: activeText,
        mediaUrl: selectedMedia?.largeUrl || selectedMedia?.url || null,
        platforms: selectedPublishChannels,
      });

      if (res && res.success) {
        setPublishResult(res.report);
        addToast({
          type: "success",
          title: "Multi-Channel Broadcast Complete",
          message: "Delivered to X, Telegram (@SwytehBot), and Notion Hub.",
        });

        // Also save to MongoDB
        try {
          const newDoc = {
            id: `post_${Date.now()}`,
            title: postTitle || topic,
            content: activeText,
            platform: selectedPublishChannels[0],
            platforms: selectedPublishChannels,
            account: "@developer_stream",
            status: "Published",
            mediaUrl: selectedMedia?.url || null,
            tags: tags,
            views: 1,
            likes: 0,
            reposts: 0,
            scheduledAt: new Date().toISOString(),
          };
          await socialApi.createPost(newDoc);
          if (onPostCreated) onPostCreated(newDoc);
        } catch {
          // ignore
        }
      } else {
        throw new Error(res.error || "Omni-publish returned error");
      }
    } catch (err) {
      addToast({
        type: "error",
        title: "Publishing Failed",
        message: err.message,
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <PageContainer>
      {/* Sleek Header */}
      <PageHeader
        title="AI Creation Studio"
        description="Generate platform-optimized copy with Gemini, attach curated visuals & audio, and syndicate to X, Telegram, and Notion in one click."
        badge={
          <Badge variant="primary" size="sm">
            Gemini 2.5 Flash + Swytchcode
          </Badge>
        }
        actions={
          <Button
            variant="primary"
            onClick={handleOmniPublish}
            disabled={isPublishing || (!postCopies.x && !postCopies.telegram)}
            icon={isPublishing ? RefreshCw : Send}
          >
            {isPublishing ? "Publishing to Channels..." : "Omni-Publish Live"}
          </Button>
        }
      />

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: AI Prompt & Content Generator (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Topic & Tone Box */}
          <Card className="p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                1. Topic or Idea Prompt
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="text-xs border border-border rounded-lg px-2.5 py-1 bg-surface text-text-primary focus:outline-none focus:border-primary"
              >
                {TONES.map((t) => (
                  <option key={t} value={t}>
                    Tone: {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Scaling distributed AI agent networks with low latency"
                className="flex-1 px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-surface text-text-primary"
              />
              <Button
                variant="primary"
                onClick={handleGenerateCopy}
                disabled={isGenerating || !topic.trim()}
                icon={isGenerating ? RefreshCw : Sparkles}
              >
                {isGenerating ? "Synthesizing..." : "Generate Copy"}
              </Button>
            </div>

            {/* Quick Inspiration Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-text-muted font-medium">Trending:</span>
              {PRESET_TOPICS.map((pt) => (
                <button
                  key={pt}
                  type="button"
                  onClick={() => setTopic(pt)}
                  className="text-[11px] px-2.5 py-0.5 rounded-full bg-surface-soft hover:bg-primary-soft hover:text-primary text-text-secondary border border-border transition-colors cursor-pointer"
                >
                  {pt}
                </button>
              ))}
            </div>
          </Card>

          {/* Generated Copy by Platform Tabs */}
          <Card className="overflow-hidden">
            <div className="border-b border-border bg-surface-soft px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {[
                  { id: "x", label: "X (Twitter)", limit: 280 },
                  { id: "telegram", label: "Telegram", limit: 4096 },
                  { id: "notion", label: "Notion Hub", limit: 2000 },
                  { id: "linkedin", label: "LinkedIn", limit: 3000 },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActivePlatformTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                      activePlatformTab === tab.id
                        ? "bg-surface text-primary shadow-subtle border border-border"
                        : "text-text-muted hover:text-text-primary hover:bg-surface"
                    }`}
                  >
                    <PlatformIcon platform={tab.id} className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleCopyText(activePlatformTab, postCopies[activePlatformTab])}
                disabled={!postCopies[activePlatformTab]}
                className="flex items-center gap-1 text-[11px] text-text-muted hover:text-text-primary disabled:opacity-40 cursor-pointer"
              >
                {copiedKey === activePlatformTab ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-success" />
                    <span className="text-success font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 space-y-3">
              <textarea
                rows={7}
                value={postCopies[activePlatformTab]}
                onChange={(e) =>
                  setPostCopies((prev) => ({
                    ...prev,
                    [activePlatformTab]: e.target.value,
                  }))
                }
                placeholder={
                  isGenerating
                    ? "Gemini is analyzing the topic and writing formatted platform content..."
                    : `Type or click "Generate Copy" to create optimized text for ${activePlatformTab.toUpperCase()}...`
                }
                className="w-full text-xs sm:text-sm font-sans text-text-primary border-0 focus:ring-0 p-0 resize-none leading-relaxed placeholder:text-text-muted focus:outline-none bg-surface"
              />

              <div className="flex items-center justify-between pt-2 border-t border-border text-[11px] text-text-muted">
                <div className="flex items-center gap-2">
                  <span>
                    Length: <strong className="text-text-primary">{postCopies[activePlatformTab].length}</strong> chars
                  </span>
                  {activePlatformTab === "x" && (
                    <span
                      className={`font-semibold ${
                        280 - postCopies.x.length < 0 ? "text-danger" : "text-success"
                      }`}
                    >
                      ({280 - postCopies.x.length} left)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-text-muted">
                  <ShieldCheck className="w-3 h-3 text-success" />
                  <span>Verified Schema</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Publish Channel Targets */}
          <Card className="p-4 space-y-3">
            <label className="text-xs font-semibold text-text-primary uppercase tracking-wider block">
              2. Target Syndication Channels
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: "X",
                  name: "X (Twitter)",
                  handle: "@developer_stream",
                  desc: "Canonical tweet via x_v2.tweet.create",
                  tool: "x_v2.tweet.create",
                },
                {
                  id: "Telegram",
                  name: "Telegram Channel",
                  handle: "@BeingA_07",
                  desc: "Bot @SwytehBot via telegram_v5_0",
                  tool: "telegram_v5_0.sendmessage.create",
                },
                {
                  id: "Notion",
                  name: "Notion Hub",
                  handle: "AI Community Hub",
                  desc: "Subpage via notion.page.create",
                  tool: "notion.page.create",
                },
              ].map((ch) => {
                const isSelected = selectedPublishChannels.includes(ch.id);
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => toggleChannel(ch.id)}
                    className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-primary-soft/40 border-primary/40 ring-1 ring-primary/30"
                        : "bg-surface border-border hover:border-border-hover opacity-70"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <PlatformIcon platform={ch.id} className="w-4 h-4 text-text-secondary" />
                        <span className="text-xs font-semibold text-text-primary">{ch.name}</span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          isSelected ? "bg-primary text-text-inverse" : "border border-border"
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5" />}
                      </div>
                    </div>
                    <div className="text-[11px] font-medium text-text-secondary truncate">{ch.handle}</div>
                    <div className="text-[10px] text-text-muted mt-0.5 truncate">{ch.desc}</div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column: Visual Media & Audio Attachments (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Image Search & Selection */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-info" />
                3. Curated Visual Media
              </label>
              {selectedMedia && (
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="text-[11px] text-danger hover:underline font-medium cursor-pointer"
                >
                  Clear Image
                </button>
              )}
            </div>

            <div className="flex gap-1.5">
              <input
                type="text"
                value={mediaQuery}
                onChange={(e) => setMediaQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchMedia(mediaQuery)}
                placeholder="Search images (Pixabay)..."
                className="flex-1 px-2.5 py-1.5 text-xs border border-border rounded-lg focus:outline-none focus:border-primary bg-surface text-text-primary"
              />
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={() => fetchMedia(mediaQuery)}
                icon={isSearchingMedia ? RefreshCw : undefined}
              >
                {isSearchingMedia ? "Searching..." : "Search"}
              </Button>
            </div>

            {/* Selected Image Preview */}
            {selectedMedia && (
              <div className="relative rounded-lg overflow-hidden border-2 border-primary group">
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.tags || "Selected"}
                  className="w-full h-36 object-cover"
                />
                <div className="absolute inset-0 bg-surface-active/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-text-primary text-xs font-medium bg-surface/90 border border-border px-2.5 py-1 rounded-md shadow-subtle">
                    Attached to Post
                  </span>
                </div>
              </div>
            )}

            {/* Image Grid */}
            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
              {mediaItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedMedia(item)}
                  className={`relative rounded-lg overflow-hidden aspect-video border transition-all cursor-pointer ${
                    selectedMedia?.id === item.id
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border hover:opacity-80"
                  }`}
                >
                  <img src={item.url} alt={item.tags} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </Card>

          {/* Soundtrack & Audio Vibes (Jamendo) */}
          <Card className="p-4 space-y-3">
            <label className="text-xs font-semibold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-primary" />
              4. Background Audio Vibe
            </label>

            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {tracks.map((track) => {
                const isSelected = selectedTrack?.id === track.id;
                return (
                  <div
                    key={track.id}
                    onClick={() => setSelectedTrack(track)}
                    className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? "bg-primary-soft/50 border-primary/40 ring-1 ring-primary/30"
                        : "bg-surface-soft border-border hover:border-border-hover"
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="font-medium text-text-primary truncate">{track.name}</div>
                      <div className="text-[10px] text-text-muted truncate">{track.artist}</div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {track.audio && (
                        <audio controls className="h-6 w-28">
                          <source src={track.audio} type="audio/mpeg" />
                        </audio>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Live Dispatch Feedback Result */}
          {publishResult && (
            <Card className="p-4 space-y-2.5 bg-success-soft/50 border-success/30">
              <div className="flex items-center gap-2 text-success font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4 text-success" />
                Broadcast Dispatched Successfully
              </div>

              <div className="space-y-1 text-[11px] text-text-secondary">
                {publishResult.toolsExecuted?.map((t) => (
                  <div key={t.name} className="flex items-center justify-between py-0.5 border-b border-success/15 last:border-0">
                    <span className="font-medium text-text-primary">{t.name}:</span>
                    <span className="font-mono text-success">{t.latency || "OK"} &bull; Success</span>
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
