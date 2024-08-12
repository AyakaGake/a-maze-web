import Vector from "./Vector";

// pages/compornent/maze.tsx
export default class Maze {
    private cells: boolean[][];

    public static readonly SIZE: number = 31; // サイズを定義
    public static readonly CELL_SIZE = 20;
    public static readonly START: Vector = { x: 1, y: 1 }; // スタート位置
    public static readonly GOAL: Vector = { x: Maze.SIZE - 2, y: Maze.SIZE - 2 }; // ゴール位置
    public static readonly DIRECTIONS: Vector[] = [
        { x: 0, y: -1 }, // 上
        { x: 0, y: 1 },  // 下
        { x: -1, y: 0 }, // 左
        { x: 1, y: 0 }   // 右
    ];

    // コンストラクタ
    // Maze.ts
    constructor() {
        this.cells = Array.from({ length: Maze.SIZE }, () => Array(Maze.SIZE).fill(true));
    }

    // セルの取得
    public getCell(x: number, y: number): boolean {
        if (x < 0 || x >= Maze.SIZE || y < 0 || y >= Maze.SIZE) {
            throw new Error('Index out of bounds');
        }
        return this.cells[y][x];
    }

    // セルの設定
    public setCell(x: number, y: number, value: boolean): void {
        if (x < 0 || x >= Maze.SIZE || y < 0 || y >= Maze.SIZE) {
            throw new Error('Index out of bounds');
        }
        console.log(`Setting cell at x=${x}, y=${y} to ${value}`);
        this.cells[y][x] = value;
    }


    // public checkSuccess(state.position) { }

}
