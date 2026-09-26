import mongoose from "mongoose";

const PlatformStatusSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["SUCCESS", "PENDING", "FAILED", "SCHEDULED"],
      default: "PENDING",
    },
    id: {
      type: String,
      required: false,
    },
    error: {
      type: String,
      required: false,
    },
    results: {
      type: [mongoose.Schema.Types.Mixed],
      required: false,
    },
    publishedAt: {
      type: Date,
      required: false,
    },
  },
  { _id: false },
);

const SocialPostSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: false,
    },
    content: {
      type: String,
      required: false,
    },
    captions: {
      instagram: { type: String },
      linkedin: { type: String },
      x: { type: String },
      facebook: { type: String },
      telegram: { type: String },
      slack: { type: String },
    },
    mediaUrl: {
      type: String,
      required: false,
    },
    altText: {
      type: String,
    },
    status: {
      type: String,
      enum: [
        "GENERATED",
        "PUBLISHED",
        "DRAFT",
        "PENDING",
        "FAILED",
        "SCHEDULED",
        "PAUSED",
        "Pending Review",
        "Scheduled",
        "Published",
        "Draft",
        "Failed",
        "Paused",
      ],
      default: "SCHEDULED",
    },
    platforms: [
      {
        type: String,
        default: "x",
      },
    ],
    platformStatus: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    scheduledAt: {
      type: Date,
      default: Date.now,
    },
    queueOrder: {
      type: Number,
      default: 0,
    },
    campaign: {
      type: String,
      default: "General",
    },
    account: {
      type: String,
      default: "@acme_eng",
    },
    tags: [
      {
        type: String,
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    reposts: {
      type: Number,
      default: 0,
    },
    failureReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("SocialPost", SocialPostSchema);

