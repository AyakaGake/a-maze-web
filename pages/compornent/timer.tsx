import { useState, useEffect } from 'react';

interface TimerProps {
    isGameOver: boolean;
    className?: string; // optional className prop

}

export default function Timer({ isGameOver, className }: TimerProps) {
    const [seconds, setSeconds] = useState<number>(0);
    const [isActive, setIsActive] = useState<boolean>(true);

    useEffect(() => {
        let timer: NodeJS.Timeout | undefined;

        if (isActive) {
            timer = setInterval(() => {
                setSeconds(prevSeconds => prevSeconds + 1);
            }, 1000);
        } else {
            if (timer) {
                clearInterval(timer);
            }
        }

        return () => {
            if (timer) {
                clearInterval(timer);
            }
        };
    }, [isActive, isGameOver]);

    useEffect(() => {
        if (isGameOver) { handleStop() }
        return () => {
        };
    }, [isGameOver]);

    const handleStart = () => setIsActive(true);
    const handleStop = () => setIsActive(false);
    const handleReset = () => {
        setIsActive(false);
        setSeconds(0);
    };

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        // <div className={`text-3xl font-bold text-white mb-1 ${className}`}>
        //     passed: {formatTime(seconds)}
        // </div>
        <div className={`text-3xl font-bold mb-1 ${isGameOver ? 'text-green-500' : 'text-white'} ${className}`}>
            {isGameOver ? `gameover: ${formatTime(seconds)}` : `passed: ${formatTime(seconds)}`}
        </div>
    );
}



