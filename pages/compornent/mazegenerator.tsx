// MazeGenerator.ts
import Vector from '@/pages/compornent/Vector';
import State from '@/pages/compornent/State';
import Maze from '@/pages/compornent/maze';

export class MazeGenerator {
    private maze: Maze;
    private stateVisitedFlags: boolean[][];
    private solution: Vector[];
    private random: () => number;

    constructor(mode?: string) {
        this.maze = new Maze(0, 0, mode);
        this.stateVisitedFlags = Array.from({ length: this.maze.getSize() }, () => Array(this.maze.getSize()).fill(false));
        this.solution = [];
        this.random = () => Math.random();
    }

    public getSolution(): Vector[] {
        return this.solution;
    }

    public getMaze(): Maze {
        return this.maze;
    }

    public getSize(): number {
        return this.maze.getSize();
    }

    public getCellSize(): number {
        return this.maze.getCellSize();
    }

    public getStart(): Vector {
        return this.maze.getStart();
    }

    public getGoal(): Vector {
        return this.maze.getGoal();
    }

    public getRemovedWalls(): Vector[] {
        return this.maze.getRemovedWalls();
    }

    private record(moveDirection: Vector): void {
        this.solution.push(moveDirection);
    }

    private getRandomSequence(): number[] {
        var sequence = [0, 1, 2, 3];
        for (var i = 0; i < 4; i++) {
            sequence[i] = i;
        }
        for (var i = 0; i < 4; i++) {
            var r = Math.floor(this.random() * 4);
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

        if (position.x < 0 || position.x >= this.maze.getSize() || position.y < 0 || position.y >= this.maze.getSize()) {
            return false;
        }

        // この位置が既に訪問済みなら終了
        if (this.stateVisitedFlags[position.x][position.y]) {
            return false;
        }

        // この位置を訪問済みにする
        this.stateVisitedFlags[position.x][position.y] = true;
        // this.maze.setCell(position.x, position.y, false); // 壁を壊す
        let result = false;

        if (state.checkSuccess(Maze.START)) {
            result = true;
        }

        var randomSequence = this.getRandomSequence();

        for (var i = 0; i < 4; i++) {
            var moveDirection = Maze.DIRECTIONS[randomSequence[i]];
            var npx = position.x + moveDirection.x;
            var npy = position.y + moveDirection.y;

            // 新しい位置が迷路の範囲内であることを確認
            if (0 <= npx && npx < this.maze.getSize() && 0 <= npy && npy < this.maze.getSize()) {
                if (!this.stateVisitedFlags[npx][npy]) {
                    // 壁を壊す
                    var wallX = position.x + (moveDirection.x / 2);
                    var wallY = position.y + (moveDirection.y / 2);
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
        this.dfSearch(new State(this.maze.getGoal()));
    }

    public getMazeMockData(): any {
        return {
            size: this.maze.getSize(),
            cellSize: this.maze.getCellSize(),
            start: this.maze.getStart(), // スタート位置を取得
            goal: this.maze.getGoal(), // ゴール位置を取得
            cells: this.maze // 迷路の状態（壁が削除された位置など）
        };
    }
}