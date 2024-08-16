import React, { useState, useEffect, useRef } from 'react';
import { MazeGenerator } from './mazegenerator';
// import MazeSolver from './mazesolver';
import Maze from './maze';
import Vector from "./Vector";
import { fetchMazeData } from './fetchMazeData';

interface Props {
    onFinish: (clearTime: number) => void
    roomId: string;
}

const MazeApplet: React.FC<Props> = ({ roomId, onFinish }) => {
    const [removedWalls, setRemovedWalls] = useState<{ x: number; y: number }[]>([]);
    const [playerPosition, setPlayerPosition] = useState<Vector>(new Vector(1, 1));
    const [playerTrail, setPlayerTrail] = useState<{ x: number; y: number }[]>([{ x: 1, y: 1 }]);
    const [shortestPath, setShortestPath] = useState<{ x: number; y: number }[]>([]);
    const [drawPathFlag, setDrawPathFlag] = useState(false);
    const [drawFlag, setDrawFlag] = useState(false);
    const [SIZE, setSize] = useState<number>(31);
    const [CELL_SIZE, setCellSize] = useState<number>(20);
    const [goal, setGoal] = useState<Vector>(new Vector(28, 28));
    const [start, setStart] = useState<Vector>(new Vector(0, 0));
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [startTime, setStartTime] = useState<number | null>(null);
    const [endTime, setEndTime] = useState<number | null>(null);

    const [maze, setMaze] = useState<{ cells: boolean[][]; size: number; cellSize: number } | null>(null);

    useEffect(() => {
        setStartTime(Date.now()); // ゲーム開始時の時間を記録
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
            // const roomId = '4130f99c-191d-49ee-9d9a-be906cf198e6'; // 実際の roomId を設定
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
                    // removedWalls を設定する場合はここに追加の処理を行う
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
            }
        }
    }, [playerPosition, playerTrail, shortestPath, drawPathFlag, maze]);

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
        ctx.fillRect(start.x * CELL_SIZE, start.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        ctx.fillStyle = 'green';
        ctx.fillRect(goal.x * CELL_SIZE, goal.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        ctx.fillStyle = 'gray';
        removedWalls.forEach(w => ctx.fillRect(w.x * CELL_SIZE, w.y * CELL_SIZE, CELL_SIZE, CELL_SIZE));
    };

    const drawPlayer = (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = 'red';
        ctx.fillRect(playerPosition.x * CELL_SIZE, playerPosition.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    };

    const drawPlayerTrail = (ctx: CanvasRenderingContext2D) => {
        ctx.strokeStyle = 'rgba(255, 105, 180, 0.7)';
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

    const movePlayer = (dx: number, dy: number) => {
        console.log('move');
        const newX = playerPosition.x + dx;
        const newY = playerPosition.y + dy;
        // サイズとゴールの位置をインスタンスから取得
        if (newX >= 0 && newX < SIZE && newY >= 0 && newY < SIZE && !maze?.cells[newY][newX]) {
            setPlayerPosition(new Vector(newX, newY));
            setPlayerTrail(prevTrail => [...prevTrail, { x: newX, y: newY }]);
            if (newX === goal.x && newY === goal.y) {
                setDrawPathFlag(true);
                const endTime = Date.now(); // ここで現在時刻を取得
                // if (endTime) {
                const clearTime = Math.floor((endTime - (startTime ?? 0)) / 1000); // 秒単位に変換
                onFinish(clearTime); // ゴールに到達したときにクリアタイムを親コンポーネントに通知

                // }
            }
        }
    };


    return (
        <div className="relative flex items-center justify-center" style={{ width: SIZE * CELL_SIZE, height: SIZE * CELL_SIZE }}>
            <div className="absolute inset-0 bg-white rounded-lg shadow-lg flex items-center justify-center">
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