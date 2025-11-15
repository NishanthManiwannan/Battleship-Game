import express, { Express, NextFunction, Request, Response } from "express";
import { initRedis } from "./utils/redisClient";
import {
  getController,
  loadGame,
  shootController,
  startBattleController,
} from "./controller/controller";

const app: Express = express();
const port = process.env.PORT || 3002;

app.use(express.json());

app.post("/battle/start", startBattleController);
app.post("/battle/:battleId/shoot", loadGame, shootController);
app.get("/battle/:battleId", loadGame, getController);

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
