import Image from "next/image";
import { Inter } from "next/font/google";
import { useEffect } from "react";
import { generateAndSaveMaze } from "../compornent/generateAndSaveMaze";


const inter = Inter({ subsets: ["latin"] });

export default function ForWaiting() {
    useEffect(() => {
        // Call the function to generate and save the maze when the component mounts
        const roomId = 'actual-room-id'; // Replace with actual room ID or fetch dynamically
        generateAndSaveMaze();
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
        </main>
    );
}
