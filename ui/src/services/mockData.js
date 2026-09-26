/**
 * Database Operational Data Models & Default Initial State
 * Mock data has been completely eliminated in favor of live MongoDB data.
 * All views fetch and synchronize directly with the backend API / MongoDB collection.
 */

export const INITIAL_POSTS = [];

export const INITIAL_QUEUE = [];

export const CONNECTED_ACCOUNTS = [];

export const AUTOMATION_JOBS = [
  {
    id: "job_01",
    name: "Publish Scheduled Posts",
    command: "node server_social.js",
    schedule: "Every 1 minute (Cron)",
    lastExecution: "Active daemon runner",
    nextExecution: "Pending queue",
    status: "Running",
    avgDuration: "350ms",
    executionsToday: 0,
    successRate: 100,
    tags: ["Cron", "Queue", "MongoDB"],
  },
  {
    id: "job_02",
    name: "Swytchcode Provider Health Monitor",
    command: "swy auth status",
    schedule: "Every 15 minutes",
    lastExecution: "Active",
    nextExecution: "in 10 minutes",
    status: "Running",
    avgDuration: "120ms",
    executionsToday: 0,
    successRate: 100,
    tags: ["Swytchcode", "HealthCheck", "Gateway"],
  }
];

export const CAMPAIGNS = [];

export const ANALYTICS_DATA = {
  overview: {
    totalPosts: 0,
    publishedCount: 0,
    scheduledCount: 0,
    pendingCount: 0,
    failedCount: 0,
    totalReach: "0",
    impressions: "0",
    engagementRate: "0.0%",
    avgLikesPerPost: 0,
    topPerformingPlatform: "X",
  },
  dailyVelocity: [],
  platformBreakdown: [],
};

export const ACTIVITY_LOGS = [];
