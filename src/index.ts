import express, { Express, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

const activeGames = new Map();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Battleship Game");
});

app.post("/game/start", (req: Request, res: Response) => {
  const gameId = uuidv4();

  const newGame = {
    gameId: gameId,
    board: [],
    ships: [],
    isGameOver: false,
  };

  activeGames.set(gameId, newGame);

  console.log(`New Game Started with ID: ${gameId}`);
  res.status(201).json({
    message: "Game started now",
    gameId: gameId,
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
