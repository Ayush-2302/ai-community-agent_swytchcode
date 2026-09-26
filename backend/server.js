import express from "express";
import cors from "cors";
import config from "./src/config/env.js";
import connectToMongoDB from "./src/db/dbConfig.js";
import { processAutoNicheReel } from "./src/services/pipeline.service.js";
import reelRoutes from "./src/routes/reel.routes.js";
import socialRoutes from "./src/routes/socialRoutes.js";

const app = express();
const PORT = config.server.port;

app.use(cors());
app.use(express.json());
app.use(express.static("."));
app.use("/output", express.static("output"));

// Connect to MongoDB
connectToMongoDB().catch((err) => {
  console.warn("[MongoDB] Initial connection error:", err.message);
});

// Routes
app.use("/api", reelRoutes);
app.use("/api/social", socialRoutes);

app.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`);

  // Direct execution on startup for all active accounts/niches
  const niches = [
    "dotenvcoder",
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
