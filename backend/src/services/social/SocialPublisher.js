import fs from "fs/promises";
import SocialPost from "../../models/SocialPost.js";
import instagramAdapter from "./adapters/InstagramAdapter.js";
import linkedInAdapter from "./adapters/LinkedInAdapter.js";
import { postToBothXAccounts } from "./adapters/XAdapter.js";

class SocialPublisher {
  async publishPost(postId, targetPlatform = null, metadata = {}) {
    const post = await SocialPost.findById(postId);
    if (!post) throw new Error("Post not found");

    if (post.status === "PUBLISHED" && !targetPlatform) return post; // Already published (full check)

    const platformStatus = post.platformStatus || {};

    let platformsToPublish = post.platforms;
    if (targetPlatform) {
      // Allow manual publishing to any supported platform, even if not originally selected
      platformsToPublish = [targetPlatform];
    }

    // Parallel execution could be better, but sequential for safety first
    for (const platform of platformsToPublish) {
      // Skip if already success (unless force re-publish logic needed? usually not for social)
      if (platformStatus[platform]?.status === "SUCCESS") {
        continue;
      }

      // Use specific mediaUrl if provided (e.g. for Instagram), otherwise default
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
            throw new Error(
              "Instagram requires media, but no media URL was provided.",
            );
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
          // Only send the punchy part (no hashtags or extra text)
          let punchy = post.captions.x;
          // If the caption accidentally contains hashtags or extra lines, strip them
          if (typeof punchy === "string") {
            punchy = punchy.split("\n")[0];
            if (punchy.length >= 276) {
              punchy = punchy.substring(0, 275);
            }
          }
          const results = await postToBothXAccounts(punchy, effectiveMediaUrl);
          // Save both results in platformStatus.x as an array
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
          publishedAt: new Date(), // attempt time
        };
      }
    }

    // Determine overall status
    const allFailed = post.platforms.every(
      (p) => platformStatus[p]?.status === "FAILED",
    );
    // Consider success if ALL platforms are success (for "PUBLISHED") or if at least one needed was done?
    // Let's stick to "someSuccess" means it's partially or fully out there.
    const someSuccess = post.platforms.some(
      (p) => platformStatus[p]?.status === "SUCCESS",
    );

    post.platformStatus = platformStatus;
    post.status = allFailed ? "FAILED" : someSuccess ? "PUBLISHED" : "FAILED";

    // Only unsync if fully published (all success) or maybe keep logic simple for now
    const allSuccess = post.platforms.every(
      (p) => platformStatus[p]?.status === "SUCCESS",
    );

    if (
      allSuccess && // Only delete local file if everything is done? Or maybe just if it's published to intended targets.
      // Let's keep it simple: if status "PUBLISHED", try unsync.
      post.status === "PUBLISHED" &&
      post.mediaUrl &&
      !post.mediaUrl.startsWith("http")
    ) {
      try {
        await fs.unlink(post.mediaUrl);
        // Optional: Update mediaUrl to indicate it's deleted, or keep path for record
        // post.mediaUrl = null;
      } catch (err) {
        // Ignore file not found if already deleted
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
