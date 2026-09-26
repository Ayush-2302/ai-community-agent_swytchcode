import { TwitterApi } from "twitter-api-v2";
import fs from "fs";
import config from "../config/env.js";

export async function publishToX(videoPath, caption) {
  const { apiKey, apiSecret, accessToken, accessSecret } = config.channels.x;

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    console.warn("[X] Credentials not configured. Skipping publish.");
    return;
  }

  const client = new TwitterApi({
    appKey: apiKey,
    appSecret: apiSecret,
    accessToken: accessToken,
    accessSecret: accessSecret,
  });

  try {
    const mediaId = await client.v1.uploadMedia(videoPath);
    const response = await client.v2.tweet({
      text: caption,
      media: { media_ids: [mediaId] },
    });

    return response.data.id;
  } catch (error) {
    console.error(`[X] Publish failed: ${error.message}`);
    throw error;
  }
}
