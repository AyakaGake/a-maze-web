// pages/compornent/State.tsx
import Vector from '@/pages/compornent/Vector';

export default class State {
    public position: Vector;

    constructor(position: Vector) {
        this.position = position;
    }

    public static fromDirection(state: State, direction: Vector): State {
        const newPos = {
            x: state.position.x + direction.x,
            y: state.position.y + direction.y
        };
        return new State(newPos);
    }

    public checkSuccess(goal: Vector): boolean {
        return this.position.x === goal.x && this.position.y === goal.y;
    }
}
