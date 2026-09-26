/**
 * Refresh yenchenglin's public Chess.com ratings and append new games.
 * Existing move marks are kept. New games are scored with Stockfish.
 */
import { spawn, spawnSync, type ChildProcessWithoutNullStreams } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { Chess } from "chess.js";
import { analyzeGame, type EngineLine, type EngineSearch, type SearchOptions } from "../lib/review/analyzeGame";
import type { SideScore } from "../lib/review/evaluation";
import { CLASS_MARK } from "../lib/review/reviewTypes";
import type { ChessRatingRecord, ChessReviewedGame, ChessResult, ChessTimeClass } from "../data/chess-review";

const USER = "yenchenglin";
const DATA = "data/chess-review.ts";
const UA = "personal-website (https://github.com/ivanlin0402/personal-website)";
const CLOCKS: ChessTimeClass[] = ["bullet", "blitz", "rapid", "daily"];
const WINDOWS_STOCKFISH =
  "C:\\Users\\ivan\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Stockfish.Stockfish_Microsoft.Winget.Source_8wekyb3d8bbwe\\stockfish\\stockfish-windows-x86-64-universal.exe";

type PlayerSide = { username?: string; rating?: number; result?: string };
type ApiGame = {
  uuid?: string;
  url?: string;
  pgn?: string;
  time_class?: string;
  end_time?: number;
  white?: PlayerSide;
  black?: PlayerSide;
};
type StatsBucket = {
  last?: { rating?: number };
  best?: { rating?: number };
  record?: { win?: number; loss?: number; draw?: number };
};

function stockfishPath(): string {
  if (process.env.STOCKFISH && existsSync(process.env.STOCKFISH)) return process.env.STOCKFISH;
  if (existsSync(WINDOWS_STOCKFISH)) return WINDOWS_STOCKFISH;
  const finder = process.platform === "win32" ? "where.exe" : "which";
  const found = spawnSync(finder, ["stockfish"], { encoding: "utf8" });
  const path = found.status === 0 ? found.stdout.split(/\r?\n/).find(Boolean) : "";
  if (path && existsSync(path)) return path;
  throw new Error("Stockfish was not found. Set STOCKFISH to the executable path.");
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
    const threads = Number(process.env.STOCKFISH_THREADS ?? 2);
    this.send(`setoption name Threads value ${Number.isFinite(threads) && threads > 0 ? threads : 2}`);
    this.send("setoption name Hash value 128");
    this.send("isready");
    await this.next((line) => line === "readyok");
    this.lines = [];
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
    this.lines = [];
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

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return (await response.json()) as T;
}

function extractValue(source: string, exportName: string): { json: string; start: number; end: number } {
  const token = `export const ${exportName}`;
  const at = source.indexOf(token);
  if (at < 0) throw new Error(`Missing export ${exportName}`);
  const eq = source.indexOf("=", at);
  let i = eq + 1;
  while (source[i] === " " || source[i] === "\n" || source[i] === "\r") i += 1;
  const open = source[i];
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let j = i; j < source.length; j += 1) {
    const char = source[j];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === open) depth += 1;
    else if (char === close) {
      depth -= 1;
      if (depth === 0) return { json: source.slice(i, j + 1), start: i, end: j + 1 };
    }
  }
  throw new Error(`Could not read ${exportName}`);
}

function taipeiParts(unixSeconds: number): { year: number; month: number } {
  const shifted = new Date((unixSeconds + 8 * 3600) * 1000);
  return { year: shifted.getUTCFullYear(), month: shifted.getUTCMonth() + 1 };
}

function outcome(result: string | undefined): ChessResult {
  if (result === "win") return "win";
  if (
    result === "agreed" ||
    result === "repetition" ||
    result === "stalemate" ||
    result === "insufficient" ||
    result === "50move" ||
    result === "timevsinsufficient"
  ) {
    return "draw";
  }
  return "loss";
}

function isClock(value: string | undefined): value is ChessTimeClass {
  return CLOCKS.includes(value as ChessTimeClass);
}

function pgnDate(pgn: string, endTime: number): string {
  const header = pgn.match(/\[Date "(\d{4})\.(\d{2})\.(\d{2})"\]/);
  if (header) return `${header[1]}-${header[2]}-${header[3]}`;
  const { year, month } = taipeiParts(endTime);
  const day = new Date((endTime + 8 * 3600) * 1000).getUTCDate();
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function toReviewedGame(game: ApiGame): ChessReviewedGame | null {
  if (!game.uuid || !game.url || !game.pgn || !game.end_time || !isClock(game.time_class)) return null;
  const white = game.white ?? {};
  const black = game.black ?? {};
  const userIsWhite = white.username?.toLowerCase() === USER;
  const userIsBlack = black.username?.toLowerCase() === USER;
  if (!userIsWhite && !userIsBlack) return null;
  const me = userIsWhite ? white : black;
  const opponent = userIsWhite ? black : white;
  let moveCount = 0;
  try {
    const chess = new Chess();
    chess.loadPgn(game.pgn);
    moveCount = Math.ceil(chess.history().length / 2);
  } catch {
    moveCount = 0;
  }
  const resigned = me.result === "resigned" || opponent.result === "resigned" || /resignation/i.test(game.pgn);
  return {
    id: game.uuid,
    date: pgnDate(game.pgn, game.end_time),
    endTime: game.end_time,
    timeClass: game.time_class,
    result: outcome(me.result),
    url: game.url,
    opponent: opponent.username ?? "",
    opponentRating: typeof opponent.rating === "number" ? opponent.rating : null,
    userRating: typeof me.rating === "number" ? me.rating : null,
    accuracy: null,
    pgn: game.pgn.trim(),
    moveCount,
    resigned,
  };
}

type ScoredGame = ChessReviewedGame & {
  brillians?: Array<{
    ply: number;
    san: string;
    color: "white" | "black";
    moveNumber: number;
    winChanceBefore: number;
    features: { secondWinChance: number | null };
  }>;
};

function withoutBrillians(game: ScoredGame | ChessReviewedGame): ChessReviewedGame {
  if (!("brillians" in game)) return game;
  const { brillians: _brillians, ...rest } = game;
  return rest;
}

async function scoreGame(game: ChessReviewedGame, engine: DesktopEngine): Promise<ScoredGame> {
  const chess = new Chess();
  chess.loadPgn(game.pgn);
  const headers = chess.getHeaders();
  const userIsWhite = headers.White?.toLowerCase() === USER;
  const moves = chess.history({ verbose: true });
  if (moves.length === 0) return game;
  const review = await analyzeGame(
    moves,
    engine,
    () => {},
    () => false,
    "",
    {
      whiteRating: Number(headers.WhiteElo) || null,
      blackRating: Number(headers.BlackElo) || null,
    },
  );
  if (review.moves.length !== moves.length) return game;
  const accuracy = userIsWhite ? review.whiteAccuracy : review.blackAccuracy;
  const marks = review.moves.map((move) => CLASS_MARK[move.classification]).join("");
  const brillians = review.moves.filter(
    (move) => move.classification === "brilliant" && move.color === (userIsWhite ? "white" : "black"),
  );
  return {
    ...game,
    accuracy,
    marks,
    moveCount: Math.ceil(moves.length / 2),
    brillians,
  };
}

function ratingRecord(bucket: StatsBucket | undefined, previous: ChessRatingRecord): ChessRatingRecord {
  const current = bucket?.last?.rating;
  const best = bucket?.best?.rating;
  const record = bucket?.record;
  if (!current || !record) return previous;
  return {
    current,
    best: Math.max(previous.best, best ?? previous.best, current),
    wins: record.win ?? previous.wins,
    losses: record.loss ?? previous.losses,
    draws: record.draw ?? previous.draws,
  };
}

async function main() {
  const source = readFileSync(DATA, "utf8");
  const ratingsSlice = extractValue(source, "chessRatings");
  const gamesSlice = extractValue(source, "chessGames");
  const brilliantsSlice = extractValue(source, "chessBrilliants");
  const ratings = JSON.parse(ratingsSlice.json) as Record<ChessTimeClass, ChessRatingRecord>;
  const games = JSON.parse(gamesSlice.json) as ChessReviewedGame[];
  const brilliants = JSON.parse(brilliantsSlice.json) as Array<Record<string, unknown>>;

  const stats = await getJson<Record<string, StatsBucket>>(`https://api.chess.com/pub/player/${USER}/stats`);
  for (const clock of CLOCKS) {
    ratings[clock] = ratingRecord(stats[`chess_${clock}`], ratings[clock]);
  }

  const known = new Set(games.map((game) => game.id.toLowerCase()));
  const knownUrls = new Set(games.map((game) => game.url));
  const latest = games.reduce((max, game) => Math.max(max, game.endTime), 0);
  const start = taipeiParts(latest || Math.floor(Date.now() / 1000));
  const now = taipeiParts(Math.floor(Date.now() / 1000));
  const months: Array<{ year: number; month: number }> = [];
  for (let year = start.year, month = start.month; year < now.year || (year === now.year && month <= now.month); ) {
    months.push({ year, month });
    month += 1;
    if (month === 13) {
      month = 1;
      year += 1;
    }
  }

  const incoming: ChessReviewedGame[] = [];
  for (const month of months) {
    const archive = await getJson<{ games?: ApiGame[] }>(
      `https://api.chess.com/pub/player/${USER}/games/${month.year}/${String(month.month).padStart(2, "0")}`,
    );
    for (const game of archive.games ?? []) {
      const id = game.uuid?.toLowerCase();
      if (!id || known.has(id) || (game.url && knownUrls.has(game.url))) continue;
      game.uuid = id;
      const reviewed = toReviewedGame(game);
      if (!reviewed) continue;
      known.add(reviewed.id);
      incoming.push(reviewed);
    }
  }
  incoming.sort((a, b) => a.endTime - b.endTime);
  if (incoming.length > 80) {
    throw new Error(`Refusing to add ${incoming.length} games at once. The daily update only expects new games.`);
  }

  const pending = [...games.filter((game) => game.accuracy == null), ...incoming];
  console.log(`Ratings refreshed. ${incoming.length} new games, ${pending.length} to analyze.`);

  const scored = new Map<string, ScoredGame>();
  if (pending.length > 0) {
    const engine = new DesktopEngine(stockfishPath());
    try {
      await engine.init();
      for (let index = 0; index < pending.length; index += 1) {
        const game = pending[index];
        console.log(`Analyzing ${index + 1}/${pending.length} ${game.date} ${game.timeClass} vs ${game.opponent}`);
        try {
          scored.set(game.id, await scoreGame(game, engine));
        } catch (error) {
          console.error(`Skipped ${game.id}:`, error instanceof Error ? error.message : error);
          scored.set(game.id, game);
        }
      }
    } finally {
      engine.quit();
    }
  }

  const nextGames = games.map((game) => withoutBrillians(scored.get(game.id) ?? game));
  for (const game of incoming) nextGames.push(withoutBrillians(scored.get(game.id) ?? game));

  for (const game of [...games, ...incoming]) {
    const fresh = scored.get(game.id);
    if (!fresh?.brillians) continue;
    for (const move of fresh.brillians) {
      const gap = move.winChanceBefore - (move.features.secondWinChance ?? move.winChanceBefore);
      brilliants.push({
        id: `${game.id}-${move.ply}`,
        gameId: game.id,
        date: game.date,
        timeClass: game.timeClass,
        san: move.san,
        ply: move.ply,
        moveNumber: move.moveNumber,
        color: move.color === "white" ? "w" : "b",
        benefit: Math.round(Math.max(0, gap) * 1000) / 10,
        url: game.url,
        opponent: game.opponent,
      });
    }
  }

  const ratingsText = JSON.stringify(ratings, null, 2);
  const gamesText = JSON.stringify(nextGames);
  const brilliantsText = JSON.stringify(brilliants);
  const unchanged =
    ratingsText === JSON.stringify(JSON.parse(ratingsSlice.json), null, 2) &&
    gamesText === JSON.stringify(JSON.parse(gamesSlice.json)) &&
    brilliantsText === JSON.stringify(JSON.parse(brilliantsSlice.json));
  if (unchanged) {
    console.log("No changes.");
    return;
  }

  let next = source.replace(
    /^\/\/.*(?:\r?\n)/,
    "// Public Chess.com games for yenchenglin. Ratings and new games refresh daily at 09:00 (UTC+8).\n",
  );
  const ratingsAgain = extractValue(next, "chessRatings");
  next = next.slice(0, ratingsAgain.start) + ratingsText + next.slice(ratingsAgain.end);
  const gamesAgain = extractValue(next, "chessGames");
  next = next.slice(0, gamesAgain.start) + gamesText + next.slice(gamesAgain.end);
  const brilliantsAgain = extractValue(next, "chessBrilliants");
  next = next.slice(0, brilliantsAgain.start) + brilliantsText + next.slice(brilliantsAgain.end);
  writeFileSync(DATA, next);
  console.log(`Wrote ${DATA}. ${nextGames.length} games.`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
