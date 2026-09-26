import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// 1. Determine environment (development, staging, production, test)
const NODE_ENV = process.env.NODE_ENV || "development";

// 2. Load layered environment files for multi-environment support
// Priority order:
// .env.<env>.local > .env.<env> > .env.local > .env
const envFiles = [
  path.resolve(process.cwd(), `.env.${NODE_ENV}.local`),
  path.resolve(process.cwd(), `.env.${NODE_ENV}`),
  path.resolve(process.cwd(), ".env.local"),
  path.resolve(process.cwd(), ".env"),
];

for (const envFile of envFiles) {
  if (fs.existsSync(envFile)) {
    dotenv.config({ path: envFile, override: false });
  }
}

// 3. Define mandatory variables required for core system execution
const REQUIRED_VARS = [
  { key: "PORT", description: "Express HTTP server port" },
  { key: "MONGODB_URI", description: "MongoDB Atlas connection string" },
  { key: "JWT_SECRET", description: "Secret for signing and verifying JWT tokens" },
  { key: "FRONTEND_URL", description: "Frontend web origin for CORS and callbacks" },
  { key: "GEMINI_API_KEY", description: "Google Gemini 2.5 Flash API key for content generation" },
  { key: "TELEGRAM_BOT_TOKEN", description: "Telegram Bot API Token (from @BotFather)" },
  { key: "TELEGRAM_CHAT_ID", description: "Default Telegram chat or channel ID for broadcasts" },
  { key: "NOTION_PAGE_ID", description: "Notion Parent Page / Database ID for documentation archival" },
  { key: "SWYTCHCODE_WORKSPACE_ID", description: "Swytchcode Workspace identifier for telemetry" },
  { key: "PIXABAY_API_KEY", description: "Pixabay API key for media asset search" },
  { key: "JAMENDO_CLIENT_ID", description: "Jamendo client ID for background audio and music" },
];

// 4. Fail-Fast Validation: collect all missing variables and halt if any are absent
const missingVars = [];
for (const { key, description } of REQUIRED_VARS) {
  const value = process.env[key];
  if (!value || (typeof value === "string" && value.trim() === "")) {
    missingVars.push({ key, description });
  }
}

if (missingVars.length > 0) {
  const missingReport = missingVars
    .map((v) => `  - ${v.key}: ${v.description}`)
    .join("\n");

  const errorMessage = `
================================================================================
CRITICAL STARTUP CONFIGURATION ERROR: MISSING REQUIRED ENVIRONMENT VARIABLES
================================================================================
The application cannot start because one or more required environment variables
are missing or empty in your environment (${NODE_ENV}):

${missingReport}

Please supply these variables in your active environment file (.env, .env.${NODE_ENV},
or process environment). Refer to backend/.env.example for template structure.
================================================================================
`;
  console.error(errorMessage);
  throw new Error(`[EnvConfig] Missing ${missingVars.length} required environment variables.`);
}

// 5. Build and freeze sanitized, typed configuration tree
export const config = Object.freeze({
  server: Object.freeze({
    port: parseInt(process.env.PORT, 10),
    env: NODE_ENV,
    isProduction: NODE_ENV === "production",
    isStaging: NODE_ENV === "staging",
    isDevelopment: NODE_ENV === "development",
    frontendUrl: process.env.FRONTEND_URL.trim(),
  }),
  auth: Object.freeze({
    jwtSecret: process.env.JWT_SECRET.trim(),
    googleClientId: process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.trim() : null,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? process.env.GOOGLE_CLIENT_SECRET.trim() : null,
    googleRedirectUri: process.env.GOOGLE_REDIRECT_URI ? process.env.GOOGLE_REDIRECT_URI.trim() : null,
  }),
  email: Object.freeze({
    user: process.env.USER_EMAIL ? process.env.USER_EMAIL.trim() : null,
    pass: process.env.USER_PASSWORD ? process.env.USER_PASSWORD.trim() : null,
  }),
  database: Object.freeze({
    uri: process.env.MONGODB_URI.trim(),
  }),
  ai: Object.freeze({
    geminiApiKey: process.env.GEMINI_API_KEY.trim(),
    ollamaUrl: process.env.OLLAMA_URL ? process.env.OLLAMA_URL.trim() : null,
  }),
  media: Object.freeze({
    pixabayApiKey: process.env.PIXABAY_API_KEY.trim(),
    unsplashAccess: process.env.UNSPLASH_ACCESS ? process.env.UNSPLASH_ACCESS.trim() : null,
    pexelsApiKey: process.env.PEXELS_API_KEY ? process.env.PEXELS_API_KEY.trim() : null,
    freepikApiKey: process.env.FREEPIK_API_KEY ? process.env.FREEPIK_API_KEY.trim() : null,
    jamendoClientId: process.env.JAMENDO_CLIENT_ID.trim(),
    fontPath: process.env.FONT_PATH ? process.env.FONT_PATH.trim() : null,
    ffmpegPath: process.env.FFMPEG_PATH ? process.env.FFMPEG_PATH.trim() : null,
    youtube: Object.freeze({
      downloadTimeoutMs: process.env.YOUTUBE_DOWNLOAD_TIMEOUT_MS ? parseInt(process.env.YOUTUBE_DOWNLOAD_TIMEOUT_MS, 10) : 120000,
      cookiesFromBrowser: process.env.YOUTUBE_COOKIES_FROM_BROWSER ? process.env.YOUTUBE_COOKIES_FROM_BROWSER.trim() : null,
      cookiesFile: process.env.YOUTUBE_COOKIES_FILE ? process.env.YOUTUBE_COOKIES_FILE.trim() : null,
    }),
    imagekit: Object.freeze({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY ? process.env.IMAGEKIT_PUBLIC_KEY.replace(/['"]/g, "").trim() : null,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY ? process.env.IMAGEKIT_PRIVATE_KEY.replace(/['"]/g, "").trim() : null,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT ? process.env.IMAGEKIT_URL_ENDPOINT.replace(/['"]/g, "").trim() : null,
    }),
    supabase: Object.freeze({
      url: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.replace(/['"]/g, "").trim() : null,
      key: process.env.SUPABASE_KEY ? process.env.SUPABASE_KEY.replace(/['"]/g, "").trim() : null,
      bucketName: process.env.BUCKET_NAME ? process.env.BUCKET_NAME.replace(/['"]/g, "").trim() : null,
    }),
  }),
  swytchcode: Object.freeze({
    apiKey: process.env.SWYTCHCODE_API_KEY ? process.env.SWYTCHCODE_API_KEY.trim() : null,
    workspaceId: process.env.SWYTCHCODE_WORKSPACE_ID.trim(),
    baseUrl: process.env.SWYTCHCODE_BASE_URL ? process.env.SWYTCHCODE_BASE_URL.trim() : "https://api.swytchcode.com/v1",
    environment: process.env.SWYTCHCODE_ENV ? process.env.SWYTCHCODE_ENV.trim() : "sandbox",
  }),
  channels: Object.freeze({
    telegram: Object.freeze({
      botToken: process.env.TELEGRAM_BOT_TOKEN.trim(),
      botUsername: process.env.TELEGRAM_BOT_USERNAME ? process.env.TELEGRAM_BOT_USERNAME.trim() : "SwytehBot",
      chatId: process.env.TELEGRAM_CHAT_ID.trim(),
    }),
    notion: Object.freeze({
      pageId: process.env.NOTION_PAGE_ID.trim(),
    }),
    x: Object.freeze({
      apiKey: process.env.X_API_KEY ? process.env.X_API_KEY.trim() : null,
      apiSecret: process.env.X_API_SECRET ? process.env.X_API_SECRET.trim() : null,
      accessToken: process.env.X_ACCESS_TOKEN ? process.env.X_ACCESS_TOKEN.trim() : null,
      accessSecret: process.env.X_ACCESS_SECRET ? process.env.X_ACCESS_SECRET.trim() : null,
      bearerToken: process.env.X_BEARER_TOKEN ? process.env.X_BEARER_TOKEN.trim() : null,
      account2: Object.freeze({
        apiKey: process.env.ACCOUNT_2_X_API_KEY ? process.env.ACCOUNT_2_X_API_KEY.trim() : null,
        apiSecret: process.env.ACCOUNT_2_X_API_SECRET ? process.env.ACCOUNT_2_X_API_SECRET.trim() : null,
        accessToken: process.env.ACCOUNT_2_X_ACCESS_TOKEN ? process.env.ACCOUNT_2_X_ACCESS_TOKEN.trim() : null,
        accessSecret: process.env.ACCOUNT_2_X_ACCESS_SECRET ? process.env.ACCOUNT_2_X_ACCESS_SECRET.trim() : null,
      }),
    }),
    linkedin: Object.freeze({
      token1: process.env.LI_ACCESS_TOKEN1 ? process.env.LI_ACCESS_TOKEN1.trim() : null,
      urn1: process.env.LI_AUTHOR_URN1 ? process.env.LI_AUTHOR_URN1.trim() : null,
      token2: process.env.LI_ACCESS_TOKEN2 ? process.env.LI_ACCESS_TOKEN2.trim() : null,
      urn2: process.env.LI_AUTHOR_URN2 ? process.env.LI_AUTHOR_URN2.trim() : null,
    }),
    instagram: Object.freeze({
      token: process.env.IG_TOKEN ? process.env.IG_TOKEN.replace(/['"]/g, "").trim() : null,
      pageId1: process.env.IG_PAGE_ID_1 ? process.env.IG_PAGE_ID_1.replace(/['"]/g, "").trim() : null,
      pageId2: process.env.IG_PAGE_ID_2 ? process.env.IG_PAGE_ID_2.replace(/['"]/g, "").trim() : null,
      pageId3: process.env.IG_PAGE_ID_3 ? process.env.IG_PAGE_ID_3.replace(/['"]/g, "").trim() : null,
    }),
  }),
});

export default config;
