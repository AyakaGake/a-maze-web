
import { MazeGenerator } from "@/pages/lib/mazegenerator";
import Vector from "@/pages/compornent/Vector";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// MazeGenerator インスタンスの作成とデータの取得
const generateAndSaveMaze = async (roomId: string) => {
    const mazeGenerator = new MazeGenerator();
    mazeGenerator.generate();
    const mazeData = mazeGenerator.getMazeMockData();

    // Vector クラスのインスタンスを JSON オブジェクトに変換するユーティリティ関数
    const serializeVector = (vector: Vector) => ({
        x: vector.x,
        y: vector.y
    });

    const serializedMazeData = {
        ...mazeData,
        start: serializeVector(mazeData.start),
        goal: serializeVector(mazeData.goal),
    };

    const mazeDataJson = JSON.stringify(serializedMazeData);

    // Supabase へのインサート
    const { data, error } = await supabase
        .from('maze-game-table')
        .insert([
            { room_id: roomId, maze_data: mazeDataJson },
        ])
        .select();

    if (error) {
        console.error('Error inserting maze data:', error);
    } else {
        console.log('Maze data inserted successfully:', data);
    }
};
