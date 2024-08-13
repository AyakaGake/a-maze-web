import Vector from "./Vector";
import State from '@/pages/compornent/State'

export default class Maze {
    private cells: boolean[][];
    private removedWalls: Vector[] = []; // List to store removed walls

    public static readonly SIZE: number = 31; // サイズを定義
    public static readonly CELL_SIZE = 20;
    public static readonly START: Vector = { x: 1, y: 1 }; // スタート位置
    public static readonly GOAL: Vector = new Vector(Maze.SIZE - 2, Maze.SIZE - 2); // ゴール位置
    // public static readonly GOAL: Vector = new Vector((Maze.SIZE - 1) / 2, (Maze.SIZE - 1) / 2); // ゴール位置
    public static readonly UP: Vector = new Vector(0, -2); // 上向きベクトル
    public static readonly RIGHT: Vector = new Vector(2, 0); // 右向きベクトル
    public static readonly DOWN: Vector = new Vector(0, 2); // 下向きベクトル
    public static readonly LEFT: Vector = new Vector(-2, 0); // 左向きベクトル
    public static readonly DIRECTIONS: Vector[] = [Maze.UP, Maze.RIGHT, Maze.DOWN, Maze.LEFT]; // 4方向

    // コンストラクタ
    // constructor() {
    //     // SIZE x SIZE の 2D 配列を初期化、すべてのセルに壁があるとする
    //     this.cells = Array.from({ length: Maze.SIZE }, () => Array(Maze.SIZE).fill(true));

    //     // 外周と奇数座標のセルに壁を配置する
    //     for (let y = 0; y < Maze.SIZE; y++) {
    //         for (let x = 0; x < Maze.SIZE; x++) {
    //             if (x === 0 || x === Maze.SIZE - 1 || y === 0 || y === Maze.SIZE - 1 || !(x % 2 === 1 && y % 2 === 1)) {
    //                 this.cells[y][x] = true; // Wall
    //             } else {
    //                 this.cells[y][x] = false; // Passage
    //             }
    //         }
    //     }
    // }

    constructor() {
        // SIZE x SIZE の 2D 配列を初期化、すべてのセルに壁があるとする
        this.cells = Array.from({ length: Maze.SIZE }, () => Array(Maze.SIZE).fill(true));

        // 外周と奇数座標のセルに壁を配置する
        for (let y = 0; y < Maze.SIZE; y++) {
            for (let x = 0; x < Maze.SIZE; x++) {
                this.cells[y][x] = x == 0 || x == Maze.SIZE - 1 || y == 0 ||
                    y == Maze.SIZE - 1 || !(x % 2 == 1 && y % 2 == 1);
            }
        }
    }





    // private initializeWalls(): void {
    //     for (let y = 0; y < Maze.SIZE; y++) {
    //         for (let x = 0; x < Maze.SIZE; x++) {
    //             if (x === 0 || x === Maze.SIZE - 1 || y === 0 || y === Maze.SIZE - 1 || !(x % 2 === 1 && y % 2 === 1)) {
    //                 this.cells[y][x] = true; // Wall
    //             } else {
    //                 this.cells[y][x] = false; // Passage
    //             }
    //         }
    //     }
    // }

    private removeWallsAtRandom(): void {
        this.removedWalls = []; // Clear previously removed walls
        const random = Math.random;

        for (let y = 1; y < Maze.SIZE - 1; y++) {
            for (let x = 1; x < Maze.SIZE - 1; x++) {
                if (((x % 2 === 0 && y % 2 === 1) ||
                    (x % 2 === 1 && y % 2 === 0)) &&
                    this.cells[y][x] && random() < 0.01) { // 1% chance
                    this.removedWalls.push({ x, y });
                    this.cells[y][x] = false; // Remove wall
                }
            }
        }
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
        this.cells[y][x] = value;
    }

    // 現在の位置がゴールに到達したかをチェックする
    public checkSuccess(position: Vector): boolean {
        return position.x === Maze.GOAL.x && position.y === Maze.GOAL.y;
    }

    public getRemovedWalls(): Vector[] {
        return this.removedWalls;
    }
}
