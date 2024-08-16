import Image from "next/image";
import { Inter } from "next/font/google";
import { useEffect } from "react";
import { generateAndSaveMaze } from "../../compornent/generateAndSaveMaze";
import { useRouter } from 'next/router';


const inter = Inter({ subsets: ["latin"] });

export default function Lobby() {
    const router = useRouter();
    const { roomId } = router.query;

    const handleSubmit = () => {
        console.log("Start");

        // Store player name and roomId in sessionStorage
        // sessionStorage.setItem('playerName', playerName);
        // sessionStorage.setItem('roomId', roomId); // Store roomId

        // Navigate to gameplay page with roomId
        router.push(`/gameplay/${roomId}`);
    };

    useEffect(() => {
        // Call the function to generate and save the maze when the component mounts
        // const roomId = 'actual-room-id'; // Replace with actual room ID or fetch dynamically

        const mode = sessionStorage.getItem('selectedMode') || 'easy'; // Default to 'easy' if not found
        //ここでは、正しくmodeを入手することができている。
        console.log("Selected Mode:", mode); // Debug log

        if (typeof roomId === 'string') {
            generateAndSaveMaze(mode, roomId); // Pass mode and roomId to the function
        }
    }, []);

    return (
        <main
            className={`flex min-h-screen flex-col items-center justify-center p-24 ${inter.className} bg-custom-image`}
        >
            <div className="background-overlay"></div>
            <h1 className='text-white text-4xl mb-5 z-30'>A-Maze!!!</h1>
            <div className='w-full md:w-96 h-fit flex flex-col bg-white rounded shadow-lg gap-4 p-6 z-30'>
                Wait while we generate your maze...
            </div>
            <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-red-600 rounded text-white hover:bg-red-700 w-full"
            >
                Start Game
            </button>
        </main>
    );
}
