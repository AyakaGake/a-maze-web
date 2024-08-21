import supabase from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid'; // 正しくインポートする

export default function Join() {
    const [playerName, setPlayerName] = useState<string>(''); // State for player name
    const [roomId, setRoomId] = useState<string>(''); // State for roomId
    const router = useRouter(); // Correctly get the router instance

    const handleSubmit = async () => {
        console.log("Join");

        const playerId = uuidv4(); // uuidv4 を正しく使用
        console.log("playerId: ", playerId);

        sessionStorage.setItem('playerName', playerName);
        sessionStorage.setItem('roomId', roomId);
        sessionStorage.setItem('playerId', playerId);
        sessionStorage.setItem('is_host', 'false');

        const { data, error } = await supabase
            .from('game-player-table')
            .insert([
                {
                    player_id: playerId,
                    room_id: roomId,
                    player_name: playerName,
                    created_at: new Date().toISOString(),
                    is_host: false
                }
            ])
            .select();

        if (error) {
            console.error('Error inserting data to game_player_table:', error);
            return;
        }

        router.push({ pathname: `/lobby/${roomId}`, });
    };

    return (
        <div className="flex flex-col items-center justify-center border border-white rounded-lg p-4 bg-white w-80">
            <h2 className='text-red-900 font-medium text-lg text-center pb-2'>
                Join game
            </h2>
            <input
                type='text'
                placeholder='Enter room ID'
                className='border border-gray-300 rounded bg-white p-2 w-full mb-4 text-black-800 focus:border-gray-500'
                value={roomId}
                onChange={(ev) => setRoomId(ev.target.value)} // Update roomId state
            />
            <input
                type='text'
                placeholder='Enter your display name'
                className='border border-gray-300 rounded bg-white p-2 w-full mb-4 text-black-900 focus:border-red-700'
                value={playerName}
                onChange={(ev) => setPlayerName(ev.target.value)} // Update playerName state
            />
            <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-red-600 rounded text-white hover:bg-red-700 w-full"
            >
                Submit
            </button>
        </div>
    );
}
