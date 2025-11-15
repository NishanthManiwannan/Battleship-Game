import { Game } from "../types/types";
import redis from "./redisClient";

const BASE_COLUMN = 65;

export function convertGridToCordinate(row: number, col: number): string {
  const colChar = String.fromCharCode(col + BASE_COLUMN);
  const rowNum = row + 1;
  return `${colChar}${rowNum}`;
}

export function isValidCoordinate(coord: string): boolean {
  const regex = /^[A-J]([1-9]|10)$/;
  return regex.test(coord);
}

export function convertCoordinateToGrid(coord: string): {
  row: number;
  col: number;
} {
  const col = coord.charCodeAt(0) - BASE_COLUMN;
  const row = parseInt(coord.substring(1)) - 1;
  return { row, col };
}


export async function saveGame(game: Game) {
  await redis.set(game.battleId, JSON.stringify(game));
}

export async function loadGameFromRedis(id: string): Promise<Game | null> {
  const data = await redis.get(id);
  return data ? JSON.parse(data) : null;
}