// MazeSolver.ts
import Maze from '@/pages/compornent/maze';
import Vector from '@/pages/compornent/Vector';


export default class MazeSolver {
    private maze: Maze; // 迷路
    private stateDepths: number[][]; // 過去に訪問したときの深さ
    private solution: Vector[]; // スタートからゴールまでの経路

    constructor(maze: Maze) {
        this.maze = maze;
        this.stateDepths = Array(Maze.SIZE).fill(null).map(() => Array(Maze.SIZE).fill(Number.MAX_SAFE_INTEGER));
        this.solution = [];
    }

    // スタートからゴールまでの経路を返す
    public getSolution(): Vector[] {
        return this.solution;
    }

    // 経路の途中の移動方向を記録する
    private record(moveDirection: Vector) {
        this.solution.push(moveDirection);
    }

    // 反復深化法を実行する
    private idSearch(state: MazeState, depth: number, currentLimit: number): boolean {
        const { x, y } = state.position;

        if (depth < this.stateDepths[x][y]) {
            this.stateDepths[x][y] = depth;
            if (this.maze.checkSuccess(state.position)) {
                return true;
            }
            if (depth === currentLimit) {
                return false;
            }
            for (const direction of Maze.DIRECTIONS) {
                const npx = state.position.x + direction.x;
                const npy = state.position.y + direction.y;
                if (npx >= 0 && npx < Maze.SIZE && npy >= 0 && npy < Maze.SIZE) {
                    const kavex = state.position.x + direction.x / 2;
                    const kavey = state.position.y + direction.y / 2;
                    if (!this.maze.getCell(kavex, kavey)) {
                        const newState = MazeState.fromState(state, direction);
                        if (this.idSearch(newState, depth + 1, currentLimit)) {
                            this.record(direction);
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    // 最短経路を求める
    public solve(): boolean {
        const depthLimit = (Maze.SIZE - 1) * (Maze.SIZE - 1) / 4 - 1;
        for (let l = 0; l <= depthLimit; l++) {
            this.stateDepths = Array(Maze.SIZE).fill(null).map(() => Array(Maze.SIZE).fill(Number.MAX_SAFE_INTEGER));
            if (this.idSearch(new MazeState(Maze.START), 0, l)) {
                return true;
            }
        }
        return false;
    }
}
