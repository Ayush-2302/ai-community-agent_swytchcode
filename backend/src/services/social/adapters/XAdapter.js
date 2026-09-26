import axios from "axios";
import fs from "fs";
import path from "path";

import { TwitterApi } from "twitter-api-v2";

class XAdapter {
  constructor(credentials) {
    if (!credentials) {
      console.warn("X (Twitter) credentials missing.");
      this.client = null;
      return;
    }

    if (typeof credentials === "string") {
      this.client = new TwitterApi(credentials);
    } else {
      const { appKey, appSecret, accessToken, accessSecret } = credentials;
      if (!appKey || !appSecret || !accessToken || !accessSecret) {
        console.warn("X (Twitter) credentials missing.");
        this.client = null;
        return;
      }
      this.client = new TwitterApi({
        appKey,
        appSecret,
        accessToken,
        accessSecret,
      });
    }
    this.rwClient = this.client.readWrite;
  }

  async uploadMedia(mediaUrl) {
    if (!this.client) throw new Error("X client not initialized");

    try {
      // If it's a remote URL, we might need to download it effectively or stream it
      // Twitter API v2 usually expects a file path or buffer for upload

      let buffer;
      let mediaType;
      let mimeType; // Full mimeType for API

      if (mediaUrl.startsWith("http")) {
        const response = await axios.get(mediaUrl, {
          responseType: "arraybuffer",
          timeout: 15000, // 15s timeout
        });
        buffer = Buffer.from(response.data);
        mimeType = response.headers["content-type"] || "image/jpeg";
        mediaType = mimeType.split("/")[1];
      } else {
        // Local file
        buffer = fs.readFileSync(mediaUrl);
        // Basic mime type guessing
        const ext = path.extname(mediaUrl).substring(1).toLowerCase();
        mediaType = ext;
        mimeType = ext === "png" ? "image/png" : "image/jpeg";
      }

      // Upload media
      const mediaId = await this.client.v1.uploadMedia(buffer, {
        mimeType: mimeType, // Correct property for v2 lib
      });
      return mediaId;
    } catch (error) {
      console.error("X Media Upload Error:", error.message);
      throw error;
    }
  }

  async checkMe(username = "AyushKu48810879") {
    if (!this.client) throw new Error("X client not initialized");

    try {
      if (username) {
        const user = await this.client.v2.userByUsername(username);
        return user.data;
      } else {
        const me = await this.client.v2.me();
        return me.data;
      }
    } catch (error) {
      console.error("❌ X Auth Check Failed:", error.message);
      throw error;
    }
  }

  async post(text, mediaUrl = null) {
    if (!this.client) throw new Error("X client not initialized");

    try {
      let mediaId = null;
      if (mediaUrl) {
        mediaId = await this.uploadMedia(mediaUrl);
      }

      let contentText = text;
      if (typeof text === "object" && text !== null) {
        contentText = text.caption || "";
      }

      const payload = { text: contentText };
      if (mediaId) {
        payload.media = { media_ids: [mediaId] };
      }

      const response = await this.rwClient.v2.tweet(payload);
      return response.data;
    } catch (error) {
      console.error("X Post Error:", error.message);
      throw error;
    }
  }
}

// Create two instances for both accounts
const xAdapter1 = new XAdapter({
  appKey: process.env.X_API_KEY,
  appSecret: process.env.X_API_SECRET,
  accessToken: process.env.X_ACCESS_TOKEN,
  accessSecret: process.env.X_ACCESS_SECRET,
});

const xAdapter2 = new XAdapter({
  appKey: process.env.ACCOUNT_2_X_API_KEY,
  appSecret: process.env.ACCOUNT_2_X_API_SECRET,
  accessToken: process.env.ACCOUNT_2_X_ACCESS_TOKEN,
  accessSecret: process.env.ACCOUNT_2_X_ACCESS_SECRET,
});

// Utility to post to both accounts
async function postToBothXAccounts(text, mediaUrl = null) {
  const results = [];
  if (xAdapter1.client) {
    try {
      const res1 = await xAdapter1.post(text, mediaUrl);
      results.push({ account: 1, result: res1 });
    } catch (e) {
      results.push({ account: 1, error: e.message });
    }
  }
  if (xAdapter2.client) {
    try {
      const res2 = await xAdapter2.post(text, mediaUrl);
      results.push({ account: 2, result: res2 });
    } catch (e) {
      results.push({ account: 2, error: e.message });
    }
  }
  return results;
}

export { postToBothXAccounts, xAdapter1, xAdapter2 };
