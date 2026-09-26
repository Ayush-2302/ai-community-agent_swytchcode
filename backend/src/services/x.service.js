import { TwitterApi } from "twitter-api-v2";
import fs from "fs";

export async function publishToX(videoPath, caption) {
  const client = new TwitterApi({
    appKey: process.env.X_API_KEY,
    appSecret: process.env.X_API_SECRET,
    accessToken: process.env.X_ACCESS_TOKEN,
    accessSecret: process.env.X_ACCESS_SECRET,
  });

  if (!process.env.X_API_KEY) {
    return;
  }

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
