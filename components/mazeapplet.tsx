import React, { useState, useEffect, useRef } from 'react';
import Vector from './Vector';
import { fetchMazeData } from './fetchMazeData';
import supabase from '../lib/supabaseClient';
// import ArrowButtons from './arrowButton';

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
  const [CELL_SIZE, setCellSize] = useState<number>(1);
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

  // const [phone, setPhone] = useState<boolean>(false);

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
    const updateCanvasSize = () => {
      if (canvasRef.current) {

        const canvas = canvasRef.current;
        if (canvas.getContext('2d')) { console.log('asdasd'); drawBackground(canvas.getContext('2d')) }
        const container = canvas.parentElement;
        if (container) {
          const containerWidth = container.offsetWidth;
          canvas.width = containerWidth;
          canvas.height = containerWidth; // Make sure the canvas is always square
          setCellSize(containerWidth / SIZE);
        }
      }
    };
    // Update size initially
    updateCanvasSize();

    // Update size on window resize
    window.addEventListener('resize', updateCanvasSize);
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [CELL_SIZE]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBackground(ctx);
        drawMaze(ctx);
        drawPlayer(ctx);
        drawPlayerTrail(ctx);
        drawOtherPlayerPosition(ctx);
        // if (window.innerWidth < 768) {  // basic size of the smartphone
        //   setPhone(true);
        // } else {
        //   setPhone(false);
        // }
      }
    }
  }, [playerPosition, playerTrail, maze, otherPlayerPositions, CELL_SIZE]);

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

    const handleTouchStart = (e: TouchEvent) => {
      if (!mazeLoaded) {
        console.warn("Maze data is not loaded yet.");
        return;
      }

      const touch = e.touches[0];
      const touchStartX = touch.clientX;
      const touchStartY = touch.clientY;

      const handleTouchMove = (e: TouchEvent) => {
        const touchMoveX = e.touches[0].clientX;
        const touchMoveY = e.touches[0].clientY;

        const dx = touchMoveX - touchStartX;
        const dy = touchMoveY - touchStartY;

        if (Math.abs(dx) > Math.abs(dy)) {
          // 横方向のスワイプ
          if (dx > 0) {
            movePlayer(1, 0);
          } else {
            movePlayer(-1, 0);
          }
        } else {
          // 縦方向のスワイプ
          if (dy > 0) {
            movePlayer(0, 1);
          } else {
            movePlayer(0, -1);
          }
        }
        e.preventDefault(); // デフォルトのタッチ操作を無効化
      };

      window.addEventListener('touchmove', handleTouchMove);

      const handleTouchEnd = () => {
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };

      window.addEventListener('touchend', handleTouchEnd);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, [playerPosition, drawPathFlag, mazeLoaded]);

  const drawBackground = (ctx: CanvasRenderingContext2D | null) => {
    if (!ctx) return;

    ctx.fillStyle = 'white'; // Background color
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Fill the entire canvas
  };

  const drawMaze = (ctx: CanvasRenderingContext2D) => {
    // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
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
    <div className='relative flex items-center justify-center maze-container'>
      <div className='bg-white rounded-lg shadow-lg flex items-center justify-center' style={{ width: '100%', height: '100%' }}>
        <canvas
          ref={canvasRef}
          className='w-full h-full'
        />
      </div>
      {/* {phone && (
        <div className='absolute -top-10 left-1/2 transform -translate-x-1/2 w-full p-4'>
          <div className='bg-black text-white p-4 rounded shadow-lg'>
            <p className='text-center'>Swipe to move the player:</p>
            <ul className='list-disc list-inside'>
              <li>Swipe left or right to move horizontally.</li>
              <li>Swipe up or down to move vertically.</li>
            </ul>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default MazeApplet;
