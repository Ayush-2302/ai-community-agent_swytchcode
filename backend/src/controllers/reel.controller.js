import { processAutoSadReel, processImageToReel } from "../services/pipeline.service.js";
import config from "../config/env.js";

export const generateMusing = async (req, res) => {
  const { topic } = req.body;
  try {
    const result = await processAutoSadReel(topic, "video");
    res.json({ success: true, url: result.publicUrl });
  } catch (error) {
    console.error(`[Musing Error] ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

export const generateFromImage = async (req, res) => {
  try {
    if (!req.file) throw new Error("No file uploaded");
    const result = await processImageToReel(req.file.path, {
      niche: "kanhacode",
      includeText: true,
      igPageId: config.channels.instagram.pageId2,
    });
    res.json({ success: true, url: result.publicUrl });
  } catch (error) {
    console.error(`[API Error] ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};
