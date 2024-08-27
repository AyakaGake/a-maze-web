import { useEffect, useState } from 'react';
import supabase from '../lib/supabaseClient';

type Player = {
    id: number;
    player_name: string;
    clear_time: number; // time in seconds
    player_color: string;
};

interface RankingProps {
    className?: string;
    roomId: string;
}

const UNCLEARED_TIME = 99 * 60 + 59;

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
        if (timeInSeconds >= UNCLEARED_TIME) return 'Not finished';

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
        <div className={`w-full md:w-96 bg-white rounded-lg shadow-lg p-6 ${className}`}>
            {/* <p className='text-center text-lg font-semibold mb-4'>Ranking:</p> */}
            <ul className='space-y-4'>
                {rankedPlayers.map(({ player, rank }) => (
                    <li
                        key={player.id}
                        className='flex items-center p-3 rounded-md shadow-md bg-gray-100'
                    >
                        <div
                            className={`w-12 h-12 flex items-center justify-center text-white rounded-full text-xl font-bold mr-3`}
                            style={{ backgroundColor: player.player_color || 'gray' }} // アイコンの背景色を設定
                        >
                            {rank} {/* ランキングの数字を表示 */}
                        </div>
                        <div className='flex-grow'>
                            <span className='text-gray-900 text-lg font-medium'>
                                {player.player_name}
                            </span>
                            <p className='text-sm text-gray-600'>
                                {player.clear_time >= UNCLEARED_TIME
                                    ? 'Not finished'
                                    : formatTime(player.clear_time)}
                            </p>
                        </div>
                    </li>
                ))}
            </ul>
            {/* <p className='text-center mt-4 text-lg font-semibold'>{rankedPlayers.length} players</p> */}
        </div>
    );
}
