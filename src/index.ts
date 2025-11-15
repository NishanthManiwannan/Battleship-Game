import express, { Express, NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { attack, battleStart } from "./battle/placement/placement";
import { Game, ShotResult } from "./types/types";
import redis, { initRedis } from "./utils/redisClient";
import { loadGameFromRedis, saveGame } from "./utils";

const app: Express = express();
const port = process.env.PORT || 3002;

app.use(express.json());

async function loadGame(req: Request, res: Response, next: NextFunction) {
  const game = await loadGameFromRedis(req.params.battleId);
  if (!game) return res.status(404).json({ message: "Game not found" });

  (req as any).game = game;
  next();
}

app.post(
  "/battle/start",
  async (req: Request, res: Response, next: NextFunction) => {
    const battleId = uuidv4();
    try {
      const newGame = battleStart(battleId);
      await saveGame(newGame);

      return res.status(201).json({
        message: "Game started now",
        battleId: battleId,
      });
    } catch (error) {
      next(error);
    }
  }
);

app.post(
  "/battle/:battleId/shoot",
  loadGame,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const game: Game = await (req as any).game;
      const { coordinate } = req.body;
      const normalizedCoordinate = coordinate.trim().toUpperCase();

      if (!coordinate || typeof coordinate !== "string")
        return res.status(400).json({ message: "Invalid coordinate" });

      if (game.isGameOver)
        return res.status(400).json({ message: "The game is already over." });

      const result: ShotResult = attack(game, normalizedCoordinate);

      result.gameOver ? await redis.del(game.battleId) : await saveGame(game);

      const responseBody: any = {
        message: result.message,
        result: result.result,
        coordinate: normalizedCoordinate,
      };

      if (result.shipType) responseBody.shipType = result.shipType;

      if (result.gameOver) responseBody.gameOver = true;

      return res.status(200).json(responseBody);
    } catch (error) {
      next(error);
    }
  }
);

app.get(
  "/battle/:battleId",
  loadGame,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const game: Game = await (req as any).game;

      return res.status(200).json({
        battleId: game.battleId,
        isGameOver: game.isGameOver,
        shipsDestroyed: game.ships
          .filter((ship) => ship.isDestroyed)
          .map((ship) => ship.type),
        remainingShips: game.ships
          .filter((ship) => !ship.isDestroyed)
          .map((ship) => ({
            type: ship.type,
            size: ship.size,
            hits: ship.hits,
          })),
      });
    } catch (error) {
      next(error);
    }
  }
);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err?.status || err?.statusCode || 500;
  return res.status(status).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

(async () => {
  await initRedis();

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
})();
