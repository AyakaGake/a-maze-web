import { Inter } from "next/font/google";
import Timer from "@/pages/compornent/timer";
import Ranking from "@/pages/compornent/ranking";
import MazeApplet from "@/pages/compornent/mazeapplet";
import { useEffect, useState } from "react";
import router, { useRouter } from 'next/router';
import { useSearchParams } from 'next/navigation'
import { supabase } from "@/utils/supabase";

const inter = Inter({ subsets: ["latin"] });

export default function Gameplay() {
    const [isGameOver, setIsGameOver] = useState<boolean>(false);
    const [playerName, setPlayerName] = useState<string | null>(null);
    const [playerId, setPlayerId] = useState<string | null>(null);

    const router = useRouter(); // Initialize useRouter hook
    const { roomId } = router.query;
    // const playerId = sessionStorage.getItem('playerId');

    // const searchParams = useSearchParams()

    // useEffect(() => {
    //     if (typeof window !== 'undefined') {
    //         const storedName = sessionStorage.getItem('playerName');
    //         setPlayerName(storedName || 'unknown'); // Default to 'unknown' if no value is found
    //     }
    // }, []);

    useEffect(() => {
        const storedName = sessionStorage.getItem('playerName');
        const storedId = sessionStorage.getItem('playerId');
        setPlayerName(storedName || 'unknown');
        setPlayerId(storedId || null);
    }, []);

    console.log('playerName', playerName)
    console.log('roomId', roomId)
    console.log('playerId', playerId)

    const handleFinish = async (clearTime: number) => {
        setIsGameOver(true);
        console.log('Game cleared in', clearTime, 'seconds');

        const { data, error } = await supabase
            .from('game-player-table')
            .update({
                clear_time: clearTime
            })
            .match({
                room_id: roomId,
                // player_id: playerId,
                // player_name: playerName
            });

        if (error) {
            console.error('Error saving clear time:', error);
        } else {
            console.log('Clear time saved successfully:', data);
        }
    };

    const handleHomeClick = () => {
        router.push('\/');
    };

    return (
        <div
            className={`relative flex h-screen flex-col items-center justify-center p-24 z-10000000  bg-custom-image`}
        >
            {/* <div className="background-overlay"></div> */}

            <MazeApplet roomId={roomId as string} onFinish={handleFinish} />

            {/* 右上にタイマー */}
            <Timer isGameOver={isGameOver} className="absolute top-4 right-4 z-30" />

            {/* 右下にランキング */}
            <Ranking className="absolute bottom-4 right-4 z-30" />

            {/* ホームスクリーンに戻るボタン */}
            <button
                type="button"
                onClick={handleHomeClick}
                className="absolute bottom-4 center-4 px-4 py-2 bg-red-600 rounded text-white hover:bg-red-700 z-100000"
            >
                Home
            </button>
            {/* プレイヤー名を左下に表示 */}
            <div
                className="absolute bottom-4 left-4 text-white font-bold mb-1 text-3xl z-30"
                style={{ zIndex: 20 }}
            >
                Player: {playerName}
            </div>
        </div>

    );
}

