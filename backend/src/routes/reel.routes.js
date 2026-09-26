import express from "express";
import multer from "multer";
import {
  generateMusing,
  generateFromImage,
} from "../controllers/reel.controller.js";
import { ensureDirectories } from "../middleware/directory.middleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/generate-musing", ensureDirectories, generateMusing);
router.post(
  "/generate-reel",
  ensureDirectories,
  upload.single("image"),
  generateFromImage,
);

export default router;
