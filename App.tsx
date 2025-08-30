import React, { Suspense, useCallback, useState, useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAppContext } from './contexts/GlobalStateContext';
import { ALL_FEATURES } from './components/features';
import { LeftSidebar } from './components/LeftSidebar';
import { CommandPalette } from './components/CommandPalette';
import { VoiceCommandModal } from './components/VoiceCommandModal';
import { DesktopView } from './components/desktop/DesktopView';
import { Alchemist } from './alchemy/alchemist/compiler';
import exampleTsal from './alchemy/example.tsal?raw';
import { ActionManager } from './components/ActionManager';

interface WindowState {
  id: string;
  featureId: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isMinimized: boolean;
  props?: any;
}

const Z_INDEX_BASE = 10;

export const App: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { isVoiceCommanderOpen, launchRequest } = state;
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  
  const [windows, setWindows] = useState<Record<string, WindowState>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [nextZIndex, setNextZIndex] = useState(Z_INDEX_BASE);

  useEffect(() => {
    const runAlchemyProofOfConcept = async () => {
        console.log("🔥 Initializing Alchemist Engine...");
        const alchemist = new Alchemist();
        try {
            console.log("Compiling example.tsal...");
            const compilationResult = await alchemist.compile(exampleTsal);
            console.log("✅ Compilation successful. Instance:", compilationResult.instance);
            
            const add = compilationResult.instance.exports.add as (a: number, b: number) => number;
            if (typeof add !== 'function') {
                throw new Error("Exported 'add' function not found in Wasm module.");
            }
            
            const result = add(40, 2);
            console.log(`🚀 Wasm execution result: add(40, 2) = ${result}`);
            if (result !== 42) {
                 console.error("VALIDATION FAILED! The universe is broken.");
            } else {
                 console.log("✨ Billion-dollar code confirmed. The machine is alive.");
            }

        } catch (error) {
            console.error("☠️ Alchemy Engine Proof-of-Concept FAILED:", error);
        }
    };
    runAlchemyProofOfConcept();
  }, []);

  const handleLaunchFeature = useCallback((featureId: string, props?: any) => {
    const newZIndex = nextZIndex + 1;
    setNextZIndex(newZIndex);
    const newWindowId = `${featureId}-${Date.now()}`;
    setActiveId(newWindowId);

    setWindows(prev => {
        const openWindowsCount = Object.values(prev).filter(w => !w.isMinimized).length;
        const newWindow: WindowState = {
            id: newWindowId,
            featureId: featureId,
            position: { x: 100 + openWindowsCount * 30, y: 50 + openWindowsCount * 30 },
            size: { width: 900, height: 700 },
            zIndex: newZIndex,
            isMinimized: false,
            props: props,
        };
        return { ...prev, [newWindowId]: newWindow };
    });
    setCommandPaletteOpen(false);
  }, [nextZIndex]);


  const handleCloseWindow = (id: string) => {
    setWindows(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
    });
    if (activeId === id) setActiveId(null);
  };

  const handleMinimizeWindow = (id: string) => {
      setWindows(prev => ({ ...prev, [id]: { ...prev[id], isMinimized: true } }));
      if (activeId === id) setActiveId(null);
  };

  const handleFocusWindow = (id: string) => {
      if (id === activeId) return;
      const newZIndex = nextZIndex + 1;
      setNextZIndex(newZIndex);
      setActiveId(id);
      setWindows(prev => ({ ...prev, [id]: { ...prev[id], zIndex: newZIndex } }));
  };
  
  const handleUpdateWindow = (id: string, updates: Partial<WindowState>) => {
      setWindows(prev => ({ ...prev, [id]: { ...prev[id], ...updates } }));
  };

  useEffect(() => {
    if (launchRequest) {
        handleLaunchFeature(launchRequest.featureId, launchRequest.props);
        dispatch({ type: 'LAUNCH_FEATURE_CONSUMED' });
    }
  }, [launchRequest, dispatch, handleLaunchFeature]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(k => !k);
      }
      if(e.key.toLowerCase() === 'v' && e.altKey) {
        e.preventDefault();
        dispatch({ type: 'SET_VOICE_COMMANDER_OPEN', payload: true });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);
  
  return (
    <ErrorBoundary>
      <div className="w-screen h-screen bg-background text-text-primary flex font-sans antialiased overflow-hidden">
        <LeftSidebar onLaunchFeature={handleLaunchFeature} />
        <main className="flex-1 relative">
            <DesktopView 
                windows={Object.values(windows)}
                activeId={activeId}
                onLaunch={handleLaunchFeature}
                onClose={handleCloseWindow}
                onMinimize={handleMinimizeWindow}
                onFocus={handleFocusWindow}
                onUpdate={handleUpdateWindow}
            />
            <ActionManager />
        </main>
        <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} onSelect={handleLaunchFeature} />
        <VoiceCommandModal isOpen={isVoiceCommanderOpen} />
      </div>
    </ErrorBoundary>
  );
};
