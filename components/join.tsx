import supabase from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function Join() {
    const [playerName, setPlayerName] = useState<string>(''); // State for player name
    const [roomId, setRoomId] = useState<string>(''); // State for roomId
    const [error, setError] = useState<string | null>(null);
    const router = useRouter(); // Correctly get the router instance

    const handleSubmit = async () => {
        console.log("Join");

        const playerId = uuidv4();
        console.log("playerId: ", playerId);

        sessionStorage.setItem('playerName', playerName);
        sessionStorage.setItem('roomId', roomId);
        sessionStorage.setItem('playerId', playerId);
        sessionStorage.setItem('is_host', 'false');

        const { data: gameStatusData, error: statusError } = await supabase
            .from('maze-game-table')
            .select('game_status')
            .eq('room_id', roomId)
            .single();

        if (statusError) {
            console.error('Error fetching game status:', statusError);
            setError('Failed to fetch game status.');
            return;
        }

        if (!gameStatusData) {
            setError('Room not found.');
            return;
        }

        const { data: players, error: fetchError } = await supabase
            .from('game-player-table')
            .select('*')
            .eq('room_id', roomId);

        if (fetchError) {
            console.error('Error fetching players:', fetchError);
            setError('Failed to fetch players.');
            return;
        }

        console.log("Updated players: ", players);

        if (players.length >= 4) {
            setError('The room is full. You cannot join this game.');
            return;
        }

        if (!playerName.trim()) {
            setError('Please enter your display name.');
            return;
        }

        const colors = ['red', 'blue', 'green', 'purple'];
        const joinOrder = players.length + 1;
        console.log("joinOrder: ", joinOrder);
        const playerColor = colors[joinOrder - 1] || 'gray';
        console.log("playerColor: ", playerColor);
        sessionStorage.setItem('playerColor', playerColor);


        const gameStatus = gameStatusData.game_status;

        if (gameStatus === 'Waiting') {
            const { data, error: insertError, } = await supabase
                .from('game-player-table')
                .insert([
                    {
                        player_id: playerId,
                        room_id: roomId,
                        player_name: playerName,
                        created_at: new Date().toISOString(),
                        is_host: false,
                        player_color: playerColor
                    }
                ])
                .select();

            if (insertError) {
                console.error('Error inserting data to game_player_table:', insertError);
                setError('Failed to join the game.');
                return;
            }
            router.push(`/lobby/${roomId}`);
        } else if (gameStatus === 'In_progress') {
            setError("You can't join this room because it is in progress now.");
        } else if (gameStatus === 'Over') {
            router.push(`/ranking/${roomId}`);
        } else {
            setError('Unknown game status.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center border border-white rounded-lg p-4 bg-white w-80">
            <h2 className='text-red-900 font-medium text-lg text-center pb-2'>
                Join game
            </h2>
            <input
                type='text'
                placeholder='Enter room ID'
                className='text-gray-900 border border-gray-300 rounded bg-white p-2 w-full mb-4 text-gray-900 focus:border-gray-500'
                value={roomId}
                onChange={(ev) => setRoomId(ev.target.value)} // Update roomId state
            />
            <input
                type='text'
                placeholder='Enter your display name'
                className='text-gray-900 border border-gray-300 rounded bg-white p-2 w-full mb-4 text-gray-900 focus:border-red-700'
                value={playerName}
                onChange={(ev) => setPlayerName(ev.target.value)} // Update playerName state
            />
            {error && (
                <p className='text-red-600 mb-4'>{error}</p> // Display error message
            )}
            <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-red-600 rounded text-white hover:bg-red-700 w-full"
            >
                Submit
            </button>
        </div>
    );
}
