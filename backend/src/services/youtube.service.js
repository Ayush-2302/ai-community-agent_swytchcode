import youtubeSearch from "youtube-search-api";
import youtubeDl from "youtube-dl-exec";
import ffmpegPath from "ffmpeg-static";
import path from "path";
import fs from "fs";

const USED_SONGS_FILE = path.resolve("used", "used_songs.json");

function loadUsedSongs() {
  try {
    if (fs.existsSync(USED_SONGS_FILE)) {
      return JSON.parse(fs.readFileSync(USED_SONGS_FILE, "utf-8"));
    }
  } catch (e) {
  }
  return [];
}

export function markUsedSong(url) {
  const used = loadUsedSongs();
  if (!used.includes(url)) {
    used.push(url);
    if (used.length > 500) used.shift();
    try {
      fs.writeFileSync(USED_SONGS_FILE, JSON.stringify(used, null, 2));
    } catch (e) {
    }
  }
}

function cleanYouTubeUrl(url) {
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.delete("list");
    urlObj.searchParams.delete("index");
    urlObj.searchParams.delete("t");
    return urlObj.toString();
  } catch (error) {
    return url;
  }
}

function withTimeout(promise, ms, label = "yt-dlp") {
  let t;
  const timeout = new Promise((_, rej) => {
    t = setTimeout(
      () => rej(new Error(`${label} timed out after ${ms}ms`)),
      ms,
    );
  });
  return Promise.race([promise.finally(() => clearTimeout(t)), timeout]);
}

function firstExistingPath(paths) {
  return paths.find((candidate) => candidate && fs.existsSync(candidate));
}

function getDurationText(video) {
  if (typeof video?.length === "string") return video.length;
  return video?.length?.simpleText || "0:00";
}

export async function searchYoutube(query, options = {}) {
  const { allowUsedFallback = false, maxResults = 25, excludeTitleRegex = null } = options;
  const used = loadUsedSongs();

  try {
    const results = await youtubeSearch.GetListByKeyword(query, false, maxResults, [
      { type: "video" },
    ]);
    let videos = (results.items || []).filter(
      (v) => v?.type === "video" && v.id && !v.isLive,
    );

    // Drop results whose titles indicate instrumental/meditation tracks when a
    // niche needs real songs with vocals.
    if (excludeTitleRegex) {
      const filtered = videos.filter((v) => !excludeTitleRegex.test(v.title || ""));
      // Only apply the exclusion if it still leaves something to pick from.
      if (filtered.length > 0) videos = filtered;
    }

    if (!videos || videos.length === 0) return null;

    const unusedVideos = videos.filter(
      (v) => !used.includes(`https://www.youtube.com/watch?v=${v.id}`),
    );
    const match =
      unusedVideos.length > 0
        ? unusedVideos[Math.floor(Math.random() * unusedVideos.length)]
        : null;
    if (match) {
      const url = `https://www.youtube.com/watch?v=${match.id}`;
      return {
        url,
        title: match.title,
        id: match.id,
        artist: match.channelTitle || match.shortBylineText?.runs?.[0]?.text || "YouTube",
        duration: getDurationText(match),
      };
    }
    if (!allowUsedFallback) return null;

    const first = videos[0];
    return {
      url: `https://www.youtube.com/watch?v=${first.id}`,
      title: first.title,
      id: first.id,
      artist: first.channelTitle || first.shortBylineText?.runs?.[0]?.text || "YouTube",
      duration: getDurationText(first),
    };
  } catch (error) {
    console.error("[YouTube] Search failed:", error.message);
    return null;
  }
}

export async function downloadYoutubeAudio(
  url,
  outputPath,
  startTime = "00:00:30",
  duration = 30,
) {
  const cleanUrl = cleanYouTubeUrl(url);
  const downloadTimeoutMs = Number(process.env.YOUTUBE_DOWNLOAD_TIMEOUT_MS) || 120 * 1000;

  // Convert "HH:MM:SS" / "MM:SS" / seconds into total seconds for the section range
  const toSeconds = (t) => {
    if (typeof t === "number") return t;
    if (!t) return 0;
    const parts = String(t).split(":").map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return parts[0] || 0;
  };
  const startSeconds = toSeconds(startTime);
  const endSeconds = startSeconds + duration;
  // Only download the exact slice we need — avoids fetching hour-long tracks in full.
  const sectionArg = `*${startSeconds}-${endSeconds}`;
  const ffmpegDir = path.dirname(ffmpegPath);

  const baseFlags = {
    format: "bestaudio/best",
    noProgress: true,
    quiet: true,
    noWarnings: true,
    noPlaylist: true,
    noCheckCertificates: true,
    restrictFilenames: true,
    jsRuntimes: `node:${process.execPath}`,
    extractorArgs: "youtube:player_client=android",
    downloadSections: sectionArg,
    forceKeyframesAtCuts: true,
    ffmpegLocation: ffmpegDir,
  };

  const childOpts = {
    windowsHide: true,
    shell: false,
    stdio: ["ignore", "pipe", "pipe"],
    timeout: downloadTimeoutMs + 5 * 1000,
  };

  // Determine initial cookies strategy based on environment
  const cookiesFromBrowser = process.env.YOUTUBE_COOKIES_FROM_BROWSER;
  const envCookiesPath = process.env.YOUTUBE_COOKIES_FILE;

  const initialCookieFlags = {};
  if (cookiesFromBrowser) {
    initialCookieFlags.cookiesFromBrowser = cookiesFromBrowser;
  } else {
    const cookiesPath = firstExistingPath([
      envCookiesPath && path.resolve(envCookiesPath),
      path.resolve("cookies.txt"),
      path.resolve("all_cookies.txt"),
      path.resolve("..", "all_cookies.txt"),
    ]);

    if (cookiesPath) {
      initialCookieFlags.cookies = cookiesPath;
    }
  }

  // Fallback strategies prioritizing Android client which bypasses GVS PO Token / 403 Forbidden
  const attempts = [
    { label: "Android client (with cookies)", flags: { ...initialCookieFlags, extractorArgs: "youtube:player_client=android" } },
    { label: "Android client (no cookies)", flags: { extractorArgs: "youtube:player_client=android" } },
    { label: "Android VR fallback", flags: { extractorArgs: "youtube:player_client=android_vr,android" } },
    { label: "Default web fallback", flags: {} },
  ];

  let lastError = null;

  const cleanupTempFiles = () => {
    const possibleExtensions = [".webm", ".m4a", ".mp3", ".mp4", ".wav", ".ogg", ".aac", ".temp"];
    possibleExtensions.forEach((ext) => {
      const p = outputPath + ".temp" + ext;
      if (fs.existsSync(p)) {
        try { fs.unlinkSync(p); } catch (e) {}
      }
    });
    const literalTemp = outputPath + ".temp";
    if (fs.existsSync(literalTemp)) {
      try { fs.unlinkSync(literalTemp); } catch (e) {}
    }
  };

  for (let i = 0; i < attempts.length; i++) {
    const attempt = attempts[i];
    const tempTemplate = outputPath + ".temp.%(ext)s";
    try {
      console.log(`[YouTube] Attempt ${i + 1}/${attempts.length}: Downloading using ${attempt.label}...`);
      
      cleanupTempFiles();

      await withTimeout(
        youtubeDl(cleanUrl, { ...baseFlags, ...attempt.flags, output: tempTemplate }, childOpts),
        downloadTimeoutMs,
      );

      // Find actual downloaded file
      const possibleExtensions = [".webm", ".m4a", ".mp3", ".mp4", ".wav", ".ogg", ".aac"];
      let actualTempPath = null;
      for (const ext of possibleExtensions) {
        const checkPath = outputPath + ".temp" + ext;
        if (fs.existsSync(checkPath)) {
          actualTempPath = checkPath;
          break;
        }
      }
      if (!actualTempPath && fs.existsSync(outputPath + ".temp")) {
        actualTempPath = outputPath + ".temp";
      }

      if (!actualTempPath) {
        throw new Error("Could not locate downloaded temp audio file.");
      }

      const { execSync } = await import("child_process");
      // yt-dlp already downloaded just the [startSeconds, endSeconds] slice, so
      // transcode the temp to mp3 (audio only) without re-applying the start offset.
      const clipCmd = `"${ffmpegPath}" -y -i "${actualTempPath}" -vn -t ${duration} -acodec libmp3lame -q:a 2 "${outputPath}"`;

      try {
        execSync(clipCmd, { stdio: "pipe" });
      } catch (clipErr) {
        const errorMsg = clipErr.stderr?.toString() || clipErr.message;
        console.error(`[YouTube] Clipping failed: ${errorMsg}`);
        throw clipErr;
      }

      cleanupTempFiles();

      if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 50000) {
        markUsedSong(url);
        return; // Success!
      } else {
        const size = fs.existsSync(outputPath) ? fs.statSync(outputPath).size : 0;
        throw new Error(`File not found or too small after clipping: ${outputPath} (Size: ${size} bytes)`);
      }
    } catch (error) {
      lastError = error;
      const errorMsg = (error.stderr || error.message || "").toString();
      console.warn(`[YouTube] Attempt ${i + 1} (${attempt.label}) failed: ${errorMsg.trim()}`);
      
      cleanupTempFiles();

      if (i < attempts.length - 1) {
        console.log(`[YouTube] Retrying with next fallback...`);
      }
    }
  }

  console.error(
    `[YouTube] All download attempts failed. Last error: ${lastError?.stderr || lastError?.message}`,
  );
  throw lastError;
}
