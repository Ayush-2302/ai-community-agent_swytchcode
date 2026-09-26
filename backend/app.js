import "dotenv/config";
import { processAutoSadReel } from "./src/services/pipeline.service.js";

async function startSadFlow() {
  try {
    await processAutoSadReel(null, "image");
  } catch (error) {
    console.error(`Flow failed: ${error.message}`);
    process.exit(1);
  }
}

startSadFlow();
