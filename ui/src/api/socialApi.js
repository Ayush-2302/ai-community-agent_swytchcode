let API_BASE_URL = "http://localhost:3000/api/social";

// Detect whether backend is running on port 3000 (processImages) or 8000 (portfolio_b)
async function detectActiveBaseUrl() {
  const candidates = [
    "http://localhost:3000/api/social",
    "http://localhost:8000/api/social",
  ];
  for (const url of candidates) {
    try {
      const res = await fetch(`${url}/automation/status`, { signal: AbortSignal.timeout(1200) });
      if (res.ok) {
        API_BASE_URL = url;
        return url;
      }
    } catch (e) {
      // try next
    }
  }
  return API_BASE_URL;
}
detectActiveBaseUrl();


// Helper to normalize MongoDB post document into UI format
export function normalizePost(doc) {
  if (!doc) return null;
  const id = doc._id ? doc._id.toString() : doc.id;
  const platform = Array.isArray(doc.platforms) && doc.platforms.length > 0
    ? doc.platforms[0].charAt(0).toUpperCase() + doc.platforms[0].slice(1)
    : "X";

  // Pick first available caption or content
  let bodyContent = doc.content || "";
  if (!bodyContent && doc.captions) {
    bodyContent =
      doc.captions.x ||
      doc.captions.linkedin ||
      doc.captions.instagram ||
      doc.captions.telegram ||
      doc.captions.slack ||
      doc.topic ||
      "";
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
    title: doc.title || doc.topic || "Untitled Post",
    topic: doc.topic || doc.title,
    content: bodyContent,
    platform,
    platforms: doc.platforms || [platform.toLowerCase()],
    account: doc.account || "@acme_eng",
    scheduledAt: doc.scheduledAt ? new Date(doc.scheduledAt).toISOString() : new Date().toISOString(),
    status: normStatus,
    campaign: doc.campaign || "General",
    mediaUrl: doc.mediaUrl || null,
    tags: doc.tags || [],
    views: doc.views || 0,
    likes: doc.likes || 0,
    reposts: doc.reposts || 0,
    failureReason: doc.failureReason || null,
    createdAt: doc.createdAt || new Date().toISOString(),
  };
}

export const socialApi = {
  // Fetch all posts from MongoDB collection
  async getPosts() {
    try {
      const res = await fetch(`${API_BASE_URL}`, {
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        const rawList = data.posts || [];
        return rawList.map(normalizePost);
      }
    } catch (err) {
      console.warn("[socialApi] Backend getPosts failed, using fallback:", err.message);
    }
    return null;
  },

  // Create post directly into MongoDB
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

      const res = await fetch(`${API_BASE_URL}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        return normalizePost(data.post);
      }
    } catch (err) {
      console.warn("[socialApi] createPost failed:", err.message);
    }
    return null;
  },

  // Update existing post in MongoDB
  async updatePost(id, updateData) {
    try {
      const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      if (res.ok) {
        const data = await res.json();
        return normalizePost(data.post);
      }
    } catch (err) {
      console.warn("[socialApi] updatePost failed:", err.message);
    }
    return null;
  },

  // Delete post from MongoDB
  async deletePost(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        return true;
      }
    } catch (err) {
      console.warn("[socialApi] deletePost failed:", err.message);
    }
    return false;
  },

  // Publish post immediately
  async publishNow(id, platform = null) {
    try {
      const res = await fetch(`${API_BASE_URL}/publish/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.post;
      }
    } catch (err) {
      console.warn("[socialApi] publishNow failed:", err.message);
    }
    return null;
  },

  // Fetch queue from backend
  async getQueue() {
    try {
      const res = await fetch(`${API_BASE_URL}/queue`);
      if (res.ok) {
        const data = await res.json();
        return (data.queue || []).map((doc, idx) => {
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
      console.warn("[socialApi] getQueue failed:", err.message);
    }
    return null;
  },

  // Reorder queue in backend
  async reorderQueue(orderedIds) {
    try {
      const res = await fetch(`${API_BASE_URL}/queue/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
      if (res.ok) {
        const data = await res.json();
        return (data.queue || []).map(normalizePost);
      }
    } catch (err) {
      console.warn("[socialApi] reorderQueue failed:", err.message);
    }
    return null;
  },

  // Fetch live analytics aggregated from MongoDB
  async getAnalytics() {
    try {
      const res = await fetch(`${API_BASE_URL}/analytics`);
      if (res.ok) {
        const data = await res.json();
        return data.analytics;
      }
    } catch (err) {
      console.warn("[socialApi] getAnalytics failed:", err.message);
    }
    return null;
  },

  // Fetch accounts connected in backend
  async getAccounts() {
    try {
      const res = await fetch(`${API_BASE_URL}/accounts`);
      if (res.ok) {
        const data = await res.json();
        return data.accounts;
      }
    } catch (err) {
      console.warn("[socialApi] getAccounts failed:", err.message);
    }
    return null;
  },

  // Fetch campaigns from backend
  async getCampaigns() {
    try {
      const res = await fetch(`${API_BASE_URL}/campaigns`);
      if (res.ok) {
        const data = await res.json();
        return data.campaigns;
      }
    } catch (err) {
      console.warn("[socialApi] getCampaigns failed:", err.message);
    }
    return null;
  },

  // Fetch operational logs from backend
  async getLogs() {
    try {
      const res = await fetch(`${API_BASE_URL}/logs`);
      if (res.ok) {
        const data = await res.json();
        return data.logs;
      }
    } catch (err) {
      console.warn("[socialApi] getLogs failed:", err.message);
    }
    return null;
  },

  // Automation Daemon Status
  async getAutomationStatus() {
    try {
      const res = await fetch(`${API_BASE_URL}/automation/status`);
      if (res.ok) {
        const data = await res.json();
        return data.daemon;
      }
    } catch (err) {
      console.warn("[socialApi] getAutomationStatus failed:", err.message);
    }
    return null;
  },

  // Swytchcode Health Check
  async testSwytchcode(provider = null) {
    try {
      const res = await fetch(`${API_BASE_URL}/swytchcode/health${provider ? `?provider=${provider}` : ""}`);
      if (res.ok) {
        const data = await res.json();
        return data.health;
      }
    } catch (err) {
      console.warn("[socialApi] testSwytchcode failed:", err.message);
    }
    return null;
  },
};
