import { createClient } from '@supabase/supabase-js';
import { serializeVector } from '@/components/mazeUtils';
import Vector from './Vector';
import { MazeGenerator } from '../lib/mazegenerator';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export const generateAndSaveMaze = async (mode: string, roomId: string) => {
  console.log('Selected Mode(genrateAndSave):', mode);
  const mazeGenerator = new MazeGenerator(mode); // モードを指定
  mazeGenerator.generate();

  const mazeData = mazeGenerator.getMazeMockData();

  // 迷路データを JSON 形式に変換
  const serializedMazeData = {
    start: serializeVector(mazeData.start),
    goal: serializeVector(mazeData.goal),
    cells: mazeData.cells,
  };

  const mazeDataJson = JSON.stringify(serializedMazeData);

  // Supabase に保存
  const { data, error } = await supabase
    .from('maze-game-table')
    .insert([{ room_id: roomId, maze_data: mazeDataJson }])
    .select();

  if (error) {
    console.error('Error inserting maze data:', error);
  } else {
    console.log('Maze data inserted successfully:', data);
  }
};
