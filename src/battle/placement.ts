import {
  Game,
  Ship,
  ShipDetail,
  ShotResult,
  SquareField,
} from "../types/types";
import {
  convertCoordinateToGrid,
  convertGridToCordinate,
  isValidCoordinate,
} from "../utils";

const GRID_SIZE = 10;
const SHIP_DETAILS: ShipDetail[] = [
  { type: "Battleship 01", size: 5 },
  { type: "Destroyer 01", size: 4 },
  { type: "Destroyer 02", size: 4 },
];

export function battleStart(battleId: string): Game {
  const field = createEmptyBoard();
  const ships: Ship[] = [];

  for (const shipDetail of SHIP_DETAILS) {
    const ship = shipPlacement(field, shipDetail);
    ships.push(ship);
  }

  return {
    battleId,
    field,
    ships,
    isGameOver: false,
  };
}

function createEmptyBoard(): SquareField[][] {
  return Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(SquareField.Empty)
  );
}

function shipPlacement(field: SquareField[][], shipDetail: ShipDetail): Ship {
  const { type, size } = shipDetail;
  while (true) {
    const orientation = Math.random() < 0.5 ? "horizontal" : "vertical";

    const startRow = Math.floor(Math.random() * GRID_SIZE);
    const startCol = Math.floor(Math.random() * GRID_SIZE);

    const shipPositions: { row: number; col: number }[] = [];
    let isValid = true;

    for (let i = 0; i < size; i++) {
      const currentRow = startRow + (orientation === "vertical" ? i : 0);
      const currentCol = startCol + (orientation === "horizontal" ? i : 0);

      if (currentRow >= GRID_SIZE || currentCol >= GRID_SIZE) {
        isValid = false;
        break;
      }

      if (field[currentRow][currentCol] === SquareField.Ship) {
        isValid = false;
        break;
      }

      shipPositions.push({ row: currentRow, col: currentCol });
    }

    if (isValid) {
      const coordinatePosition: string[] = [];

      for (const position of shipPositions) {
        field[position.row][position.col] = SquareField.Ship;
        coordinatePosition.push(
          convertGridToCordinate(position.row, position.col)
        );
      }

      return {
        type,
        size,
        positions: coordinatePosition,
        hits: 0,
        isDestroyed: false,
      };
    }
  }
}

export function attack(game: Game, coordinate: string): ShotResult {
  if (!isValidCoordinate(coordinate)) {
    return {
      result: "invalid",
      message: "Invalid coordinate. Use A1 to J10.",
    };
  }

  const { row, col } = convertCoordinateToGrid(coordinate);
  const currentState = game.field[row][col];

  if (currentState === SquareField.Hit || currentState === SquareField.Miss) {
    return {
      result: "invalid",
      message: "Already hit that coordinate",
    };
  }

  if (currentState === SquareField.Empty) {
    game.field[row][col] = SquareField.Miss;
    return { result: "miss", message: "You missed." };
  }

  if (currentState === SquareField.Ship) {
    game.field[row][col] = SquareField.Hit;

    const hitShip = game.ships.find((ship) =>
      ship.positions.includes(coordinate)
    );

    if (!hitShip) {
      return { result: "invalid", message: "Something went wrong" };
    }

    hitShip.hits++;

    if (hitShip.hits === hitShip.size) {
      hitShip.isDestroyed = true;

      const allDestroyed = game.ships.every((ship) => ship.isDestroyed);
      if (allDestroyed) {
        game.isGameOver = true;
        return {
          result: "hit",
          message: "Game Over",
          shipType: hitShip.type,
          gameOver: true,
        };
      }

      return {
        result: "hit",
        message: `Direct hit! You destroyed the ship`,
        shipType: hitShip.type,
      };
    }
    return { result: "hit", message: "You hit a ship!" };
  }
  return { result: "invalid", message: "Something went wrong" };
}
