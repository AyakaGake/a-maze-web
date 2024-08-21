import { useEffect, useState } from 'react';
import supabase from '../lib/supabaseClient';

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

    const getRankedPlayers = (players: Player[]): { player: Player, rank: number }[] => {
        const sortedPlayers = [...players];
        sortedPlayers.sort((a, b) => a.clear_time - b.clear_time);

        const rankedPlayers = [];
        let currentRank = 1;
        let lastTime = -1;
        for (const player of sortedPlayers) {
            if (player.clear_time !== lastTime) {
                currentRank = rankedPlayers.length + 1;
            }
            rankedPlayers.push({ player, rank: currentRank });
            lastTime = player.clear_time;
        }
        return rankedPlayers;
    };

    if (loading) return <div>Loading...</div>;
    const rankedPlayers = getRankedPlayers(players);

    return (
        <div className={`flex flex-col items-center p-10 bg-white border border-gray-300 rounded-lg shadow-lg w-80 ${className}`}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Ranking</h2>
            <ul className="list-none p-0 text-gray-900 w-full">
                {rankedPlayers.length > 0 ? (
                    rankedPlayers.map(({ player, rank }) => (
                        <li key={player.id} className="flex justify-between items-center mb-3 p-2 border-b border-gray-200">
                            <span className="font-extrabold text-lg text-red-600">{rank}. {player.player_name}</span>
                            <span className="ml-4 text-lg font-semibold text-gray-800">Time: {formatTime(player.clear_time)}</span>
                        </li>
                    ))
                ) : (
                    <li className="text-gray-500">No players yet</li>
                )}
            </ul>
        </div>
    );
}
