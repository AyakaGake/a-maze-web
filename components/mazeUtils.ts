import Vector from '@/components/Vector';

// Vector クラスのインスタンスを JSON オブジェクトに変換するユーティリティ関数
export const serializeVector = (vector: Vector) => ({
  x: vector.x,
  y: vector.y,
});

// JSON から Vector クラスのインスタンスに変換するユーティリティ関数
export const deserializeVector = (vector: { x: number; y: number }) =>
  new Vector(vector.x, vector.y);

// Supabase から取得した maze_data を復元するユーティリティ関数
export const parseMazeData = (mazeDataJson: string) => {
  const mazeData = JSON.parse(mazeDataJson);

  return {
    size: mazeData.size,
    cellSize: mazeData.cellSize,
    start: deserializeVector(mazeData.start),
    goal: deserializeVector(mazeData.goal),
    cells: mazeData.cells,
  };
};
