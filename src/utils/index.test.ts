import {
  convertCoordinateToGrid,
  convertGridToCordinate,
  isValidCoordinate,
  loadGameFromRedis,
  saveGame,
} from ".";
import { Game, Ship, SquareField } from "../types/types";
import redis from "./redisClient";

jest.mock("./redisClient", () => {
  return {
    __esModule: true,
    default: {
      set: jest.fn(),
      get: jest.fn(),
    },
  };
});

const mockShip: Ship = {
  type: "Test Ship",
  size: 2,
  positions: ["A1", "A2"],
  hits: 1,
  isDestroyed: false,
};

const mockGame: Game = {
  battleId: "test-123",
  field: [
    [SquareField.Hit, SquareField.Ship],
    [SquareField.Empty, SquareField.Miss],
  ],
  ships: [mockShip],
  isGameOver: false,
};

describe("Coordinate Conversion Utilities", () => {
  describe("convertGridToCordinate", () => {
    test("should convert grid (0, 0) to A1", () => {
      expect(convertGridToCordinate(0, 0)).toBe("A1");
    });

    test("should convert grid (9, 9) to J10", () => {
      expect(convertGridToCordinate(9, 9)).toBe("J10");
    });
  });

  describe("convertCoordinateToGrid", () => {
    test("should convert A1 to grid (0, 0)", () => {
      expect(convertCoordinateToGrid("A1")).toEqual({ row: 0, col: 0 });
    });

    test("should convert J10 to grid (9, 9)", () => {
      expect(convertCoordinateToGrid("J10")).toEqual({ row: 9, col: 9 });
    });
  });

  describe("isValidCoordinate", () => {
    test("should return true for valid coordinates", () => {
      expect(isValidCoordinate("A1")).toBe(true);
    });

    test("should return false for invalid coordinate", () => {
      expect(isValidCoordinate("Z1")).toBe(false);
    });
  });
});

describe("Redis Interaction Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("saveGame", () => {
    test("should call redis.set with the battleId and stringified Game object", async () => {
      await saveGame(mockGame);

      expect(redis.set).toHaveBeenCalledTimes(1);
      expect(redis.set).toHaveBeenCalledWith(
        mockGame.battleId,
        JSON.stringify(mockGame)
      );
    });
  });

  describe("loadGameFromRedis", () => {
    test("should return the parsed Game object if data is found", async () => {
      (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(mockGame));
      const result = await loadGameFromRedis(mockGame.battleId);

      expect(redis.get).toHaveBeenCalledWith(mockGame.battleId);
      expect(result).toEqual(mockGame);
    });

    test("should return null if the game data is not found in Redis", async () => {
      (redis.get as jest.Mock).mockResolvedValue(null);
      const result = await loadGameFromRedis("non-existent-id");

      expect(redis.get).toHaveBeenCalledWith("non-existent-id");
      expect(result).toBeNull();
    });
  });
});
