import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

import { resizeToReel } from "../utils/image.js";
import { generateReel, generateVideoReel } from "./ffmpeg.service.js";
import { publishReel } from "./instagram.service.js";
import {
  LI_ACCOUNT_1,
  LI_ACCOUNT_2,
  publishToLinkedIn,
} from "./linkedin.service.js";
import { getMusicPath } from "./music.service.js";
import {
  generateContentMetadata,
  generateTopic,
  NICHES,
  optimizeSearchQuery,
} from "./ollama.service.js";
import { deleteFromSupabase, uploadToSupabase } from "./supabase.service.js";

import ImageProcessor from "./ImageProcessor.js";
import ImageSearchService from "./ImageSearchService.js";
import VideoSearchService from "./VideoSearchService.js";

async function runGenericPipeline(options) {
  const {
    requestId,
    baseImagePath,
    finalVideoPath,
    metadata,
    niche,
    igPageId,
    cloudFolder,
    postToLinkedIn,
    postToInstagram = true,
    liCredentials,
  } = options;
  let cloudName = null;
  try {
    const musicPath = await getMusicPath({
      music_mood: metadata.music_mood || "upbeat",
      music_search_query: metadata.music_search_query,
      niche: niche,
      topic: options.topic,
      caption: metadata.caption,
    });

    const tempVideoPath = path.join("output", `${requestId}-temp.mp4`);
    if (options.backgroundVideoPath) {
      const overlayBuffer = await fs.readFile(baseImagePath);
      await generateVideoReel(options.backgroundVideoPath, tempVideoPath, {
        music_path: musicPath?.path,
        duration: 10,
        overlayBuffer,
      });
    } else {
      await generateReel(baseImagePath, tempVideoPath, {
        music_path: musicPath?.path,
        duration: 10,
        include_text: false,
      });
    }

    const VideoEffectsProcessor = (await import("./VideoEffectsProcessor.js"))
      .default;
    await VideoEffectsProcessor.applyEffects(
      tempVideoPath,
      finalVideoPath,
      options.style || "broken_wings",
    );
    await fs.unlink(tempVideoPath).catch(() => {});

    cloudName = `${cloudFolder}/${Date.now()}-${requestId}.mp4`;
    const publicUrl = await uploadToSupabase(finalVideoPath, cloudName);
    let fullPostText =
      `${metadata.post_caption || metadata.caption}\n\n${metadata.hashtags || ""}`.trim();

    // Clean markdown bold characters
    fullPostText = fullPostText.replace(/\*\*/g, "");

    if (postToInstagram && fullPostText.length > 2100) {
      console.warn(
        `[Instagram] Caption too long (${fullPostText.length} chars). Truncating...`,
      );
      fullPostText = fullPostText.substring(0, 2100) + "...";
    }

    const publishTasks = [];
    if (postToInstagram) {
      publishTasks.push(publishReel(publicUrl, fullPostText, igPageId));
    }

    if (postToLinkedIn) {
      publishTasks.push(
        publishToLinkedIn(finalVideoPath, fullPostText, liCredentials).catch(
          (e) => console.error(`[LinkedIn] Failed: ${e.message}`),
        ),
      );
    }

    await Promise.all(publishTasks);
    return { success: true, publicUrl };
  } finally {
    if (cloudName) await deleteFromSupabase(cloudName).catch(() => {});
  }
}

const SOCIAL_CONFIGS = {
  personallinkedin: {
    li: LI_ACCOUNT_1,
    ig: null,
    postToLinkedIn: true,
    postToInstagram: false,
  },
  dotenvcoder: {
    li: LI_ACCOUNT_2,
    ig: process.env.IG_PAGE_ID_2,
    postToLinkedIn: true,
    postToInstagram: true,
  },
  kanhacode: {
    li: null,
    ig: process.env.IG_PAGE_ID_1,
    postToLinkedIn: false,
    postToInstagram: true,
  },
  broken_wings: {
    li: null,
    ig: process.env.IG_PAGE_ID_3,
    postToLinkedIn: false,
    postToInstagram: true,
  },
};

export async function processAutoNicheReel(nicheId, topicOverride = null) {
  const actualNicheId = nicheId;
  const niche = NICHES[actualNicheId];
  if (!niche) throw new Error(`Invalid niche ID: ${nicheId}`);

  const social = SOCIAL_CONFIGS[actualNicheId];
  const requestId = uuidv4();
  const baseImagePath = path.join("uploads", `${requestId}-base.jpg`);
  const finalVideoPath = path.join("output", `${requestId}-reel.mp4`);

  try {
    const topic = topicOverride || (await generateTopic(actualNicheId));
    const metadata = await generateContentMetadata(topic, actualNicheId);

    let imageBuffer = null;
    if (actualNicheId !== "kanhacode") {
      const searchQuery =
        actualNicheId === "broken_wings" && metadata.image_search_query
          ? metadata.image_search_query
          : await optimizeSearchQuery(topic, actualNicheId);

      const searchResult = await ImageSearchService.search(
        searchQuery,
        "portrait",
      );
      if (!searchResult?.buffer)
        throw new Error(`Could not find image for niche: ${actualNicheId}`);
      imageBuffer = searchResult.buffer;
    }

    if (!metadata.caption) metadata.caption = topic;

    // Clean markdown bold
    metadata.caption = metadata.caption.replace(/\*\*/g, "");
    const cleanTopic = topic.replace(/\*\*/g, "");

    let styledBuffer;
    if (actualNicheId === "personallinkedin") {
      // Ensure metadata contains filename and topic
      if (
        !metadata.filename ||
        typeof metadata.filename !== "string" ||
        !metadata.filename.trim()
      ) {
        metadata.filename = "insight.js";
      } else if (!metadata.filename.endsWith(".js")) {
        metadata.filename = metadata.filename.split(".")[0] + ".js";
      }
      if (
        !metadata.topic ||
        typeof metadata.topic !== "string" ||
        !metadata.topic.trim()
      ) {
        metadata.topic = cleanTopic;
      }
      styledBuffer = await ImageProcessor.processPersonalLinkedInStyle(
        imageBuffer,
        metadata.caption,
        "Backend Architect",
        metadata,
      );
    } else if (actualNicheId === "dotenvcoder") {
      styledBuffer = await ImageProcessor.processDotEnvCoderStyle(
        metadata.caption,
        metadata.language || "JavaScript",
        imageBuffer,
      );
    } else if (actualNicheId === "broken_wings") {
      styledBuffer = await ImageProcessor.processBrokenWingsStyle(
        imageBuffer,
        metadata.caption,
        cleanTopic,
      );
    } else if (actualNicheId === "kanhacode") {
      styledBuffer = await ImageProcessor.processKanhaCodeStyle(
        null,
        metadata.caption,
        cleanTopic,
        true,
        metadata,
      );
    } else {
      styledBuffer = await ImageProcessor.processKanhaCodeStyle(
        null,
        metadata.caption,
        cleanTopic,
        true,
        metadata,
      );
    }

    await fs.writeFile(baseImagePath, styledBuffer);

    return await runGenericPipeline({
      flowName: `${actualNicheId}Flow`,
      requestId,
      baseImagePath,
      finalVideoPath,
      metadata,
      topic: cleanTopic,
      niche: actualNicheId,
      style: actualNicheId,
      igPageId: social.ig,
      cloudFolder: `auto_${actualNicheId}`,
      postToLinkedIn: social.postToLinkedIn,
      postToInstagram: social.postToInstagram,
      liCredentials: social.li,
    });
  } catch (e) {
    console.error(`[${actualNicheId}] Flow Failed: ${e.message}`);
    throw e;
  } finally {
    await fs.unlink(baseImagePath).catch(() => {});
    await fs.unlink(finalVideoPath).catch(() => {});
  }
}

export async function processAutoKanhaCodeReel(topicOverride = null) {
  return processAutoNicheReel("kanhacode", topicOverride);
}

// Backward compatibility or specific helpers
export async function processAutoMemeReel(topicOverride = null, options = {}) {
  const niche = options.niche || "kanhacode";
  return processAutoNicheReel(niche, topicOverride);
}

export async function processAutoDesiMemeReel(topicOverride = null) {
  return processAutoKanhaCodeReel(topicOverride);
}

export async function processAutoSadReel(topicOverride = null, type = "image") {
  const nicheId = "broken_wings";
  const niche = NICHES[nicheId];
  const social = SOCIAL_CONFIGS[nicheId];

  const requestId = uuidv4();
  const baseImagePath = path.join("uploads", `${requestId}-base.jpg`);
  const finalVideoPath = path.join("output", `${requestId}-reel.mp4`);
  let backgroundVideoPath = null;

  try {
    const topic = topicOverride || (await generateTopic(nicheId));
    const metadata = await generateContentMetadata(topic, nicheId);

    let imageBuffer;
    if (type === "solid-bg") {
      imageBuffer = await ImageProcessor.processBrokenWingsStyle(
        null,
        metadata.caption,
        topic,
        true,
      );
    } else if (type === "video") {
      const videoQuery = await optimizeSearchQuery(topic, nicheId);
      const videoUrl = await VideoSearchService.search(
        videoQuery,
        nicheId === "broken_wings",
      );
      if (!videoUrl) throw new Error("Could not find video");

      backgroundVideoPath = path.join("uploads", `${requestId}-bg.mp4`);
      await VideoSearchService.downloadVideo(videoUrl, backgroundVideoPath);

      imageBuffer = await ImageProcessor.processBrokenWingsStyle(
        null,
        metadata.caption,
        topic,
      );
    } else {
      const searchQuery =
        metadata.image_search_query || (await optimizeSearchQuery(topic, nicheId));
      const { buffer: downloadedBuffer } = await ImageSearchService.search(
        searchQuery,
        "portrait",
      );
      if (!downloadedBuffer)
        throw new Error("Could not find or download image");

      imageBuffer = await ImageProcessor.processBrokenWingsStyle(
        downloadedBuffer,
        metadata.caption,
        topic,
      );
    }

    await fs.writeFile(baseImagePath, imageBuffer);

    return await runGenericPipeline({
      flowName: "SadFlow",
      requestId,
      baseImagePath,
      backgroundVideoPath,
      finalVideoPath,
      metadata,
      topic,
      niche: "broken_wings",
      style: "broken_wings",
      igPageId: social.ig,
      cloudFolder: "auto_sad",
      postToLinkedIn: false,
      postToInstagram: true,
      liCredentials: social.li,
    });
  } catch (e) {
    console.error(`[SadFlow] Failed: ${e.message}`);
    throw e;
  } finally {
    await fs.unlink(baseImagePath).catch(() => {});
    await fs.unlink(finalVideoPath).catch(() => {});
    if (backgroundVideoPath)
      await fs.unlink(backgroundVideoPath).catch(() => {});
  }
}

export async function processImageToReel(imagePath, options = {}) {
  const {
    niche = "kanhacode",
    includeText = false,
    igPageId = process.env.IG_PAGE_ID_1,
    isBatch = false,
  } = options;
  const requestId = uuidv4();
  const resizedPath = path.join("uploads", `${requestId}-resized.jpg`);
  const finalVideoPath = path.join("output", `${requestId}-reel.mp4`);

  try {
    const baseName = path.basename(imagePath, path.extname(imagePath));

    await resizeToReel(imagePath, resizedPath, { niche });
    const imageBuffer = await fs.readFile(resizedPath);

    const metadataTopic = isBatch ? `Batch image ${baseName}` : baseName;
    let metadata = await generateContentMetadata(metadataTopic, niche);

    const shouldStyle = includeText || (
      [
        "kanhacode",
        "broken_wings",
        "personallinkedin",
        "dotenvcoder",
      ].includes(niche)
    );

    if (shouldStyle) {
      let styledBuffer;
      const textToOverlay = includeText ? metadata.caption : null;

      if (niche === "kanhacode") {
        styledBuffer = await ImageProcessor.processKanhaCodeStyle(
          null,
          textToOverlay,
          metadataTopic,
          true,
          metadata,
        );
      } else if (niche === "broken_wings")
        styledBuffer = await ImageProcessor.processBrokenWingsStyle(
          imageBuffer,
          textToOverlay || "",
          metadataTopic || "being",
          false,
          metadata,
        );
      else if (niche === "personallinkedin")
        styledBuffer = await ImageProcessor.processPersonalLinkedInStyle(
          imageBuffer,
          textToOverlay || "Backend Topic",
          "Backend Architect",
          metadata,
        );
      else
        styledBuffer = await ImageProcessor.processDotEnvCoderStyle(
          textToOverlay || "Dev Topic",
          "JavaScript",
          imageBuffer,
        );

      await fs.writeFile(resizedPath, styledBuffer);
    }
    return await runGenericPipeline({
      flowName: `Batch-${niche}`,
      requestId,
      baseImagePath: resizedPath,
      finalVideoPath,
      metadata,
      topic: metadataTopic,
      niche: niche,
      style: niche,
      igPageId,
      cloudFolder: "reels_batch",
      postToLinkedIn: niche === "personallinkedin" || niche === "dotenvcoder",
      postToInstagram: niche !== "personallinkedin" && niche !== "dotenvcoder",
      liCredentials: niche === "personallinkedin" ? LI_ACCOUNT_1 : LI_ACCOUNT_2,
    });
  } finally {
    await fs.unlink(resizedPath).catch(() => {});
    await fs.unlink(finalVideoPath).catch(() => {});
  }
}
