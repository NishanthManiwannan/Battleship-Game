export enum SquareField {
  Empty,
  Ship,
  Miss,
  Hit,
}

export interface Ship {
  type: string;
  size: number;
  positions: string[];
  hits: number;
  isDestroyed: boolean;
}

export interface Game {
  battleId: string;
  field: SquareField[][];
  ships: Ship[];
  isGameOver: boolean;
}

export interface ShipDetail {
  type: string;
  size: number;
}

export interface ShotResult {
  result: "hit" | "miss" | "invalid";
  message: string;
  shipType?: string;
  gameOver?: boolean;
}