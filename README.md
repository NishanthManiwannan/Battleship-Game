# Battleship Game API

A simple RESTful API for playing a single-player game of Battleship against an AI-placed fleet. This API manages game state, ship placement, and attack logic using Redis for persistence.

# Setup and Installation

## Prerequisites

Node.js: Ensure you have a recent LTS version of Node.js installed.
Redis Server: A running instance of the Redis server. It's connect to the default Redis location (localhost:6379).

## Steps

Clone - repo
Install the required dependencies:

```bash
npm install
```

Start the Redis server
Compile and development server

```bash
npm run dev
```

Build server

```bash
npm run build
```

Compile and run prod server

```bash
npm run start
```

The server will start on port 3002 or .env and you will see the message: Server running at http://localhost:3002.

# Game Details

Grid Size: The battlefield is a 10x10 grid, using standard coordinates (A1 -> J10).

Ships are randomly placed on the board:
- Battleship 01: Size 5
- Destroyer 01: Size 4
- Destroyer 02: Size 4

## API end points

1. The server randomly places the ships, saves the game state to Redis, and returns the unique ID for the battle.

```bash
|-------------------------------------------------------------------------------|
|Method         | URL            | Description                                  |
|-------------------------------------------------------------------------------|
|-------------------------------------------------------------------------------|
|POST           | /battle/start  | Starts a new game and returns the battleId.  |
|-------------------------------------------------------------------------------|
```

Response: 201
```bash
{
  "message": "Game started now",
  "battleId": "d7e3a9b1-f6c4-4a2e-9d0b-6c8f1e2a5d4c"
}
```

2. Submits a coordinate to attack the opponent's board in a specific game session.

```bash
|-------------------------------------------------------------------------------------|
|Method         | URL                      | Description                              |
|-------------------------------------------------------------------------------------|
|-------------------------------------------------------------------------------------|
|POST           | /battle/:battleId/shoot  | Fires a shot at the specified coordinate.|
|-------------------------------------------------------------------------------------|
```

Path Parameter
```bash
  :battleId
```

Request Body
```bash
{
  "coordinate": "C5"
}
```

Response: 200
```bash
{
    "message": "Already hit that coordinate",
    "result": "invalid",
    "coordinate": "C5"
}

{
    "message": "Already hit that coordinate",
    "result": "invalid",
    "coordinate": "C5"
}
.etc
```

3. Get Game Status - Retrieves the current status of the game

```bash
|-----------------------------------------------------------------------------------------------|
|Method         | URL                | Description                                              |
|-----------------------------------------------------------------------------------------------|
|-----------------------------------------------------------------------------------------------|
|GET            | /battle/:battleId  | Get the status, including destroyed and remaining ships. |
|-----------------------------------------------------------------------------------------------|
```

Path Parameter
```bash
  :battleId
```

Response: 200
```bash
{
  "battleId": "d7e3a9b1-f6c4-4a2e-9d0b-6c8f1e2a5d4c",
  "isGameOver": false,
  "shipsDestroyed": ["Destroyer 01"],
  "remainingShips": [
    { "type": "Battleship 01", "size": 5, "hits": 2 },
    { "type": "Destroyer 02", "size": 4, "hits": 0 }
  ]
}
```

# Project Packages & Libraries
```bash
|----------------------------------------------------------------------------------------------------------|
| Name of the package |  What would you accomplish using that?                                             |
|----------------------------------------------------------------------------------------------------------|
|----------------------------------------------------------------------------------------------------------|
| ExpressJS           | Web Application Framework - Handles routing, middleware, and HTTP request/response |
|----------------------------------------------------------------------------------------------------------|
| redis               | Persistence layer for storing and retrieving game state                            |
|----------------------------------------------------------------------------------------------------------|
| uuid                | Generating unique id (battleId)                                                    |
|----------------------------------------------------------------------------------------------------------|
| TypeScript          | Adding static typing to the codebase for better scalability and error prevention   |
|----------------------------------------------------------------------------------------------------------|
| ts-node-dev         | Live reloading, automatically restarting the server on file changes                |
|----------------------------------------------------------------------------------------------------------|
| Node.js             | Runtime environment it allows to run JavaScript on the server side                 |
|----------------------------------------------------------------------------------------------------------|
| Jest                | Used to make sure the logic works correctly                                        |
|----------------------------------------------------------------------------------------------------------|
```

# Development Environment & Tools
```bash
|---------------------------------------------------------------------------------------------------------------|
| Program/Tool        |  What would you accomplish using that?                                                  |
|---------------------------------------------------------------------------------------------------------------|
|---------------------------------------------------------------------------------------------------------------|
| Visual Studio Code  | IDE for coding, debugging, and project management                                       |
|---------------------------------------------------------------------------------------------------------------|
| npm                 | Package managers for installing, managing, and running project dependencies and scripts.|
|---------------------------------------------------------------------------------------------------------------|
| Postman             | Tool for testing, validating, and documenting the API endpoints during development.     |
|---------------------------------------------------------------------------------------------------------------|
| draw.io             | Used for draw ER diagram
|---------------------------------------------------------------------------------------------------------------|
```

<img width="1023" height="650" alt="Nishanth-BattleShip Class diagram" src="https://github.com/user-attachments/assets/c01567ee-3017-454d-8ed3-1d05e1d0af3d" />

