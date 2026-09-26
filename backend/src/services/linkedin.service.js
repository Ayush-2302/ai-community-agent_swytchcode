import axios from "axios";
import fs from "fs";
import config from "../config/env.js";

export const LI_ACCOUNT_1 = {
  token: config.channels.linkedin.token1,
  urn: config.channels.linkedin.urn1,
};

export const LI_ACCOUNT_2 = {
  token: config.channels.linkedin.token2,
  urn: config.channels.linkedin.urn2,
};

export async function publishToLinkedIn(videoPath, caption, credentials = {}) {
  let LI_TOKEN = credentials.token || LI_ACCOUNT_1.token;
  let rawUrn = credentials.urn || LI_ACCOUNT_1.urn;

  if (!LI_TOKEN || !rawUrn) {
    console.warn("[LinkedIn] Credentials missing. Skipping publish.");
    return;
  }

  // Ensure URN is fully qualified
  const LI_PERSON_URN = rawUrn.includes("urn:li:") 
    ? rawUrn 
    : `urn:li:person:${rawUrn}`;

  console.log(`[LinkedIn] Attempting publish for URN: ${LI_PERSON_URN}`);

  try {
    const registerRes = await axios.post(
      "https://api.linkedin.com/v2/assets?action=registerUpload",
      {
        registerUploadRequest: {
          recipes: ["urn:li:digitalmediaRecipe:feedshare-video"],
          owner: LI_PERSON_URN,
          serviceRelationships: [
            {
              relationshipType: "OWNER",
              identifier: "urn:li:userGeneratedContent",
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${LI_TOKEN}`,
          "LinkedIn-Version": "202401",
        },
      },
    );

    const uploadUrl =
      registerRes.data.value.uploadMechanism[
        "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
      ].uploadUrl;
    const asset = registerRes.data.value.asset;

    const videoBuffer = fs.readFileSync(videoPath);
    await axios.put(uploadUrl, videoBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
      },
    });

    await new Promise((r) => setTimeout(r, 15000));

    const postRes = await axios.post(
      "https://api.linkedin.com/v2/ugcPosts",
      {
        author: LI_PERSON_URN,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: {
              text:
                caption.length > 2900
                  ? caption.substring(0, 2900) + "..."
                  : caption,
            },
            shareMediaCategory: "VIDEO",
            media: [{ status: "READY", media: asset }],
          },
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      },
      {
        headers: {
          Authorization: `Bearer ${LI_TOKEN}`,
          "LinkedIn-Version": "202401",
        },
      },
    );

    return postRes.data.id;
  } catch (error) {
    if (error.response && error.response.data) {
      console.error(`[LinkedIn] Publish failed: ${error.message}`, JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(`[LinkedIn] Publish failed: ${error.message}`);
    }
    throw error;
  }
}
