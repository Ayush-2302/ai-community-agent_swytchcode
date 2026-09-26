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
  getCampaigns,
  getLogs,
} from "../controllers/socialController.js";
import swytchcodeAdapter from "../services/social/adapters/SwytchcodeAdapter.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import verifyUser from "../middlewares/verifyUser.js";

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
router.get("/campaigns", getCampaigns);
router.get("/logs", getLogs);

router.get("/", getPosts);
router.get("/:id", getPostById);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);

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

export default router;


