import Vector from "./Vector";

export default class Maze {
    private cells: boolean[][];
    private removedWalls: Vector[] = []; // List to store removed walls

    public static readonly DEFAULT_SIZE: number = 31;
    public static readonly DEFAULT_CELL_SIZE: number = 20;
    public static readonly START: Vector = new Vector(1, 1); // スタート位置
    public static readonly DEFAULT_GOAL: Vector = new Vector(Maze.DEFAULT_SIZE - 2, Maze.DEFAULT_SIZE - 2); // ゴール位置
    public static readonly UP: Vector = new Vector(0, -2); // 上向きベクトル
    public static readonly RIGHT: Vector = new Vector(2, 0); // 右向きベクトル
    public static readonly DOWN: Vector = new Vector(0, 2); // 下向きベクトル
    public static readonly LEFT: Vector = new Vector(-2, 0); // 左向きベクトル
    public static readonly DIRECTIONS: Vector[] = [Maze.UP, Maze.RIGHT, Maze.DOWN, Maze.LEFT]; // 4方向

    private size: number;
    private cellSize: number;
    private goal: Vector;

    constructor(size: number = Maze.DEFAULT_SIZE, cellSize: number = Maze.DEFAULT_CELL_SIZE, mode?: string) {
        switch (mode) {
            case 'easy':
                this.size = 31;
                this.cellSize = 10;
                this.goal = new Vector(this.size - 2, this.size - 2);
                break;
            case 'hard':
                this.size = 51;
                this.cellSize = 13;
                this.goal = new Vector(this.size - 2, this.size - 2);
                break;
            case 'super-hard':
                this.size = 71;
                this.cellSize = 10;
                this.goal = new Vector(this.size - 2, this.size - 2);
                break;
            default:
                this.size = size;
                this.cellSize = cellSize;
                this.goal = new Vector(this.size - 2, this.size - 2);
                break;
        }

        // SIZE x SIZE の 2D 配列を初期化、すべてのセルに壁があるとする
        this.cells = Array.from({ length: this.size }, () => Array(this.size).fill(true));
        console.log(this.cells);

        // 外周と奇数座標のセルに壁を配置する
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                this.cells[y][x] = x == 0 || x == this.size - 1 || y == 0 ||
                    y == this.size - 1 || !(x % 2 == 1 && y % 2 == 1);
            }
        }
    }

    // セルの取得
    public getCell(x: number, y: number): boolean {
        if (x < 0 || x >= this.size || y < 0 || y >= this.size) {
            throw new Error('Index out of bounds');
        }
        return this.cells[y][x];
    }

    // セルの設定
    public setCell(x: number, y: number, value: boolean): void {
        if (x < 0 || x >= this.size || y < 0 || y >= this.size) {
            throw new Error('Index out of bounds');
        }
        this.cells[y][x] = value;
    }

    // 現在の位置がゴールに到達したかをチェックする
    public checkSuccess(position: Vector): boolean {
        return position.x === this.goal.x && position.y === this.goal.y;
    }

    // スタート位置を取得するメソッドを追加
    public getStart(): Vector {
        return Maze.START;
    }

    public getRemovedWalls(): Vector[] {
        return this.removedWalls;
    }

    public getSize(): number {
        return this.size;
    }

    public getCellSize(): number {
        return this.cellSize;
    }

    public getGoal(): Vector {
        return this.goal;
    }

    public getWidth() {
        return this.size * this.cellSize;
    }

    public getHeight() {
        return this.size * this.cellSize;
    }
}
