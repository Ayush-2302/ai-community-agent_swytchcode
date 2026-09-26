import "dotenv/config";
import { processAutoNicheReel } from "./src/services/pipeline.service.js";

async function runTechAcc1Pipeline() {
  try {
    await processAutoNicheReel("personallinkedin");
  } catch (error) {
    console.error("Tech Account 1 Pipeline failed:", error.message);
    process.exit(1);
  }
}

runTechAcc1Pipeline();
