import { promises as fs } from "fs";
import path from "path";

/**
 * Local unique-visitor store used when Supabase is not configured.
 * Data lives in `.data/visits.json` (gitignored).
 */
type VisitsFile = {
  totalVisits: number;
  visitors: string[];
};

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "visits.json");

async function readStore(): Promise<VisitsFile> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as VisitsFile;
    return {
      totalVisits: Number(parsed.totalVisits) || 0,
      visitors: Array.isArray(parsed.visitors) ? parsed.visitors : [],
    };
  } catch {
    return { totalVisits: 0, visitors: [] };
  }
}

async function writeStore(data: VisitsFile): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

export async function registerLocalVisit(visitorId: string): Promise<number> {
  const store = await readStore();

  if (!store.visitors.includes(visitorId)) {
    store.visitors.push(visitorId);
    store.totalVisits += 1;
    await writeStore(store);
  }

  return store.totalVisits;
}
