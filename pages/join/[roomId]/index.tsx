import Image from 'next/image';
import { Inter } from 'next/font/google';
import Join2 from '@/components/join2';


const inter = Inter({ subsets: ['latin'] });

export default function Home() {
    return (
        <main
            className={`flex min-h-screen flex-col items-center justify-center p-6 ${inter.className}  bg-custom-image`}
        >
            <div className='background-overlay'></div>
            <h1 className='text-white text-5xl mb-5 z-30'>Join Game</h1>
            <div className='w-full md:w-96 h-fit flex flex-col bg-white rounded shadow-lg gap-4  p-6 z-30'>
                <Join2 />
            </div>
        </main>
    );
}
