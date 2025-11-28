import React from 'react';

const PixelBar = ({ label, value, max, color }) => {
    const percentage = Math.max(0, Math.min((value / max) * 100, 100));
    
        return (
            <div className="flex flex-col w-full mb-2">
            <div className="flex justify-between text-[10px] font-bold uppercase mb-1 text-gray-700 tracking-wider font-mono">
                <span>{label}</span>
                <span>{Math.floor(value)}%</span>
            </div>
            <div className="h-4 bg-gray-300 border-2 border-gray-900 rounded-lg overflow-hidden relative">
                <div
                className={`h-full transition-all duration-500 ${color}`}
                style={{ width: `${percentage}%` }}
                ></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-white opacity-30"></div>
            </div>
            </div>
        );
    };
export default PixelBar;