/**
 * Resize drone-camp photos for the web while keeping original aspect ratio.
 * Run: node scripts/optimize-drone-photos.mjs
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const dir = path.join(
  process.cwd(),
  "public/projects/taipei-drone-summer-camp-2026/9-19-day2",
);

const files = ["photo-1.jpg", "photo-2.jpg", "photo-3.jpg", "photo-4.jpg"];
const MAX_EDGE = 1600;
const QUALITY = 78;

for (const file of files) {
  const inputPath = path.join(dir, file);
  const tempPath = path.join(dir, `.tmp-${file}`);
  const meta = await sharp(inputPath, { failOn: "none" }).rotate().metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  if (!width || !height) throw new Error(`No dimensions for ${file}`);

  await sharp(inputPath, { failOn: "none" })
    .rotate()
    .resize({
      width: MAX_EDGE,
      height: MAX_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(tempPath);

  fs.renameSync(tempPath, inputPath);

  const outStat = fs.statSync(inputPath);
  const outMeta = await sharp(inputPath).metadata();
  console.log(
    `${file}: ${width}x${height} -> ${outMeta.width}x${outMeta.height} (${Math.round(outStat.size / 1024)} KB)`,
  );
}
