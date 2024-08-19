// MazeState.ts
import Vector from '@/components/Vector';

export default class MazeState {
  position: Vector;

  constructor(position: Vector) {
    this.position = position;
  }

  static fromState(state: MazeState, moveDirection: Vector): MazeState {
    return new MazeState(
      new Vector(
        state.position.x + moveDirection.x,
        state.position.y + moveDirection.y
      )
    );
  }
}
