import axios from "axios";
import fs from "fs";
import path from "path";

class LinkedInAdapter {
  constructor() {
    this.accessToken = process.env.LI_ACCESS_TOKEN;
    this.authorUrn = process.env.LI_AUTHOR_URN;
    this.baseUrl = "https://api.linkedin.com/v2";
  }

  async getHeaders() {
    if (!this.accessToken) throw new Error("LinkedIn Access Token missing");
    return {
      Authorization: `Bearer ${this.accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    };
  }

  async getAuthorUrn() {
    if (this.authorUrn) return this.authorUrn;

    try {
      const response = await axios.get(`${this.baseUrl}/me`, {
        headers: await this.getHeaders(),
        timeout: 15000,
      });

      this.authorUrn = `urn:li:person:${response.data.id}`;
      return this.authorUrn;
    } catch (error) {
      console.error("Error fetching LinkedIn Profile:", error.message);
      throw new Error("Could not determine LinkedIn Author URN");
    }
  }

  async registerUpload(isImage = true) {
    const recipe = isImage
      ? "urn:li:digitalmediaRecipe:feedshare-image"
      : "urn:li:digitalmediaRecipe:feedshare-video";

    const author = await this.getAuthorUrn();

    const payload = {
      registerUploadRequest: {
        recipes: [recipe],
        owner: author,
        serviceRelationships: [
          {
            relationshipType: "OWNER",
            identifier: "urn:li:userGeneratedContent",
          },
        ],
      },
    };

    const response = await axios.post(
      `${this.baseUrl}/assets?action=registerUpload`,
      payload,
      { headers: await this.getHeaders(), timeout: 15000 },
    );

    const uploadUrl =
      response.data.value.uploadMechanism[
        "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
      ].uploadUrl;

    return {
      uploadUrl,
      asset: response.data.value.asset,
    };
  }

  /**
   * Detect MIME type based on file extension.
   * LinkedIn is happier when you tell it what you're sending 🙂
   */
  detectMimeType(filePathOrUrl) {
    const ext = path.extname(filePathOrUrl).toLowerCase();

    switch (ext) {
      case ".png":
        return "image/png";
      case ".jpg":
      case ".jpeg":
        return "image/jpeg";
      case ".gif":
        return "image/gif";
      case ".mp4":
        return "video/mp4";
      default:
        return "application/octet-stream";
    }
  }

  async uploadMedia(uploadUrl, mediaUrl) {
    let buffer;

    if (mediaUrl.startsWith("http")) {
      const response = await axios.get(mediaUrl, {
        responseType: "arraybuffer",
        timeout: 60000,
      });
      buffer = Buffer.from(response.data);
    } else {
      buffer = fs.readFileSync(mediaUrl);
    }

    const mimeType = this.detectMimeType(mediaUrl);

    await axios.put(uploadUrl, buffer, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": mimeType, // ✅ CRITICAL FIX
        "Content-Length": buffer.length,
      },
      transformRequest: [(data) => data], // ✅ Prevent axios mangling
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 120000,
    });
  }

  async post(text, mediaUrl = null, title = null) {
    if (!this.accessToken) throw new Error("LinkedIn credentials missing");

    try {
      const author = await this.getAuthorUrn();
      let shareMediaCategory = "NONE";
      let media = [];

      if (mediaUrl) {
        shareMediaCategory = "IMAGE"; // Extend later for video
        const { uploadUrl, asset } = await this.registerUpload(true);

        await this.uploadMedia(uploadUrl, mediaUrl);

        // Small delay so LinkedIn finishes processing the upload
        await new Promise((resolve) => setTimeout(resolve, 3000));

        media.push({
          status: "READY",
          media: asset,
          title: title ? { text: title } : undefined,
        });
      }

      let contentText = text;
      if (typeof text === "object" && text !== null) {
        contentText = text.caption || "";
        if (text.hashtags) {
          contentText += `\n\n${text.hashtags}`;
        }
      }

      const payload = {
        author,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: contentText },
            shareMediaCategory,
            media: media.length ? media : undefined,
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      };

      const response = await axios.post(`${this.baseUrl}/ugcPosts`, payload, {
        headers: await this.getHeaders(),
        timeout: 15000,
      });

      return response.data;
    } catch (error) {
      console.error("LinkedIn Post Error:", error.message);
      throw error;
    }
  }
}

export default new LinkedInAdapter();
