import { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../lib/supabaseClient'; // Note the relative path


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { roomId } = req.query;

    if (typeof roomId !== 'string') {
        return res.status(400).json({ error: 'Room ID is required' });
    }

    try {
        const { data, error } = await supabase
            .from('game_player_table') // Ensure this is your table name
            .select('*')
            .eq('room_id', roomId)
            .order('clear_time', { ascending: true });

        if (error) {
            throw error;
        }

        res.status(200).json({ players: data });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
