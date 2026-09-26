import fs from "fs/promises";
import SocialPost from "../../models/SocialPost.js";
import instagramAdapter from "./adapters/InstagramAdapter.js";
import linkedInAdapter from "./adapters/LinkedInAdapter.js";
import { postToBothXAccounts } from "./adapters/XAdapter.js";

class SocialPublisher {
  async publishPost(postId, targetPlatform = null, metadata = {}) {
    const post = await SocialPost.findById(postId);
    if (!post) throw new Error("Post not found");

    if (post.status === "PUBLISHED" && !targetPlatform) return post;

    const platformStatus = post.platformStatus || {};
    const platformsToPublish = targetPlatform ? [targetPlatform] : post.platforms;

    for (const platform of platformsToPublish) {
      if (platformStatus[platform]?.status === "SUCCESS") {
        continue;
      }

      let effectiveMediaUrl = null;
      if (platform === targetPlatform && metadata.mediaUrl) {
        effectiveMediaUrl = metadata.mediaUrl;
      } else if (post.mediaUrl) {
        effectiveMediaUrl = post.mediaUrl;
      }

      try {
        let result;
        if (platform === "instagram") {
          if (!effectiveMediaUrl) {
            throw new Error("Instagram requires media, but no media URL was provided.");
          }
          result = await instagramAdapter.post(
            post.captions.instagram,
            effectiveMediaUrl,
          );
          platformStatus.instagram = {
            status: "SUCCESS",
            id: result.id,
            publishedAt: new Date(),
          };
        } else if (platform === "linkedin") {
          result = await linkedInAdapter.post(
            post.captions.linkedin,
            effectiveMediaUrl,
            post.altText,
          );
          platformStatus.linkedin = {
            status: "SUCCESS",
            id: result.id,
            publishedAt: new Date(),
          };
        } else if (platform === "x") {
          let punchy = post.captions.x;
          if (typeof punchy === "string") {
            punchy = punchy.split("\n")[0];
            if (punchy.length >= 276) {
              punchy = punchy.substring(0, 275);
            }
          }
          const results = await postToBothXAccounts(punchy, effectiveMediaUrl);
          platformStatus.x = {
            status: results.some((r) => r.result) ? "SUCCESS" : "FAILED",
            results,
            publishedAt: new Date(),
          };
        }
      } catch (error) {
        console.error(`Failed to publish to ${platform}:`, error.message);
        platformStatus[platform] = {
          status: "FAILED",
          error: error.message,
          publishedAt: new Date(),
        };
      }
    }

    const allFailed = post.platforms.every(
      (p) => platformStatus[p]?.status === "FAILED",
    );
    const someSuccess = post.platforms.some(
      (p) => platformStatus[p]?.status === "SUCCESS",
    );

    post.platformStatus = platformStatus;
    post.status = allFailed ? "FAILED" : someSuccess ? "PUBLISHED" : "FAILED";

    const allSuccess = post.platforms.every(
      (p) => platformStatus[p]?.status === "SUCCESS",
    );

    if (
      allSuccess &&
      post.status === "PUBLISHED" &&
      post.mediaUrl &&
      !post.mediaUrl.startsWith("http")
    ) {
      try {
        await fs.unlink(post.mediaUrl);
      } catch (err) {
        if (err.code !== "ENOENT") {
          console.error(
            `Failed to unsync (delete) local media: ${post.mediaUrl}`,
            err.message,
          );
        }
      }
    }

    await post.save();
    return post;
  }
}

export default new SocialPublisher();
