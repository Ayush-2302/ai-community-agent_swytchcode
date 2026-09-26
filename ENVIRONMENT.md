# Environment Configuration & Secrets Management Guide

This document defines the unified environment and secrets architecture for the **AI Community (SocialOps Hub)** project across both backend and frontend layers.

---

## 1. Security Architecture & Principles

1. **Zero Hardcoded Secrets**: No API keys, tokens, credentials, private URLs, database strings, or fallback passwords may ever be committed to Git or hardcoded in source files.
2. **Zero Fallback Defaults for Secrets**: Patterns such as `process.env.SECRET || "my-fallback"` or `import.meta.env.VITE_API_URL || "http://localhost:3000"` are strictly forbidden. If a parameter is mandatory, the application halts at initialization.
3. **Fail-Fast Startup Validation**: Both backend and frontend parse and validate required environment variables during boot/build time. If any required variable is missing or blank, execution terminates immediately with a structured diagnostic error report listing every missing variable.
4. **Strict Client-Side Isolation**: The React/Vite frontend code must NEVER receive or import backend secrets. Only public, browser-safe variables prefixed with `VITE_*` are made available.
5. **Git Protection**: All `.env`, `.env.*`, and `*.local` files are ignored by `.gitignore`. Only sanitized `.env.example` templates containing placeholder structures are tracked.

---

## 2. Multi-Environment Hierarchy

Both Backend and Frontend support environment tiering (`development`, `staging`, `production`, `test`). Files are loaded in the following order of precedence (earlier files take precedence):

```
1. .env.<NODE_ENV>.local   (Highest priority, machine-specific overrides)
2. .env.<NODE_ENV>         (Environment-tier defaults, e.g. .env.production)
3. .env.local              (Local machine-specific overrides)
4. .env                    (Base defaults)
```

To run under a specific environment:
- **Development**: `NODE_ENV=development node server_social.js`
- **Staging**: `NODE_ENV=staging node server_social.js`
- **Production**: `NODE_ENV=production node server_social.js`

---

## 3. Backend Environment Reference (`backend/.env`)

Centralized module: [`backend/src/config/env.js`](file:///d:/Project/Personal/AI%20Community/backend/src/config/env.js)

### Mandatory Variables (Server will fail to start if absent)

| Variable Name | Description | Example / Format |
|---|---|---|
| `PORT` | HTTP server port for Express | `3000` |
| `MONGODB_URI` | MongoDB Atlas cluster connection string | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `JWT_SECRET` | Secret key for signing/verifying authentication tokens | Min 32 random characters |
| `FRONTEND_URL` | Allowed client origin for CORS and email verification links | `http://localhost:5173` |
| `GEMINI_API_KEY` | Google Gemini 2.5 Flash API Key for AI studio post generation | `AIzaSy...` |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot API Token issued by `@BotFather` | `1234567890:ABCdef...` |
| `TELEGRAM_CHAT_ID` | Target Telegram channel or chat ID for broadcasts | `123456789` or `-100...` |
| `NOTION_PAGE_ID` | Notion Parent Page or Database UUID for archival | `a1b2c3d4e5f67890123456789abcdef0` |
| `SWYTCHCODE_WORKSPACE_ID` | Swytchcode Workspace slug for telemetry and orchestration | `ws_ai_community_ops` |
| `PIXABAY_API_KEY` | Pixabay API Key for AI Studio media asset search | `52417755-32e6a...` |
| `JAMENDO_CLIENT_ID` | Jamendo Client ID for background audio and music tracks | `66983191` |

### Optional / Integration-Specific Variables

| Variable Name | Description | Default / Fallback Behavior |
|---|---|---|
| `NODE_ENV` | Active environment tier | Defaults to `development` |
| `OLLAMA_URL` | Local Ollama endpoint | `null` (falls back to Gemini) |
| `SWYTCHCODE_ENV` | Execution mode (`sandbox` or `live`) | Defaults to `sandbox` |
| `SWYTCHCODE_BASE_URL` | Swytchcode API base URL | Defaults to `https://api.swytchcode.com/v1` |
| `SWYTCHCODE_API_KEY` | Live Swytchcode API Token | `null` (uses sandbox mock if empty) |
| `TELEGRAM_BOT_USERNAME` | Bot handle for display | Defaults to `SwytehBot` |
| `X_API_KEY` / `X_API_SECRET` | Primary X/Twitter app keys | If missing, X publishing is skipped |
| `X_ACCESS_TOKEN` / `X_ACCESS_SECRET` | Primary X/Twitter user tokens | If missing, X publishing is skipped |
| `ACCOUNT_2_X_*` | Secondary X/Twitter credentials | Optional dual-channel publishing |
| `LI_ACCESS_TOKEN1` / `LI_AUTHOR_URN1` | LinkedIn Account 1 credentials | Optional LinkedIn publishing |
| `LI_ACCESS_TOKEN2` / `LI_AUTHOR_URN2` | LinkedIn Account 2 credentials | Optional LinkedIn publishing |
| `IG_TOKEN` / `IG_PAGE_ID_1..3` | Meta Graph API tokens and page IDs | Optional Instagram Reel publishing |
| `IMAGEKIT_*` | ImageKit CDN public/private keys and endpoint | If missing, local images are served |
| `SUPABASE_URL` / `SUPABASE_KEY` / `BUCKET_NAME` | Supabase storage bucket | If missing, Supabase upload is bypassed |
| `FONT_PATH` | TTF Font path for FFmpeg subtitles | System default Arial |
| `FFMPEG_PATH` | Path to FFmpeg executable binary | `@ffmpeg-installer/ffmpeg` bundle |
| `YOUTUBE_DOWNLOAD_TIMEOUT_MS` | Video download timeout in ms | `120000` (2 minutes) |
| `USER_EMAIL` / `USER_PASSWORD` | SMTP Gmail credentials for Nodemailer | Optional email alerts |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth2 credentials | Optional Google Sign-In |

---

## 4. Frontend Environment Reference (`ui/.env.local`)

Centralized module: [`ui/src/config/env.js`](file:///d:/Project/Personal/AI%20Community/ui/src/config/env.js)

> **Important**: Never add tokens, passwords, or backend secrets here. Any variable starting with `VITE_` is compiled directly into the client bundle and visible to all end users!

| Variable Name | Required | Description | Example |
|---|---|---|---|
| `VITE_API_BASE_URL` | **Yes** | Express backend API base endpoint | `http://localhost:3000/api/social` |
| `VITE_APP_NAME` | **Yes** | Console display title | `"SocialOps Console"` |
| `VITE_SWYTCHCODE_WORKSPACE_ID` | **Yes** | Public workspace identifier | `ws_acme_social_ops` |
| `VITE_API_TIMEOUT` | No | HTTP request timeout in milliseconds | `15000` (default: 15s) |
| `VITE_APP_ENV` | No | Environment tag for UI telemetry | `development` |

---

## 5. Quick Setup Guide

### 1. Initialize Backend Environment
```bash
cd backend
cp .env.example .env
# Edit .env with your real MongoDB Atlas, Gemini, Telegram, and Notion keys
```

### 2. Initialize Frontend Environment
```bash
cd ui
cp .env.example .env.local
# Edit .env.local if your backend port differs from 3000
```

### 3. Verify Configuration & Start Services
```bash
# In backend/
node server_social.js

# In ui/
npm run dev
```

If any mandatory variable is missing, you will immediately see a clear message indicating which variable is absent:

```
================================================================================
CRITICAL STARTUP CONFIGURATION ERROR: MISSING REQUIRED ENVIRONMENT VARIABLES
================================================================================
The application cannot start because one or more required environment variables
are missing or empty in your environment (development):

  - MONGODB_URI: MongoDB Atlas connection string
  - GEMINI_API_KEY: Google Gemini 2.5 Flash API key for content generation

Please supply these variables in your active environment file (.env, .env.development,
or process environment). Refer to backend/.env.example for template structure.
================================================================================
```
