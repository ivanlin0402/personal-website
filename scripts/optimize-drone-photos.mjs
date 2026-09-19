/**
 * Crop drone-camp photos to 16:9 (subject-centered) and compress for the web.
 * Run: node scripts/optimize-drone-photos.mjs
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const dir = path.join(
  process.cwd(),
  "public/projects/taipei-drone-summer-camp-2026/9-19-day2",
);

/** Vertical crop bias: 0 = top, 0.5 = center, 1 = bottom */
const jobs = [
  { file: "photo-1.jpg", biasY: 0.55 },
  { file: "photo-2.jpg", biasY: 0.72 },
  { file: "photo-3.jpg", biasY: 0.28 },
  { file: "photo-4.jpg", biasY: 0.5 },
];

const TARGET_RATIO = 16 / 9;
const MAX_WIDTH = 1600;
const QUALITY = 78;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

async function optimizeOne({ file, biasY }) {
  const inputPath = path.join(dir, file);
  const tempPath = path.join(dir, `.tmp-${file}`);
  const image = sharp(inputPath, { failOn: "none" }).rotate();
  const meta = await image.metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  if (!width || !height) throw new Error(`No dimensions for ${file}`);

  let left = 0;
  let top = 0;
  let cropW = width;
  let cropH = height;

  if (width / height > TARGET_RATIO) {
    cropH = height;
    cropW = Math.round(height * TARGET_RATIO);
    left = Math.round((width - cropW) / 2);
  } else {
    cropW = width;
    cropH = Math.round(width / TARGET_RATIO);
    const maxTop = height - cropH;
    top = Math.round(maxTop * clamp(biasY, 0, 1));
  }

  await sharp(inputPath, { failOn: "none" })
    .rotate()
    .extract({ left, top, width: cropW, height: cropH })
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(tempPath);

  fs.renameSync(tempPath, inputPath);

  const outStat = fs.statSync(inputPath);
  const outMeta = await sharp(inputPath).metadata();
  console.log(
    `${file}: ${width}x${height} -> ${outMeta.width}x${outMeta.height} (${Math.round(outStat.size / 1024)} KB)`,
  );
}

for (const job of jobs) {
  await optimizeOne(job);
}
