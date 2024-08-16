import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabase'; // Supabase クライアントのインポート

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { roomId } = req.query;

    // roomId の型チェックと変換
    if (typeof roomId !== 'string') {
        return res.status(400).json({ error: 'Room ID is required' });
    }

    try {
        const { data, error } = await supabase
            .from('game_player_table') // テーブル名を確認してください
            .select('*')
            .eq('room_id', roomId)
            .order('clear_time', { ascending: true }); // clear_time で昇順ソート

        if (error) {
            throw error;
        }

        res.status(200).json({ players: data });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
