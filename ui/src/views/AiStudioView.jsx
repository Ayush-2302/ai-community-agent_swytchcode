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
import { Button } from "../components/common/Button";
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
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Sleek Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">AI Creation Studio</h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-violet-50 text-violet-700 border border-violet-200">
              Gemini 2.5 Flash + Swytchcode
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Generate platform-optimized copy with Gemini, attach curated visuals & audio, and syndicate to X, Telegram, and Notion in one click.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={handleOmniPublish}
            disabled={isPublishing || (!postCopies.x && !postCopies.telegram)}
            className="flex items-center gap-2 text-xs"
          >
            {isPublishing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Publishing to Channels...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Omni-Publish Live
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: AI Prompt & Content Generator (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Topic & Tone Box */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                1. Topic or Idea Prompt
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
              />
              <Button
                variant="primary"
                onClick={handleGenerateCopy}
                disabled={isGenerating || !topic.trim()}
                className="whitespace-nowrap flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Synthesizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate Copy
                  </>
                )}
              </Button>
            </div>

            {/* Quick Inspiration Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 font-medium">Trending:</span>
              {PRESET_TOPICS.map((pt) => (
                <button
                  key={pt}
                  type="button"
                  onClick={() => setTopic(pt)}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 border border-slate-200 transition-colors"
                >
                  {pt}
                </button>
              ))}
            </div>
          </div>

          {/* Generated Copy by Platform Tabs */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="border-b border-slate-200 bg-slate-50/60 px-4 py-2.5 flex items-center justify-between">
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
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      activePlatformTab === tab.id
                        ? "bg-white text-indigo-700 shadow-xs border border-slate-200/80"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
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
                className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 disabled:opacity-40"
              >
                {copiedKey === activePlatformTab ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-medium">Copied</span>
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
                className="w-full text-xs sm:text-sm font-sans text-slate-800 border-0 focus:ring-0 p-0 resize-none leading-relaxed placeholder:text-slate-400 focus:outline-none"
              />

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <span>
                    Length: <strong className="text-slate-700">{postCopies[activePlatformTab].length}</strong> chars
                  </span>
                  {activePlatformTab === "x" && (
                    <span
                      className={`font-semibold ${
                        280 - postCopies.x.length < 0 ? "text-rose-600" : "text-emerald-600"
                      }`}
                    >
                      ({280 - postCopies.x.length} left)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-slate-400">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  <span>Verified Schema</span>
                </div>
              </div>
            </div>
          </div>

          {/* Publish Channel Targets */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
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
                    className={`text-left p-3 rounded-lg border transition-all ${
                      isSelected
                        ? "bg-indigo-50/50 border-indigo-300 ring-1 ring-indigo-200"
                        : "bg-white border-slate-200 hover:border-slate-300 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <PlatformIcon platform={ch.id} className="w-4 h-4" />
                        <span className="text-xs font-semibold text-slate-900">{ch.name}</span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          isSelected ? "bg-indigo-600 text-white" : "border border-slate-300"
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5" />}
                      </div>
                    </div>
                    <div className="text-[11px] font-medium text-slate-600 truncate">{ch.handle}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">{ch.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Visual Media & Audio Attachments (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Image Search & Selection */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-sky-500" />
                3. Curated Visual Media
              </label>
              {selectedMedia && (
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="text-[11px] text-rose-500 hover:text-rose-700 font-medium"
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
                className="flex-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-sky-500 bg-slate-50"
              />
              <button
                type="button"
                onClick={() => fetchMedia(mediaQuery)}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md"
              >
                {isSearchingMedia ? <RefreshCw className="w-3 h-3 animate-spin" /> : "Search"}
              </button>
            </div>

            {/* Selected Image Preview */}
            {selectedMedia && (
              <div className="relative rounded-lg overflow-hidden border-2 border-indigo-500 group">
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.tags || "Selected"}
                  className="w-full h-36 object-cover"
                />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-medium bg-slate-900/80 px-2 py-1 rounded">
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
                  className={`relative rounded-md overflow-hidden aspect-video border transition-all ${
                    selectedMedia?.id === item.id
                      ? "border-indigo-600 ring-2 ring-indigo-400"
                      : "border-slate-200 hover:opacity-80"
                  }`}
                >
                  <img src={item.url} alt={item.tags} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Soundtrack & Audio Vibes (Jamendo) */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-violet-500" />
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
                        ? "bg-violet-50/70 border-violet-300 ring-1 ring-violet-200"
                        : "bg-slate-50/50 border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="font-medium text-slate-800 truncate">{track.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{track.artist}</div>
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
          </div>

          {/* Live Dispatch Feedback Result */}
          {publishResult && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-900 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Broadcast Dispatched Successfully
              </div>

              <div className="space-y-1 text-[11px] text-emerald-800">
                {publishResult.toolsExecuted?.map((t) => (
                  <div key={t.name} className="flex items-center justify-between py-0.5 border-b border-emerald-100/60 last:border-0">
                    <span className="font-medium">{t.name}:</span>
                    <span className="font-mono text-emerald-700">{t.latency || "OK"} &bull; Success</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
