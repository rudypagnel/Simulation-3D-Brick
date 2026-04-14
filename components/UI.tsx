import React, { useState, useRef } from 'react';
import { BrickColor, BrickSize, CameraView } from '../types';
import { BRICK_COLORS, BRICK_SIZES } from '../constants';
import { playSound } from '../utils/audio';

interface UIProps {
  currentSize: BrickSize;
  currentColor: string;
  currentRotation: number;
  isDarkMode: boolean;
  showGrid: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onSelectSize: (size: BrickSize) => void;
  onSelectColor: (color: string) => void;
  onRotate: () => void;
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onToggleTheme: () => void;
  onToggleGrid: () => void;
  onScreenshot: () => void;
  onSave: () => void;
  onLoad: (file: File) => void;
  onSetCameraView: (view: CameraView) => void;
}

// Compact SVG representation of a brick
const BrickThumbnail: React.FC<{ width: number; depth: number; color: string; isSelected: boolean; isDarkMode: boolean }> = ({ 
    width, 
    depth, 
    color, 
    isSelected,
    isDarkMode 
}) => {
    // Smaller cell size for compact sidebar
    const cellSize = 6; 
    const studRadius = 2;
    
    const pixelWidth = width * cellSize;
    const pixelHeight = depth * cellSize;

    const baseClass = isSelected 
        ? 'ring-2 ring-offset-1 ring-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-400' 
        : 'hover:bg-gray-100 dark:hover:bg-gray-700 border-transparent opacity-80 hover:opacity-100';

    const ringOffsetColor = isDarkMode ? 'ring-offset-gray-800' : 'ring-offset-white';

    return (
        <div 
            className={`p-1 rounded-md border transition-all flex flex-col items-center justify-center ${baseClass} ${ringOffsetColor}`}
            title={`${width}x${depth}`}
        >
            <svg width={pixelWidth} height={pixelHeight} style={{ display: 'block', overflow: 'visible' }}>
                <rect 
                    x={0} y={0} 
                    width={pixelWidth} height={pixelHeight} 
                    fill={color} 
                    stroke="rgba(0,0,0,0.15)" 
                    strokeWidth="0.5" 
                    rx="1.5" 
                />
                {Array.from({ length: width * depth }).map((_, i) => {
                    const cX = (i % width);
                    const cY = Math.floor(i / width);
                    const cx = cX * cellSize + cellSize/2;
                    const cy = cY * cellSize + cellSize/2;
                    return (
                        <g key={i}>
                            <circle cx={cx} cy={cy + 0.5} r={studRadius} fill="rgba(0,0,0,0.1)" />
                            <circle cx={cx} cy={cy} r={studRadius} fill={color} />
                            <circle cx={cx - 0.5} cy={cy - 0.5} r={0.5} fill="rgba(255,255,255,0.4)" />
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

export const UI: React.FC<UIProps> = ({
  currentSize,
  currentColor,
  isDarkMode,
  showGrid,
  canUndo,
  canRedo,
  onSelectSize,
  onSelectColor,
  onRotate,
  onClear,
  onUndo,
  onRedo,
  onToggleTheme,
  onToggleGrid,
  onScreenshot,
  onSave,
  onLoad,
  onSetCameraView
}) => {
  const [showCameraMenu, setShowCameraMenu] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = (action: () => void) => {
    playSound('click');
    action();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          onLoad(e.target.files[0]);
          e.target.value = ''; 
      }
  };

  const handleCameraSelect = (view: CameraView) => {
    playSound('click');
    onSetCameraView(view);
    setShowCameraMenu(false);
  };

  // Dynamic Classes based on theme
  const panelClass = isDarkMode 
    ? "bg-gray-900/90 backdrop-blur-md text-white border-gray-700 shadow-black/50" 
    : "bg-white/90 backdrop-blur-md text-gray-800 border-gray-200 shadow-xl";
    
  const iconBtnClass = `p-2 rounded-lg transition-all ${isDarkMode ? 'hover:bg-gray-700 disabled:text-gray-600' : 'hover:bg-gray-200 disabled:text-gray-300'}`;
  
  const utilityBtnClass = `p-2 rounded-xl border shadow-sm transition-all flex items-center justify-center relative ${
      isDarkMode 
      ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300' 
      : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-600'
  }`;

  const footerBtnClass = `w-full p-2.5 rounded-lg transition-colors flex items-center justify-center ${
      isDarkMode 
      ? 'text-gray-400 hover:text-white hover:bg-white/10' 
      : 'text-gray-400 hover:text-gray-700 hover:bg-black/5'
  }`;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col z-10">
      
      {/* ================= HEADER ================= */}
      <div className="absolute top-0 left-0 w-full p-4 pointer-events-auto z-30 flex flex-col sm:flex-row justify-between items-start gap-4">
        {/* Title & Undo/Redo */}
        <div className={`p-2 px-3 rounded-2xl shadow-md border transition-colors flex items-center gap-4 ${panelClass}`}>
            <h1 className="text-lg font-black bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent tracking-tight">
                BrickMaster
            </h1>
            
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-1"></div>

            <div className="flex items-center gap-1">
                <button onClick={() => handleButtonClick(onUndo)} disabled={!canUndo} className={iconBtnClass} title="Undo">
                     <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                </button>
                <button onClick={() => handleButtonClick(onRedo)} disabled={!canRedo} className={iconBtnClass} title="Redo">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" /></svg>
                </button>
            </div>

             <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-1"></div>

             <button onClick={() => handleButtonClick(onToggleTheme)} className={iconBtnClass} title="Toggle Theme">
                {isDarkMode ? (
                    <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                ) : (
                    <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
             </button>
        </div>

        {/* Camera Tools */}
        <div className="flex items-center gap-2">
            {/* File Load Input */}
            <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} />

            {/* Camera Menu */}
            <div className="relative">
                <button onClick={() => { playSound('click'); setShowCameraMenu(!showCameraMenu); }} className={utilityBtnClass} title="Camera Views">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </button>
                {showCameraMenu && (
                    <div className={`absolute top-full right-0 mt-2 w-32 rounded-xl shadow-xl border overflow-hidden flex flex-col z-50 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        {['iso', 'top', 'front', 'right'].map((view) => (
                            <button key={view} onClick={() => handleCameraSelect(view as CameraView)} className={`px-4 py-2 text-left text-sm hover:bg-blue-50 dark:hover:bg-gray-700 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                {view.charAt(0).toUpperCase() + view.slice(1)}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* ================= LEFT SIDEBAR: INSTRUCTIONS & ABOUT ================= */}
      <div className="absolute top-20 left-4 hidden sm:flex flex-col gap-3 items-start pointer-events-auto z-20">
          {/* Controls Info */}
          <div className={`p-4 rounded-xl border shadow-lg backdrop-blur-md transition-colors w-[200px] ${panelClass}`}>
              <h3 className="font-bold text-[10px] uppercase tracking-widest mb-3 opacity-50 border-b border-gray-500/20 pb-1">Controls</h3>
              <ul className="text-xs space-y-2 opacity-80 font-medium">
                <li className="flex justify-between items-center">
                    <span>Place Brick</span>
                    <span className="bg-gray-200/50 dark:bg-gray-700/50 px-1.5 py-0.5 rounded text-[10px] font-bold">L-Click</span>
                </li>
                <li className="flex justify-between items-center">
                    <span>Rotate View</span>
                    <span className="bg-gray-200/50 dark:bg-gray-700/50 px-1.5 py-0.5 rounded text-[10px] font-bold">R-Click</span>
                </li>
                <li className="flex justify-between items-center">
                    <span>Remove</span>
                    <span className="bg-gray-200/50 dark:bg-gray-700/50 px-1.5 py-0.5 rounded text-[10px] font-bold">Alt+Click</span>
                </li>
                <li className="flex justify-between items-center">
                    <span>Rotate Brick</span>
                    <span className="bg-gray-200/50 dark:bg-gray-700/50 px-1.5 py-0.5 rounded text-[10px] font-bold">R</span>
                </li>
                <li className="flex justify-between items-center">
                    <span>Zoom</span>
                    <span className="bg-gray-200/50 dark:bg-gray-700/50 px-1.5 py-0.5 rounded text-[10px] font-bold">Scroll</span>
                </li>
              </ul>
          </div>

          {/* About Button */}
          <button
            onClick={() => { playSound('click'); setShowAbout(true); }}
            className={`p-3 rounded-full shadow-lg border transition-all flex items-center justify-center w-10 h-10 ${
                isDarkMode 
                ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700' 
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
            title="About"
          >
             <span className="font-serif font-bold italic text-lg leading-none">i</span>
          </button>
      </div>

      {/* ================= ABOUT MODAL ================= */}
      {showAbout && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-auto p-4 animate-fade-in">
            <div className={`relative max-w-md w-full p-6 rounded-2xl shadow-2xl border flex flex-col gap-4 ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800'}`}>
               <button onClick={() => setShowAbout(false)} className="absolute top-4 right-4 opacity-50 hover:opacity-100 transition-opacity">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
               <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">About Brick Master</h2>
               <p className="leading-relaxed opacity-90 text-sm">
                  Brick Master is a 3D Lego-style building playground I made because I got curious after trying Gemini 3 and thought, “Hey, why not build something cool?” So here it is, a simple place to stack bricks, play around, and let your imagination do the heavy lifting without stepping on real Lego pieces at 2AM.
               </p>
               <p className="leading-relaxed opacity-90 text-sm border-t border-gray-500/20 pt-3">
                  Want to see other apps I built out of curiosity and caffeine? Check out my website: <a href="https://rudypagnel.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-medium">rudypagnel.com</a>.
               </p>
               <div className="pt-2">
                  <button onClick={() => { playSound('click'); setShowAbout(false); }} className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20 text-sm">
                      Close
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* ================= RIGHT SIDEBAR (Desktop) / BOTTOM SHEET (Mobile) ================= */}
      <div className="absolute right-0 bottom-0 w-full h-auto max-h-[45vh] sm:max-h-none sm:top-20 sm:bottom-4 sm:right-4 sm:w-64 sm:h-auto pointer-events-auto z-20 flex flex-col">
         
         <div className={`flex flex-col w-full h-full sm:rounded-2xl rounded-t-2xl shadow-2xl border backdrop-blur-md overflow-hidden transition-colors ${panelClass}`}>
            
            {/* Scrollable Content Area - Neat & Clean */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                
                {/* 1. Actions Section */}
                <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2">Actions</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <button 
                            onClick={() => handleButtonClick(onRotate)}
                            className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border transition-all ${
                                isDarkMode 
                                ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-200' 
                                : 'bg-white border-gray-200 hover:bg-blue-50 text-gray-700'
                            }`}
                        >
                            <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            <span className="text-[11px] font-bold">Rotate</span>
                        </button>
                        <button 
                            onClick={() => handleButtonClick(onClear)}
                            className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border transition-all ${
                                isDarkMode 
                                ? 'bg-gray-800 border-gray-700 hover:bg-red-900/20 text-red-400' 
                                : 'bg-white border-gray-200 hover:bg-red-50 text-red-500'
                            }`}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            <span className="text-[11px] font-bold">Clear</span>
                        </button>
                    </div>
                </div>

                {/* 2. Palette Section */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-40">Palette</h3>
                        <div className="w-2.5 h-2.5 rounded-full ring-1 ring-offset-1 ring-gray-300 dark:ring-gray-600 shadow-sm" style={{ backgroundColor: currentColor }}></div>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                        {BRICK_COLORS.map((c) => (
                            <button
                                key={c.hex}
                                onClick={() => { playSound('click'); onSelectColor(c.hex); }}
                                className={`w-full aspect-square rounded-lg transition-all duration-200 ${
                                    currentColor === c.hex 
                                    ? 'ring-2 ring-blue-500 scale-110 z-10 shadow-md' 
                                    : 'hover:scale-105 hover:shadow-sm opacity-90 hover:opacity-100'
                                }`}
                                style={{ backgroundColor: c.hex }}
                                title={c.name}
                            />
                        ))}
                    </div>
                </div>

                {/* 3. Bricks Section */}
                <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2">Bricks</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {BRICK_SIZES.map((size) => (
                            <button
                                key={size.label}
                                onClick={() => { playSound('click'); onSelectSize(size); }}
                                className="focus:outline-none group"
                            >
                                <BrickThumbnail 
                                    width={size.width} 
                                    depth={size.depth} 
                                    color={currentColor} 
                                    isSelected={currentSize.label === size.label}
                                    isDarkMode={isDarkMode}
                                />
                                <div className={`text-[9px] text-center mt-1.5 font-mono transition-opacity ${currentSize.label === size.label ? 'opacity-100 font-bold text-blue-500' : 'opacity-40 group-hover:opacity-80'}`}>
                                    {size.label}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer Actions - Improved contrast for dark mode & Alignment */}
            <div className={`p-3 px-4 border-t grid grid-cols-4 gap-2 ${
                isDarkMode 
                ? 'bg-white/5 border-gray-700' 
                : 'bg-gray-50/80 border-gray-200'
            }`}>
                 <button onClick={() => handleButtonClick(onToggleGrid)} className={`w-full p-2.5 rounded-lg transition-colors flex items-center justify-center ${showGrid ? 'text-blue-500 bg-blue-500/10' : (isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-700')}`} title="Toggle Grid">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                 </button>
                 <button onClick={() => handleButtonClick(onScreenshot)} className={footerBtnClass} title="Screenshot">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                 </button>
                 <button onClick={() => handleButtonClick(onSave)} className={footerBtnClass} title="Save JSON">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                 </button>
                 <button onClick={() => fileInputRef.current?.click()} className={footerBtnClass} title="Load JSON">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                 </button>
            </div>
         </div>
      </div>

    </div>
  );
};