import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import config from "../config/env.js";

ffmpeg.setFfmpegPath(config.media.ffmpegPath || ffmpegInstaller.path);

export async function generateReel(inputImagePath, outputVideoPath, metadata) {
  const {
    caption,
    text_placement = "bottom",
    style = {},
    music_path,
    duration = 10,
    include_text = true,
  } = metadata;

  const absoluteInputPath = path.resolve(inputImagePath);
  const absoluteOutputPath = path.resolve(outputVideoPath);

  // Ensure output directory exists
  const outputDir = path.dirname(absoluteOutputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Create caption file (avoids complex shell escaping)
  const captionFilePath = path.resolve(`uploads/caption-${Date.now()}.txt`);

  // Path helpers
  const normalizePath = (p) => p.replace(/\\/g, "/");
  const escapeFilterPath = (p) => p.replace(/\\/g, "/").replace(/:/g, "\\:");

  // Text wrapping helper
  const wrapText = (text, maxChars) => {
    const words = text.split(/\s+/);
    let lines = [];
    let currentLine = "";

    words.forEach((word) => {
      if ((currentLine + word).length > maxChars) {
        lines.push(currentLine.trim());
        currentLine = word + " ";
      } else {
        currentLine += word + " ";
      }
    });
    lines.push(currentLine.trim());
    return lines.filter((l) => l.length > 0).join("\n");
  };

  const isLongCaption = (caption || "").split(/\s+/).length > 20;
  const wrappedCaption = wrapText(caption || "", 45);

  // Font & Style
  const fontPath = config.media.fontPath;
  const fontColor = style.text_color || "white";
  const fontSize = isLongCaption ? 36 : 64;
  const height = 1920;

  // Use dynamic variables so multi-line text aligns properly
  let yPos = "(h-text_h)-200"; // default bottom
  if (text_placement === "top") yPos = "200";
  if (text_placement === "center") yPos = "(h-text_h)/2";

  return new Promise((resolve, reject) => {
    let command = ffmpeg();

    // 1. INPUT 0: Image (looped)
    command.input(normalizePath(absoluteInputPath)).inputOptions(["-loop 1"]);

    if (music_path && fs.existsSync(music_path)) {
      command.input(normalizePath(path.resolve(music_path)));
    } else {
      // Fallback: Generate a silent audio stream so Instagram won't reject the file
      command.input("anullsrc").inputFormat("lavfi");
    }

    // 3. Prepare Filters (Removed fade-in to ensure clear thumbnail)
    const filters = [`fade=t=out:st=${duration - 1}:d=1`];

    if (include_text !== false) {
      // Added box=1 and boxcolor for better readability of dense text
      filters.push(
        `drawtext=fontfile='${escapeFilterPath(fontPath)}':textfile='${escapeFilterPath(
          captionFilePath,
        )}':fontsize=${fontSize}:fontcolor=${fontColor}:x=(w-text_w)/2:y=${yPos}:shadowcolor=black:shadowx=2:shadowy=2`,
      );
    }

    // 3.5 Detect aspect ratio to prevent stretching
    filters.push("scale=1080:-2");

    // 4. Sequence Command
    command
      .videoFilters(filters)
      .outputOptions([
        `-t ${duration}`,
        "-r 30",
        "-pix_fmt yuv420p",
        "-map 0:v:0", // Source video from image input
        "-map 1:a:0", // Source audio from music or anullsrc
        "-shortest",
      ])
      .videoCodec("libx264")
      .audioCodec("aac")
      .output(normalizePath(absoluteOutputPath));

    // 5. Monitoring & Execution
    command
      .on("start", (cmd) => {})
      .on("end", () => {
        if (fs.existsSync(captionFilePath)) fs.unlinkSync(captionFilePath);
        resolve(outputVideoPath);
      })
      .on("error", (err) => {
        console.error("[FFmpeg] Error:", err.message);
        if (fs.existsSync(captionFilePath)) fs.unlinkSync(captionFilePath);
        reject(err);
      })
      .run();
  });
}

/**
 * Generates a reel where multiple icons "dance" independently using complex filters.
 * @param {object} assets - { bgPath, titlePath, iconAssets: [{ path, x, y }] }
 * @param {string} outputVideoPath - Destination path
 * @param {object} metadata - { music_path, duration }
 */
export async function generateDancingReel(assets, outputVideoPath, metadata) {
  const { bgPath, titlePath, iconAssets } = assets;
  const { music_path, duration = 8 } = metadata;

  const normalizePath = (p) => p.replace(/\\/g, "/");

  return new Promise((resolve, reject) => {
    let command = ffmpeg();

    // Inputs: 0 (BG), 1 (Title), 2...N (Icons), N+1 (Audio)
    command.input(normalizePath(bgPath)).inputOptions(["-loop 1"]);
    command.input(normalizePath(titlePath)).inputOptions(["-loop 1"]);

    iconAssets.forEach((icon) => {
      command.input(normalizePath(icon.path)).inputOptions(["-loop 1"]);
    });

    let hasAudio = false;
    if (music_path && fs.existsSync(music_path)) {
      command.input(normalizePath(path.resolve(music_path)));
      hasAudio = true;
    }

    const filters = [];

    // 1. Overlay Title over BG
    filters.push({
      filter: "overlay",
      options: { x: "0", y: "0" },
      inputs: ["[0:v]", "[1:v]"],
      outputs: "vtitle",
    });

    // 2. Overlay Icons with "Dance" expressions
    let lastOutput = "vtitle";
    iconAssets.forEach((icon, i) => {
      const inputRef = `[${i + 2}:v]`;
      const outputRef = `vicon${i}`;

      // The "Dance": High-frequency bounce + subtle drift
      // We vary the phase (i*0.5) so they don't all move in perfect sync
      const bounceY = `${icon.y} + sin(t*5 + ${i * 0.8})*20`;
      const wobbleX = `${icon.x} + cos(t*3 + ${i * 0.5})*10`;

      filters.push({
        filter: "overlay",
        options: { x: wobbleX, y: bounceY },
        inputs: [lastOutput, inputRef],
        outputs: outputRef,
      });
      lastOutput = outputRef;
    });

    // 3. Final touch: Fade out
    filters.push({
      filter: "fade",
      options: { t: "out", st: duration - 1, d: 1 },
      inputs: [lastOutput],
      outputs: "final",
    });

    command
      .complexFilter(filters)
      .outputOptions(
        [
          `-t ${duration}`,
          "-r 30",
          "-pix_fmt yuv420p",
          "-map [final]",
          hasAudio ? `-map ${iconAssets.length + 2}:a:0` : null,
        ].filter(Boolean),
      )
      .videoCodec("libx264")
      .output(normalizePath(path.resolve(outputVideoPath)))
      .on("start", (cmd) => {
        fs.appendFileSync("ffmpeg-debug.log", `Command: ${cmd}\n\n`);
      })
      .on("stderr", (line) => {
        fs.appendFileSync("ffmpeg-debug.log", `STDERR: ${line}\n`);
      })
      .on("end", () => {
        resolve(outputVideoPath);
      })
      .on("error", (err) => {
        console.error("[FFmpeg] Dancing Reel Error:", err.message);
        reject(err);
      })
      .run();
  });
}
export async function generateVideoReel(
  inputVideoPath,
  outputVideoPath,
  metadata,
) {
  const { music_path, duration = 10, overlayBuffer } = metadata;

  const absoluteInputPath = path.resolve(inputVideoPath);
  const absoluteOutputPath = path.resolve(outputVideoPath);

  const overlayPath = path.resolve(`uploads/overlay-${Date.now()}.png`);
  if (overlayBuffer) {
    fs.writeFileSync(overlayPath, overlayBuffer);
  }

  const normalizePath = (p) => p.replace(/\\/g, "/");

  return new Promise((resolve, reject) => {
    let command = ffmpeg(normalizePath(absoluteInputPath));

    if (music_path && fs.existsSync(music_path)) {
      command.input(normalizePath(path.resolve(music_path)));
    }

    const complexFilters = [];

    // 1. Scale and Crop the background video
    complexFilters.push({
      filter: "scale",
      options: "1080:1920:force_original_aspect_ratio=increase",
      inputs: "[0:v]",
      outputs: "scaled",
    });
    complexFilters.push({
      filter: "crop",
      options: "1080:1920",
      inputs: "scaled",
      outputs: "cropped",
    });

    let lastVideoOutput = "cropped";
    const overlayInputIndex = music_path && fs.existsSync(music_path) ? 2 : 1;

    if (overlayBuffer) {
      command.input(normalizePath(overlayPath));
      complexFilters.push({
        filter: "overlay",
        options: "0:0",
        inputs: [lastVideoOutput, `[${overlayInputIndex}:v]`],
        outputs: "final_video",
      });
      lastVideoOutput = "final_video";
    }

    command
      .complexFilter(complexFilters)
      .outputOptions([
        `-t ${duration}`,
        "-pix_fmt yuv420p",
        "-map",
        overlayBuffer ? "[final_video]" : "[cropped]",
        music_path ? "-map 1:a:0" : "-map 0:a:0?",
        "-shortest",
      ])
      .videoCodec("libx264")
      .audioCodec("aac")
      .output(normalizePath(absoluteOutputPath))
      .on("end", () => {
        if (fs.existsSync(overlayPath)) fs.unlinkSync(overlayPath);
        resolve(outputVideoPath);
      })
      .on("error", (err) => {
        if (fs.existsSync(overlayPath)) fs.unlinkSync(overlayPath);
        reject(err);
      })
      .run();
  });
}
