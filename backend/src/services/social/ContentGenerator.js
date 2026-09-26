import { GoogleGenAI } from "@google/genai";
import { toFile } from "@imagekit/nodejs";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import imagekit from "../../config/imagekit.js";
import ImageSearchService from "../image/ImageSearchService.js";
import ImageProcessor from "../image/ImageProcessor.js";
import config from "../../config/env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class ContentGenerator {
  constructor() {
    this.apiKey = config.ai.geminiApiKey;
    if (!this.apiKey) {
      console.warn("GEMINI_API_KEY not configured");
    }

    // Initialize GoogleGenAI client
    try {
      this.client = new GoogleGenAI({ apiKey: this.apiKey });
    } catch (e) {
      console.error("Failed to initialize GoogleGenAI client:", e.message);
    }
  }

  async _generateWithRetry(prompt, retries = 5, initialDelay = 10000) {
    for (let i = 0; i < retries; i++) {
      try {
        return await this.client.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });
      } catch (error) {
        const status =
          error.status ||
          (error.response && error.response.status) ||
          (error.error && error.error.code);
        const message = error.message || "";
        const isRateLimit =
          status === 429 ||
          status === 503 ||
          message.includes("429") ||
          message.includes("Too Many Requests") ||
          message.includes("quota");

        if (isRateLimit && i < retries - 1) {
          const waitTime = initialDelay * Math.pow(2, i);
          console.warn(
            `Gemini Rate Limit (${status}). Retrying in ${waitTime / 1000}s... (Attempt ${i + 1}/${retries})`,
          );
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        } else {
          throw error;
        }
      }
    }
  }

  async getTrendingTopic() {
    if (!this.client) throw new Error("GenAI Client not initialized");

    const prompt = `You are a tech trend analyst for 2026. Return ONLY a single trending technology topic name (3-8 words max).

CRITERIA (2026 context):
- Cutting-edge AI/ML/Edge/Quantum/Biotech/Space
- Enterprise-ready, not hype
- Professional social media appeal
- Examples: "AI-Driven Supply Chain Optimization", "Quantum-Resistant Cybersecurity", "Edge AI Health Monitoring"

TRENDING 2026 CATEGORIES:
1. AI Agents & Automation
2. Edge Computing + 6G  
3. Biotech + Personalized Medicine
4. Climate Tech + Carbon Capture
5. Quantum Computing Applications
6. Spatial Computing/AR Workflows

Return ONE topic name only. No explanations.`;

    try {
      const response = await this._generateWithRetry(prompt);
      const topic = response.text
        ? response.text.trim()
        : "Edge AI Health Platforms";

      // Validate: reject bad outputs
      if (
        topic.length < 3 ||
        topic.length > 50 ||
        (!topic.includes("AI") &&
          !topic.includes("Quantum") &&
          !topic.includes("Edge"))
      ) {
        return "AI-Powered Edge Computing Platforms";
      }

      return topic;
    } catch (e) {
      console.error("Failed to get trending topic:", e.message);
      return "AI-Driven Personalized Health Platforms";
    }
  }

  async generateCaptions(
    topic,
    platforms = ["linkedin", "x"],
    imagePath = null,
  ) {
    if (!this.client) throw new Error("GenAI Client not initialized");

    const platformPrompts = {
      instagram:
        '"instagram": "string (casual, engaging caption + emojis + hashtags)",',
      linkedin: '"linkedin": "string (professional, insightful + hashtags)",',
      x: '"x": "string (strictly under 256 chars, punchy)",',
    };

    const selectedPrompts = platforms
      .map((p) => platformPrompts[p])
      .filter(Boolean)
      .join("\n  ");

    const promptText = `Create social posts for topic: "${topic}".
Return ONLY a valid JSON object matching this exact schema:

{
  ${selectedPrompts}
  "alt_text": "string (visual description of an image for this topic)"
}

STRICT RULES:
- Output must be valid JSON ONLY.
- The values for platforms MUST be plain strings containing the full post text (including hashtags). Do NOT make them nested objects.
- All values must be strings.`;

    let contents = promptText;

    if (imagePath && fs.existsSync(imagePath)) {
      const imageBuffer = fs.readFileSync(imagePath);
      const imageBase64 = imageBuffer.toString("base64");
      const mimeType = imagePath.toLowerCase().endsWith(".png")
        ? "image/png"
        : "image/jpeg";

      contents = [
        {
          role: "user",
          parts: [
            { text: promptText },
            { inlineData: { mimeType, data: imageBase64 } },
          ],
        },
      ];
    }

    try {
      const response = await this._generateWithRetry(contents);
      let rawText = response.text ? response.text : JSON.stringify(response);

      // Clean markdown more robustly
      rawText = rawText.trim();

      // Attempt to extract JSON if wrapped in code blocks or just text
      const jsonMatch =
        rawText.match(/```json([\s\S]*?)```/) ||
        rawText.match(/```([\s\S]*?)```/) ||
        rawText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        rawText = jsonMatch[1] || jsonMatch[0]; // extraction
      }

      // Cleanup
      rawText = rawText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      try {
        return JSON.parse(rawText);
      } catch (parseError) {
        console.error("Failed to parse Gemini JSON:", parseError.message);
        throw new Error("Failed to parse social content from AI response.");
      }
    } catch (error) {
      console.error("Gemini Generation Error:", error.message);
      throw error;
    }
  }

  async generateTopicAndCaptions() {
    if (!this.client) throw new Error("GenAI Client not initialized");

    const prompt = `You are a backend JSON API. Your job is to return ONLY valid JSON.

DO NOT:
- Use markdown
- Use code blocks
- Use explanations
- Use comments
- Add any text before or after JSON

  TASK:
  1. Pick ONE topic from the following mix:
     - Software Engineering: "Fresher vs Experienced", debugging horror stories, legacy code, imposter syndrome, mentorship.
     - Tech Trends 2026: AI Agents & Automation, Edge Computing + 6G, Quantum Computing, Spatial Computing.
     - AVOID: Generic, low-effort titles. Make it specific and engaging.
  2. Generate social media captions for that topic.

OUTPUT MUST MATCH THIS EXACT SCHEMA:

{
  "topic": "string",
  "captions": {
    "instagram": "string (casual, engaging caption + emojis + hashtags)",
    "linkedin": "string (professional, insightful + hashtags)",
    "x": "string (strictly under 276 chars, punchy)"
  },
  "alt_text": "string"
}

STRICT RULES:
- Output must be valid JSON.
- All values must be strings.
- No emojis except in Instagram.
- No line breaks inside strings.
- X "punchy" caption must be strictly under 276 characters.
- Instagram caption should be casual, funny, and engaging.
- LinkedIn "professional" caption should be insightful, career-focused, and encourage discussion (e.g. "How do you handle X?").
- alt_text must be a literal visual description of an image representing the topic.

Generate the JSON now.`;

    try {
      const response = await this._generateWithRetry(prompt);
      let rawText = response.text ? response.text : JSON.stringify(response);

      // Robust JSON extraction and cleaning
      rawText = rawText.trim();
      const jsonMatch =
        rawText.match(/```json([\s\S]*?)```/) ||
        rawText.match(/```([\s\S]*?)```/) ||
        rawText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        rawText = jsonMatch[1] || jsonMatch[0];
      }

      rawText = rawText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      try {
        return JSON.parse(rawText);
      } catch (parseError) {
        console.error("Failed to parse Gemini JSON:", parseError.message);
        throw new Error("Failed to parse social content from AI response.");
      }
    } catch (error) {
      console.error("Gemini Generation Error:", error.message);
      throw error;
    }
  }

  async uploadFile(filePath) {
    if (!config.media.imagekit.publicKey) {
      console.warn("ImageKit keys missing, skipping upload.");
      return null;
    }

    try {
      const fileBuffer = fs.readFileSync(filePath);
      const fileName = path.basename(filePath);
      const fileObj = await toFile(fileBuffer, fileName);

      const uploadResponse = await imagekit.files.upload({
        file: fileObj,
        fileName: fileName,
        folder: "/user_uploads",
        useUniqueFileName: true,
      });

      return uploadResponse.url;
    } catch (uploadError) {
      console.error("ImageKit Upload Failed:", uploadError.message);
      throw new Error("Failed to upload file to ImageKit.");
    }
  }

  async generateImage(topic) {
    if (!config.media.imagekit.publicKey) {
      console.warn("ImageKit keys missing, skipping image generation.");
      return null;
    }

    // Fallback optimization: Use Gemini to refine search keywords
    let searchQuery = topic;
    try {
      const promptRequest = `Given the topic "${topic}", provide 2-3 search keywords for a professional stock photo. Output only keywords.`;
      const response = await this._generateWithRetry(promptRequest);
      if (response?.text) {
        searchQuery = response.text.trim().replace(/[".]/g, "");
      }
    } catch {
      console.warn("Search query optimization failed. Using topic.");
    }

    // Use ImageSearchService to find an image (Portrait)
    let imageURL = await ImageSearchService.search(searchQuery, "portrait");

    // Download the found image
    let imageBuffer = null;
    if (imageURL) {
      imageBuffer = await ImageSearchService.downloadBuffer(imageURL);
    }

    // Emergency fallback to Stable Horde if search fails
    if (!imageBuffer) {
      console.warn("Stock search yielded no buffer. Attempting Stable Horde...");
      try {
        const start = await axios.post(
          "https://stablehorde.net/api/v2/generate/async",
          {
            prompt: `${topic}, cinematic, professional photography, portrait`,
            params: {
              sampler_name: "k_euler",
              width: 512,
              height: 1024, // Portrait size for generation
              steps: 20,
              n: 1,
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
              apikey: "0000000000",
            },
          },
        );

        const id = start.data.id;
        let hordeUrl = null;
        for (let i = 0; i < 20; i++) {
          await new Promise((r) => setTimeout(r, 4000));
          const status = await axios.get(
            `https://stablehorde.net/api/v2/generate/status/${id}`,
          );
          if (status.data.done && status.data.generations.length > 0) {
            hordeUrl = status.data.generations[0].img;
            break;
          }
        }

        if (hordeUrl) {
          const img = await axios.get(hordeUrl, {
            responseType: "arraybuffer",
          });
          imageBuffer = Buffer.from(img.data);
        }
      } catch (e) {
        console.warn("Stable Horde emergency fallback failed:", e.message);
      }
    }

    if (!imageBuffer) {
      console.error(
        `All image providers (Search + Horde) failed for topic: "${topic}".`,
      );
      throw new Error("All image providers failed.");
    }

    // Apply visual processing
    try {
      const musingText = topic;
      imageBuffer = await ImageProcessor.processMusingImage(imageBuffer, musingText, topic);
    } catch (e) {
      console.error("Failed to apply visual styling:", e.message);
    }

    // Upload to ImageKit
    try {
      const fileObj = await toFile(imageBuffer, `gen_${Date.now()}.jpg`);

      const uploadResponse = await imagekit.files.upload({
        file: fileObj,
        fileName: `gen_${Date.now()}.jpg`,
        folder: "/generated_social_media",
        useUniqueFileName: true,
      });

      return uploadResponse.url;
    } catch (uploadError) {
      console.error("ImageKit Upload Failed:", uploadError.message);
      throw new Error("Failed to upload generated image.");
    }
  }
}

export default new ContentGenerator();
