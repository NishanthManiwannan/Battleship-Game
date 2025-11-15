import { Game, Ship, SquareField } from "../types/types";
import * as Utils from "../utils";
import { attack, battleStart } from "./placement";

jest.mock("../utils");

const mockUtils = Utils as jest.Mocked<typeof Utils>;

describe("Battleship Game Logic", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("battleStart", () => {
    it("should initialize a new game with a 10x10 empty field", () => {
      const game = battleStart("test-001");

      expect(game.battleId).toBe("test-001");
      expect(game.isGameOver).toBe(false);
      expect(game.field.length).toBe(10);
      expect(game.field[0].length).toBe(10);
      expect(
        game.field.every((row) =>
          row.every(
            (square) =>
              square === SquareField.Ship || square === SquareField.Empty
          )
        )
      ).toBe(true);
    });

    it("should place exactly three ships on the board", () => {
      const game = battleStart("test-002");

      expect(game.ships.length).toBe(3);
      expect(game.ships[0].type).toBe("Battleship 01");
      expect(game.ships[1].type).toBe("Destroyer 01");
      expect(game.ships[2].type).toBe("Destroyer 02");
    });
  });

  describe("attack", () => {
    let mockGame: Game;

    beforeEach(() => {
      const field: SquareField[][] = Array.from({ length: 10 }, () =>
        Array(10).fill(SquareField.Empty)
      );

      field[0][0] = SquareField.Ship;
      field[0][1] = SquareField.Ship;
      field[0][2] = SquareField.Ship;

      field[9][9] = SquareField.Ship;

      const ship1: Ship = {
        type: "Ship 1",
        size: 3,
        positions: ["A1", "B1", "C1"],
        hits: 0,
        isDestroyed: false,
      };

      const ship2: Ship = {
        type: "Ship 2",
        size: 1,
        positions: ["J10"],
        hits: 0,
        isDestroyed: false,
      };

      mockGame = {
        battleId: "attack-test",
        field,
        ships: [ship1, ship2],
        isGameOver: false,
      };

      mockUtils.isValidCoordinate.mockReturnValue(true);
    });

    it("should return invalid for an invalid coordinate", () => {
      mockUtils.isValidCoordinate.mockReturnValue(false);
      const result = attack(mockGame, "Z99");
      expect(result.result).toBe("invalid");
      expect(result.message).toBe("Invalid coordinate. Use A1 to J10.");
    });

    it("should register a miss and update the board", () => {
      mockUtils.convertCoordinateToGrid.mockReturnValue({ row: 5, col: 5 });

      const result = attack(mockGame, "F6");

      expect(result.result).toBe("miss");
      expect(result.message).toBe("You missed.");
      expect(mockGame.field[5][5]).toBe(SquareField.Miss);
    });

    it("should return invalid if the coordinate has already been missed", () => {
      mockGame.field[5][5] = SquareField.Miss;
      mockUtils.convertCoordinateToGrid.mockReturnValue({ row: 5, col: 5 });

      const result = attack(mockGame, "F6");

      expect(result.result).toBe("invalid");
      expect(result.message).toBe("Already hit that coordinate");
    });

    it("should register a hit, update the board, and increment ship hits", () => {
      mockUtils.convertCoordinateToGrid.mockReturnValue({ row: 0, col: 0 });

      const result = attack(mockGame, "A1");

      expect(result.result).toBe("hit");
      expect(result.message).toBe("You hit a ship!");
      expect(mockGame.field[0][0]).toBe(SquareField.Hit);
      expect(mockGame.ships[0].hits).toBe(1);
      expect(mockGame.ships[0].isDestroyed).toBe(false);
      expect(mockGame.ships[0].hits).toBe(1);
    });

    it("should return invalid if the coordinate has already been hit", () => {
      mockGame.field[0][0] = SquareField.Hit;
      mockUtils.convertCoordinateToGrid.mockReturnValue({ row: 0, col: 0 });

      const result = attack(mockGame, "A1");

      expect(result.result).toBe("invalid");
      expect(result.message).toBe("Already hit that coordinate");
    });

    it("should destroy a ship on the final hit", () => {
      mockGame.ships[0].hits = 2;
      mockGame.field[0][0] = SquareField.Hit;
      mockGame.field[0][1] = SquareField.Hit;

      mockUtils.convertCoordinateToGrid.mockReturnValue({ row: 0, col: 2 });

      const result = attack(mockGame, "C1");

      expect(result.result).toBe("hit");
      expect(result.message).toContain("destroyed the ship");
      expect(result.shipType).toBe("Ship 1");
      expect(mockGame.ships[0].hits).toBe(3);
      expect(mockGame.ships[0].isDestroyed).toBe(true);
      expect(result.gameOver).toBeUndefined();
    });

    it("should end the game when the last ship is destroyed", () => {
      mockGame.ships[0].hits = 3;
      mockGame.ships[0].isDestroyed = true;

      mockUtils.convertCoordinateToGrid.mockReturnValue({ row: 9, col: 9 });

      const result = attack(mockGame, "J10");

      expect(result.result).toBe("hit");
      expect(result.message).toBe("Game Over");
      expect(result.shipType).toBe("Ship 2");
      expect(mockGame.ships[1].hits).toBe(1);
      expect(mockGame.ships[1].isDestroyed).toBe(true);
      expect(mockGame.isGameOver).toBe(true);
      expect(result.gameOver).toBe(true);
    });
  });
});
