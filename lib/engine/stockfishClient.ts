import { reviewConfig } from "@/lib/review/reviewConfig";
import { withBasePath } from "@/lib/paths";
import type { EngineSearch, EngineLine, SearchOptions } from "@/lib/review/analyzeGame";
import type { SideScore } from "@/lib/review/evaluation";

const SCRIPT = "/stockfish/stockfish-18-lite-single.js";

type Waiter = {
  epoch: number;
  lines: string[];
  match: (line: string) => boolean;
  resolve: (lines: string[]) => void;
  reject: (error: Error) => void;
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
  private epoch = 0;
  private multiPv: number = reviewConfig.firstPassMultiPv;

  private ensure(): Promise<void> {
    if (this.ready) return this.ready;
    this.ready = new Promise((resolve, reject) => {
      const worker = new Worker(withBasePath(SCRIPT));
      this.worker = worker;
      worker.onerror = () => reject(new Error("Stockfish failed to start"));
      worker.onmessage = (event: MessageEvent<string>) => {
        for (const raw of String(event.data).split(/\r?\n/)) {
          const line = raw.trim();
          if (!line) continue;
          this.takeLine(line);
        }
      };
      this.send("uci");
      this.waitFor(this.epoch, (line) => line === "uciok")
        .then(() => {
          this.send(`setoption name MultiPV value ${reviewConfig.firstPassMultiPv}`);
          this.send("isready");
          return this.waitFor(this.epoch, (line) => line === "readyok");
        })
        .then(() => resolve())
        .catch(reject);
    });
    return this.ready;
  }

  private send(command: string) {
    this.worker?.postMessage(command);
  }

  private takeLine(line: string) {
    if (!this.pending) {
      this.queue.push(line);
      return;
    }
    this.pending.lines.push(line);
    if (!this.pending.match(line)) return;
    const waiter = this.pending;
    this.pending = null;
    this.queue = [];
    if (waiter.epoch !== this.epoch) waiter.reject(new Error("cancelled"));
    else waiter.resolve(waiter.lines);
  }

  private waitFor(epoch: number, match: (line: string) => boolean): Promise<string[]> {
    return new Promise((resolve, reject) => {
      if (epoch !== this.epoch) {
        reject(new Error("cancelled"));
        return;
      }
      const ready = this.queue.findIndex((line) => match(line));
      if (ready >= 0) {
        const lines = this.queue.slice(0, ready + 1);
        this.queue = this.queue.slice(ready + 1);
        resolve(lines);
        return;
      }
      this.pending = {
        epoch,
        lines: this.queue,
        match,
        resolve,
        reject,
      };
      this.queue = [];
    });
  }

  async search(fen: string, options?: SearchOptions): Promise<EngineSearch> {
    await this.ensure();
    const epoch = this.epoch;
    const depth = options?.depth ?? reviewConfig.firstPassDepth;
    const multiPv = options?.multiPv ?? reviewConfig.firstPassMultiPv;
    if (multiPv !== this.multiPv) {
      this.multiPv = multiPv;
      this.send(`setoption name MultiPV value ${multiPv}`);
    }
    // Drop a bestmove left over from Cancel before this search starts.
    this.send("stop");
    this.send("isready");
    await this.waitFor(epoch, (line) => line === "readyok");
    this.queue = [];
    this.send("isready");
    await this.waitFor(epoch, (line) => line === "readyok");
    this.queue = [];
    this.send(`position fen ${fen}`);
    this.send(`go depth ${depth}`);
    const lines = await this.waitFor(epoch, (line) => line.startsWith("bestmove"));
    return parseInfo(lines);
  }

  stop() {
    this.epoch += 1;
    const waiter = this.pending;
    this.pending = null;
    this.queue = [];
    waiter?.reject(new Error("cancelled"));
    this.send("stop");
  }

  quit() {
    this.epoch += 1;
    const waiter = this.pending;
    this.pending = null;
    waiter?.reject(new Error("cancelled"));
    this.send("quit");
    this.worker?.terminate();
    this.worker = null;
    this.ready = null;
    this.queue = [];
    this.multiPv = reviewConfig.firstPassMultiPv;
  }
}
