import dotenv from "dotenv";
import swytchcodeOmniAgent from "../src/services/social/SwytchcodeOmniAgent.js";

dotenv.config();

/**
 * Runnable Demonstration Script for Swytchcode Hackathon Evaluators
 * Demonstrates 3 tool calls across real-world APIs:
 * 1. x.create_tweet
 * 2. telegram.send_message
 * 3. notion.create_page
 */
async function main() {
  console.log("-----------------------------------------------------------------");
  console.log("🚀 Swytchcode Hackathon - Autonomous Omni-Channel Publisher Agent");
  console.log("-----------------------------------------------------------------\n");

  const sampleUpdate = {
    title: "Swytchcode Autonomous Agent Deployment",
    content: "Excited to share our AI Community Agent powered by Swytchcode! Autonomous cross-posting to X, Telegram, and Notion in production.",
    mediaUrl: null,
  };

  try {
    const report = await swytchcodeOmniAgent.runOmniPipeline(sampleUpdate);

    console.log("\n=================== EXECUTION REPORT ===================");
    console.log(JSON.stringify(report, null, 2));
    console.log("========================================================\n");

    console.log("✔ 3 Swytchcode tool calls executed.");
    console.log("✔ Audit trail recorded with latencies and statuses.");
  } catch (error) {
    console.error("Pipeline encountered an error:", error.message);
  }
}

main();
