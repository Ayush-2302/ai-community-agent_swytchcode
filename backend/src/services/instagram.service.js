import axios from "axios";

export async function publishReel(videoUrl, caption, pageId) {
  const IG_TOKEN = process.env.IG_TOKEN;
  const GRAPH_BASE = "https://graph.facebook.com/v21.0";

  if (!pageId || !IG_TOKEN) {
    throw new Error("Instagram credentials missing in .env");
  }

  console.log(`[Instagram] Fetching business account for Page ID: ${pageId}`);
  try {
    const pageRes = await axios.get(`${GRAPH_BASE}/${pageId}`, {
      params: { fields: "instagram_business_account", access_token: IG_TOKEN },
    });

    const igUserId = pageRes.data?.instagram_business_account?.id;
    if (!igUserId) {
      console.error(`[Instagram] Response:`, pageRes.data);
      throw new Error("No linked Instagram business account found.");
    }
    console.log(`[Instagram] Found IG User ID: ${igUserId}`);
    return await _publish(igUserId, videoUrl, caption, IG_TOKEN, GRAPH_BASE);
  } catch (error) {
    if (error.response) {
      console.error(`[Instagram] API Error:`, error.response.data);
    }
    throw error;
  }
}

async function _publish(igUserId, videoUrl, caption, IG_TOKEN, GRAPH_BASE) {
  const containerRes = await axios.post(
    `${GRAPH_BASE}/${igUserId}/media`,
    null,
    {
      params: {
        media_type: "REELS",
        video_url: videoUrl,
        caption: caption,
        access_token: IG_TOKEN,
      },
    },
  );

  const creationId = containerRes.data.id;

  let status = "IN_PROGRESS";
  let attempts = 0;
  while (status !== "FINISHED" && attempts < 10) {
    await new Promise((r) => setTimeout(r, 10000));
    attempts++;

    const statusRes = await axios.get(`${GRAPH_BASE}/${creationId}`, {
      params: { fields: "status_code", access_token: IG_TOKEN },
    });

    status = statusRes.data.status_code;

    if (status === "ERROR")
      throw new Error("Instagram video processing failed");
  }

  if (status !== "FINISHED")
    throw new Error("Instagram video processing timed out");

  const publishRes = await axios.post(
    `${GRAPH_BASE}/${igUserId}/media_publish`,
    null,
    {
      params: { creation_id: creationId, access_token: IG_TOKEN },
    },
  );

  return publishRes.data.id;
}
