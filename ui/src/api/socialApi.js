import axios from "axios";
import env from "../config/env";

// Validated environment-driven API configuration
const API_URL = env.api.baseUrl;
const REQUEST_TIMEOUT = env.api.timeout;

// Axios Client instance
export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Returns the validated active API base URL
export async function getBaseUrl() {
  return API_URL;
}

// Request interceptor ensuring standard base URL
apiClient.interceptors.request.use((config) => {
  config.baseURL = API_URL;
  return config;
});

// Helper to safely extract string text from any value (string, nested {caption}, etc.)
export function extractText(val) {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    if (typeof val.caption === "string") return val.caption;
    if (typeof val.text === "string") return val.text;
    if (typeof val.content === "string") return val.content;
    if (typeof val.title === "string") return val.title;
    if (typeof val.topic === "string") return val.topic;
    if (typeof val.message === "string") return val.message;
    if (val.caption && typeof val.caption === "object") return extractText(val.caption);
    try {
      return JSON.stringify(val);
    } catch {
      return "";
    }
  }
  return String(val);
}

// Helper to normalize MongoDB post document into UI format
export function normalizePost(doc) {
  if (!doc) return null;
  const id = doc._id ? doc._id.toString() : doc.id;
  const platform =
    Array.isArray(doc.platforms) && doc.platforms.length > 0
      ? doc.platforms[0].charAt(0).toUpperCase() + doc.platforms[0].slice(1)
      : "X";

  // Pick first available caption or content
  let bodyContent = doc.content;
  if (!bodyContent && doc.captions) {
    bodyContent =
      doc.captions.x ||
      doc.captions.linkedin ||
      doc.captions.instagram ||
      doc.captions.telegram ||
      doc.captions.slack ||
      doc.captions.notion ||
      doc.topic ||
      "";
  }

  const cleanContent = extractText(bodyContent);
  const cleanTitle = extractText(doc.title || doc.topic || "Untitled Post");
  const cleanTopic = extractText(doc.topic || doc.title || "Social Post");

  // Filter out unreachable local file paths (file:///D:/... or D:\...)
  let cleanMediaUrl = doc.mediaUrl || null;
  if (
    cleanMediaUrl &&
    (cleanMediaUrl.startsWith("file://") ||
      /^[a-zA-Z]:[\\/]/.test(cleanMediaUrl) ||
      cleanMediaUrl.startsWith("/Users/") ||
      cleanMediaUrl.startsWith("/home/"))
  ) {
    if (!cleanMediaUrl.startsWith("http://") && !cleanMediaUrl.startsWith("https://") && !cleanMediaUrl.startsWith("data:")) {
      cleanMediaUrl = null;
    }
  }

  // Normalize status
  let normStatus = doc.status || "Scheduled";
  if (normStatus === "SCHEDULED") normStatus = "Scheduled";
  if (normStatus === "PUBLISHED" || normStatus === "SUCCESS") normStatus = "Published";
  if (normStatus === "PENDING") normStatus = "Pending Review";
  if (normStatus === "DRAFT" || normStatus === "GENERATED") normStatus = "Draft";
  if (normStatus === "FAILED") normStatus = "Failed";
  if (normStatus === "PAUSED") normStatus = "Paused";

  return {
    id,
    _id: id,
    title: cleanTitle,
    topic: cleanTopic,
    content: cleanContent,
    platform,
    platforms: doc.platforms || [platform.toLowerCase()],
    account: extractText(doc.account) || "@developer_stream",
    scheduledAt: doc.scheduledAt ? new Date(doc.scheduledAt).toISOString() : new Date().toISOString(),
    status: normStatus,
    campaign: extractText(doc.campaign) || "General",
    mediaUrl: cleanMediaUrl,
    tags: Array.isArray(doc.tags) ? doc.tags.map(extractText) : [],
    views: doc.views || 0,
    likes: doc.likes || 0,
    reposts: doc.reposts || 0,
    failureReason: extractText(doc.failureReason) || null,
    createdAt: doc.createdAt || new Date().toISOString(),
  };
}

export const socialApi = {
  // Fetch all posts from MongoDB collection using axios
  async getPosts() {
    try {
      const res = await apiClient.get("/");
      if (res.data && res.data.success) {
        const rawList = res.data.posts || [];
        return rawList.map(normalizePost);
      }
    } catch (err) {
      console.warn("[socialApi] Axios getPosts failed:", err.message);
    }
    return null;
  },

  // Create post directly into MongoDB using axios
  async createPost(postData) {
    try {
      const payload = {
        title: postData.title,
        topic: postData.title,
        content: postData.content,
        platform: postData.platform?.toLowerCase(),
        platforms: postData.platforms?.map((p) => p.toLowerCase()) || [postData.platform?.toLowerCase()],
        account: postData.account,
        scheduledAt: postData.scheduledAt,
        status: postData.status?.toUpperCase() || "SCHEDULED",
        campaign: postData.campaign,
        tags: postData.tags,
        mediaUrl: postData.mediaUrl,
        queueOrder: postData.queueOrder || 0,
      };

      const res = await apiClient.post("/create", payload);
      if (res.data && res.data.success) {
        return normalizePost(res.data.post);
      }
    } catch (err) {
      console.warn("[socialApi] Axios createPost failed:", err.message);
    }
    return null;
  },

  // Update existing post in MongoDB using axios
  async updatePost(id, updateData) {
    try {
      const res = await apiClient.put(`/${id}`, updateData);
      if (res.data && res.data.success) {
        return normalizePost(res.data.post);
      }
    } catch (err) {
      console.warn("[socialApi] Axios updatePost failed:", err.message);
    }
    return null;
  },

  // Delete post from MongoDB using axios
  async deletePost(id) {
    try {
      const res = await apiClient.delete(`/${id}`);
      return Boolean(res.data && res.data.success);
    } catch (err) {
      console.warn("[socialApi] Axios deletePost failed:", err.message);
    }
    return false;
  },

  // Publish post immediately using axios
  async publishNow(id, platform = null) {
    try {
      const res = await apiClient.post(`/publish/${id}`, { platform });
      if (res.data && res.data.success) {
        return res.data.post;
      }
    } catch (err) {
      console.warn("[socialApi] Axios publishNow failed:", err.message);
    }
    return null;
  },

  // Fetch queue from backend using axios
  async getQueue() {
    try {
      const res = await apiClient.get("/queue");
      if (res.data && res.data.success) {
        return (res.data.queue || []).map((doc, idx) => {
          const norm = normalizePost(doc);
          return {
            ...norm,
            queueOrder: doc.queueOrder || idx + 1,
            publishTime: new Date(norm.scheduledAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            timeRemaining: "Scheduled",
          };
        });
      }
    } catch (err) {
      console.warn("[socialApi] Axios getQueue failed:", err.message);
    }
    return null;
  },

  // Reorder queue in backend using axios
  async reorderQueue(orderedIds) {
    try {
      const res = await apiClient.put("/queue/reorder", { orderedIds });
      if (res.data && res.data.success) {
        return (res.data.queue || []).map(normalizePost);
      }
    } catch (err) {
      console.warn("[socialApi] Axios reorderQueue failed:", err.message);
    }
    return null;
  },

  // Fetch live analytics aggregated from MongoDB using axios
  async getAnalytics() {
    try {
      const res = await apiClient.get("/analytics");
      if (res.data && res.data.success) {
        return res.data.analytics;
      }
    } catch (err) {
      console.warn("[socialApi] Axios getAnalytics failed:", err.message);
    }
    return null;
  },

  // Fetch accounts connected in backend using axios
  async getAccounts() {
    try {
      const res = await apiClient.get("/accounts");
      if (res.data && res.data.success) {
        return res.data.accounts;
      }
    } catch (err) {
      console.warn("[socialApi] Axios getAccounts failed:", err.message);
    }
    return null;
  },

  // Connect account in backend
  async connectAccount(data) {
    try {
      const res = await apiClient.post("/accounts/connect", data);
      return res.data;
    } catch (err) {
      console.warn("[socialApi] Axios connectAccount failed:", err.message);
      return { success: false, error: err.message };
    }
  },

  // Disconnect / delete account from backend
  async deleteAccount(id) {
    try {
      const res = await apiClient.delete(`/accounts/${id}`);
      return res.data;
    } catch (err) {
      console.warn("[socialApi] Axios deleteAccount failed:", err.message);
      return { success: false, error: err.message };
    }
  },

  // Sync account in backend
  async syncAccount(id) {
    try {
      const res = await apiClient.post(`/accounts/${id}/sync`);
      return res.data;
    } catch (err) {
      console.warn("[socialApi] Axios syncAccount failed:", err.message);
      return { success: false, error: err.message };
    }
  },

  // Fetch campaigns from backend using axios
  async getCampaigns() {
    try {
      const res = await apiClient.get("/campaigns");
      if (res.data && res.data.success) {
        return res.data.campaigns;
      }
    } catch (err) {
      console.warn("[socialApi] Axios getCampaigns failed:", err.message);
    }
    return null;
  },

  // Fetch operational logs from backend using axios
  async getLogs() {
    try {
      const res = await apiClient.get("/logs");
      if (res.data && res.data.success) {
        return res.data.logs;
      }
    } catch (err) {
      console.warn("[socialApi] Axios getLogs failed:", err.message);
    }
    return null;
  },

  // Automation Daemon Status using axios
  async getAutomationStatus() {
    try {
      const res = await apiClient.get("/automation/status");
      if (res.data && res.data.success) {
        return res.data.daemon;
      }
    } catch (err) {
      console.warn("[socialApi] Axios getAutomationStatus failed:", err.message);
    }
    return null;
  },

  // Swytchcode Health Check using axios
  async testSwytchcode(provider = null) {
    try {
      const res = await apiClient.get(`/swytchcode/health${provider ? `?provider=${provider}` : ""}`);
      if (res.data && res.data.success) {
        return res.data.health;
      }
    } catch (err) {
      console.warn("[socialApi] Axios testSwytchcode failed:", err.message);
    }
    return null;
  },

  // Swytchcode Multi-Channel Omni-Publish (X, Telegram, Notion)
  async omniPublish(data) {
    try {
      const res = await apiClient.post("/omni-publish", data);
      return res.data;
    } catch (err) {
      console.warn("[socialApi] Axios omniPublish failed:", err.message);
      return { success: false, error: err.message };
    }
  },

  // AI Studio: Gemini Multi-Platform Generation
  async generateAiContent(topic, tone = "Insightful & Professional") {
    try {
      const res = await apiClient.post("/ai/generate", { topic, tone });
      return res.data;
    } catch (err) {
      console.warn("[socialApi] Axios generateAiContent failed:", err.message);
      return { success: false, error: err.message };
    }
  },

  // AI Studio: Visual Media Search
  async searchAiMedia(query = "technology") {
    try {
      const res = await apiClient.get(`/ai/media?query=${encodeURIComponent(query)}`);
      return res.data;
    } catch (err) {
      console.warn("[socialApi] Axios searchAiMedia failed:", err.message);
      return { success: false, items: [] };
    }
  },

  // AI Studio: Background Audio & Tracks Search
  async searchAiMusic(query = "") {
    try {
      const res = await apiClient.get(`/ai/music${query ? `?query=${encodeURIComponent(query)}` : ""}`);
      return res.data;
    } catch (err) {
      console.warn("[socialApi] Axios searchAiMusic failed:", err.message);
      return { success: false, tracks: [] };
    }
  },
};
