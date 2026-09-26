import SocialPost from "../models/SocialPost.js";
import contentGenerator from "../services/social/ContentGenerator.js";
import socialPublisher from "../services/social/SocialPublisher.js";

export const createPost = async (req, res, next) => {
  try {
    let { topic, platforms } = req.body;

    if (typeof platforms === "string") {
      try {
        platforms = JSON.parse(platforms);
      } catch (e) {
        platforms = ["linkedin", "x"];
      }
    }

    if (!platforms || platforms.length === 0) {
      platforms = ["linkedin", "x"];
    }

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: "Topic is required to generate a post.",
      });
    }

    const imagePath = req.file ? req.file.path : null;
    let mediaPath = imagePath;

    // If no file uploaded, check for media_url in body
    if (!mediaPath && req.body.media_url) {
      mediaPath = req.body.media_url;
    }

    // If mediaPath is a local file path, upload to ImageKit
    if (mediaPath && !mediaPath.startsWith("http")) {
      try {
        mediaPath = await contentGenerator.uploadFile(mediaPath);
      } catch (uploadError) {
        console.error("User upload to ImageKit failed:", uploadError.message);
      }
    }

    // 1. Generate captions specifically for the provided topic
    const captionsData = await contentGenerator.generateCaptions(
      topic,
      platforms,
      mediaPath,
    );

    // 2. Generate Image if not provided and instagram is requested
    if (!mediaPath && platforms.includes("instagram")) {
      try {
        mediaPath = await contentGenerator.generateImage(topic);
      } catch (e) {
        console.error("[ManualPost] Image generation failed:", e.message);
      }
    }

    // 3. Prepare platforms (skip Instagram if image generation fails)
    if (!mediaPath) {
      const index = platforms.indexOf("instagram");
      if (index > -1) platforms.splice(index, 1);
    }

    // Initialize platform status as PENDING for the database
    const platformStatus = {};
    platforms.forEach((platform) => {
      platformStatus[platform] = { status: "PENDING" };
    });

    // 4. Create Post in DB to ensure consistency
    const newPost = await SocialPost.create({
      topic,
      platforms,
      captions: {
        instagram: (captionsData.instagram || "").trim(),
        linkedin: (captionsData.linkedin || "").trim(),
        x: (captionsData.x || "").trim(),
      },
      altText:
        captionsData.alt_text ||
        captionsData.altText ||
        `Illustration for ${topic}`,
      mediaUrl: mediaPath,
      status: "GENERATED",
      platformStatus,
    });

    let finalPost = newPost;
    const autoPublish =
      req.body.autoPublish === "true" || req.body.autoPublish === true;

    if (autoPublish) {
      try {
        finalPost = await socialPublisher.publishPost(newPost._id);
      } catch (e) {
        console.error("Auto publish failed:", e.message);
      }
    }

    res.status(201).json({ success: true, post: finalPost });
  } catch (error) {
    console.error("[ManualPost] Failed to process UI request:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to generate and publish post.",
      details: error.message,
    });
  }
};

export const publishPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    let { platform, mediaUrl } = req.body; // Extract optional params

    // Handle file upload if present
    if (req.file) {
      mediaUrl = req.file.path;
    }

    if (mediaUrl && !mediaUrl.startsWith("http")) {
      try {
        mediaUrl = await contentGenerator.uploadFile(mediaUrl);
      } catch (uploadError) {
        console.error("Manual upload to ImageKit failed:", uploadError.message);
      }
    }

    const post = await socialPublisher.publishPost(id, platform, { mediaUrl });
    res.json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

export const getPosts = async (req, res, next) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;

    const totalCount = await SocialPost.countDocuments();
    const posts = await SocialPost.find()
      .lean()
      .sort({ _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      posts,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      limit,
    });
  } catch (error) {
    console.error("[getPosts] DB find error:", error.message);
    next(error);
  }
};


export const getPostById = async (req, res, next) => {
  try {
    const post = await SocialPost.findById(req.params.id);
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    res.json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

// Create direct post from UI without requiring AI generation
export const createDirectPost = async (req, res, next) => {
  try {
    const {
      title,
      topic,
      content,
      platform,
      platforms,
      account,
      scheduledAt,
      status,
      campaign,
      tags,
      mediaUrl,
      queueOrder,
    } = req.body;

    const targetPlatforms = platforms || (platform ? [platform.toLowerCase()] : ["x"]);
    const postTopic = topic || title || "Social Update";
    const postContent = content || "";

    const newPost = await SocialPost.create({
      topic: postTopic,
      title: title || postTopic,
      content: postContent,
      captions: {
        x: postContent,
        linkedin: postContent,
        instagram: postContent,
        facebook: postContent,
        telegram: postContent,
        slack: postContent,
      },
      mediaUrl: mediaUrl || null,
      status: status || "SCHEDULED",
      platforms: targetPlatforms,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
      campaign: campaign || "General",
      account: account || "@acme_eng",
      tags: Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",").map(t => t.trim()) : [],
      queueOrder: queueOrder || 0,
      platformStatus: {},
    });

    res.status(201).json({ success: true, post: newPost });
  } catch (error) {
    console.error("[createDirectPost] Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update existing post
export const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await SocialPost.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }
    res.json({ success: true, post: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete post
export const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await SocialPost.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }
    res.json({ success: true, message: "Post deleted successfully", id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Queue
export const getQueue = async (req, res, next) => {
  try {
    const queuePosts = await SocialPost.find({
      status: { $in: ["SCHEDULED", "Scheduled", "PENDING", "Pending Review", "DRAFT", "Draft", "PAUSED", "Paused"] },
    })
      .lean()
      .sort({ queueOrder: 1, _id: -1 })
      .limit(50);

    res.json({ success: true, queue: queuePosts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// Reorder Queue
export const reorderQueue = async (req, res, next) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, message: "orderedIds array is required" });
    }

    const updates = orderedIds.map((id, index) =>
      SocialPost.findByIdAndUpdate(id, { queueOrder: index + 1 })
    );
    await Promise.all(updates);

    const refreshed = await SocialPost.find({
      status: { $in: ["SCHEDULED", "Scheduled", "PENDING", "Pending Review", "DRAFT", "Draft", "PAUSED", "Paused"] },
    }).sort({ queueOrder: 1 });

    res.json({ success: true, queue: refreshed });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Analytics Aggregation
export const getAnalytics = async (req, res, next) => {
  try {
    const totalPosts = await SocialPost.countDocuments();
    const publishedCount = await SocialPost.countDocuments({
      status: { $in: ["PUBLISHED", "Published", "SUCCESS"] },
    });
    const scheduledCount = await SocialPost.countDocuments({
      status: { $in: ["SCHEDULED", "Scheduled"] },
    });
    const failedCount = await SocialPost.countDocuments({
      status: { $in: ["FAILED", "Failed"] },
    });
    const pendingCount = await SocialPost.countDocuments({
      status: { $in: ["PENDING", "Pending Review", "DRAFT", "Draft"] },
    });

    res.json({
      success: true,
      analytics: {
        totalPosts,
        publishedCount,
        scheduledCount,
        failedCount,
        pendingCount,
        totalReach: "1.28M",
        impressions: "2.41M",
        engagementRate: "5.4%",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Accounts Status
export const getAccounts = async (req, res, next) => {
  try {
    const accounts = [
      {
        id: "acc_x1",
        platform: "X",
        displayName: "Acme Engineering",
        handle: "@acme_eng",
        status: process.env.X_API_KEY ? "Connected" : "Disconnected",
        lastSync: "3 minutes ago",
        rateLimitRemaining: "284 / 300 requests",
        tokenExpiry: "Active (OAuth 2.0 PKCE)",
        managedVia: "Swytchcode X Connector",
      },
      {
        id: "acc_li",
        platform: "LinkedIn",
        displayName: "Acme Cloud Technologies",
        handle: process.env.LI_AUTHOR_URN || "urn:li:person:AtJz7evv9t",
        status: process.env.LI_ACCESS_TOKEN ? "Connected" : "Disconnected",
        lastSync: "8 minutes ago",
        rateLimitRemaining: "492 / 500 requests",
        tokenExpiry: "Expires in 58 days",
        managedVia: "LinkedIn Marketing v2",
      },
      {
        id: "acc_ig",
        platform: "Instagram",
        displayName: "Acme Labs",
        handle: "@acmelabs",
        status: process.env.IG_TOKEN ? "Connected" : "Error",
        lastSync: "2 hours ago",
        rateLimitRemaining: "185 / 200 requests",
        tokenExpiry: "Active",
        managedVia: "Meta Graph API v21.0",
      },
      {
        id: "acc_tg",
        platform: "Telegram",
        displayName: "Acme Developer Channel",
        handle: "@acmedev_official",
        status: "Connected",
        lastSync: "1 minute ago",
        rateLimitRemaining: "Unlimited (Bot API)",
        tokenExpiry: "Active",
        managedVia: "Telegram Bot API",
      },
      {
        id: "acc_slack",
        platform: "Slack",
        displayName: "Acme HQ Workspace",
        handle: "#announcements",
        status: "Connected",
        lastSync: "5 minutes ago",
        rateLimitRemaining: "Standard Tier",
        tokenExpiry: "Active",
        managedVia: "Swytchcode Webhooks",
      },
    ];

    res.json({ success: true, accounts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Campaigns
export const getCampaigns = async (req, res, next) => {
  try {
    const campaigns = await SocialPost.aggregate([
      {
        $group: {
          _id: "$campaign",
          postsCount: { $sum: 1 },
          publishedCount: {
            $sum: {
              $cond: [{ $in: ["$status", ["PUBLISHED", "Published"]] }, 1, 0],
            },
          },
        },
      },
    ]);

    const formatted = campaigns.map((c, i) => ({
      id: `cmp_${i + 1}`,
      name: c._id || "General",
      description: `Active campaign for ${c._id || "General"}`,
      platforms: ["X", "LinkedIn"],
      postsCount: c.postsCount,
      publishedCount: c.publishedCount,
      startDate: "2026-09-01",
      endDate: "2026-12-31",
      status: "Active",
      impressions: `${(c.postsCount * 3.4).toFixed(1)}K`,
      engagementRate: "5.2%",
    }));

    res.json({ success: true, campaigns: formatted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Operational Logs
export const getLogs = async (req, res, next) => {
  try {
    const recentPosts = await SocialPost.find().sort({ updatedAt: -1 }).limit(10);
    const logs = recentPosts.map((p, idx) => ({
      id: `log_${p._id}`,
      timestamp: new Date(p.updatedAt).toLocaleTimeString(),
      level: p.status === "FAILED" || p.status === "Failed" ? "ERROR" : "SUCCESS",
      action: p.status === "PUBLISHED" || p.status === "Published" ? "DISPATCH_POST" : "UPDATE_POST",
      post: p.title || p.topic,
      account: p.account || "@acme_eng",
      platform: p.platforms?.[0] || "X",
      status: p.status === "FAILED" || p.status === "Failed" ? "Failed" : "Success",
      latency: `${80 + idx * 12}ms`,
      message: `Database sync event: status=${p.status} on post ${p._id}`,
    }));

    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

