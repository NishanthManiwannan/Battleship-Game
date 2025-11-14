import express, { Express, NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { battleStart } from "./battle/placement/placement";

const activeGames = new Map();

const app: Express = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Battleship Game");
});

app.post("/battel/start", (req: Request, res: Response, next: NextFunction) => {
  const battleId = uuidv4();
  try {
    const response = battleStart(battleId);
    const newBattleField = response;

    activeGames.set(battleId, newBattleField);

    res.status(201).json({
      message: "Game started now",
      data: activeGames.get(battleId),
      gameId: battleId,
    });
  } catch (error) {
    next(error);
  }
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });

  res.status(400).json({
    success: false,
    message: err.message || "Bad Request",
  });

  res.status(404).json({
    success: false,
    message: err.message || "Server Not Found",
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
