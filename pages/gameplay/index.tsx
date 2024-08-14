import { Inter } from "next/font/google";
import Timer from "@/pages/compornent/timer";
import Ranking from "@/pages/compornent/ranking";
import MazeApplet from "@/pages/compornent/mazeapplet";
import { useState } from "react";
import router, { useRouter } from 'next/router';
import { useSearchParams } from 'next/navigation'

const inter = Inter({ subsets: ["latin"] });

export default function Gameplay() {
    const [isGameOver, setIsGameOver] = useState<boolean>(false);
    const [result, setResult] = useState<number>(0);
    const router = useRouter(); // Initialize useRouter hook
    const searchParams = useSearchParams()

    const mode = searchParams.get('mode') || 'easy'; // Default to 'easy' if mode is not available
    console.log('mode', mode)

    const handleFinish = () => {
        setIsGameOver(true);
    };

    const handleHomeClick = () => {
        // console.log('aaa');
        router.push('/');
    };

    return (
        <div
            className={`relative flex h-screen flex-col items-center justify-center p-24 z-10000000  bg-custom-image`}
        >
            {/* <div className="background-overlay"></div> */}

            {/* 大きな白い四角 */}
            <MazeApplet mode={mode} onFinish={handleFinish} />

            {/* 右上にタイマー */}
            <Timer isGameOver={isGameOver} className="absolute top-4 right-4 z-30" />

            {/* 右下にランキング */}
            <Ranking className="absolute bottom-4 right-4 z-30" />

            {/* ホームスクリーンに戻るボタン */}
            <button type="button"
                onClick={handleHomeClick}
                className="absolute bottom-4 center-4 px-4 py-2 bg-red-600 rounded text-white hover:bg-red-700 z-100000"
            >
                Home
            </button>
        </div>

    );
}

