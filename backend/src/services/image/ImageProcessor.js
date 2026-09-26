import sharp from "sharp";

class ImageProcessor {
  /**
   * Processes a base image to add a professional "Musing" look:
   * - Portrait resizing (1080x1920)
   * - Rounded corners or padding (P-3)
   * - Decorative tiled squares stripe
   * - Text/Musing overlay
   */
  async processMusingImage(imageBuffer, text, topic = "") {
    console.log(`🖼️ Processing image for musing: "${text.substring(0, 30)}..."`);
    
    // 1. Prepare base portrait image (1080x1920)
    // We use a dark background for padding
    const baseWidth = 1080;
    const baseHeight = 1920;
    const padding = 30; // p-3 roughly 30px
    const contentWidth = baseWidth - padding * 2;
    const contentHeight = baseHeight - padding * 2;

    // Resize input image to fit inside padding
    const resizedImage = await sharp(imageBuffer)
      .resize(contentWidth, contentHeight, {
        fit: "cover",
        position: "center",
      })
      .toBuffer();

    // Create a base background (dark/gradient style)
    const background = sharp({
      create: {
        width: baseWidth,
        height: baseHeight,
        channels: 4,
        background: { r: 18, g: 18, b: 18, alpha: 1 },
      },
    });

    // 2. Generate decorative "stripe of two square"
    // We'll create two overlapping squares as SVG overlays
    const squareSize = 250;
    const square1 = `
      <svg width="${squareSize}" height="${squareSize}">
        <rect x="0" y="0" width="${squareSize}" height="${squareSize}" rx="20" fill="rgba(255, 255, 255, 0.1)" stroke="white" stroke-width="2"/>
      </svg>
    `;
    const square2 = `
      <svg width="${squareSize}" height="${squareSize}">
        <rect x="0" y="0" width="${squareSize}" height="${squareSize}" rx="20" fill="rgba(255, 255, 255, 0.05)" stroke="white" stroke-width="1" stroke-dasharray="10,5"/>
      </svg>
    `;

    // 3. Generate Text Overlay (SVG)
    // We'll use a clean layout for the text
    const cleanText = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const wrappedText = this._wrapText(cleanText, 30);
    
    // Dynamic height based on lines
    const lineHeight = 60;
    const overlayHeight = Math.max(800, (wrappedText.length * lineHeight) + 400);

    const textOverlay = `
      <svg width="${contentWidth}" height="${overlayHeight}">
        <style>
          .musing { fill: white; font-family: sans-serif; font-weight: bold; font-size: 42px; }
          .topic { fill: #aaaaaa; font-family: sans-serif; font-size: 32px; text-transform: uppercase; letter-spacing: 5px; }
        </style>
        <text x="50%" y="100" text-anchor="middle" class="topic">${topic}</text>
        <text x="50%" y="250" text-anchor="middle" class="musing">
          ${wrappedText.map((line, i) => `<tspan x="50%" dy="${i === 0 ? 0 : lineHeight}">${line}</tspan>`).join("")}
        </text>
      </svg>
    `;

    // 4. Composite everything
    const processed = await background
      .composite([
        {
          input: resizedImage,
          top: padding,
          left: padding,
        },
        // Tiled Squares (Stripe)
        {
          input: Buffer.from(square1),
          top: 150,
          left: 50,
        },
        {
          input: Buffer.from(square2),
          top: 250,
          left: 150,
        },
        // Text
        {
          input: Buffer.from(textOverlay),
          top: 1000, // Position text in lower half
          left: padding,
        },
      ])
      .jpeg({ quality: 90 })
      .toBuffer();

    return processed;
  }

  _wrapText(text, maxChars) {
    const words = text.split(" ");
    let lines = [];
    let currentLine = "";
    
    for (const word of words) {
      if ((currentLine + word).length > maxChars) {
        lines.push(currentLine.trim());
        currentLine = word + " ";
      } else {
        currentLine += word + " ";
      }
    }
    if (currentLine) lines.push(currentLine.trim());
    return lines;
  }
}

export default new ImageProcessor();
