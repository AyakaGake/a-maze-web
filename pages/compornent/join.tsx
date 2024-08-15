import { useRouter } from 'next/router';
import { useState } from 'react';

export default function Join() {
    const [playerName, setPlayerName] = useState<string>(''); // State for player name
    const router = useRouter(); // Correctly get the router instance

    const handleSubmit = () => {
        console.log("Join");
        const roomId = '2ee29d88-44d1-4b6e-a92c-ace66ba20982'; // Example roomId

        // Store player name and roomId in sessionStorage
        sessionStorage.setItem('playerName', playerName);
        sessionStorage.setItem('roomId', roomId); // Store roomId

        // Navigate to gameplay page with roomId
        router.push(`/gameplay/${roomId}`);
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
            // If you want to capture roomId from input, use state here
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
