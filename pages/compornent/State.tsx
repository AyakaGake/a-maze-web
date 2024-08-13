// pages/compornent/State.ts
import Vector from "./Vector";

export default class State {
    public position: Vector;

    constructor(position: Vector) {
        this.position = position;
    }

    // constructor(public position: Vector) { }
    // public position: Vector;

    // constructor(position: Vector);
    // constructor(state: State, direction: Vector);
    // constructor(arg1: Vector | State, direction?: Vector) {
    //     if (direction !== undefined) {
    //         // This constructor is for creating a new state from an existing state and direction
    //         const state = arg1 as State;
    //         const moveDirection = direction;
    //         this.position = {
    //             x: state.position.x + moveDirection.x,
    //             y: state.position.y + moveDirection.y
    //         };
    //     } else {
    //         // This constructor is for creating a state with a specific position
    //         this.position = arg1 as Vector;
    //     }
    // }

    // Method to check if the state has reached the goal

    // Method to check if the state has reached the goal
    public checkSuccess(success: Vector): boolean {
        return this.position.x === success.x && this.position.y === success.y;
    }

    // Static method to create a new State from an existing state and a direction
    public static fromDirection(state: State, direction: Vector): State {
        // Calculate the new position by applying the direction
        const newPosition = new Vector(
            state.position.x + direction.x,
            state.position.y + direction.y
        );
        // Return a new State with the new position
        return new State(newPosition);
    }

    // public checkSuccess(success: Vector): boolean {
    //     return this.position.x === success.x && this.position.y === success.y;
    // }

    // // Static method to create a new State from a direction
    // public static fromDirection(state: State, direction: Vector): State {
    //     return new State(
    //         new Vector(state.position.x + direction.x, state.position.y + direction.y)
    //     );
    // }
}
