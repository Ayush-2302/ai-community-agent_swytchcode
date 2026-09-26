/**
 * Centralized, validated environment configuration for the Frontend (Vite + React).
 *
 * Rules:
 * 1. Only browser-safe variables prefixed with VITE_* are accessible here.
 * 2. Never expose backend API keys, tokens, or secrets to the browser.
 * 3. Fails fast at initialization time if any required environment variable is missing.
 * 4. No fallback strings like `import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"`.
 */

const requiredClientVariables = [
  {
    key: "VITE_API_BASE_URL",
    description: "Base HTTP URL for the Express backend API",
  },
  {
    key: "VITE_APP_NAME",
    description: "Client application display title",
  },
  {
    key: "VITE_SWYTCHCODE_WORKSPACE_ID",
    description: "Public Swytchcode workspace identifier",
  },
];

const missingVariables = [];

for (const { key, description } of requiredClientVariables) {
  const value = import.meta.env[key];
  if (!value || typeof value !== "string" || value.trim() === "") {
    missingVariables.push({ key, description });
  }
}

if (missingVariables.length > 0) {
  const formattedErrors = missingVariables
    .map((item) => `  - ${item.key}: ${item.description}`)
    .join("\n");

  const errorMessage = `
================================================================================
[FRONTEND ENV CONFIG ERROR] Missing required client environment variables:
${formattedErrors}

Please ensure these variables are defined in your .env.local or active environment file.
See .env.example or ENVIRONMENT.md for setup instructions.
================================================================================
`;
  console.error(errorMessage);
  throw new Error(errorMessage);
}

export const env = Object.freeze({
  api: Object.freeze({
    baseUrl: import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, ""),
    timeout: import.meta.env.VITE_API_TIMEOUT
      ? parseInt(import.meta.env.VITE_API_TIMEOUT, 10)
      : 15000,
  }),
  app: Object.freeze({
    name: import.meta.env.VITE_APP_NAME.trim(),
    mode: import.meta.env.MODE,
    isDev: Boolean(import.meta.env.DEV),
    isProd: Boolean(import.meta.env.PROD),
  }),
  swytchcode: Object.freeze({
    workspaceId: import.meta.env.VITE_SWYTCHCODE_WORKSPACE_ID.trim(),
  }),
});

export default env;
