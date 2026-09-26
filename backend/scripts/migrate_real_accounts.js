import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

import mongoose from "mongoose";
import config from "../src/config/env.js";
import SocialPost from "../src/models/SocialPost.js";
import SocialAccount from "../src/models/SocialAccount.js";

async function run() {
  console.log("[Migration] Connecting to MongoDB...");
  await mongoose.connect(config.database.uri);

  // 1. Update posts with @acme_eng to real handles
  const resX = await SocialPost.updateMany(
    { account: "@acme_eng", platforms: "x" },
    { $set: { account: "@developer_stream" } }
  );
  const resLi = await SocialPost.updateMany(
    { account: "@acme_eng", platforms: "linkedin" },
    { $set: { account: "dotenvcoder" } }
  );
  const resIg = await SocialPost.updateMany(
    { account: "@acme_eng", platforms: "instagram" },
    { $set: { account: "kanhacode" } }
  );
  const resTg = await SocialPost.updateMany(
    { account: "@acme_eng", platforms: "telegram" },
    { $set: { account: `Chat ID: ${config.channels.telegram.chatId}` } }
  );
  const resRest = await SocialPost.updateMany(
    { account: "@acme_eng" },
    { $set: { account: "@developer_stream" } }
  );

  console.log("[Migration] Posts updated:", {
    x: resX.modifiedCount,
    linkedin: resLi.modifiedCount,
    instagram: resIg.modifiedCount,
    telegram: resTg.modifiedCount,
    rest: resRest.modifiedCount,
  });

  // 2. Clear old accounts and seed real accounts
  await SocialAccount.deleteMany({});
  const realAccounts = [
    {
      platform: "Telegram",
      displayName: "Telegram Community Channel",
      handle: `Chat ID: ${config.channels.telegram.chatId}`,
      email: "ayushkumarakt@gmail.com",
      status: "Connected",
      rateLimitRemaining: "30 msg/sec (Bot API)",
      tokenExpiry: "Active (Swytchcode Vault)",
      managedVia: "Swytchcode Telegram Provider",
      lastSync: "Just now",
    },
    {
      platform: "Notion",
      displayName: "Notion AI Community Hub",
      handle: `Page: ${config.channels.notion.pageId.slice(0, 16)}...`,
      email: "ayushkumarakt@gmail.com",
      status: "Connected",
      rateLimitRemaining: "3 req/sec (Notion API)",
      tokenExpiry: "Active (Swytchcode Integration)",
      managedVia: "Swytchcode Notion Provider",
      lastSync: "Just now",
    },
    {
      platform: "X",
      displayName: "X (Twitter) Feed",
      handle: "@developer_stream",
      email: "ayushkumarakt@gmail.com",
      status: "Connected",
      rateLimitRemaining: "300 / 300 requests",
      tokenExpiry: "Active (OAuth 2.0 PKCE)",
      managedVia: "Swytchcode X Provider",
      lastSync: "Just now",
    },
    {
      platform: "LinkedIn",
      displayName: "LinkedIn Developer Profile",
      handle: "dotenvcoder",
      email: "dotenvcoder@gmail.com",
      status: "Connected",
      rateLimitRemaining: "500 / 500 requests",
      tokenExpiry: "Active (OAuth 2.0)",
      managedVia: "LinkedIn Marketing API v2",
      lastSync: "Just now",
    },
    {
      platform: "Instagram",
      displayName: "kanhacode (Instagram)",
      handle: config.channels.instagram.pageId1
        ? `Page ID: ${config.channels.instagram.pageId1}`
        : "Instagram Channel",
      email: "ankithelpadi143ayush@gmail.com",
      status: "Connected",
      rateLimitRemaining: "200 / 200 requests",
      tokenExpiry: "Active (Meta Graph API v21.0)",
      managedVia: "Meta Graph API",
      lastSync: "Just now",
    },
  ];

  const inserted = await SocialAccount.insertMany(realAccounts);
  console.log(`[Migration] Seeded ${inserted.length} real accounts into MongoDB.`);

  await mongoose.disconnect();
  console.log("[Migration] Done!");
}

run().catch((err) => {
  console.error("[Migration] Error:", err);
  process.exit(1);
});
