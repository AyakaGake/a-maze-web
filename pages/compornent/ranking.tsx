import { useState } from 'react';
import Timer from './timer';

type Player = {
    name: string;
    score: number;
    time: string; // 追加: プレイヤーの時間
};

interface RankingProps {
    className?: string; // optional className prop
}

export default function Ranking({ className }: RankingProps) {
    const [players, setPlayers] = useState<Player[]>([]);

    const addPlayer = (name: string, score: number, time: string) => {
        setPlayers(prevPlayers => [...prevPlayers, { name, score, time }]);
    };

    // スコアで降順ソート
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

    return (
        <div className={`flex flex-col items-center p-10 bg-white border border-gray-300 rounded-lg shadow-lg w-80 ${className}`}>
            <h2 className="text-xl font-medium text-gray-900 mb-4">Ranking</h2>
            <ul className="list-none p-0 text-gray-900">
                {sortedPlayers.map((player, index) => (
                    <li key={index} className="flex justify-between items-center mb-2">
                        <span className="font-bold">{index + 1}. {player.name}</span>
                        <span className="ml-4">Time: {player.time}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
