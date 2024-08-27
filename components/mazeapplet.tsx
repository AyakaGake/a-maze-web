import React, { useState, useEffect, useRef } from 'react';
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
  const [removedWalls, setRemovedWalls] = useState<{ x: number; y: number }[]>([]);
  const [playerPosition, setPlayerPosition] = useState<Vector>(new Vector(1, 1));
  const [playerTrail, setPlayerTrail] = useState<{ x: number; y: number }[]>([{ x: 1, y: 1 }]);
  const [drawPathFlag, setDrawPathFlag] = useState(false);
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

  const [otherPlayerPositions, setOtherPlayerPositions] = useState<PlayerData[]>([]);
  const [channel, setChannel] = useState<any>(null);
  const [mazeLoaded, setMazeLoaded] = useState<boolean>(false);

  // Set up channel subscription
  useEffect(() => {
    const newChannel = supabase.channel(roomId);
    newChannel.on('broadcast', { event: 'position' }, (payload) => messageReceived(payload));
    newChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Subscribed to channel ${roomId}`);
      }
    });
    setChannel(newChannel);

    // Clean up subscription on component unmount or roomId change
    return () => {
      if (newChannel) {
        newChannel.unsubscribe();
        console.log(`Unsubscribed from channel ${roomId}`);
      }
    };
  }, [roomId]); // Dependency array ensures this runs only when roomId changes

  // Fetch and set maze data
  useEffect(() => {
    console.log("playerId: ", playerId);
    console.log("playerName: ", playerName);
    console.log("playerColor: ", playerColor);
    setStartTime(Date.now());

    const fetchAndSetMazeData = async (roomId: string) => {
      if (roomId) {
        try {
          const mazeData = await fetchMazeData(roomId);
          if (mazeData) {
            console.log("Fetched maze data:", mazeData);
            setMaze({
              cells: mazeData.cells,
              size: mazeData.size,
              cellSize: mazeData.cellSize,
            });
            setSize(mazeData.size);
            setCellSize(mazeData.cellSize);
            setGoal(new Vector(mazeData.goal.x, mazeData.goal.y));
            setStart(new Vector(mazeData.start.x, mazeData.start.y));
            setRemovedWalls([]);
            setMazeLoaded(true);
          }
        } catch (error) {
          console.error("Failed to fetch maze data:", error);
        }
      }
    };
    fetchAndSetMazeData(roomId);
  }, [roomId]);

  useEffect(() => {
    console.log("Maze loaded state changed:", mazeLoaded);
  }, [mazeLoaded]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawMaze(ctx);
        drawPlayer(ctx);
        drawPlayerTrail(ctx);
        drawOtherPlayerPosition(ctx);
      }
    }
  }, [playerPosition, playerTrail, maze, otherPlayerPositions]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      if (!mazeLoaded) {
        console.warn("Maze data is not loaded yet.");
        return;
      }
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
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerPosition, drawPathFlag, mazeLoaded]);

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
    ctx.fillRect(start.x * CELL_SIZE, start.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    ctx.fillStyle = 'yellow';
    ctx.fillRect(goal.x * CELL_SIZE, goal.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    ctx.fillStyle = 'gray';
    removedWalls.forEach((w) => ctx.fillRect(w.x * CELL_SIZE, w.y * CELL_SIZE, CELL_SIZE, CELL_SIZE));
  };

  const drawPlayer = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = playerColor;
    ctx.fillRect(playerPosition.x * CELL_SIZE, playerPosition.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  };


  const drawPlayerTrail = (ctx: CanvasRenderingContext2D) => {
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

  const drawOtherPlayerPosition = (ctx: CanvasRenderingContext2D) => {
    otherPlayerPositions.forEach(({ x, y, color }) => {
      ctx.fillStyle = color;
      ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    });
  };

  const movePlayer = (dx: number, dy: number) => {
    if (!mazeLoaded) {
      console.warn("Maze data is not loaded yet.");
      return;  // Prevent moving until maze data is loaded
    }

    if (!maze) {
      console.warn("Maze data is missing.");
      return;
    }

    const newX = playerPosition.x + dx;
    const newY = playerPosition.y + dy;
    if (newX >= 0 && newX < SIZE && newY >= 0 && newY < SIZE && !maze?.cells[newY][newX]) {
      setPlayerPosition(new Vector(newX, newY));
      setPlayerTrail((prevTrail) => [...prevTrail, { x: newX, y: newY }]);

      if (channel) {
        channel.send({
          type: 'broadcast',
          event: 'position',
          payload: { position: new Vector(newX, newY), playerId, playerName, playerColor },
        });
      }

      if (newX === goal.x && newY === goal.y) {
        setDrawPathFlag(true);
        const endTime = Date.now();
        const clearTime = Math.floor((endTime - (startTime ?? 0)) / 1000);
        onFinish(clearTime);
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
      <div className='bg-white rounded-lg shadow-lg flex items-center justify-center'>
        <canvas
          width={SIZE * CELL_SIZE}
          height={SIZE * CELL_SIZE}
          ref={canvasRef}
          className='w-full'
        />
      </div>
    </div>
  );
};

export default MazeApplet;
