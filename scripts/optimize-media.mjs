/**
 * Compress public images (and prepare video poster if present).
 * Run: node scripts/optimize-media.mjs
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.join(process.cwd(), "public");

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const MAX_EDGE = 1280;
const JPEG_QUALITY = 72;
const WEBP_QUALITY = 70;
const PNG_QUALITY = 80;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip playable game bundles and Stockfish binaries
      if (
        full.includes(`${path.sep}play${path.sep}`) ||
        full.includes(`${path.sep}stockfish${path.sep}`)
      ) {
        continue;
      }
      walk(full, out);
    } else if (IMAGE_EXTS.has(path.extname(entry.name).toLowerCase())) {
      out.push(full);
    }
  }
  return out;
}

async function optimizeImage(file) {
  const before = fs.statSync(file).size;
  const lower = path.extname(file).toLowerCase();
  const temp = `${file}.tmp-opt`;

  let pipeline = sharp(file, { failOn: "none" }).rotate().resize({
    width: MAX_EDGE,
    height: MAX_EDGE,
    fit: "inside",
    withoutEnlargement: true,
  });

  if (lower === ".png") {
    // Keep transparency; compress aggressively
    pipeline = pipeline.png({ compressionLevel: 9, palette: true, quality: PNG_QUALITY });
  } else if (lower === ".webp") {
    pipeline = pipeline.webp({ quality: WEBP_QUALITY });
  } else {
    pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });
  }

  await pipeline.toFile(temp);
  const after = fs.statSync(temp).size;
  if (after < before) {
    fs.renameSync(temp, file);
    console.log(
      `${path.relative(root, file)}: ${Math.round(before / 1024)}KB -> ${Math.round(after / 1024)}KB`,
    );
  } else {
    fs.unlinkSync(temp);
    console.log(`${path.relative(root, file)}: kept ${Math.round(before / 1024)}KB`);
  }
}

const files = walk(root);
for (const file of files) {
  await optimizeImage(file);
}
console.log(`Optimized ${files.length} image(s).`);
