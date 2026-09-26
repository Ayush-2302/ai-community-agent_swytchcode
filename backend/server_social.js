import "dotenv/config";
import connectToMongoDB from "./src/db/dbConfig.js";

const port = process.env.PORT || 8000;

async function startServer() {
  await connectToMongoDB();
  const { default: app } = await import("./src/socialApp.js");
  const { seedSocialPostsIfEmpty } = await import("./src/db/seedSocialPosts.js");
  const { default: cronScheduler } = await import("./src/services/CronScheduler.js");
  
  await seedSocialPostsIfEmpty();
  cronScheduler.start();
  app.listen(port, () => {
    console.log(`[SocialOps Server] Listening on port ${port}`);
  });
}

startServer();



