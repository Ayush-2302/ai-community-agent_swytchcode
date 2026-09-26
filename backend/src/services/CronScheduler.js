import cron from "node-cron";
import SocialPost from "../models/SocialPost.js";
import contentGenerator from "./social/ContentGenerator.js";
import socialPublisher from "./social/SocialPublisher.js";

class CronScheduler {
  constructor() {
    this.scheduledTasks = [];
  }

  start() {
    console.log("Starting Cron Scheduler...");

    // Schedule: 9:00 AM daily
    this.scheduleJob("00 09 * * *", "Morning Post", {
      timezone: "Asia/Kolkata",
    });

    // Schedule: 11:00 PM daily
    this.scheduleJob("21 22 * * *", "Night Post", {
      timezone: "Asia/Kolkata",
    });
  }

  scheduleJob(timing, label) {
    const task = cron.schedule(timing, async () => {
      try {
        await this.runAutoPostFlow();
      } catch (error) {
        console.error(`[Cron] Failed scheduled task: ${label}`, error.message);
      }
    });
    this.scheduledTasks.push(task);
  }

  async runAutoPostFlow() {
    // 1 & 2. Get Trending Topic and Generate Content
    const generatedContent = await contentGenerator.generateTopicAndCaptions();

    const { topic, captions, alt_text: altText } = generatedContent;

    // 3. Generate Image
    let mediaPath = null;
    try {
      mediaPath = await contentGenerator.generateImage(topic);
    } catch (e) {
      console.error("[AutoPost] Image generation failed:", e.message);
    }

    // 4. Create Post in DB
    const platforms = ["instagram", "linkedin", "x"];
    if (!mediaPath) {
      const index = platforms.indexOf("instagram");
      if (index > -1) platforms.splice(index, 1);
    }

    // Initialize platform status as PENDING for the platforms we intend to publish to
    const platformStatus = {};
    platforms.forEach((platform) => {
      platformStatus[platform] = { status: "PENDING" };
    });

    const newPost = await SocialPost.create({
      topic,
      platforms,
      captions: {
        instagram: (captions.instagram || "").trim(),
        linkedin: (captions.linkedin || "").trim(),
        x: (captions.x || "").trim(),
      },
      altText: altText,
      mediaUrl: mediaPath,
      status: "GENERATED",
      platformStatus,
    });

    // 5. Publish
    await socialPublisher.publishPost(newPost._id);
  }
}

export default new CronScheduler();
