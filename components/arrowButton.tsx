// ArrowButtons.tsx
import React from 'react';

interface ArrowButtonsProps {
    onMove: (dx: number, dy: number) => void;
}

const ArrowButtons: React.FC<ArrowButtonsProps> = ({ onMove }) => {
    return (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center space-y-2 z-40">
            <div className="flex space-x-2">
                <button className="arrow-button" onClick={() => onMove(0, -1)}>↑</button>
            </div>
            <div className="flex space-x-2">
                <button className="arrow-button" onClick={() => onMove(-1, 0)}>←</button>
                <button className="arrow-button" onClick={() => onMove(1, 0)}>→</button>
            </div>
            <div className="flex space-x-2">
                <button className="arrow-button" onClick={() => onMove(0, 1)}>↓</button>
            </div>
        </div>
    );
};

export default ArrowButtons;
