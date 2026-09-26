import { processAutoSadReel, processImageToReel } from "../services/pipeline.service.js";

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
      igPageId: process.env.IG_PAGE_ID_2
    });
    res.json({ success: true, url: result.publicUrl });
  } catch (error) {
    console.error(`[API Error] ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};
