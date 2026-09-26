import sharp from "sharp";
import fs from "fs/promises";

/**
 * Standard Resizing with Optional Branding (Vignette, Logo, Tagline)
 */
export async function resizeToReel(inputPath, outputPath, options = {}) {
  const {
    tagline,
    niche,
    includePill = false,
  } = options;
  const targetW = 1080;
  const targetH = 1920;
  const margin = 50;
  const brandTagline = tagline || "Brand";
  const shouldIncludePill = includePill;

  try {
    const metadata = await sharp(inputPath).metadata();
    const imgRatio = metadata.width / metadata.height;
    const targetRatio = targetW / targetH;

    let scaledW, scaledH;
    if (imgRatio > targetRatio) {
      scaledW = targetW;
      scaledH = targetW / imgRatio;
    } else {
      scaledH = targetH;
      scaledW = targetH * imgRatio;
    }

    const xOffset = (targetW - scaledW) / 2;
    const yOffset = (targetH - scaledH) / 2;

    const charWidth = 18;
    const pillPadding = 110;
    
    let brandingOverlay = null;
    if (shouldIncludePill && brandTagline) {
      brandingOverlay = Buffer.from(`
        <svg width="${targetW}" height="${targetH}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="black" flood-opacity="0.9"/>
              <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="black" flood-opacity="0.7"/>
            </filter>

            <radialGradient id="vignette" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" style="stop-color:rgba(0,0,0,0);stop-opacity:0" />
              <stop offset="100%" style="stop-color:rgba(0,0,0,0.6);stop-opacity:1" />
            </radialGradient>
          </defs>

          <!-- Vignette Effect -->
          <rect width="${targetW}" height="${targetH}" fill="url(#vignette)" />

          <!-- Branding Text -->
          <text x="${targetW / 2}" y="100" font-family="Arial, sans-serif" font-weight="900" font-size="32" fill="white" letter-spacing="2" text-anchor="middle" filter="url(#textShadow)" opacity="0.9">
            @${brandTagline.toUpperCase()}
          </text>
        </svg>
      `);
    } else {
      brandingOverlay = Buffer.from(`
        <svg width="${targetW}" height="${targetH}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="vignette" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" style="stop-color:rgba(0,0,0,0);stop-opacity:0" />
              <stop offset="100%" style="stop-color:rgba(0,0,0,0.6);stop-opacity:1" />
            </radialGradient>
          </defs>
          <rect width="${targetW}" height="${targetH}" fill="url(#vignette)" />
        </svg>
      `);
    }

    const composites = [{ input: brandingOverlay, top: 0, left: 0 }];

    await sharp(inputPath)
      .resize(targetW, targetH, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 1 },
      })
      .composite(composites)
      .toFile(outputPath);
  } catch (error) {
    console.error("Error in resizeToReel:", error.message);
    await sharp(inputPath)
      .resize(targetW, targetH, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 1 },
      })
      .toFile(outputPath);
  }
}

/**
 * Engineer Bro style: White bar with black bold text
 */
export async function addMemeStyleText(inputPath, outputPath, text, options = {}) {
  const { placement = "top" } = options;
  const targetW = 1080;
  const targetH = 1920;

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
    return lines.filter((l) => l.length > 0);
  };

  const lines = wrapText(text || "", 35);
  const fontSize = 48;
  const lineHeight = 65;
  const padding = 40;
  const barHeight = lines.length * lineHeight + padding * 2;

  const svg = `
    <svg width="${targetW}" height="${targetH}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${targetW}" height="${barHeight}" fill="white" y="${placement === "top" ? 0 : targetH - barHeight}" />
      <text font-family="Arial, sans-serif" font-weight="bold" font-size="${fontSize}" fill="black" text-anchor="middle">
        ${lines
          .map(
            (line, i) =>
              `<tspan x="${targetW / 2}" y="${(placement === "top" ? padding + 40 : targetH - barHeight + padding + 40) + i * lineHeight}">${line.toUpperCase()}</tspan>`,
          )
          .join("")}
      </text>
    </svg>
  `;

  await sharp(inputPath)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .toFile(outputPath);
}

export async function imageToBase64(filePath) {
  const buffer = await fs.readFile(filePath);
  return buffer.toString("base64");
}
