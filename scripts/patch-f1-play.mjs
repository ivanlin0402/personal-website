import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const playDir = join(root, "public", "play", "f1-time-trial");
const outPlayDir = join(root, "out", "play", "f1-time-trial");

const config = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
};

function writeConfig(dir) {
  if (!existsSync(dir)) return;
  writeFileSync(join(dir, "config.json"), JSON.stringify(config, null, 2) + "\n");
  console.log(
    `Wrote F1 config to ${dir} (supabase ${config.supabaseUrl ? "set" : "empty"})`,
  );
}

function patchIndex(dir) {
  const indexPath = join(dir, "index.html");
  if (!existsSync(indexPath)) return;
  let html = readFileSync(indexPath, "utf8");
  if (!html.includes("f1-leaderboard.js")) {
    html = html.replace(
      /<\/body>/i,
      '  <script src="f1-leaderboard.js"></script>\n</body>',
    );
  }
  // Keep mobile touch from scrolling the page while racing
  if (!html.includes("touch-action: none")) {
    html = html.replace(
      /(canvas\.emscripten \{[\s\S]*?right:\s*0;)/,
      "$1\n            touch-action: none;\n            user-select: none;\n            -webkit-user-select: none;",
    );
  }
  writeFileSync(indexPath, html);
  console.log(`Patched ${indexPath}`);
}

writeConfig(playDir);
patchIndex(playDir);
writeConfig(outPlayDir);
patchIndex(outPlayDir);
