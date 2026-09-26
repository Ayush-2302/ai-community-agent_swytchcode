import express from "express";
import multer from "multer";
import {
  createPost,
  createDirectPost,
  getPostById,
  getPosts,
  publishPost,
  updatePost,
  deletePost,
  getQueue,
  reorderQueue,
  getAnalytics,
  getAccounts,
  connectAccount,
  deleteAccount,
  syncAccount,
  getCampaigns,
  getLogs,
} from "../controllers/socialController.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import verifyUser from "../middlewares/verifyUser.js";
import config from "../config/env.js";

const router = express.Router();

const upload = multer({ dest: "src/uploads/" });

// Core Post routes
router.post(
  "/generate",
  verifyUser,
  roleMiddleware("admin"),
  upload.single("image"),
  createPost,
);
router.post(
  "/publish/:id",
  verifyUser,
  roleMiddleware("admin"),
  upload.single("image"),
  publishPost,
);

// Direct Operational Post Endpoints
router.post("/create", createDirectPost);
router.get("/queue", getQueue);
router.put("/queue/reorder", reorderQueue);
router.get("/analytics", getAnalytics);
router.get("/accounts", getAccounts);
router.post("/accounts/connect", connectAccount);
router.delete("/accounts/:id", deleteAccount);
router.post("/accounts/:id/sync", syncAccount);
router.get("/campaigns", getCampaigns);
router.get("/logs", getLogs);

router.get("/", getPosts);
router.get("/posts", getPosts);
router.get("/:id", getPostById);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);

// Swytchcode Multi-Channel Omni-Publish Endpoint (X + Telegram + Notion)
router.post("/omni-publish", async (req, res) => {
  try {
    const { title, content, mediaUrl } = req.body;
    const { swytchcodeOmniAgent } = await import("../services/social/SwytchcodeOmniAgent.js");
    const report = await swytchcodeOmniAgent.runOmniPipeline({
      title: title || "SocialOps Update",
      content: content || title || "Announcement update dispatched via Swytchcode.",
      mediaUrl: mediaUrl || null,
    });
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Swytchcode API Integration Endpoints
router.get("/swytchcode/health", async (req, res) => {
  try {
    const provider = req.query.provider || null;
    const health = await swytchcodeAdapter.healthCheck(provider);
    res.json({ success: true, health });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/swytchcode/dispatch", async (req, res) => {
  try {
    const { provider, account, text, mediaUrls, scheduleAt } = req.body;
    const result = await swytchcodeAdapter.dispatch({
      provider,
      account,
      text,
      mediaUrls,
      scheduleAt,
    });
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/swytchcode/webhook", async (req, res) => {
  try {
    const result = await swytchcodeAdapter.handleWebhook(req.body);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Automation Daemon & Job Runner Endpoints
router.get("/automation/status", (req, res) => {
  res.json({
    success: true,
    daemon: {
      status: "Running",
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
      pid: process.pid,
      timestamp: new Date().toISOString(),
    },
  });
});

// AI Studio: Gemini Content Generation
router.post("/ai/generate", async (req, res) => {
  try {
    const { topic = "AI Agents & Autonomous Workflows", tone = "Insightful & Professional" } = req.body;
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: config.ai.geminiApiKey });

    const prompt = `You are a world-class AI Social Media Strategist and Lead DevRel for 2026.
Topic: "${topic}"
Tone: "${tone}"

Generate optimized, ready-to-publish social copy tailored specifically for each platform:
1. "x": A punchy, high-engagement tweet strictly under 260 characters with 1-2 relevant tech hashtags.
2. "telegram": A beautifully formatted Telegram channel post with emoji headers, key bullet takeaways, and markdown formatting.
3. "notion": A structured executive summary suitable for a Notion Community Documentation Hub (Title, Overview, Strategic Impact).
4. "linkedin": An insightful, thought-leadership post with paragraph breaks and 3 hashtags.
5. "title": A short, catchy title (under 50 chars).
6. "tags": An array of 3-5 lowercase relevant tags/keywords.

Return ONLY a valid JSON object matching this schema:
{
  "title": "string",
  "x": "string",
  "telegram": "string",
  "notion": "string",
  "linkedin": "string",
  "tags": ["tag1", "tag2", "tag3"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const raw = response.text || "";
    const cleanJson = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    let parsed;
    try {
      parsed = JSON.parse(cleanJson);
    } catch {
      parsed = {
        title: topic,
        x: `Exploring ${topic} today! The acceleration in AI agentic pipelines is redefining developer workflows. #DevRel #AI`,
        telegram: `🚀 *${topic}*\n\nDeep dive into modern autonomous developer architectures:\n• Real-time multi-agent execution\n• Zero-overhead orchestration\n• Canonical execution kernels\n\nWhat are your thoughts on agentic workflows?`,
        notion: `# ${topic}\n\n**Strategic Overview**\nImplementation breakdown and architectural impact on engineering workflows.\n\n**Key Takeaways**\n- Automated provider syndication\n- Deterministic telemetry`,
        linkedin: `The future of software delivery is increasingly autonomous. Our latest work on ${topic} shows how modern teams eliminate integration overhead. Let's discuss in the comments.`,
        tags: ["ai", "agents", "swytchcode", "devrel"],
      };
    }

    res.json({ success: true, generated: parsed });
  } catch (error) {
    console.error("[AI Studio Generate Error]", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Studio: Image Search (Pixabay)
router.get("/ai/media", async (req, res) => {
  try {
    const query = req.query.query || "artificial intelligence technology";
    const axios = (await import("axios")).default;
    const pixabayKey = config.media.pixabayApiKey;

    if (!pixabayKey) {
      return res.json({ success: true, items: [] });
    }

    const resp = await axios.get("https://pixabay.com/api/", {
      params: {
        key: pixabayKey,
        q: query,
        image_type: "photo",
        orientation: "horizontal",
        safesearch: "true",
        per_page: 8,
      },
      timeout: 8000,
    });

    const items = (resp.data.hits || []).map((hit) => ({
      id: hit.id,
      url: hit.webformatURL,
      largeUrl: hit.largeImageURL,
      tags: hit.tags,
      author: hit.user,
      likes: hit.likes,
    }));

    res.json({ success: true, items });
  } catch (error) {
    console.warn("[AI Studio Media Error]", error.message);
    res.json({ success: true, items: [] });
  }
});

// AI Studio: Audio / Music Search (Jamendo)
router.get("/ai/music", async (req, res) => {
  try {
    const clientId = config.media.jamendoClientId;
    const axios = (await import("axios")).default;
    const resp = await axios.get("https://api.jamendo.com/v3.0/tracks/", {
      params: {
        client_id: clientId,
        format: "json",
        limit: 6,
        order: "popularity_total",
      },
      timeout: 8000,
    });

    const tracks = (resp.data.results || []).map((t) => ({
      id: t.id,
      name: t.name,
      artist: t.artist_name,
      audio: t.audio,
      duration: t.duration,
      shareUrl: t.shareurl,
    }));

    res.json({ success: true, tracks });
  } catch (error) {
    console.warn("[AI Studio Music Error]", error.message);
    res.json({ success: true, tracks: [] });
  }
});

export default router;


