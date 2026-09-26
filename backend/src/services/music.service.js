import axios from "axios";
import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import {
  downloadYoutubeAudio,
  markUsedSong,
  searchYoutube,
} from "./youtube.service.js";

const JAMENDO_CLIENT_ID = process.env.JAMENDO_CLIENT_ID || "66983191";

const AUTHENTIC_HINDI_MUSIC_CHANNELS = [
  { name: "T-Series", handle: "@tseries" },
  { name: "Sony Music India", handle: "@SonyMusicIndia" },
  { name: "Zee Music Company", handle: "@zeemusiccompany" },
  { name: "Saregama Music", handle: "@saregama" },
  { name: "Tips Official", handle: "@tipsofficial" },
  { name: "YRF", handle: "@yrf" },
  { name: "Evergreen Songs", handle: "@EvergreenSongsm1" },
  { name: "THE SONG TV", handle: "@THESONGTV" },
  { name: "Venus Movies", handle: "@venusmovies" },
  { name: "Ultra Bollywood", handle: "@UltraBollywood" },
  { name: "Ishtar Music", handle: "@IshtarMusic" },
  { name: "VYRL Originals", handle: "@VYRLOriginals" },
  { name: "DM - Desi Melodies", handle: "@desimelodies" },
  { name: "Desi Music Factory", handle: "@DesiMusicFactory" },
  { name: "Universal Music India", handle: "@UniversalMusicIndia" },
  { name: "Speed Records", handle: "@speedrecords" },
  { name: "White Hill Music", handle: "@whitehillmusic" },
];

const AUTHENTIC_SPIRITUAL_CHANNELS = [
  { name: "T-Series Bhakti Sagar", handle: "@tseriesbhaktisagar" },
  { name: "Spiritual Mantra", handle: "@SpiritualMantra" },
  { name: "Bhakti Ganga", handle: "@BhaktiGangaOfficial" },
  { name: "Divine Melodies", handle: "@divinemelodies" },
  { name: "Saregama Bhakti", handle: "@saregamabhakti" },
  { name: "Rajshri Soul", handle: "@rajshrisoul" },
  { name: "Strumm Spiritual", handle: "@strummspiritual" },
  { name: "Times Music Spiritual", handle: "@timesmusicspiritual" },
  { name: "Tips Bhakti", handle: "@TipsBhakti" },
  { name: "Zee Music Devotional", handle: "@ZeeMusicDevotional" },
  { name: "Spiritual Activity", handle: "@spiritualactivity" },
  { name: "Art of Living", handle: "@artofliving" },
  { name: "Sadhguru", handle: "@sadhguru" },
];

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function uniqueQueries(queries) {
  return [...new Set(queries.map((q) => q && q.trim()).filter(Boolean))];
}

// Titles containing these words are instrumental/meditation tracks — rejected
// for niches that must use real songs with vocals (e.g. broken_wings).
const INSTRUMENTAL_TITLE_REGEX =
  /\b(instrumental|meditation|meditative|relaxing|calming|soothing|sleep|study|ambient|lofi|bgm|background\s*music|flute|bansuri|sitar|piano\s*music|no\s*copyright)\b/i;

function stripInstrumentalWords(str) {
  return String(str || "")
    .replace(
      /\b(instrumental|flute|bansuri|sitar|piano|meditation|meditative|relaxing|calming|soothing|sleep|study|ambient|lofi|bgm|beats|background)\b/gi,
      "",
    )
    .replace(/\s+/g, " ")
    .trim();
}

function cleanSeed(str, maxWords = 5) {
  if (!str || typeof str !== "string") return "";
  return str
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .trim()
    .split(/\s+/)
    .slice(0, maxWords)
    .join(" ");
}

function buildYoutubeSearchQueries(metadata = {}) {
  const { niche, music_mood, music_search_query, topic } = metadata;
  const rawSeed = music_search_query || topic || "";
  const seed = cleanSeed(rawSeed, 8);

  if (niche === "broken_wings") {
    const ch1 = randomItem(AUTHENTIC_HINDI_MUSIC_CHANNELS);
    const ch2 = randomItem(AUTHENTIC_HINDI_MUSIC_CHANNELS);

    // Filter out instrumental/flute/meditation keywords to guarantee real songs with vocals
    const cleanedSeed = stripInstrumentalWords(seed);

    const queries = [];
    // Primary: drive search off the LLM's per-quote song suggestion
    if (cleanedSeed && cleanedSeed.length > 3) {
      queries.push(`${cleanedSeed} official audio`);
      queries.push(`${cleanedSeed} ${ch1.name}`);
      queries.push(`${cleanedSeed} sad Hindi song`);
    }

    // Dynamic generic fallbacks (no hardcoded song titles)
    queries.push(
      `sad Hindi song ${ch1.name} official audio`,
      `heartbreak emotional Hindi song ${ch2.name}`,
      `slowed and reverb sad Hindi songs with lyrics`,
      `trending sad Hindi song official audio`,
      `evergreen sad Hindi song official audio`,
    );

    return uniqueQueries(queries);
  }

  if (niche === "kanhacode") {
    const spCh1 = randomItem(AUTHENTIC_SPIRITUAL_CHANNELS);
    const spCh2 = randomItem(AUTHENTIC_SPIRITUAL_CHANNELS);

    const queries = [];
    // Primary: drive search directly off the LLM's per-quote song/instrumental suggestion
    if (seed && seed.length > 3) {
      queries.push(`${seed} official audio`);
      queries.push(`${seed} ${spCh1.name}`);
      queries.push(`${seed}`);
      queries.push(`${seed} slowed and reverb`);
      queries.push(`${seed} ${spCh2.name}`);
    }

    // Dynamic generic fallbacks for best slow latest songs and instrumental tracks from top channels
    queries.push(
      `trending Krishna slow song ${spCh1.name}`,
      `Radha Krishna serial flute theme instrumental`,
      `peaceful Krishna bansuri flute instrumental`,
      `latest Krishna bhajan slow ${spCh2.name}`,
      `soulful Krishna devotional song slowed reverb`,
      `divine Krishna meditation flute music`,
      `Achyutam Keshavam slowed reverb official`,
      `popular Krishna bhajan official audio ${spCh1.name}`,
      `Krishna lofi slow soulful bhajan`,
    );

    return uniqueQueries(queries);
  }

  if (niche === "personallinkedin" || niche === "dotenvcoder") {
    const curated = [
      "lofi coding background music",
      "chill electronic productivity music",
      "future garage coding music",
      "cyberpunk synthwave background music",
      "ambient techno focus music",
    ];
    const queries = [];
    if (seed && seed.length > 3) {
      queries.push(`${seed} lofi coding music`);
    }
    queries.push(...curated.sort(() => Math.random() - 0.5));
    return uniqueQueries(queries);
  }

  return uniqueQueries([
    `${seed} chill background music`,
    "chill lofi background music",
  ]);
}

async function getYoutubeMusicInternal(searchQuery, music_mood, niche) {
  const parseDuration = (str) => {
    if (!str) return 0;
    const p = str.split(':').map(Number);
    if (p.length === 3) return p[0] * 3600 + p[1] * 60 + p[2];
    if (p.length === 2) return p[0] * 60 + p[1];
    return p[0] || 0;
  };
  const cacheFolder = path.join(process.cwd(), "music");
  if (!fs.existsSync(cacheFolder)) {
    fs.mkdirSync(cacheFolder, { recursive: true });
  }

  const queries = Array.isArray(searchQuery) ? searchQuery : [searchQuery];
  let song = null;
  let matchedQuery = "";

  // Niches that strictly need real songs with vocals must skip instrumental/meditation results.
  const excludeTitleRegex =
    niche === "broken_wings" ? INSTRUMENTAL_TITLE_REGEX : null;

  for (const query of queries) {
    song = await searchYoutube(query, {
      allowUsedFallback: true,
      maxResults: 25,
      excludeTitleRegex,
    });

    if (song) {
      matchedQuery = query;
      break;
    }
  }

  if (!song) throw new Error(`No YouTube results found for: ${queries.join(" | ")}`);

  console.log(`[Music] YouTube match: "${song.title}" via "${matchedQuery}"`);

  const safeFileName = song.title
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase()
    .substring(0, 50);
  const localPath = path.join(cacheFolder, `${safeFileName}.mp3`);

  if (fs.existsSync(localPath)) {
    markUsedSong(song.url);
    return {
      path: localPath,
      track_name: song.title,
      artist_name: song.artist,
    };
  }

  const songSeconds = parseDuration(song.duration);
  let startSeconds = music_mood === "sad" ? 45 : 30;
  
  if (songSeconds > 0 && songSeconds <= startSeconds) {
    startSeconds = 0;
  }
  
  const startTime = `00:00:${startSeconds.toString().padStart(2, '0')}`;
  await downloadYoutubeAudio(song.url, localPath, startTime, 30);

  return {
    path: localPath,
    track_name: song.title,
    artist_name: song.artist,
  };
}

export async function getHindiYoutubeMusic(metadata = {}) {
  const { topic, music_mood = "sad", niche = "broken_wings" } = metadata;

  try {
    return await getYoutubeMusicInternal(
      buildYoutubeSearchQueries({ ...metadata, niche }),
      music_mood,
      niche,
    );
  } catch (err) {
    console.error(`[Music] getHindiYoutubeMusic failed: ${err.message}`);
    return await getRandomLocalTrack();
  }
}

async function getRandomLocalTrack() {
  const cacheFolder = path.join(process.cwd(), "music");
  try {
    const files = await fs.promises.readdir(cacheFolder);
    const tracks = files.filter((f) => f.endsWith(".mp3"));
    if (tracks.length === 0) return null;

    const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
    return { path: path.join(cacheFolder, randomTrack) };
  } catch (err) {
    return null;
  }
}

async function getJamendoMusic(musicMetadata) {
  const { music_mood, music_search_query, preference, topic, caption } =
    musicMetadata;
  const query = music_search_query || topic || caption || music_mood || "chill";
  const safeQuery = encodeURIComponent(query);

  const cacheFolder = path.join(process.cwd(), "music");
  if (!fs.existsSync(cacheFolder)) {
    fs.mkdirSync(cacheFolder, { recursive: true });
  }

  try {
    let track = null;
    const searchUrl = `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=50&search=${safeQuery}${preference ? `&vocalinstrumental=${preference}` : ""}&boost=popularity_total&audioformat=mp32`;
    const searchRes = await axios.get(searchUrl);
    if (searchRes.data?.results?.length > 0) {
      track =
        searchRes.data.results[
          Math.floor(Math.random() * searchRes.data.results.length)
        ];
    }

    if (!track && music_mood) {
      const vocalParam = preference ? `&vocalinstrumental=${preference}` : "";
      const fallbackUrl = `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=50&tags=${encodeURIComponent(music_mood)}${vocalParam}&boost=popularity_total&audioformat=mp32`;
      const fallbackRes = await axios.get(fallbackUrl);
      if (fallbackRes.data?.results?.length > 0) {
        track =
          fallbackRes.data.results[
            Math.floor(Math.random() * fallbackRes.data.results.length)
          ];
      }
    }

    if (track && track.audio) {
      const localPath = path.join(cacheFolder, `jamendo_${track.id}.mp3`);
      
      if (fs.existsSync(localPath)) {
        return {
          path: localPath,
          album_image: track.album_image || track.image,
          track_name: track.name,
          artist_name: track.artist_name,
        };
      }

      const downloadRes = await axios.get(track.audio, {
        responseType: "stream",
      });
      await pipeline(downloadRes.data, fs.createWriteStream(localPath));
      return {
        path: localPath,
        album_image: track.album_image || track.image,
        track_name: track.name,
        artist_name: track.artist_name,
      };
    }
  } catch (err) {
    console.error(`[Music] Jamendo failed: ${err.message}`);
  }
  return null;
}

async function getLocalMusicForNiche(niche) {
  const cacheFolder = path.join(process.cwd(), "music");
  try {
    const files = await fs.promises.readdir(cacheFolder);
    const tracks = files.filter((f) => f.endsWith(".mp3") && !f.endsWith(".temp.mp3"));
    if (tracks.length === 0) return null;

    let keywords = [];
    if (niche === "broken_wings") {
      keywords = ["sad", "soulful", "longing", "piano", "melancholy", "heartbreak", "sufi", "instrumental", "arijit", "melod", "grief", "tear", "alone", "ghost", "rain", "silent"];
    } else if (niche === "kanhacode") {
      keywords = ["krishna", "kanha", "radha", "achyutam", "keshavam", "govind", "hare", "shyam", "bhajan", "devotional", "mohana", "spiritual", "divine", "gita", "sacred", "flute", "bansuri", "peace", "calm"];
    } else if (niche === "personallinkedin" || niche === "dotenvcoder") {
      keywords = ["lofi", "coding", "electronic", "garage", "synthwave", "productivity", "tech", "focus", "chill", "study", "work"];
    }

    const matchedTracks = tracks.filter((file) => {
      const lower = file.toLowerCase();
      return keywords.some((kw) => lower.includes(kw));
    });

    const chosenTrack = matchedTracks.length > 0
      ? matchedTracks[Math.floor(Math.random() * matchedTracks.length)]
      : tracks[Math.floor(Math.random() * tracks.length)];

    return {
      path: path.join(cacheFolder, chosenTrack),
      track_name: chosenTrack.replace(/_/g, " ").replace(".mp3", ""),
      artist_name: "Local Library",
    };
  } catch (err) {
    console.error("[Music] Failed to read local tracks:", err.message);
    return null;
  }
}

export async function getMusicPath(musicMetadata) {
  const { niche, music_mood } = musicMetadata;
  const queries = buildYoutubeSearchQueries(musicMetadata);

  try {
    return await getYoutubeMusicInternal(
      queries,
      niche === "broken_wings" ? "sad" : music_mood,
      niche,
    );
  } catch (err) {
    console.error(`[Music] YouTube failed: ${err.message}. Falling back to Jamendo.`);
    const jamendoTrack = await getJamendoMusic(musicMetadata);
    if (jamendoTrack) return jamendoTrack;
    
    console.warn(`[Music] Jamendo failed. Falling back to local niche-specific track.`);
    const localTrack = await getLocalMusicForNiche(niche);
    if (localTrack) return localTrack;
    
    throw new Error("Failed to get music from any source");
  }
}
