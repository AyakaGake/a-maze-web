import supabase from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function Mode() {
    const router = useRouter();
    const [selectedMode, setSelectedMode] = useState<string>('easy'); // Default to 'easy'
    const [playerName, setPlayerName] = useState<string>(''); // State for player name
    const [error, setError] = useState<string | null>(null); // State for error message

    const handleSubmit = async () => {
        if (!playerName.trim()) { // Check if playerName is empty
            setError('Please enter your display name.');
            return;
        }

        setError(null);
        const roomId = uuidv4();
        console.log("Start");
        const playerId = uuidv4();
        console.log("playerId: ", playerId);
        const playerColor = "red";
        console.log("playerColor: ", playerColor);

        sessionStorage.setItem('playerName', playerName);
        sessionStorage.setItem('selectedMode', selectedMode);
        sessionStorage.setItem('roomId', roomId);
        sessionStorage.setItem('playerId', playerId);
        sessionStorage.setItem('is_host', 'true');
        sessionStorage.setItem('playerColor', playerColor);

        const { data, error } = await supabase
            .from('game-player-table')
            .insert([
                {
                    player_id: playerId,
                    room_id: roomId,
                    player_name: playerName,
                    created_at: new Date().toISOString(),
                    is_host: true,
                    player_color: playerColor
                }
            ])
            .select();

        if (error) {
            console.error('Error inserting data to game_player_table:', error);
            setError('Failed to create the game. Please try again.');
            return;
        }

        router.push({
            pathname: `/lobby/${roomId}`,
        });
    };

    return (
        <div className="flex flex-col items-center justify-center border border-white rounded-lg p-4 bg-white w-full lg:w-80">
            <h2 className='text-red-900 font-medium text-lg text-center pb-2'>
                Host game
            </h2>
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
            <p className="mb-4 text-red-900">Please choose the mode</p>
            <div className="flex gap-4 mb-4">
                <label className="flex items-center text-red-900">
                    <input
                        type="radio"
                        name="mode"
                        value="easy"
                        checked={selectedMode === 'easy'} // Controlled radio button
                        onChange={(ev) => setSelectedMode(ev.target.value)}
                        className="mr-2" />
                    Easy
                </label>
                <label className="flex items-center text-red-900">
                    <input
                        type="radio"
                        name="mode"
                        value="hard"
                        checked={selectedMode === 'hard'} // Controlled radio button
                        onChange={(ev) => setSelectedMode(ev.target.value)}
                        className="mr-2" />
                    Hard
                </label>
                <label className="flex items-center text-red-900">
                    <input
                        type="radio"
                        name="mode"
                        value="super-hard"
                        checked={selectedMode === 'super-hard'} // Controlled radio button
                        onChange={(ev) => setSelectedMode(ev.target.value)}
                        className="mr-2" />
                    Super Hard
                </label>
            </div>
            <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-red-600 rounded text-white hover:bg-red-700 w-full"
            >
                Submit
            </button>
        </div>
    );
}
