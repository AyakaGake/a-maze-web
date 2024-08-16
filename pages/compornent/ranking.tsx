import { useEffect, useState } from 'react';

type Player = {
    player_name: string;
    clear_time: number;
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
                const response = await fetch(`/api/getRanking?roomId=${roomId}`);
                const result = await response.json();

                if (response.ok) {
                    console.log('Fetched players:', result.players); // デバッグ用
                    setPlayers(result.players || []);
                } else {
                    console.error('Error fetching ranking data:', result.error);
                }
            } catch (error) {
                console.error('Error fetching ranking data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRanking();
    }, [roomId]);

    if (loading) return <div>Loading...</div>;

    return (
        <div className={`flex flex-col items-center p-10 bg-white border border-gray-300 rounded-lg shadow-lg w-80 ${className}`}>
            <h2 className="text-xl font-medium text-gray-900 mb-4">Ranking</h2>
            <ul className="list-none p-0 text-gray-900">
                {players.length > 0 ? (
                    players.map((player, index) => (
                        <li key={index} className="flex justify-between items-center mb-2">
                            <span className="font-bold">{index + 1}. {player.player_name}</span>
                            <span className="ml-4">Time: {player.clear_time} seconds</span>
                        </li>
                    ))
                ) : (
                    <li>No players yet</li>
                )}
            </ul>
        </div>
    );
}
