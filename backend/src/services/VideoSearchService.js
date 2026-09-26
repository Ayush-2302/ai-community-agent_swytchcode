import axios from "axios";
import fs from "fs";
import path from "path";
import config from "../config/env.js";

const USED_VIDEOS_FILE = path.resolve("used", "used_videos.json");
const PIXABAY_API_KEY = config.media.pixabayApiKey;

function loadUsedVideos() {
  try {
    if (fs.existsSync(USED_VIDEOS_FILE)) {
      return JSON.parse(fs.readFileSync(USED_VIDEOS_FILE, "utf-8"));
    }
  } catch (e) {}
  return [];
}

function saveUsedVideo(url) {
  const used = loadUsedVideos();
  if (!used.includes(url)) {
    used.push(url);
    if (used.length > 500) used.shift();
    try {
      fs.writeFileSync(USED_VIDEOS_FILE, JSON.stringify(used, null, 2));
    } catch (e) {}
  }
}

export async function search(query, isDarkTheme = false) {
  if (!PIXABAY_API_KEY) {
    return null;
  }

  let simplifiedQuery = query.split(",")[0].trim();
  if (isDarkTheme && !simplifiedQuery.toLowerCase().includes("dark") && !simplifiedQuery.toLowerCase().includes("night")) {
    simplifiedQuery = `${simplifiedQuery} dark`;
  }
  const used = loadUsedVideos();

  try {
    const url = `https://pixabay.com/api/videos/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(simplifiedQuery)}&orientation=vertical&video_type=film&per_page=10`;
    const response = await axios.get(url);
    const videos = response.data.hits;

    if (!videos || videos.length === 0) {
      return null;
    }

    const match = videos.find((v) => !used.includes(v.videos.large.url));
    if (match) {
      const videoUrl = match.videos.large.url;
      return videoUrl;
    }

    return videos[0].videos.large.url;
  } catch (error) {
    console.error(
      `[VideoSearch] Failed for "${simplifiedQuery}": ${error.message}`,
    );
    return null;
  }
}

export async function downloadVideo(url, outputPath) {
  try {
    const response = await axios({
      method: "get",
      url: url,
      responseType: "stream",
    });

    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => {
        saveUsedVideo(url);
        resolve();
      });
      writer.on("error", reject);
    });
  } catch (error) {
    console.error(`[VideoDownload] Failed: ${error.message}`);
    throw error;
  }
}

export default { search, downloadVideo };
