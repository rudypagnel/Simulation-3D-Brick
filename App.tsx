import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Scene, SceneRef } from './components/Scene';
import { UI } from './components/UI';
import { BrickData, BrickSize, CameraView } from './types';
import { BRICK_COLORS, BRICK_SIZES, STUD_SIZE, BRICK_HEIGHT } from './constants';
import { playSound } from './utils/audio';

const App: React.FC = () => {
  // History State
  const [history, setHistory] = useState<BrickData[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Current State derived from history is not strictly necessary if we sync them, 
  // but to keep rendering fast we keep a local bricks state and sync on undo/redo.
  const [bricks, setBricks] = useState<BrickData[]>([]);
  
  const [currentSize, setCurrentSize] = useState<BrickSize>(BRICK_SIZES[4]); // Default 2x2
  const [currentColor, setCurrentColor] = useState<string>(BRICK_COLORS[0].hex); // Default Red
  const [currentRotation, setCurrentRotation] = useState<number>(0);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  
  // Ref to the Scene for screenshot capability
  const sceneRef = useRef<SceneRef>(null);

  // Sync history to bricks on mount or undo/redo
  useEffect(() => {
    setBricks(history[historyIndex]);
  }, [historyIndex, history]);

  const handleRotate = useCallback(() => {
    setCurrentRotation((prev) => (prev === 0 ? 1 : 0));
  }, []);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      playSound('click');
      setHistoryIndex(historyIndex - 1);
    } else {
      playSound('error');
    }
  }, [historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      playSound('click');
      setHistoryIndex(historyIndex + 1);
    } else {
      playSound('error');
    }
  }, [historyIndex, history.length]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key.toLowerCase() === 'r') {
        handleRotate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history.length, handleUndo, handleRedo, handleRotate]);

  // Helper to save state to history
  const saveToHistory = (newBricks: BrickData[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newBricks);
    // Optional: limit history size
    if (newHistory.length > 50) newHistory.shift();
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleAddBrick = useCallback((newBrick: BrickData) => {
    playSound('place');
    const newBricks = [...bricks, newBrick];
    setBricks(newBricks);
    saveToHistory(newBricks);
  }, [bricks, history, historyIndex]);

  const handleRemoveBrick = useCallback((id: string) => {
    playSound('remove');
    const newBricks = bricks.filter((b) => b.id !== id);
    setBricks(newBricks);
    saveToHistory(newBricks);
  }, [bricks, history, historyIndex]);

  const handleClear = useCallback(() => {
    if (bricks.length === 0) return;
    playSound('remove');
    setBricks([]);
    saveToHistory([]);
  }, [bricks]);

  const handleScreenshot = useCallback(() => {
    if (sceneRef.current) {
      sceneRef.current.takeScreenshot();
      playSound('click');
    }
  }, []);

  const handleSave = useCallback(() => {
    const data = JSON.stringify(bricks, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().slice(0, 10);
    a.download = `brick-build-${timestamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
    playSound('click');
  }, [bricks]);

  const handleLoad = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const loadedBricks = JSON.parse(content);
        
        if (Array.isArray(loadedBricks)) {
          // Basic validation: check if items look like bricks
          const valid = loadedBricks.every(b => b.position && b.size && b.color);
          if (valid) {
             setBricks(loadedBricks);
             saveToHistory(loadedBricks);
             playSound('place');
          } else {
             throw new Error("Invalid brick format");
          }
        }
      } catch (error) {
        console.error("Failed to load project", error);
        playSound('error');
        alert("Could not load project: Invalid file format.");
      }
    };
    reader.readAsText(file);
  }, [history, historyIndex]);

  const handleSetCameraView = useCallback((view: CameraView) => {
      if (sceneRef.current) {
          sceneRef.current.setCameraView(view);
      }
  }, []);

  return (
    <div className={`w-full h-full relative ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Scene
        ref={sceneRef}
        bricks={bricks}
        currentBrickSize={currentSize}
        currentBrickColor={currentColor}
        currentRotation={currentRotation}
        isDarkMode={isDarkMode}
        showGrid={showGrid}
        onAddBrick={handleAddBrick}
        onRemoveBrick={handleRemoveBrick}
      />
      <UI
        currentSize={currentSize}
        currentColor={currentColor}
        currentRotation={currentRotation}
        isDarkMode={isDarkMode}
        showGrid={showGrid}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onSelectSize={setCurrentSize}
        onSelectColor={setCurrentColor}
        onRotate={handleRotate}
        onClear={handleClear}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        onToggleGrid={() => setShowGrid(!showGrid)}
        onScreenshot={handleScreenshot}
        onSave={handleSave}
        onLoad={handleLoad}
        onSetCameraView={handleSetCameraView}
      />
    </div>
  );
};

export default App;