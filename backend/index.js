import "dotenv/config";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { processImageToReel } from "./src/services/pipeline.service.js";

const FOLDER_PATH = "./memes_image";
const INCLUDE_TEXT = false;

async function runBatch() {
  const dirs = ["uploads", "output"];
  dirs.forEach((dir) => {
    if (!fsSync.existsSync(dir)) {
      fsSync.mkdirSync(dir, { recursive: true });
    }
  });

  for (const dir of dirs) {
    try {
      const files = await fs.readdir(dir);
      for (const file of files) {
        await fs.unlink(path.join(dir, file)).catch(() => {});
      }
    } catch (err) {
      console.warn(`Could not clean ${dir}: ${err.message}`);
    }
  }

  let successCount = 0;
  let skipCount = 0;

  try {
    const files = await fs.readdir(FOLDER_PATH);
    const images = files.filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return [".jpg", ".jpeg", ".png", ".webp"].includes(ext);
    });

    for (const image of images) {
      const fullPath = path.join(FOLDER_PATH, image);
      try {
        await processImageToReel(fullPath, {
          niche: "kanhacode",
          includeText: INCLUDE_TEXT,
          igPageId: process.env.IG_PAGE_ID_1,
          isBatch: true,
        });

        successCount++;
        await fs.unlink(fullPath).catch((err) => {});
      } catch (err) {
        console.error(`\nSkipping ${image}: ${err.message}`);
        skipCount++;
      }
    }
  } catch (error) {
    console.error("Batch processing failed:", error.message);
  }
}

runBatch();
