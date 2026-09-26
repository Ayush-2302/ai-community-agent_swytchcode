import axios from "axios";

class InstagramAdapter {
  constructor() {
    this.pageId = process.env.IG_PAGE_ID;
    this.token = process.env.IG_TOKEN;
    this.graphBase = "https://graph.facebook.com/v21.0";
  }

  async getInstagramUserId() {
    if (!this.pageId || !this.token)
      throw new Error("Instagram credentials missing");

    const url = `${this.graphBase}/${this.pageId}`;
    const params = {
      fields: "instagram_business_account",
      access_token: this.token,
    };

    const response = await axios.get(url, { params, timeout: 15000 });
    if (!response.data.instagram_business_account) {
      throw new Error("No linked Instagram business account found.");
    }
    return response.data.instagram_business_account.id;
  }

  async ensurePublicUrl(mediaUrl) {
    // Instagram requires a public URL.
    // ContentGenerator now warrants a public URL from ImageKit.
    if (mediaUrl.startsWith("http")) return mediaUrl;

    throw new Error(
      "InstagramAdapter received non-public URL. Image upload should happen in ContentGenerator.",
    );
  }

  async validateImageUrl(mediaUrl) {
    try {
      const response = await axios.head(mediaUrl, { timeout: 10000 });
      const contentType = response.headers["content-type"];

      if (!contentType || !contentType.startsWith("image/")) {
        throw new Error(`Invalid content type: ${contentType}`);
      }

      // Check if image is accessible by trying to get a small portion
      const imageResponse = await axios.get(mediaUrl, {
        responseType: "arraybuffer",
        timeout: 15000,
        maxContentLength: 1024 * 1024, // 1MB limit for validation
      });

      if (imageResponse.data.length === 0) {
        throw new Error("Image URL returned empty content");
      }

      return true;
    } catch (error) {
      console.error(`Image validation failed for ${mediaUrl}:`, error.message);
      throw new Error(`Image URL validation failed: ${error.message}`);
    }
  }

  async post(caption, mediaUrl) {
    if (!this.pageId || !this.token)
      throw new Error("Instagram credentials missing");
    if (!mediaUrl)
      throw new Error(
        "Instagram requires media (image/video), but no media URL was provided to the adapter.",
      );

    try {
      const userId = await this.getInstagramUserId();
      const publicUrl = await this.ensurePublicUrl(mediaUrl);

      // Validate image URL before posting
      await this.validateImageUrl(publicUrl);

      // 1. Create Media Container
      const containerParams = {
        image_url: publicUrl,
        caption: caption,
        access_token: this.token,
      };
      const createRes = await axios.post(
        `${this.graphBase}/${userId}/media`,
        null,
        { params: containerParams, timeout: 15000 },
      );
      const containerId = createRes.data.id;

      // 2. Publish Media
      // Wait a bit? Usually instant for images.
      // We can implement polling if needed, but often quick enough.
      await new Promise((resolve) => setTimeout(resolve, 3000)); // Safety wait

      const publishParams = {
        creation_id: containerId,
        access_token: this.token,
      };
      const publishRes = await axios.post(
        `${this.graphBase}/${userId}/media_publish`,
        null,
        { params: publishParams, timeout: 15000 },
      );

      return publishRes.data;
    } catch (error) {
      console.error("Instagram Post Error:", error.message);
      throw error;
    }
  }
}

export default new InstagramAdapter();
