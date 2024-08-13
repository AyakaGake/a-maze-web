import { Inter } from "next/font/google";
import Timer from "@/pages/compornent/timer";
import Ranking from "@/pages/compornent/ranking";
import MazeApplet from "@/pages/compornent/mazeapplet";
import { useState } from "react";

const inter = Inter({ subsets: ["latin"] });


export default function Gameplay() {
    const [isGameOver, setIsGameOver] = useState<boolean>(false)
    const [result, setResult] = useState<number>(0)
    const handleFinish = () => { setIsGameOver(true) }


    return (
        <main
            className={`relative flex min-h-screen flex-col items-center justify-center p-24 ${inter.className} bg-custom-image`}
        >
            <div className="background-overlay"></div>
            <div className="bg-shape-square"></div>
            {/* <div className="bg-shape-circle"></div> */}

            {/* 大きな白い四角 */}
            <MazeApplet onFinish={handleFinish} />

            {/* 右上にタイマー */}
            <Timer isGameOver={isGameOver} className="absolute top-4 right-4 z-30" />

            {/* 右下にランキング */}
            <Ranking className="absolute bottom-4 right-4 z-30" />
        </main>
    );
}
