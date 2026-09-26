import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { Chess } from "chess.js";
import { analyzeGame, type EngineLine, type EngineSearch, type SearchOptions } from "../lib/review/analyzeGame";
import type { SideScore } from "../lib/review/evaluation";

const FALLBACK =
  "C:\\Users\\ivan\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Stockfish.Stockfish_Microsoft.Winget.Source_8wekyb3d8bbwe\\stockfish\\stockfish-windows-x86-64-universal.exe";

function stockfishPath(): string {
  if (process.env.STOCKFISH && existsSync(process.env.STOCKFISH)) return process.env.STOCKFISH;
  if (existsSync(FALLBACK)) return FALLBACK;
  throw new Error("Stockfish executable was not found. Set STOCKFISH to its path.");
}

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

class DesktopEngine {
  private proc: ChildProcessWithoutNullStreams;
  private pending = "";
  private lines: string[] = [];
  private waiter: ((line: string) => void) | null = null;
  private multiPv = 1;

  constructor(exe: string) {
    this.proc = spawn(exe, [], { stdio: ["pipe", "pipe", "pipe"] });
    this.proc.stdout.setEncoding("utf8");
    this.proc.stdout.on("data", (chunk: string) => {
      this.pending += chunk;
      const parts = this.pending.split(/\r?\n/);
      this.pending = parts.pop() ?? "";
      for (const line of parts) {
        if (this.waiter) this.waiter(line);
        else this.lines.push(line);
      }
    });
  }

  private send(command: string) {
    this.proc.stdin.write(`${command}\n`);
  }

  private next(match: (line: string) => boolean): Promise<string[]> {
    return new Promise((resolve) => {
      const collected = this.lines;
      this.lines = [];
      const finish = (line: string) => {
        collected.push(line);
        if (!match(line)) return;
        this.waiter = null;
        resolve(collected);
      };
      if (collected.some(match)) {
        resolve(collected);
        return;
      }
      this.waiter = finish;
    });
  }

  async init() {
    this.send("uci");
    await this.next((line) => line === "uciok");
    this.send("setoption name Threads value 8");
    this.send("setoption name Hash value 256");
    this.send("isready");
    await this.next((line) => line === "readyok");
  }

  async search(fen: string, options?: SearchOptions): Promise<EngineSearch> {
    const multiPv = options?.multiPv ?? 2;
    const depth = options?.depth ?? 14;
    if (multiPv !== this.multiPv) {
      this.multiPv = multiPv;
      this.send(`setoption name MultiPV value ${multiPv}`);
      this.send("isready");
      await this.next((line) => line === "readyok");
    }
    this.send(`position fen ${fen}`);
    this.send(`go depth ${depth}`);
    const lines = await this.next((line) => line.startsWith("bestmove"));
    return parseInfo(lines);
  }

  quit() {
    this.send("quit");
    this.proc.kill();
  }
}

async function main() {
  const pgn = readFileSync("scripts/fixtures/tzya-brilliant.pgn", "utf8");
  const chess = new Chess();
  chess.loadPgn(pgn);
  const headers = chess.getHeaders();
  const engine = new DesktopEngine(stockfishPath());
  await engine.init();
  const review = await analyzeGame(
    chess.history({ verbose: true }),
    engine,
    (done, total) => {
      if (done === total || done % 8 === 0) console.log(`progress ${done}/${total}`);
    },
    () => false,
    "",
    { whiteRating: Number(headers.WhiteElo), blackRating: Number(headers.BlackElo) },
  );
  engine.quit();

  const white = review.moves.filter((move) => move.color === "white");
  console.log(`\nWhite accuracy ${review.whiteAccuracy}`);
  console.log(`White brilliant count ${review.white.brilliant}`);
  const inspect = new Set(["Rf3", "Rxh3", "Qxf6+", "Qxg7+", "gxh3"]);
  for (const move of white) {
    const sacrifice = move.features.sacrificeCandidate;
    if (!inspect.has(move.san) && !sacrifice.isSacrificeCandidate && move.classification !== "brilliant") continue;
    console.log("\n---");
    console.log(
      `${move.moveNumber}. ${move.san}  class=${move.classification}  rank=${move.features.engineRank ?? "-"}  loss=${move.winChanceLoss.toFixed(3)}`,
    );
    console.log(
      `before ${move.winChanceBefore.toFixed(3)} after ${move.winChanceAfter.toFixed(3)} material ${sacrifice.materialBefore} -> ${sacrifice.materialImmediatelyAfter}`,
    );
    console.log(
      `sacrifice ${sacrifice.isSacrificeCandidate} type=${sacrifice.type} piece=${sacrifice.sacrificedPiece ?? "-"} compensation=${sacrifice.compensationType}`,
    );
    console.log(`pv ${sacrifice.forcedSequence.join(" ")}`);
    console.log(`${move.brilliant.accepted ? "BRILLIANT" : "NOT BRILLIANT"}: ${move.brilliant.reason}`);
  }
  if (review.white.brilliant !== 3) {
    console.error(`\nExpected 3 white brilliant moves, found ${review.white.brilliant}`);
    process.exit(1);
  }
  console.log("\nBRILLIANT FIXTURE ok");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
