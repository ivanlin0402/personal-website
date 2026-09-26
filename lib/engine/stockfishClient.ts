import { reviewConfig } from "@/lib/review/reviewConfig";
import { withBasePath } from "@/lib/paths";
import type { EngineSearch, EngineLine, SearchOptions } from "@/lib/review/analyzeGame";
import type { SideScore } from "@/lib/review/evaluation";

const SCRIPT = "/stockfish/stockfish-18-lite-single.js";

type Waiter = {
  lines: string[];
  resolve: (lines: string[]) => void;
};

function parseScore(line: string): SideScore | null {
  const mate = line.match(/\bscore mate (-?\d+)/);
  if (mate) return { type: "mate", mate: Number(mate[1]) };
  const cp = line.match(/\bscore cp (-?\d+)/);
  if (cp) return { type: "cp", cp: Number(cp[1]) };
  return null;
}

function parseInfo(lines: string[]): EngineSearch {
  const byPv: Record<number, EngineLine> = {};
  for (const line of lines) {
    if (!line.startsWith("info ") || !line.includes(" pv ") || line.includes("lowerbound") || line.includes("upperbound")) {
      continue;
    }
    const score = parseScore(line);
    const pv = line.match(/\bpv (.+)$/)?.[1]?.split(/\s+/) ?? [];
    if (!score || !pv[0]) continue;
    const multipv = Number(line.match(/\bmultipv (\d+)/)?.[1] ?? 1);
    const depth = Number(line.match(/\bdepth (\d+)/)?.[1] ?? 0);
    const prev = byPv[multipv];
    if (!prev || depth >= prev.depth) byPv[multipv] = { depth, multipv, score, move: pv[0], pv };
  }
  const ranked = Object.values(byPv).sort((a, b) => a.multipv - b.multipv);
  return { best: ranked[0] ?? null, second: ranked[1] ?? null, third: ranked[2] ?? null, lines: ranked };
}

/** One reused Stockfish worker. Single-threaded so GitHub Pages does not need special headers. */
export class StockfishClient {
  private worker: Worker | null = null;
  private queue: string[] = [];
  private pending: Waiter | null = null;
  private ready: Promise<void> | null = null;
  private multiPv: number = reviewConfig.firstPassMultiPv;

  private ensure(): Promise<void> {
    if (this.ready) return this.ready;
    this.ready = new Promise((resolve, reject) => {
      const worker = new Worker(withBasePath(SCRIPT));
      this.worker = worker;
      worker.onerror = () => reject(new Error("Stockfish failed to start"));
      worker.onmessage = (event: MessageEvent<string>) => {
        const line = String(event.data).replace(/\r/g, "");
        if (this.pending) this.pending.lines.push(line);
        else this.queue.push(line);
        if (line === "uciok" || line === "readyok" || line.startsWith("bestmove")) {
          const waiter = this.pending;
          if (waiter) {
            this.pending = null;
            waiter.resolve(waiter.lines);
          }
        }
      };
      this.send("uci");
      this.waitFor((lines) => lines.some((line) => line === "uciok"))
        .then(() => {
          this.send(`setoption name MultiPV value ${reviewConfig.firstPassMultiPv}`);
          this.send("isready");
          return this.waitFor((lines) => lines.some((line) => line === "readyok"));
        })
        .then(() => resolve())
        .catch(reject);
    });
    return this.ready;
  }

  private send(command: string) {
    this.worker?.postMessage(command);
  }

  private waitFor(match: (lines: string[]) => boolean): Promise<string[]> {
    return new Promise((resolve) => {
      const take = () => {
        if (match(this.queue)) {
          const lines = this.queue;
          this.queue = [];
          resolve(lines);
          return;
        }
        this.pending = {
          lines: this.queue,
          resolve: (lines) => {
            this.queue = [];
            resolve(lines);
          },
        };
        this.queue = [];
      };
      take();
    });
  }

  async search(fen: string, options?: SearchOptions): Promise<EngineSearch> {
    await this.ensure();
    const depth = options?.depth ?? reviewConfig.firstPassDepth;
    const multiPv = options?.multiPv ?? reviewConfig.firstPassMultiPv;
    this.queue = [];
    if (multiPv !== this.multiPv) {
      this.multiPv = multiPv;
      this.send(`setoption name MultiPV value ${multiPv}`);
      this.send("isready");
      await this.waitFor((list) => list.some((line) => line === "readyok"));
    }
    this.send(`position fen ${fen}`);
    this.send(`go depth ${depth}`);
    const lines = await this.waitFor((list) => list.some((line) => line.startsWith("bestmove")));
    return parseInfo(lines);
  }

  stop() {
    this.send("stop");
  }

  quit() {
    this.send("quit");
    this.worker?.terminate();
    this.worker = null;
    this.ready = null;
    this.pending = null;
    this.queue = [];
    this.multiPv = reviewConfig.firstPassMultiPv;
  }
}
