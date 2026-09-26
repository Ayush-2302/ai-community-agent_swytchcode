import mongoose from "mongoose";

const SocialAccountSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: true,
      enum: ["X", "Telegram", "Notion", "LinkedIn", "Instagram", "Facebook", "Slack"],
    },
    displayName: {
      type: String,
      required: true,
    },
    handle: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Connected", "Disconnected", "Error", "Active"],
      default: "Connected",
    },
    rateLimitRemaining: {
      type: String,
      default: "Active Tier",
    },
    tokenExpiry: {
      type: String,
      default: "Active (Encrypted Local Vault)",
    },
    managedVia: {
      type: String,
      default: "Swytchcode Provider Runtime",
    },
    lastSync: {
      type: String,
      default: "Just now",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("SocialAccount", SocialAccountSchema);
