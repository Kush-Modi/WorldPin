import React from 'react';

const WorldPinGlobe: React.FC = () => {
    return (
        <div className="relative w-24 h-24 flex items-center justify-center">
            {/* Ambient Glow */}
            <div className="absolute inset-0 bg-teal-500/20 blur-3xl rounded-full" />

            {/* Main Globe Container */}
            <div className="relative w-full h-full">
                {/* Outer Ring - Static or very slow rotation */}
                <div className="absolute inset-0 rounded-full border border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.1)]" />

                {/* Inner Rotating Ring 1 */}
                <div className="absolute inset-2 rounded-full border-t border-l border-teal-400/40 border-r-transparent border-b-transparent animate-spin-slow" />

                {/* Inner Rotating Ring 2 - Reverse */}
                <div className="absolute inset-4 rounded-full border-b border-r border-teal-300/30 border-t-transparent border-l-transparent animate-spin-reverse-slow" />

                {/* Grid/Latitude Lines (Stylized) */}
                <div className="absolute inset-0 rounded-full border border-white/5 overflow-hidden">
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-teal-500/10" />
                    <div className="absolute left-1/2 top-0 h-full w-[1px] bg-teal-500/10" />
                    <div className="absolute top-1/4 left-0 w-full h-[1px] bg-teal-500/5" />
                    <div className="absolute bottom-1/4 left-0 w-full h-[1px] bg-teal-500/5" />
                </div>

                {/* Center Pin */}
                <div className="absolute inset-0 flex items-center justify-center animate-pulse-glow">
                    <div className="relative">
                        {/* Pin Head */}
                        <div className="w-3 h-3 bg-teal-400 rounded-full shadow-[0_0_10px_rgba(45,212,191,0.8)] z-10 relative" />
                        {/* Pin Stick (optional, keeping it minimal as just a dot for now or a small marker) */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-[1px] h-3 bg-gradient-to-b from-teal-400 to-transparent opacity-50" />
                        {/* Pin Pulse Ring */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-teal-400/10 rounded-full animate-ping" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorldPinGlobe;
