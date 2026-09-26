import { Chess } from "chess.js";

/**
 * Standard opening lines of the kind surveyed in Modern Chess Openings.
 * These are public move sequences, not text from the book.
 */
const LINES = `
e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3 O-O h3
e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 O-O c3 d5
e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Nxe4
e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 d3
e4 e5 Nf3 Nc6 Bb5 a6 Bxc6 dxc6
e4 e5 Nf3 Nc6 Bb5 Nf6 O-O Nxe4 d4
e4 e5 Nf3 Nc6 Bb5 Nf6 d3
e4 e5 Nf3 Nc6 Bb5 Bc5 c3
e4 e5 Nf3 Nc6 Bb5 d6 d4
e4 e5 Nf3 Nc6 Bb5 f5
e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O O-O
e4 e5 Nf3 Nc6 Bc4 Bc5 b4 Bxb4 c3
e4 e5 Nf3 Nc6 Bc4 Nf6 d3
e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Na5
e4 e5 Nf3 Nc6 d4 exd4 Nxd4
e4 e5 Nf3 Nc6 Nc3 Nf6 Bb5
e4 e5 Nf3 Nc6 Nc3 Nf6 Bc4
e4 e5 Nf3 Nf6 Nxe5 d6 Nf3 Nxe4 d4
e4 e5 Nf3 Nf6 Nc3
e4 e5 Nf3 d6 d4
e4 e5 f4 exf4 Nf3
e4 e5 Nc3 Nf6
e4 e5 Bc4 Nf6
e4 e5 d4 exd4
e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6
e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6
e4 c5 Nf3 Nc6 d4 cxd4 Nxd4
e4 c5 Nf3 Nc6 Bb5
e4 c5 Nf3 e6 d4 cxd4 Nxd4
e4 c5 Nf3 a6
e4 c5 Nc3 Nc6
e4 c5 c3
e4 c5 d4 cxd4
e4 e6 d4 d5 Nc3 Nf6
e4 e6 d4 d5 Nd2
e4 e6 d4 d5 e5
e4 e6 d4 d5 exd5
e4 c6 d4 d5 Nc3
e4 c6 d4 d5 Nd2
e4 c6 d4 d5 exd5 cxd5
e4 c6 d4 d5 e5
e4 d5 exd5 Qxd5 Nc3
e4 d5 exd5 Nf6
e4 Nf6 e5 Nd5
e4 d6 d4 Nf6 Nc3 g6
e4 g6 d4 Bg7
e4 Nc6
d4 d5 c4 e6 Nc3 Nf6 Bg5
d4 d5 c4 e6 Nc3 Nf6 Nf3
d4 d5 c4 e6 Nf3 Nf6 g3
d4 d5 c4 dxc4 Nf3
d4 d5 c4 c6 Nf3 Nf6 Nc3
d4 d5 c4 c6 Nc3
d4 d5 Nf3 Nf6 Bf4
d4 d5 Bf4
d4 Nf6 c4 e6 Nc3 Bb4
d4 Nf6 c4 e6 Nf3 b6
d4 Nf6 c4 e6 g3
d4 Nf6 c4 g6 Nc3 Bg7 e4 d6
d4 Nf6 c4 g6 Nc3 d5
d4 Nf6 c4 c5 d5
d4 Nf6 c4 e6 Nc3 c5
d4 f5 g3
d4 Nf6 Nf3 g6 g3
d4 Nf6 Bg5
c4 e5 Nc3 Nf6
c4 e5 Nc3 Nc6
c4 c5
c4 Nf6 Nf3
c4 e6
Nf3 d5 g3
Nf3 d5 c4
Nf3 Nf6 g3
g3
b3
f4
`.trim();

function positionKey(chess: Chess): string {
  const [board, turn, castling, enPassant] = chess.fen().split(" ");
  return `${board} ${turn} ${castling} ${enPassant}`;
}

function buildBook(text: string): Map<string, Set<string>> {
  const book = new Map<string, Set<string>>();
  for (const line of text.split("\n")) {
    const chess = new Chess();
    for (const san of line.trim().split(/\s+/)) {
      const key = positionKey(chess);
      const replies = book.get(key) ?? new Set<string>();
      replies.add(san);
      book.set(key, replies);
      if (!chess.move(san)) {
        throw new Error(`Opening book line is illegal after ${chess.pgn()}: ${san}`);
      }
    }
  }
  return book;
}

const BOOK = buildBook(LINES);

export function openingBookLines(): string[] {
  return LINES.split("\n");
}

/** True when this move continues a recorded Modern Chess Openings line from the position reached so far. */
export function isBookMove(priorSans: string[], san: string): boolean {
  const chess = new Chess();
  for (const earlier of priorSans) {
    if (!chess.move(earlier)) return false;
  }
  return BOOK.get(positionKey(chess))?.has(san) ?? false;
}
