import React, { useState, useEffect, useRef } from 'react';
import { MazeGenerator } from './mazegenerator';
import MazeSolver from './mazesolver';
import Maze from './maze';
import Vector from "./Vector";

const SIZE = Maze.SIZE;
const CELL_SIZE = Maze.CELL_SIZE;
const START_POSITION = Maze.START;
const GOAL_POSITION = Maze.GOAL;

interface Props {
    onFinish: () => void
    mode?: string
}

const MazeApplet: React.FC<Props> = ({ onFinish, mode }) => {
    const [maze, setMaze] = useState<Maze>(new Maze());
    const [removedWalls, setRemovedWalls] = useState<{ x: number; y: number }[]>([]);
    const [playerPosition, setPlayerPosition] = useState(START_POSITION);
    const [playerTrail, setPlayerTrail] = useState<{ x: number; y: number }[]>([START_POSITION]);
    const [shortestPath, setShortestPath] = useState<{ x: number; y: number }[]>([]);
    const [drawPathFlag, setDrawPathFlag] = useState(false);
    const [drawFlag, setDrawFlag] = useState(false);

    // const [timerActive, setTimerActive] = useState(false); // Timer active state
    // const [timerKey, setTimerKey] = useState<number>(0); // Key to reset Timer component

    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        // const initializeMaze = () => {
        //     const mazeInstance = new Maze();
        //     mazeInstance.initialize(); // 状態を初期化する
        //     return mazeInstance;
        // };

        // const mazeInstance = new Maze();
        // mazeInstance.initialize(); // 状態を初期化する
        const mazeGenerator = new MazeGenerator();
        mazeGenerator.generate();
        const generatedMaze = mazeGenerator.getMaze();
        setMaze(generatedMaze);

        // Wall removal logic
        const removeWalls = () => {
            const walls: { x: number; y: number }[] = [];
            const random = Math.random;
            for (let y = 1; y < SIZE - 1; y++) {
                for (let x = 1; x < SIZE - 1; x++) {
                    if (((x % 2 === 0 && y % 2 === 1) || (x % 2 === 1 && y % 2 === 0)) &&
                        generatedMaze.getCell(x, y) && random() < 0.1) { // Adjust probability if needed
                        walls.push({ x, y });
                        generatedMaze.setCell(x, y, false);
                    }
                }
            }
            setRemovedWalls(walls);
        };
        removeWalls();

        // Optionally, solve maze and set shortest path
        // const mazeSolver = new MazeSolver(generatedMaze);
        // if (mazeSolver.solve()) {
        //     setShortestPath(mazeSolver.getSolution().map(v => ({ x: v.x, y: v.y })));
        // }

    }, []);


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


    }, [playerPosition, playerTrail, shortestPath, drawPathFlag]);

    const drawMaze = (ctx: CanvasRenderingContext2D) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = 'black';
        for (let y = 0; y < SIZE; y++) {
            for (let x = 0; x < SIZE; x++) {
                if (maze.getCell(x, y)) {
                    ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                }
            }
        }
        ctx.fillStyle = 'cyan';
        ctx.fillRect(START_POSITION.x * CELL_SIZE, START_POSITION.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        ctx.fillStyle = 'green';
        ctx.fillRect(GOAL_POSITION.x * CELL_SIZE, GOAL_POSITION.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
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
        // const SIZE = maze.SIZE;
        // const GOAL_POSITION = maze.GOAL;

        if (newX >= 0 && newX < SIZE && newY >= 0 && newY < SIZE && !maze.getCell(newX, newY)) {
            setPlayerPosition({ x: newX, y: newY });
            setPlayerTrail(prevTrail => [...prevTrail, { x: newX, y: newY }]);
            if (newX === GOAL_POSITION.x && newY === GOAL_POSITION.y) {
                setDrawPathFlag(true);
                onFinish(); // ゴールに到達したときの処理
            }
        }
    };

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
                    setPlayerPosition(START_POSITION);
                    setPlayerTrail([START_POSITION]);

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