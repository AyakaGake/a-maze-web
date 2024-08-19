// Vector.ts
export default class Vector {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    // Vector を JSON 形式のオブジェクトに変換するメソッド
    toJSON(): { x: number, y: number } {
        return { x: this.x, y: this.y };
    }

    // JSON 形式のオブジェクトから Vector を生成する静的メソッド
    static fromJSON(json: { x: number, y: number }): Vector {
        return new Vector(json.x, json.y);
    }
}
