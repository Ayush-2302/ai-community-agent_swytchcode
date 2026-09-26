import { randomInt } from "crypto";
import sharp from "sharp";
import { brokenWingsThemes, kanhaCodeThemes, themes } from "./themes.js";

const themePools = new Map();

function shuffleThemes(themeList) {
  const shuffled = [...themeList];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1);
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

function pickTheme(themeKey, themeList) {
  if (!Array.isArray(themeList) || themeList.length === 0) {
    throw new Error(`No themes available for ${themeKey}`);
  }

  let themePool = themePools.get(themeKey);

  if (!themePool || themePool.length === 0) {
    themePool = shuffleThemes(themeList);
    themePools.set(themeKey, themePool);
  }

  return themePool.pop();
}

function escapeXml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

class ImageProcessor {
  _resolveFont(fontChoice, defaultType = "sans") {
    if (!fontChoice || typeof fontChoice !== "string") {
      return defaultType === "serif"
        ? "'Georgia', 'Palatino', serif"
        : "'Figtree', 'Inter', 'Segoe UI', sans-serif";
    }
    const clean = fontChoice.replace(/['"]/g, "").trim();
    const isSerif =
      clean.toLowerCase().includes("serif") ||
      [
        "playfair display",
        "merriweather",
        "cormorant",
        "georgia",
        "lora",
        "garamond",
        "baskerville",
      ].includes(clean.toLowerCase());

    return isSerif
      ? `'${clean}', 'Georgia', 'Palatino', serif`
      : `'${clean}', 'Figtree', 'Inter', 'Segoe UI', sans-serif`;
  }

  async processBrokenWingsStyle(
    imageBuffer,
    text,
    topic = "NIGHT THOUGHTS",
    isSolidBg = false,
    metadata = {},
  ) {
    const width = 1080;
    const height = 1920;

    const cleanText = (text || "").toString().trim();

    // Select random theme from brokenWingsThemes for both image overlay and solid background
    const theme = pickTheme("brokenWings", brokenWingsThemes);
    const accent = theme.accent || "#E2E8F0";
    const topicFontFamily = this._resolveFont(
      metadata.topic_font_family || metadata.font_family || theme.topicFontFamily,
      "sans",
    );
    const bodyFontFamily = this._resolveFont(
      metadata.body_font_family || metadata.font_family || theme.fontFamily,
      "serif",
    );
    const topicFontWeight = theme.topicFontWeight || "700";
    const topicLetterSpacing = theme.topicLetterSpacing || "1px";
    const bodyLetterSpacing = theme.bodySpacing || theme.letterSpacing || "0px";

    let baseImage;
    if (isSolidBg) {
      // Solid theme background
      baseImage = {
        create: {
          width,
          height,
          channels: 4,
          background: theme.bg || "#090A10",
        },
      };
    } else if (imageBuffer) {
      // Base image processing - Keep image as is with balanced cinematic contrast
      baseImage = await sharp(imageBuffer)
        .resize(width, height, { fit: "cover" })
        .modulate({
          brightness: 0.6,
          saturation: 0.7,
        })
        .toBuffer();
    } else {
      // Transparent base for video overlay
      baseImage = {
        create: {
          width,
          height,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
      };
    }

    // Text preparation
    const cleanTopic = (topic || "NIGHT THOUGHTS").toString().trim();

    const wrappedTopic = this._wrapText(cleanTopic.toUpperCase(), 38);
    const wrappedText = this._wrapText(cleanText, 42);

    // Layout configuration
    const leftPadding = 96;
    const accentLineX = 64;
    const textAnchor = "start";

    const mainFontSize = Number(theme.fontSize) || 30;
    const lineH = Number(theme.lineHeight) || 52;
    const topicFontSize = Number(theme.topicFontSize) || 20;
    const topicLineH = Number(theme.topicLineHeight) || 30;
    const topicGap = Number(theme.topicGap) || 28;
    const brandGap = Number(theme.brandGap) || 36;
    const footerFontSize = Number(theme.footerFontSize) || 16;

    const effectiveMainLineH = Number.isFinite(lineH) ? lineH : 48;
    const effectiveTopicLineH = Number.isFinite(topicLineH) ? topicLineH : 28;

    // Calculate total block height for balanced vertical layout
    const totalTopicHeight = wrappedTopic.length * effectiveTopicLineH;
    const totalMainHeight =
      wrappedText.length > 0
        ? (wrappedText.length - 1) * effectiveMainLineH + mainFontSize
        : 0;
    const totalContentHeight =
      totalTopicHeight + topicGap + totalMainHeight + brandGap + footerFontSize;

    // Optical vertical positioning (cinematic lower-middle zone)
    let topicY = Number(theme.topicY) || 740;
    if (topicY + totalContentHeight > height - 140) {
      topicY = Math.max(200, height - 140 - totalContentHeight);
    }

    const textY = topicY + totalTopicHeight + topicGap;
    const brandingY =
      textY +
      (wrappedText.length > 0 ? (wrappedText.length - 1) * effectiveMainLineH : 0) +
      brandGap +
      footerFontSize;

    const lineStartY = topicY - topicFontSize + 4;
    const lineEndY =
      wrappedText.length > 0
        ? textY + (wrappedText.length - 1) * effectiveMainLineH + 6
        : textY + 6;

    const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Dark gradient overlay for modern cinematic feel and text contrast -->
        <linearGradient id="overlayGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="black" stop-opacity="0.2" />
          <stop offset="30%" stop-color="black" stop-opacity="0.45" />
          <stop offset="65%" stop-color="black" stop-opacity="0.85" />
          <stop offset="100%" stop-color="black" stop-opacity="0.98" />
        </linearGradient>
        <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000000" flood-opacity="0.95" />
        </filter>
      </defs>

      ${!isSolidBg ? `<rect width="100%" height="100%" fill="url(#overlayGrad)" />` : ""}

      <!-- Cinematic vertical accent quote line -->
      <line
        x1="${accentLineX}"
        y1="${lineStartY}"
        x2="${accentLineX}"
        y2="${lineEndY}"
        stroke="${accent}"
        stroke-width="3"
        stroke-linecap="round"
        stroke-opacity="0.9"
      />

      <!-- Topic -->
      <text
        x="${leftPadding}"
        y="${topicY}"
        text-anchor="${textAnchor}"
        font-family="${topicFontFamily}"
        font-size="${topicFontSize}"
        fill="${theme.titleColor || '#FFFFFF'}"
        letter-spacing="${topicLetterSpacing}"
        font-weight="${topicFontWeight}"
        filter="url(#textShadow)"
      >${wrappedTopic
        .map(
          (line, i) =>
            `<tspan x="${leftPadding}" dy="${i === 0 ? 0 : effectiveTopicLineH}">${escapeXml(line)}</tspan>`,
        )
        .join("")}</text>

      <!-- Main content -->
      <text
        x="${leftPadding}"
        y="${textY}"
        text-anchor="${textAnchor}"
        font-family="${bodyFontFamily}"
        font-weight="${theme.fontWeight || theme.bodyWeight || '500'}"
        font-size="${mainFontSize}"
        fill="${theme.bodyColor || '#FFFFFF'}"
        letter-spacing="${bodyLetterSpacing}"
        filter="url(#textShadow)"
      >${wrappedText
        .map(
          (line, i) =>
            `<tspan x="${leftPadding}" dy="${i === 0 ? 0 : effectiveMainLineH}">${escapeXml(line)}</tspan>`,
        )
        .join("")}</text>

      <!-- Bottom footer tag -->
      <text
        x="${leftPadding}"
        y="${brandingY}"
        text-anchor="start"
        font-family="${topicFontFamily}"
        font-size="${footerFontSize}"
        fill="${theme.footerColor || '#CBD5E1'}"
        letter-spacing="${theme.footerLetterSpacing || '1.5px'}"
        font-weight="600"
        filter="url(#textShadow)"
      >${escapeXml(theme.footerText || "being")}</text>
    </svg>`;

    const processor = sharp(baseImage).composite([
      {
        input: Buffer.from(svg),
        top: 0,
        left: 0,
      },
    ]);

    if (imageBuffer || isSolidBg) {
      return await processor.jpeg({ quality: 95 }).toBuffer();
    } else {
      return await processor.png().toBuffer();
    }
  }

  async processDotEnvCoderStyle(
    codeText,
    language = "JavaScript",
    imageBuffer = null,
  ) {
    const width = 1080;
    const height = 1080; // 1:1 Square

    let baseImage;
    if (imageBuffer) {
      // Process background image: dark, blurred, moody
      baseImage = await sharp(imageBuffer)
        .resize(width, height, { fit: "cover" })
        .blur(10) // Nice blur for code visibility
        .modulate({ brightness: 0.4, saturation: 0.8 })
        .toBuffer();
    }

    // 1. Better Wrapping and Overflow handling
    const rawLines = codeText.split("\n");
    const wrappedLines = [];
    rawLines.forEach((line) => {
      // Wrap each code line to max 48 chars for better snippet look
      const subLines = this._wrapText(line, 48);
      subLines.forEach((sub, i) => {
        wrappedLines.push({
          content: sub
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;"),
          isContinuation: i > 0,
        });
      });
    });

    // 2. Enhanced Syntax Highlighting (More keywords, better colors)
    const processedLines = wrappedLines.map((line, index) => {
      let highlighted = line.content
        // 1. Strings (Yellowish/Green) - Do this first
        .replace(
          /(&quot;.*?&quot;|&apos;.*?&apos;|`.*?`)/g,
          '<tspan fill="#f1fa8c">$1</tspan>',
        )
        // 2. Keywords (Pinkish)
        .replace(
          /\b(const|let|var|function|return|if|else|import|export|class|await|async|node|from|default)\b/g,
          '<tspan fill="#ff79c6">$1</tspan>',
        )
        // 3. Numbers (Purple)
        .replace(/\b(\d+)\b/g, '<tspan fill="#bd93f9">$1</tspan>')
        // 4. Comments (Grey)
        .replace(/(\/\/.*$)/g, '<tspan fill="#6272a4">$1</tspan>')
        // 5. Functions/Methods (Green)
        .replace(/\b(\w+)(?=\()/g, '<tspan fill="#50fa7b">$1</tspan>');

      return {
        number: line.isContinuation
          ? "  "
          : (index + 1).toString().padStart(2, "0"),
        content: highlighted,
      };
    });

    const windowWidth = 920;
    const lineH = 44;
    const codeFontSize = 30;
    const maxVisibleLines = 15;
    const visibleLines = processedLines.slice(0, maxVisibleLines);

    const windowHeight = visibleLines.length * lineH + 180; // Dynamic height
    const windowY = (height - windowHeight) / 2;
    const codeTop = windowY + 140;

    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="premiumShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="30" stdDeviation="40" flood-color="black" flood-opacity="0.8"/>
          </filter>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#16213e;stop-opacity:1" />
          </linearGradient>
        </defs>

        ${
          !imageBuffer
            ? `
        <!-- Main Background -->
        <rect width="100%" height="100%" fill="url(#bgGradient)" />
        
        <!-- Subtle Pattern -->
        <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="white" opacity="0.05"/>
        </pattern>
        <rect width="100%" height="100%" fill="url(#dots)" />`
            : ""
        }

        <!-- Terminal Window Card -->
        <rect x="80" y="${windowY}" width="${windowWidth}" height="${windowHeight}" rx="24" fill="#282a36" fill-opacity="${imageBuffer ? 0.92 : 1}" filter="url(#premiumShadow)"/>
        
        <!-- Window Title Bar -->
        <rect x="80" y="${windowY}" width="${windowWidth}" height="64" rx="24" fill="#21222c" />
        <rect x="80" y="${windowY + 32}" width="${windowWidth}" height="32" fill="#21222c" />
        
        <!-- Window Controls -->
        <circle cx="125" cy="${windowY + 32}" r="7" fill="#ff5555" />
        <circle cx="155" cy="${windowY + 32}" r="7" fill="#f1fa8c" />
        <circle cx="185" cy="${windowY + 32}" r="7" fill="#50fa7b" />
        
        <text x="${width / 2}" y="${windowY + 40}" text-anchor="middle" font-family="monospace" font-size="20" fill="#6272a4" font-weight="bold">terminal — ${language.toLowerCase()}</text>

        <!-- Terminal Prompt -->
        <text x="130" y="${windowY + 105}" font-family="monospace" font-size="${codeFontSize}" font-weight="bold">
          <tspan fill="#50fa7b">user@linux</tspan><tspan fill="#f8f8f2">:</tspan><tspan fill="#8be9fd">~</tspan><tspan fill="#f8f8f2">$ </tspan>
          <tspan fill="#f8f8f2" opacity="0.8">_</tspan>
        </text>

        <!-- Code Content -->
        <text x="130" y="${codeTop}" font-family="monospace" font-size="${codeFontSize}" fill="#f8f8f2">
          ${visibleLines
            .map(
              (line, i) => `
            <tspan x="130" dy="${i === 0 ? 0 : lineH}"><tspan fill="#6272a4" font-weight="normal" opacity="0.6">${line.number}</tspan>   ${line.content}</tspan>`,
            )
            .join("")}
        </text>

        <!-- Branding -->
        <text x="${width / 2}" y="${height - 60}" text-anchor="middle" font-family="monospace" font-size="22" fill="${imageBuffer ? "white" : "#44475a"}" opacity="${imageBuffer ? 0.6 : 1}" font-weight="bold" letter-spacing="6">DOTENV_CODER</text>
      </svg>`;

    if (imageBuffer) {
      return await sharp(baseImage)
        .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
        .jpeg({ quality: 95 })
        .toBuffer();
    }

    return await sharp(Buffer.from(svg)).jpeg({ quality: 95 }).toBuffer();
  }

  async processKanhaCodeStyle(
    imageBuffer,
    text,
    topic = "GITA WISDOM",
    isSolidBg = true,
    metadata = {},
  ) {
    const width = 1080;
    const height = 1920;

    const cleanText = (text || "").toString().trim();
    const cleanTopic = (topic || metadata.topic || "GITA WISDOM").toString().trim();

    // Pick a theme from kanhaCodeThemes
    const theme = pickTheme("kanhaCode", kanhaCodeThemes);
    const accent = theme.accent || "#FFFFFF";
    const textCol = theme.bodyColor || "#FFFFFF";
    const titleCol = theme.titleColor || "#FFFFFF";
    const footerCol = theme.footerColor || "#CBD5E1";
    const bgColor = theme.bg || "#0B2545";

    const topicFontFamily = this._resolveFont(
      metadata.topic_font_family || metadata.font_family || theme.topicFontFamily,
      "sans",
    );
    const bodyFontFamily = this._resolveFont(
      metadata.body_font_family || metadata.font_family || theme.fontFamily,
      "serif",
    );

    // Solid background canvas
    const baseImage = {
      create: {
        width,
        height,
        channels: 4,
        background: bgColor,
      },
    };

    const wrappedTopic = this._wrapText(cleanTopic.toUpperCase(), 34);
    const wrappedText = this._wrapText(cleanText, 38);

    const mainFontSize = Number(theme.fontSize) || 34;
    const lineH = Number(theme.lineHeight) || 56;
    const topicFontSize = Number(theme.topicFontSize) || 20;
    const topicLineH = Number(theme.topicLineHeight) || 30;
    const topicGap = Number(theme.topicGap) || 30;
    const brandGap = Number(theme.brandGap) || 38;
    const footerFontSize = Number(theme.footerFontSize) || 15;

    const totalTopicHeight = wrappedTopic.length * topicLineH;
    const totalMainHeight =
      wrappedText.length > 0
        ? (wrappedText.length - 1) * lineH + mainFontSize
        : 0;
    const totalContentHeight =
      totalTopicHeight + topicGap + totalMainHeight + brandGap + footerFontSize;

    let topicY = 720;
    if (topicY + totalContentHeight > height - 180) {
      topicY = Math.max(240, height - 180 - totalContentHeight);
    }

    const textY = topicY + totalTopicHeight + topicGap;
    const brandingY =
      textY +
      (wrappedText.length > 0 ? (wrappedText.length - 1) * lineH : 0) +
      brandGap +
      footerFontSize;

    const accentLineX = 80;
    const leftPadding = 112;
    const lineStartY = topicY - topicFontSize + 4;
    const lineEndY =
      wrappedText.length > 0
        ? textY + (wrappedText.length - 1) * lineH + 6
        : textY + 6;

    const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Header Brand Badge -->
      <g transform="translate(${leftPadding}, 160)">
        <text font-family="${topicFontFamily}" font-weight="700" font-size="17" fill="#FFFFFF" letter-spacing="2px">
          ⟨ KANHACODE ⟩
        </text>
        <text x="175" y="0" font-family="${topicFontFamily}" font-weight="600" font-size="13" fill="#CBD5E1" letter-spacing="1.5px">
          // GITA OS
        </text>
      </g>

      <!-- Sacred Accent Line -->
      <line
        x1="${accentLineX}"
        y1="${lineStartY}"
        x2="${accentLineX}"
        y2="${lineEndY}"
        stroke="#E2E8F0"
        stroke-width="3"
        stroke-linecap="round"
        stroke-opacity="0.85"
      />

      <!-- Topic / Reference Tag -->
      <text
        x="${leftPadding}"
        y="${topicY}"
        font-family="${topicFontFamily}"
        font-weight="700"
        font-size="${topicFontSize}"
        fill="${titleCol}"
        letter-spacing="1px"
      >
        ${wrappedTopic.map((line, i) => `<tspan x="${leftPadding}" dy="${i === 0 ? 0 : topicLineH}">${escapeXml(line)}</tspan>`).join("")}
      </text>

      <!-- Main Decoded Wisdom Text -->
      <text
        x="${leftPadding}"
        y="${textY}"
        font-family="${bodyFontFamily}"
        font-weight="500"
        font-size="${mainFontSize}"
        fill="${textCol}"
        letter-spacing="0px"
      >
        ${wrappedText.map((line, i) => `<tspan x="${leftPadding}" dy="${i === 0 ? 0 : lineH}">${escapeXml(line)}</tspan>`).join("")}
      </text>

      <!-- Footer Brand Signature -->
      <text
        x="${leftPadding}"
        y="${brandingY}"
        font-family="${topicFontFamily}"
        font-weight="600"
        font-size="${footerFontSize}"
        fill="${footerCol}"
        letter-spacing="1.5px"
      >
        ${escapeXml(theme.footerText || "KANHACODE  •  THE GITA DECODED")}
      </text>
    </svg>`;

    return await sharp(baseImage)
      .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
      .jpeg({ quality: 95 })
      .toBuffer();
  }

  async processPersonalLinkedInStyle(
    imageBuffer,
    text,
    niche = "FULL STACK & AI Integraton",
    metadata = {},
  ) {
    const width = 1080;
    const height = 1080;

    let baseImage;

    if (imageBuffer) {
      baseImage = await sharp(imageBuffer)
        .resize(width, height, { fit: "cover" })
        .blur(4)
        .modulate({
          brightness: 0.25,
          saturation: 0.8,
        })
        .toBuffer();
    } else {
      baseImage = {
        create: {
          width,
          height,
          channels: 4,
          background: {
            r: 15,
            g: 15,
            b: 20,
            alpha: 1,
          },
        },
      };
    }

    // Content formatting
    const maxChars = 48;
    const rawLines = text.split("\n");
    const wrappedText = [];
    rawLines.forEach((line) => {
      const subLines = this._wrapText(line, maxChars);
      subLines.forEach((sub) => wrappedText.push(sub));
    });

    // Ensure metadata contains filename and topic
    let filename = metadata.filename;
    if (!filename || typeof filename !== "string" || !filename.trim()) {
      filename = "insight.js";
    } else if (!filename.endsWith(".js")) {
      filename = filename.split(".")[0] + ".js";
    }

    let topicText = metadata.topic;
    if (!topicText || typeof topicText !== "string" || !topicText.trim()) {
      topicText = "Engineering Insight";
    }

    const wrappedTopic = this._wrapText(topicText, maxChars);

    // Layout calculations
    const editorX = 80;
    const editorWidth = width - editorX * 2;

    const topPadding = 120;
    const bottomPadding = 80;

    const lineHeight = 44;
    const fontSize = 30;

    const topicGap = 60;

    const topicHeight = wrappedTopic.length * 42;
    const codeHeight = wrappedText.length * lineHeight;

    const editorHeight =
      topPadding + topicHeight + topicGap + codeHeight + bottomPadding;

    const editorY = (height - editorHeight) / 2;

    const codeStartX = editorX + 50;
    const topicStartY = editorY + 110;
    const mainCodeStartY = topicStartY + topicHeight + topicGap - 20;

    const textColor = metadata.text_color || "#FFFFFF";

    // SVG rendering
    const svg = `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">

    <defs>

      <!-- SHADOW -->
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow
          dx="0"
          dy="20"
          stdDeviation="30"
          flood-color="black"
          flood-opacity="0.6"
        />
      </filter>

      <!-- GLOW -->
      <filter id="blur">
        <feGaussianBlur stdDeviation="80"/>
      </filter>

    </defs>

    <!-- BACKGROUND GLOW -->

    <circle
      cx="200"
      cy="300"
      r="300"
      fill="#007ACC"
      opacity="0.15"
      filter="url(#blur)"
    />

    <circle
      cx="880"
      cy="1000"
      r="350"
      fill="#00C896"
      opacity="0.12"
      filter="url(#blur)"
    />

    <!-- EDITOR -->

    <rect
      x="${editorX}"
      y="${editorY}"
      width="${editorWidth}"
      height="${editorHeight}"
      rx="16"
      fill="#1E1E1E"
      filter="url(#shadow)"
    />

    <!-- TOP BAR -->

    <rect
      x="${editorX}"
      y="${editorY}"
      width="${editorWidth}"
      height="50"
      rx="16"
      fill="#252526"
    />
    <rect x="${editorX}" y="${editorY + 25}" width="${editorWidth}" height="25" fill="#252526" />

    <!-- MAC BUTTONS -->

    <circle
      cx="${editorX + 30}"
      cy="${editorY + 25}"
      r="7"
      fill="#FF5F56"
    />

    <circle
      cx="${editorX + 54}"
      cy="${editorY + 25}"
      r="7"
      fill="#FFBD2E"
    />

    <circle
      cx="${editorX + 78}"
      cy="${editorY + 25}"
      r="7"
      fill="#27C93F"
    />

    <!-- ACTIVE TAB -->

    <rect
      x="${editorX + 120}"
      y="${editorY + 10}"
      width="220"
      height="40"
      rx="8"
      fill="#1E1E1E"
    />
    <rect x="${editorX + 120}" y="${editorY + 30}" width="220" height="20" fill="#1E1E1E" />

    <text
      x="${editorX + 145}"
      y="${editorY + 32}"
      font-family="'JetBrains Mono', monospace"
      font-size="15"
      fill="#E2E2E2"
      dominant-baseline="middle"
    >
      ${filename}
    </text>

    <!-- COMMENT HEADER -->

    <text
      x="${codeStartX}"
      y="${topicStartY}"
      font-family="'JetBrains Mono', monospace"
      font-size="22"
      xml:space="preserve"
      dominant-baseline="middle"
    >
      ${wrappedTopic
        .map(
          (line, i) =>
            `<tspan x="${codeStartX}" dy="${i === 0 ? 0 : 38}" fill="#6A9955">// ${line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</tspan>`,
        )
        .join("")}
    </text>

    <!-- CODE -->

    <text
      x="${codeStartX}"
      y="${mainCodeStartY}"
      font-family="'JetBrains Mono', 'Fira Code', monospace"
      font-size="${fontSize}"
      font-weight="500"
      letter-spacing="0.5"
      xml:space="preserve"
      dominant-baseline="middle"
    >
      ${wrappedText
        .map(
          (line, i) =>
            `<tspan x="${codeStartX}" dy="${i === 0 ? 0 : lineHeight}" fill="${textColor}">${line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</tspan>`,
        )
        .join("")}
    </text>

    <!-- CURSOR -->

    <rect
      x="${codeStartX}"
      y="${mainCodeStartY + (wrappedText.length - 1) * lineHeight + 20}"
      width="15"
      height="4"
      fill="#007ACC"
      opacity="0.8"
    />

    <!-- STATUS BAR -->

    <rect
      x="${editorX}"
      y="${editorY + editorHeight - 30}"
      width="${editorWidth}"
      height="30"
      rx="16"
      fill="#007ACC"
    />
    <rect x="${editorX}" y="${editorY + editorHeight - 30}" width="${editorWidth}" height="15" fill="#007ACC" />

    <text
      x="${editorX + 20}"
      y="${editorY + editorHeight - 14}"
      font-family="'JetBrains Mono', monospace"
      font-size="13"
      fill="white"
      dominant-baseline="middle"
    >
      JavaScript
    </text>

    <text
      x="${editorX + 140}"
      y="${editorY + editorHeight - 14}"
      font-family="'JetBrains Mono', monospace"
      font-size="13"
      fill="white"
      dominant-baseline="middle"
    >
      UTF-8
    </text>

    <!-- BRANDING -->

    <text
      x="${width / 2}"
      y="${height - 40}"
      text-anchor="middle"
      font-family="'JetBrains Mono', monospace"
      font-size="20"
      letter-spacing="4"
      fill="white"
      opacity="0.85"
      font-weight="bold"
      dominant-baseline="middle"
    >
      AYUSH.dev
    </text>

  </svg>
  `;

    return await sharp(baseImage)
      .composite([
        {
          input: Buffer.from(svg),
          top: 0,
          left: 0,
        },
      ])
      .jpeg({ quality: 96 })
      .toBuffer();
  }

  _wrapText(text, max = 38) {
    if (!text) return [];
    const paragraphs = text
      .toString()
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n");

    const lines = [];

    for (const paragraph of paragraphs) {
      const trimmed = paragraph.trim();
      if (!trimmed) continue;

      const words = trimmed.split(/\s+/).filter(Boolean);
      let currentLine = "";

      for (const word of words) {
        if (!currentLine) {
          currentLine = word;
        } else if ((currentLine + " " + word).length <= max) {
          currentLine += " " + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }

      if (currentLine) {
        lines.push(currentLine);
      }
    }

    return lines;
  }
}

export default new ImageProcessor();
