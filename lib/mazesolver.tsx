// // MazeSolver.ts
// import Maze from '@/pages/compornent/maze';
// import Vector from '@/pages/compornent/Vector';
// import State from './State';


// export default class MazeSolver {
//     private maze: Maze; // 迷路
//     private stateDepths: number[][]; // 過去に訪問したときの深さ
//     private solution: Vector[]; // スタートからゴールまでの経路

//     constructor(maze: Maze) {
//         this.maze = maze;
//         this.stateDepths = Array(Maze.SIZE).fill(null).map(() => Array(Maze.SIZE).fill(Number.MAX_SAFE_INTEGER));
//         this.solution = [];
//     }

//     // スタートからゴールまでの経路を返す
//     public getSolution(): Vector[] {
//         return this.solution;
//     }

//     // 経路の途中の移動方向を記録する
//     private record(moveDirection: Vector) {
//         this.solution.push(moveDirection);
//     }

//     // 反復深化法を実行する
//     private idSearch(state: State, depth: number, currentLimit: number): boolean {
//         // Check and update depth
//         const pos = state.position; // Directly access the position property
//         if (depth < this.stateDepths[pos.x][pos.y]) {
//             this.stateDepths[pos.x][pos.y] = depth;

//             // Check if the goal is reached
//             if (state.checkSuccess(Maze.GOAL)) {
//                 return true;
//             }

//             // If depth limit reached, return false
//             if (depth === currentLimit) {
//                 return false;
//             }

//             // Explore all directions
//             for (let i = 0; i < Maze.DIRECTIONS.length; i++) {
//                 const direction = Maze.DIRECTIONS[i];
//                 const npx = pos.x + direction.x;
//                 const npy = pos.y + direction.y;
//                 if (0 <= npx && npx <= Maze.SIZE && 0 <= npy && npy <= Maze.SIZE) {
//                     const wallx = pos.x + (direction.x / 2);
//                     const wally = pos.y + (direction.y / 2);
//                     // Check bounds and wall
//                     if (!this.maze.getCell(wallx, wally)) {
//                         const newState = State.fromDirection(state, direction);
//                         if (this.idSearch(newState, depth + 1, currentLimit)) {
//                             this.record(direction); // Ensure this method exists
//                             return true;
//                         }
//                     }
//                 }
//             }
//         }
//         return false;
//     }


//     // 最短経路を求める
//     public solve(): boolean {
//         const depthLimit = (Maze.SIZE - 1) * (Maze.SIZE - 1) / 4 - 1;
//         for (let l = 0; l <= depthLimit; l++) {
//             for (var x = 1; x < Maze.SIZE; x += 2) {
//                 for (var y = 1; y < Maze.SIZE; y += 2) {
//                     this.stateDepths = Array(Maze.SIZE).fill(null).map(() => Array(Maze.SIZE).fill(Number.MAX_SAFE_INTEGER));
//                 }
//             }
//             if (this.idSearch(new State(Maze.START), 0, l)) {
//                 return true;
//             }
//         }
//         return false;
//     }
// }

