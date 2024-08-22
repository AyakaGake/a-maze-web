import React, { useState, useEffect, useRef } from 'react';
import { MazeGenerator } from '../lib/mazegenerator';
// import MazeSolver from './mazesolver';
import Maze from './maze';
import Vector from './Vector';
import { fetchMazeData } from './fetchMazeData';
import supabase from '../lib/supabaseClient';

interface Props {
  onFinish: (clearTime: number) => void;
  roomId: string;
  playerId: string;
  playerName: string;
  playerColor: string;
}

interface PlayerData {
  x: number;
  y: number;
  color: string;
  playerId: string;
}

const MazeApplet: React.FC<Props> = ({ roomId, onFinish, playerId, playerName, playerColor }) => {
  const [removedWalls, setRemovedWalls] = useState<{ x: number; y: number }[]>(
    []
  );
  const [playerPosition, setPlayerPosition] = useState<Vector>(
    new Vector(1, 1)
  );
  const [playerTrail, setPlayerTrail] = useState<{ x: number; y: number }[]>([
    { x: 1, y: 1 },
  ]);
  const [shortestPath, setShortestPath] = useState<{ x: number; y: number }[]>(
    []
  );
  const [drawPathFlag, setDrawPathFlag] = useState(false);
  const [drawFlag, setDrawFlag] = useState(false);
  const [SIZE, setSize] = useState<number>(31);
  const [CELL_SIZE, setCellSize] = useState<number>(20);
  const [goal, setGoal] = useState<Vector>(new Vector(28, 28));
  const [start, setStart] = useState<Vector>(new Vector(0, 0));
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);

  const [maze, setMaze] = useState<{
    cells: boolean[][];
    size: number;
    cellSize: number;
  } | null>(null);

  const channel = supabase.channel(roomId)
  const [otherPlayerPositions, setOtherPlayerPositions] = useState<PlayerData[]>([]);

  // const [playerId, setPlayerId] = useState<string | null>(null);

  // useEffect(() => {
  //   const id = localStorage.getItem('playerId');
  //   if (id) {
  //     setPlayerId(id);
  //   } else {
  //     console.error('Player ID not found in localStorage');
  //   }
  // }, []);

  useEffect(() => {
    console.log("playerId" + playerId)
    console.log("playerName" + playerName)
    console.log("playerColor" + playerColor)
    setStartTime(Date.now());
    // Wall removal logic
    // const removeWalls = () => {
    //     const walls: { x: number; y: number }[] = [];
    //     const random = Math.random;
    //     for (let y = 1; y < SIZE - 1; y++) {
    //         for (let x = 1; x < SIZE - 1; x++) {
    //             if (((x % 2 === 0 && y % 2 === 1) || (x % 2 === 1 && y % 2 === 0)) &&
    //                 maze.cells[x][y] && random() < 0.1) { // Adjust probability if needed
    //                 walls.push({ x, y });
    //                 maze.cells[y][x] = false;
    //             }
    //         }
    //     }
    //     setRemovedWalls(walls);
    // };
    const fetchAndSetMazeData = async (roomId: string) => {
      if (roomId) {
        const mazeData = await fetchMazeData(roomId);

        if (mazeData) {
          setMaze({
            cells: mazeData.cells,
            size: mazeData.size,
            cellSize: mazeData.cellSize,
          });
          setSize(mazeData.size);
          setCellSize(mazeData.cellSize);
          setGoal(new Vector(mazeData.goal.x, mazeData.goal.y));
          setStart(new Vector(mazeData.start.x, mazeData.start.y));
          setRemovedWalls([]); // 例: empty array for now
        }
      }
    };
    fetchAndSetMazeData(roomId);
  }, [roomId]);

  //     const removeWalls = () => {
  //         const newCells = cells.map((row: any[]) => row.slice()); // Deep copy of the maze cells
  //         const walls: { x: number; y: number }[] = [];
  //         const random = Math.random;
  //         for (let y = 1; y < SIZE - 1; y++) {
  //             for (let x = 1; x < SIZE - 1; x++) {
  //                 if (((x % 2 === 0 && y % 2 === 1) || (x % 2 === 1 && y % 2 === 0)) &&
  //                     newCells[y][x] && random() < 0.1) { // Adjust probability if needed
  //                     walls.push({ x, y });
  //                     newCells[y][x] = false;
  //                 }
  //             }
  //         }
  //         setMaze(prevMaze => ({ ...prevMaze, cells: newCells }));
  //         setRemovedWalls(walls);
  //     };
  //     removeWalls();
  //     // Optionally, solve maze and set shortest path
  //     // const mazeSolver = new MazeSolver(generatedMaze);
  //     // if (mazeSolver.solve()) {
  //     //     setShortestPath(mazeSolver.getSolution().map(v => ({ x: v.x, y: v.y })));
  //     // }
  //     //
  // }, [size]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawMaze(ctx);
        drawPlayer(ctx);
        drawPlayerTrail(ctx);
        if (drawPathFlag) {
          drawShortestPath(ctx);
        }
        drawOtherPlayerPosition(ctx);
      }
    }
  }, [playerPosition, playerTrail, shortestPath, drawPathFlag, maze, otherPlayerPositions]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      switch (e.key) {
        case 'ArrowUp':
          movePlayer(0, -1);
          break;
        case 'ArrowDown':
          movePlayer(0, 1);
          break;
        case 'ArrowLeft':
          movePlayer(-1, 0);
          break;
        case 'ArrowRight':
          movePlayer(1, 0);
          break;
        case 'r':
          setPlayerPosition(start);
          setPlayerTrail([start]);
          setDrawPathFlag(false);
          break;
        case 'd':
          setDrawPathFlag(!drawPathFlag);
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerPosition, drawPathFlag]);

  const drawMaze = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = 'black';
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        if (maze?.cells[y][x]) {
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }
    ctx.fillStyle = 'cyan';
    ctx.fillRect(
      start.x * CELL_SIZE,
      start.y * CELL_SIZE,
      CELL_SIZE,
      CELL_SIZE
    );
    ctx.fillStyle = 'yellow';
    ctx.fillRect(goal.x * CELL_SIZE, goal.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    ctx.fillStyle = 'gray';
    removedWalls.forEach((w) =>
      ctx.fillRect(w.x * CELL_SIZE, w.y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
    );
  };

  const drawPlayer = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = playerColor;
    ctx.fillRect(
      playerPosition.x * CELL_SIZE,
      playerPosition.y * CELL_SIZE,
      CELL_SIZE,
      CELL_SIZE
    );
  };

  const drawPlayerTrail = (ctx: CanvasRenderingContext2D) => {
    // ctx.strokeStyle = adjustColorBrightness(playerColor, 0.5);
    ctx.strokeStyle = playerColor;
    ctx.lineWidth = CELL_SIZE * 0.5;
    ctx.beginPath();
    playerTrail.forEach((pos, index) => {
      const x = pos.x * CELL_SIZE + CELL_SIZE / 2;
      const y = pos.y * CELL_SIZE + CELL_SIZE / 2;
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
  };

  const drawShortestPath = (ctx: CanvasRenderingContext2D) => {
    if (shortestPath.length > 0) {
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = CELL_SIZE * 0.3;
      ctx.beginPath();
      shortestPath.forEach((pos, index) => {
        const x = pos.x * CELL_SIZE + CELL_SIZE / 2;
        const y = pos.y * CELL_SIZE + CELL_SIZE / 2;
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }
  };

  const drawOtherPlayerPosition = (ctx: CanvasRenderingContext2D) => {
    otherPlayerPositions.forEach(({ x, y, color }) => {
      ctx.fillStyle = color;
      ctx.fillRect(
        x * CELL_SIZE,
        y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
    });
  };

  const movePlayer = (dx: number, dy: number) => {
    console.log('move');
    const newX = playerPosition.x + dx;
    const newY = playerPosition.y + dy;
    if (
      newX >= 0 &&
      newX < SIZE &&
      newY >= 0 &&
      newY < SIZE &&
      !maze?.cells[newY][newX]
    ) {
      setPlayerPosition(new Vector(newX, newY));
      setPlayerTrail((prevTrail) => [...prevTrail, { x: newX, y: newY }]);

      channel.subscribe((status) => {
        // Wait for successful connection
        if (status !== 'SUBSCRIBED') {
          return null
        }
        channel.on(
          'broadcast',
          { event: 'position' },
          (payload) => messageReceived(payload)
        )
        channel.send({
          type: 'broadcast',
          event: 'position',
          payload: { position: new Vector(newX, newY), "playerId": playerId, "playerName": playerName, "playerColor": playerColor },
        })
      })

      if (newX === goal.x && newY === goal.y) {
        setDrawPathFlag(true);
        const endTime = Date.now();

        // if (endTime) {
        const clearTime = Math.floor((endTime - (startTime ?? 0)) / 1000);
        onFinish(clearTime);

        // }
      }
    }
  };

  function messageReceived(payload: any) {
    if (payload.event === 'position') {
      const { position, playerId, playerName, playerColor } = payload.payload;
      setOtherPlayerPositions((prevPositions) => {
        // Update the player position or add it if it's a new player
        const existingPlayerIndex = prevPositions.findIndex(p => p.playerId === playerId);
        if (existingPlayerIndex >= 0) {
          console.log('Previous Positions:', prevPositions);
          // Update existing player
          const updatedPositions = [...prevPositions];
          updatedPositions[existingPlayerIndex] = { x: position.x, y: position.y, color: playerColor, playerId };
          return updatedPositions;
        } else {
          // Add new player
          return [...prevPositions, { x: position.x, y: position.y, color: playerColor, playerId }];
        }
      });
    }
  }

  return (
    <div
      className='relative flex items-center justify-center'
      style={{ width: SIZE * CELL_SIZE, height: SIZE * CELL_SIZE }}
    >
      <div className='absolute inset-0 bg-white rounded-lg shadow-lg flex items-center justify-center'>
        <canvas
          width={SIZE * CELL_SIZE}
          height={SIZE * CELL_SIZE}
          ref={canvasRef}
        />
      </div>
    </div>
  );
};

export default MazeApplet;
