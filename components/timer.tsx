import { useState, useEffect } from 'react';

interface TimerProps {
    isGameOver: boolean;
    isGiveUp: boolean;
    className?: string; // optional className prop
    // onGameClear?: (time: number) => void; // コールバック関数の追加
}

export default function Timer({ isGameOver, isGiveUp, className }: TimerProps) {
    const [seconds, setSeconds] = useState<number>(0);
    const [isActive, setIsActive] = useState<boolean>(true);

    useEffect(() => {
        let timer: NodeJS.Timeout | undefined;

        if (isActive && !isGameOver) {
            timer = setInterval(() => {
                setSeconds(prevSeconds => prevSeconds + 1);
            }, 1000);
        } else {
            clearInterval(timer);
            setIsActive(false);
        }

        return () => {

            clearInterval(timer);

        };
    }, [isActive, isGameOver]);

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    // console.log(`gameover: ${formatTime(seconds)}`);

    const getTextColor = () => {
        if (isGiveUp) return 'text-red-700'; // Red color for Give Up
        if (isGameOver) return 'text-green-500'; // Green color for Game Clear
        return 'text-white'; // Default color
    };

    return (
        <div className={`text-3xl font-bold mb-1 ${getTextColor()} ${className}`}>
            {isGiveUp ? 'Give Up' : isGameOver ? `Game clear: ${formatTime(seconds)}` : `Time: ${formatTime(seconds)}`}
        </div>
    );
}



