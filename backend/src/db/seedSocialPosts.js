import SocialPost from "../models/SocialPost.js";

export async function seedSocialPostsIfEmpty() {
  try {
    const count = await SocialPost.countDocuments();
    if (count > 0) {
      console.log(`[SocialOps] MongoDB collection 'socialposts' has ${count} records. Ready.`);
      return;
    }

    console.log("[SocialOps] Seeding initial posts into MongoDB 'socialposts' collection...");

    const initialPosts = [
      {
        topic: "Introducing v2.4 of our API Gateway",
        title: "Introducing v2.4 of our API Gateway",
        content: "We just rolled out v2.4 of our low-latency API gateway. Throughput increased by 38% with sub-10ms p99 latency across all edge regions. Read the full engineering breakdown on our tech blog #Engineering #DevOps #Performance",
        captions: {
          x: "We just rolled out v2.4 of our low-latency API gateway. Throughput increased by 38% with sub-10ms p99 latency across all edge regions. Read the full engineering breakdown on our tech blog #Engineering #DevOps #Performance",
          linkedin: "We just rolled out v2.4 of our low-latency API gateway. Throughput increased by 38% with sub-10ms p99 latency across all edge regions. Read the full engineering breakdown on our tech blog #Engineering #DevOps #Performance",
        },
        platforms: ["x", "linkedin"],
        account: "@developer_stream",
        scheduledAt: new Date(Date.now() + 2 * 3600 * 1000),
        status: "SCHEDULED",
        queueOrder: 1,
        campaign: "Q3 Engineering",
        mediaUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
        tags: ["Engineering", "DevOps", "Infrastructure"],
        views: 4520,
        likes: 218,
        reposts: 42,
      },
      {
        topic: "Customer Spotlight: How FinTech scaleup cut cloud spend 42%",
        title: "Customer Spotlight: How FinTech scaleup cut cloud spend 42%",
        content: "Thrilled to share how our customer reduced monthly egress costs by 42% while simultaneously scaling to 15,000 active concurrent connections. Special thanks to the infra architecture team for spearheading this initiative. Link to the case study in the comments below.",
        captions: {
          linkedin: "Thrilled to share how our customer reduced monthly egress costs by 42% while simultaneously scaling to 15,000 active concurrent connections. Special thanks to the infra architecture team for spearheading this initiative. Link to the case study in the comments below.",
        },
        platforms: ["linkedin"],
        account: "dotenvcoder",
        scheduledAt: new Date(Date.now() + 4 * 3600 * 1000),
        status: "SCHEDULED",
        queueOrder: 2,
        campaign: "Customer Stories",
        mediaUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80",
        tags: ["FinTech", "Cloud", "CaseStudy"],
        views: 8940,
        likes: 412,
        reposts: 58,
      },
      {
        topic: "Behind the Scenes: Product Sprint Demo Day",
        title: "Behind the Scenes: Product Sprint Demo Day",
        content: "Behind the screens at our bi-weekly Sprint Showcase! The distributed engineering crew shipped 14 new customer-requested features this sprint. What feature are you most eager to test next?",
        captions: {
          instagram: "Behind the screens at our bi-weekly Sprint Showcase! The distributed engineering crew shipped 14 new customer-requested features this sprint. What feature are you most eager to test next?",
        },
        platforms: ["instagram"],
        account: "kanhacode",
        scheduledAt: new Date(Date.now() + 6 * 3600 * 1000),
        status: "PENDING",
        queueOrder: 3,
        campaign: "Culture & Team",
        mediaUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
        tags: ["Culture", "Teamwork", "TechLife"],
        views: 1200,
        likes: 85,
        reposts: 0,
      },
      {
        topic: "Critical Security Advisory Notice",
        title: "Critical Security Advisory Notice",
        content: "Urgent Maintenance Completed: Security patch CVE-2026-9811 deployed across all cluster nodes. Zero downtime recorded. Review the advisory report in our compliance portal.",
        captions: {
          slack: "Urgent Maintenance Completed: Security patch CVE-2026-9811 deployed across all cluster nodes. Zero downtime recorded. Review the advisory report in our compliance portal.",
        },
        platforms: ["slack"],
        account: "#announcements",
        scheduledAt: new Date(Date.now() - 3600 * 1000),
        status: "PUBLISHED",
        queueOrder: 0,
        campaign: "Operations",
        mediaUrl: null,
        tags: ["Security", "Patch", "Maintenance"],
        views: 310,
        likes: 45,
        reposts: 12,
      },
      {
        topic: "Weekly Developer Tips: Zero-Allocation Buffers in Rust",
        title: "Weekly Developer Tips: Zero-Allocation Buffers in Rust",
        content: "Tip of the week: Using zero-copy ring buffers can shave up to 3ms off high-frequency websocket serialization. Example snippet included in this thread. What's your go-to memory optimization trick?",
        captions: {
          telegram: "Tip of the week: Using zero-copy ring buffers can shave up to 3ms off high-frequency websocket serialization. Example snippet included in this thread. What's your go-to memory optimization trick?",
        },
        platforms: ["telegram"],
        account: "Chat ID: 8476056272",
        scheduledAt: new Date(Date.now() + 20 * 3600 * 1000),
        status: "DRAFT",
        queueOrder: 4,
        campaign: "Developer Community",
        mediaUrl: null,
        tags: ["Rust", "Tips", "WebSockets"],
        views: 0,
        likes: 0,
        reposts: 0,
      }
    ];

    await SocialPost.insertMany(initialPosts);
    console.log("[SocialOps] Seeded initial posts into MongoDB successfully.");
  } catch (error) {
    console.warn("[SocialOps] Seeding check skipped/failed:", error.message);
  }
}
