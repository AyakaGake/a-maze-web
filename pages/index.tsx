import Image from 'next/image';
import { Inter } from 'next/font/google';
import Mode from '../components/mode';
import Join from '../components/join';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-center p-24 ${inter.className}  bg-custom-image`}
    >
      <div className='background-overlay'></div>
      <h1 className='text-white text-5xl mb-5 z-30'>A-Maze!!!</h1>
      {/* <div className='bg-shape-square'></div> */}
      {/* <div className='bg-shape-circle'></div> */}
      <div className='w-full md:w-96 h-fit flex flex-col bg-white rounded shadow-lg gap-4 p-6 z-30'>
        <Mode />
        <Join />
      </div>
    </main>
  );
}
