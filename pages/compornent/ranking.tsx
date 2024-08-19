import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';

type Player = {
    id: number;
    player_name: string;
    clear_time: number; // time in seconds
};

interface RankingProps {
    className?: string;
    roomId: string;
}

export default function Ranking({ className, roomId }: RankingProps) {
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchRanking = async () => {
            try {
                const { data, error } = await supabase
                    .from('game-player-table') // テーブル名を確認してください
                    .select('*')
                    .eq('room_id', roomId)
                    .order('clear_time', { ascending: true });
                if (error) {
                    throw error;
                }

                setPlayers(data || []);
            } catch (error) {
                console.error('Error fetching ranking data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRanking();
    }, [roomId]);

    const formatTime = (timeInSeconds: number): string => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        return `${minutes}m ${seconds}s`;
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className={`flex flex-col items-center p-10 bg-white border border-gray-300 rounded-lg shadow-lg w-80 ${className}`}>
            <h2 className="text-xl font-medium text-gray-900 mb-4">Ranking</h2>
            <ul className="list-none p-0 text-gray-900">
                {players.length > 0 ? (
                    players.map((player, index) => (
                        <li key={index} className="flex justify-between items-center mb-2">
                            <span className="font-bold">{index + 1}. {player.player_name}</span>
                            <span className="ml-4">Time: {formatTime(player.clear_time)}</span>
                        </li>
                    ))
                ) : (
                    <li>No players yet</li>
                )}
            </ul>
        </div>
    );
}
