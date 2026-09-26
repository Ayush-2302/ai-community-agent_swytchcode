import * as simpleIcons from "simple-icons";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import fsSync from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LUCIDE_ICONS_PATH = path.join(__dirname, "..", "..", "node_modules", "lucide-static", "icons");

export function wrapSvgText(text, maxChars) {
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
  return lines.filter(l => l.length > 0);
}

export async function getIconData(iconName) {
  const lucidePath = path.join(LUCIDE_ICONS_PATH, `${iconName.toLowerCase()}.svg`);
  if (fsSync.existsSync(lucidePath)) {
    const svg = await fs.readFile(lucidePath, "utf-8");
    return {
      title: iconName,
      slug: iconName.toLowerCase(),
      svg: svg,
      hex: "#ffffff",
      type: "lucide"
    };
  }

  const siKey = `si${iconName.charAt(0).toUpperCase() + iconName.slice(1).toLowerCase()}`;
  const icon = simpleIcons[siKey];
  if (icon) {
    return {
      title: icon.title,
      slug: icon.slug,
      svg: icon.svg,
      hex: `#${icon.hex}`,
      type: "brand"
    };
  }

  return null;
}

export async function prepareIconsReelAssets(iconsList, titleText, folderPath) {
  const width = 1080;
  const height = 1920;

  try {
    const bgPath = path.join(folderPath, `bg-${Date.now()}.png`);
    await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 10, g: 15, b: 30, alpha: 1 }
      }
    })
    .composite([
      {
        input: Buffer.from(
          `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#0f2027;stop-opacity:1" />
                <stop offset="50%" style="stop-color:#203a43;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#2c5364;stop-opacity:1" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grad)" />
          </svg>`
        ),
        top: 0,
        left: 0,
      }
    ])
    .png()
    .toFile(bgPath);

    const titleLines = wrapSvgText(titleText, 15);
    const lineHeight = 90;
    const titleYStart = 200;
    
    const titleSvg = `<svg width="${width}" height="600" xmlns="http://www.w3.org/2000/svg">
      <style>
        .title { fill: white; font-family: 'Segoe UI', Arial, sans-serif; font-size: 70px; text-anchor: middle; font-weight: bold; }
      </style>
      ${titleLines.map((line, i) => `<text x="50%" y="${titleYStart + i * lineHeight}" class="title">${line}</text>`).join("")}
    </svg>`;
    
    const titlePath = path.join(folderPath, `title-${Date.now()}.png`);
    await sharp(Buffer.from(titleSvg)).png().toFile(titlePath);

    const cardSize = 280;
    const iconPadding = 60;
    const iconAssets = [];

    const cols = 2;
    const gap = 80;
    const startTop = 700;
    const startLeft = (width - (cardSize * cols + gap * (cols - 1))) / 2;

    for (let i = 0; i < iconsList.length; i++) {
      const iconName = iconsList[i];
      const data = await getIconData(iconName);
      if (!data) continue;

      const iconCardPath = path.join(folderPath, `icon-${i}-${Date.now()}.png`);
      try {
        await createIconCard(data, cardSize, iconPadding, iconCardPath);
      } catch (err) {
        console.error(`[Icons] Failed to create card for ${iconName}:`, err.message);
        continue;
      }

      const row = Math.floor(i / cols);
      const col = i % cols;

      iconAssets.push({
        path: iconCardPath,
        x: startLeft + col * (cardSize + gap),
        y: startTop + row * (cardSize + gap),
        color: data.hex
      });
    }

    return { bgPath, titlePath, iconAssets };
  } catch (error) {
    console.error("[Icons] prepareIconsReelAssets failed:", error.message);
    throw error;
  }
}

async function createIconCard(data, size, padding, outputPath) {
  const cornerRadius = 50;
  const iconSize = size - padding * 2;
  const bgColor = data.type === "brand" ? data.hex : "#3a4a5a";

  const cardSvg = Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${size}" height="${size}" rx="${cornerRadius}" ry="${cornerRadius}" fill="${bgColor}" fill-opacity="0.8" />
      <rect x="2" y="2" width="${size-4}" height="${size-4}" rx="${cornerRadius}" ry="${cornerRadius}" fill="none" stroke="white" stroke-opacity="0.3" stroke-width="4" />
    </svg>`
  );

  let cleanIconSvg = data.svg;
  if (!cleanIconSvg.includes("xmlns")) {
    cleanIconSvg = cleanIconSvg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  const svgOpenTagMatch = cleanIconSvg.match(/<svg[^>]*>/);
  if (svgOpenTagMatch) {
    let openTag = svgOpenTagMatch[0];
    let newOpenTag = openTag
      .replace(/\s(width|height)="[^"]*"/g, "")
      .replace("<svg", `<svg width="${iconSize}" height="${iconSize}"`);
    cleanIconSvg = cleanIconSvg.replace(openTag, newOpenTag);
  }
  
  cleanIconSvg = cleanIconSvg
    .replace(/currentColor/g, "white")
    .replace(/stroke="[^"]*"/g, 'stroke="white"')
    .replace(/fill="[^"]*"/g, 'fill="white"');

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([
      { input: cardSvg, top: 0, left: 0 },
      { input: Buffer.from(cleanIconSvg), top: padding, left: padding }
    ])
    .png()
    .toFile(outputPath);
}
