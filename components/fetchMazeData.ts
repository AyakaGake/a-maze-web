import supabase from '../lib/supabaseClient';
// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
// const supabase = createClient(supabaseUrl, supabaseKey);

export const fetchMazeData = async (roomId: string) => {
    const { data, error } = await supabase
        .from('maze-game-table')
        .select('maze_data')
        .eq('room_id', roomId)
        .single();

    if (error) {
        console.error('Error fetching maze data:', error);
        return null;
    }

    // データのパース
    const mazeData = JSON.parse(data.maze_data);

    // mazeData をデバッグ用にログ出力
    console.log('Parsed maze data:', mazeData);

    // 必要な形式に変換して返す
    return {
        cells: mazeData.cells.cells, // cells フィールドにアクセス
        size: mazeData.cells.size, // サイズを設定
        cellSize: mazeData.cells.cellSize, // セルサイズを設定
        goal: mazeData.cells.goal, // ゴールの位置を設定
        start: mazeData.start,
    };
};
