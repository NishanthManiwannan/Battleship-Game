import { Request, Response, NextFunction } from "express";
import * as placement from "../battle/placement";
import * as utils from "../utils";
import { v4 as uuidv4 } from "uuid";
import { Game, SquareField } from "../types/types";
import { getController, loadGame, startBattleController } from "./controller";

jest.mock("uuid", () => ({
  v4: jest.fn(),
}));
jest.mock("../battle/placement", () => ({
  battleStart: jest.fn(),
  attack: jest.fn(),
}));
jest.mock("../utils", () => ({
  saveGame: jest.fn(),
  loadGameFromRedis: jest.fn(),
}));
jest.mock("../utils/redisClient", () => ({
  del: jest.fn(),
}));

const getMockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

const mockGame: Game = {
  battleId: "test-battle-id",
  field: [] as SquareField[][],
  ships: [
    { type: "Ship 1", size: 5, positions: [], hits: 0, isDestroyed: false },
    { type: "Ship 2", size: 4, positions: [], hits: 4, isDestroyed: true },
  ],
  isGameOver: false,
};

describe("Game Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Response;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = getMockResponse();
    mockNext = jest.fn();
  });

  describe("loadGame", () => {
    it("should call next() and attach game if found", async () => {
      mockRequest.params = { battleId: "test-id" };
      (utils.loadGameFromRedis as jest.Mock).mockResolvedValue(mockGame);

      await loadGame(mockRequest as Request, mockResponse, mockNext);

      expect(utils.loadGameFromRedis).toHaveBeenCalledWith("test-id");
      expect(mockNext).toHaveBeenCalled();
    });

    it("should return 404 if game not found", async () => {
      mockRequest.params = { battleId: "not-found" };
      (utils.loadGameFromRedis as jest.Mock).mockResolvedValue(null);

      await loadGame(mockRequest as Request, mockResponse, mockNext);

      expect(utils.loadGameFromRedis).toHaveBeenCalledWith("not-found");
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Game not found",
      });
    });
  });

  describe("startBattleController", () => {
    it("should create a new game and return 201", async () => {
      const newGameId = "new-game-id";
      const newGame = { ...mockGame, battleId: newGameId };

      (uuidv4 as jest.Mock).mockReturnValue(newGameId);
      (placement.battleStart as jest.Mock).mockReturnValue(newGame);

      await startBattleController(
        mockRequest as Request,
        mockResponse,
        mockNext
      );

      expect(placement.battleStart).toHaveBeenCalledWith(newGameId);
      expect(utils.saveGame).toHaveBeenCalledWith(newGame);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Game started now",
        battleId: newGameId,
      });
    });
  });

  describe("getController", () => {
    it("should return processed game status", async () => {
      (mockRequest as any).game = mockGame;

      await getController(mockRequest as Request, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        battleId: "test-battle-id",
        isGameOver: false,
        shipsDestroyed: ["Ship 2"],
        remainingShips: [
          {
            type: "Ship 1",
            size: 5,
            hits: 0,
          },
        ],
      });
    });
  });
});
