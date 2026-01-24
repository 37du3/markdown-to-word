// Script to generate extension icons with true transparency using sharp
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [16, 32, 48, 128];
const outputDir = path.join(__dirname, '../src/extension/icons');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// SVG template with proper transparency
const createSvg = (size) => {
    const padding = Math.round(size * 0.03);
    const cornerRadius = Math.round(size * 0.19);
    const rectSize = size - padding * 2;
    const fontSize = Math.round(size * 0.38);

    return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea"/>
      <stop offset="100%" style="stop-color:#764ba2"/>
    </linearGradient>
  </defs>
  <rect x="${padding}" y="${padding}" width="${rectSize}" height="${rectSize}" rx="${cornerRadius}" ry="${cornerRadius}" fill="url(#grad)"/>
  <text x="${size / 2}" y="${size / 2 + fontSize * 0.35}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="bold" fill="white">MW</text>
</svg>`);
};

async function generateIcons() {
    for (const size of sizes) {
        const svg = createSvg(size);
        const outputPath = path.join(outputDir, `icon${size}.png`);

        await sharp(svg)
            .png()
            .toFile(outputPath);

        console.log(`Created ${outputPath}`);
    }
    console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
