// MazeGenerator.ts
import Vector from '@/pages/compornent/Vector';
import State from '@/pages/compornent/State';
import Maze from '@/pages/compornent/maze';
// import { assert } from '@/pages/compornent/assert'; // assert 関数をインポート

export class MazeGenerator {
    private maze: Maze;
    private stateVisitedFlags: boolean[][];
    private solution: Vector[];
    private random: () => number;

    constructor() {
        this.maze = new Maze();
        this.stateVisitedFlags = Array.from({ length: Maze.SIZE }, () => Array(Maze.SIZE).fill(false));
        this.solution = [];
        this.random = () => Math.random();
    }


    public getMaze(): Maze {
        return this.maze;
    }

    public getSolution(): Vector[] {
        return this.solution;
    }

    private record(moveDirection: Vector): void {
        this.solution.push(moveDirection);
    }

    private getRandomSequence(): number[] {
        const sequence = [0, 1, 2, 3];
        for (var i = 0; i < 4; i++) {
            sequence[i] = i;
        }
        for (let i = 0; i < 4; i++) {
            const r = Math.floor(this.random() * 4);
            if (r !== i) {
                var tmp = sequence[r];
                sequence[r] = sequence[i];
                sequence[i] = tmp;
            }
        }
        return sequence;
    }


    private dfSearch(state: State): boolean {
        var position = state.position;

        // この位置が既に訪問済みなら終了
        if (!this.stateVisitedFlags[position.x][position.y]) {
            return false;
        }

        // この位置を訪問済みにする
        this.stateVisitedFlags[position.x][position.y] = true;
        this.maze.setCell(position.x, position.y, false); // 壁を壊す
        let result = false;

        if (state.checkSuccess(Maze.START)) {
            result = true;
        }
        const randomSequence = this.getRandomSequence();
        for (var i = 0; i < 4; i++) {
            const moveDirection = Maze.DIRECTIONS[randomSequence[i]];
            const npx = position.x + moveDirection.x;
            const npy = position.y + moveDirection.y;

            // 新しい位置が迷路の範囲内であることを確認
            if (0 <= npx && npx < Maze.SIZE && 0 <= npy && npy < Maze.SIZE) {
                if (!this.stateVisitedFlags[npx][npy]) {
                    // 壁を壊す
                    const wallX = position.x + (moveDirection.x / 2);
                    const wallY = position.y + (moveDirection.y / 2);
                    this.maze.setCell(wallX, wallY, false);

                    // 新しい位置に進む
                    if (this.dfSearch(State.fromDirection(state, moveDirection))) {
                        this.record(moveDirection);
                        result = true;
                    }
                }
            }
        }

        return result;
    }

    public generate(): void {
        this.dfSearch(new State(Maze.GOAL));
    }
}