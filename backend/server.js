import "dotenv/config";
import express from "express";
import { processAutoNicheReel } from "./src/services/pipeline.service.js";
import reelRoutes from "./src/routes/reel.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("."));
app.use("/output", express.static("output"));

// Routes
app.use("/api", reelRoutes);

app.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`);

  // Direct execution on startup for all active accounts/niches
  const niches = [
    "dotenvcoder",
    // "personallinkedin",
    "kanhacode",
    "broken_wings",
  ];

  for (const niche of niches) {
    try {
      console.log(`\n========================================`);
      console.log(`[Startup] Triggering automatic processing for: ${niche}`);
      console.log(`========================================`);
      await processAutoNicheReel(niche);
      console.log(`[Startup] Successfully completed processing for: ${niche}\n`);
    } catch (error) {
      console.error(`[Startup] Execution failed for ${niche}:`, error.message);
    }
  }
});
