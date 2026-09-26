import "dotenv/config";
import { processAutoNicheReel } from "./src/services/pipeline.service.js";

async function runKanhaCodePipeline() {
  try {
    await processAutoNicheReel("kanhacode");
  } catch (error) {
    console.error("KanhaCode Pipeline failed:", error.message);
    process.exit(1);
  }
}

runKanhaCodePipeline();
