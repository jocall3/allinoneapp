import React, { Suspense, useCallback, useState, useEffect, useRef } from 'react';
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
import { ArrowLeftIcon, Bars3Icon } from './components/icons';
import { FEATURES_MAP } from './components/features/index.ts';

// ADDED: A type for our window state for better type safety.
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
const MOBILE_BREAKPOINT = 768; // The pixel width to switch to mobile view

export const App: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { isVoiceCommanderOpen, launchRequest } = state;
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  
  // FIX: State management for windows, active window, and z-index is now centralized.
  const [windows, setWindows] = useState<Record<string, WindowState>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [nextZIndex, setNextZIndex] = useState(Z_INDEX_BASE);
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);
  const [mobileFeatureListOpen, setMobileFeatureListOpen] = useState(true);

  // ADDED: Effect hook to detect screen size and toggle mobile view.
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Alchemy Proof of Concept (original)
  useEffect(() => {
    const runAlchemyProofOfConcept = async () => {
        console.log("🔥 Initializing Alchemist Engine...");
        const alchemist = new Alchemist();
        try {
            console.log("Compiling example.tsal...");
            const compilationResult = await alchemist.compile(exampleTsal);
            console.log("✅ Compilation successful. Instance:", compilationResult.instance);
            
            const add = compilationResult.instance.exports.add as (a: number, b: number) => number;
            if (typeof add !== 'function') throw new Error("Exported 'add' function not found.");
            
            const result = add(40, 2);
            console.log(`🚀 Wasm execution result: add(40, 2) = ${result}`);
            if (result !== 42) console.error("VALIDATION FAILED! The universe is broken.");
            else console.log("✨ Billion-dollar code confirmed. The machine is alive.");
        } catch (error) {
            console.error("☠️ Alchemy Engine Proof-of-Concept FAILED:", error);
        }
    };
    runAlchemyProofOfConcept();
  }, []);

  const handleLaunchFeature = useCallback((featureId: string, props?: any) => {
    // Check if a window for this feature already exists and is minimized
    const existingWindow = Object.values(windows).find(w => w.featureId === featureId && w.isMinimized);
    if (existingWindow) {
        // If it exists and is minimized, restore it
        const newZIndex = nextZIndex + 1;
        setNextZIndex(newZIndex);
        setActiveId(existingWindow.id);
        setWindows(prev => ({
            ...prev,
            [existingWindow.id]: { ...prev[existingWindow.id], isMinimized: false, zIndex: newZIndex }
        }));
    } else {
        // Otherwise, create a new window
        const newZIndex = nextZIndex + 1;
        setNextZIndex(newZIndex);
        const newWindowId = `${featureId}-${Date.now()}`;
        
        setActiveId(newWindowId);
        setWindows(prev => {
            const openWindowsCount = Object.values(prev).filter(w => !w.isMinimized).length;
            const newWindow: WindowState = {
                id: newWindowId,
                featureId: featureId,
                position: isMobile ? { x: 0, y: 0 } : { x: 100 + openWindowsCount * 30, y: 50 + openWindowsCount * 30 },
                size: isMobile ? { width: window.innerWidth, height: window.innerHeight } : { width: 900, height: 700 },
                zIndex: newZIndex,
                isMinimized: false,
                props: props,
            };
            return { ...prev, [newWindowId]: newWindow };
        });
    }

    setMobileFeatureListOpen(false); // Close list on mobile when feature is launched
    setCommandPaletteOpen(false);
  }, [nextZIndex, windows, isMobile]);

  // FIX: handleCloseWindow now correctly deletes the window state.
  const handleCloseWindow = (id: string) => {
    setWindows(prev => {
        const newState = { ...prev };
        delete newState[id];
        // If we closed the last window on mobile, show the feature list.
        if (isMobile && Object.keys(newState).length === 0) {
            setMobileFeatureListOpen(true);
        }
        if (activeId === id) {
          const remainingWindows = Object.keys(newState);
          setActiveId(remainingWindows.length > 0 ? remainingWindows[remainingWindows.length-1] : null);
        }
        return newState;
    });
  };

  // FIX: handleMinimizeWindow now correctly updates the isMinimized flag.
  const handleMinimizeWindow = (id: string) => {
      setWindows(prev => ({ ...prev, [id]: { ...prev[id], isMinimized: true } }));
      if (activeId === id) setActiveId(null);
  };
  
  const handleRestoreWindow = (id: string) => {
       const newZIndex = nextZIndex + 1;
       setNextZIndex(newZIndex);
       setWindows(prev => ({ ...prev, [id]: { ...prev[id], isMinimized: false, zIndex: newZIndex }}));
       setActiveId(id);
  };

  // FIX: handleFocusWindow brings the selected window to the front.
  const handleFocusWindow = (id: string) => {
      if (id === activeId && !isMobile) return;
      const newZIndex = nextZIndex + 1;
      setNextZIndex(newZIndex);
      setActiveId(id);
      setWindows(prev => ({ ...prev, [id]: { ...prev[id], zIndex: newZIndex } }));
  };
  
  // FIX: onUpdate prop handler for dragging and resizing.
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

  // FIX: Logic to separate open and minimized windows for correct rendering.
  const openWindows = Object.values(windows).filter(w => !w.isMinimized);
  const minimizedWindows = Object.values(windows).filter(w => w.isMinimized);

  // ADDED: A full mobile-friendly view.
  if (isMobile) {
    const activeWindow = windows[activeId || ''];
    const ActiveComponent = activeWindow ? FEATURES_MAP.get(activeWindow.featureId)?.component : null;

    return (
      <ErrorBoundary>
        <div className="w-screen h-screen bg-background text-text-primary flex flex-col font-sans antialiased overflow-hidden">
          <header className="w-full h-14 bg-surface/80 backdrop-blur-sm border-b border-border flex-shrink-0 flex items-center justify-between px-4">
              <img src="https://citibankdemobusiness.dev/wp-content/uploads/2025/08/cropped-Untitled-1-180x180.png" alt="Logo" className="w-10 h-10"/>
              <button onClick={() => setMobileFeatureListOpen(o => !o)} className="p-2">
                <Bars3Icon />
              </button>
          </header>

          <main className="flex-1 relative">
            {(mobileFeatureListOpen || !activeId) && (
              <div className="absolute inset-0 bg-background/50 p-4 overflow-y-auto">
                 <h2 className="text-xl font-bold mb-4">Features</h2>
                 <div className="grid grid-cols-2 gap-4">
                   {ALL_FEATURES.map(feature => (
                     <button key={feature.id} onClick={() => handleLaunchFeature(feature.id)} className="p-4 bg-surface border border-border rounded-lg flex flex-col items-center text-center">
                       <div className="text-3xl text-primary mb-2">{feature.icon}</div>
                       <span className="text-sm">{feature.name}</span>
                     </button>
                   ))}
                 </div>
              </div>
            )}

            {!mobileFeatureListOpen && activeId && ActiveComponent && (
                <div className="absolute inset-0 flex flex-col">
                     <div className="h-full w-full">
                       <Suspense fallback={<div>Loading...</div>}>
                          <ActiveComponent {...activeWindow.props} />
                       </Suspense>
                     </div>
                </div>
            )}
          </main>
        </div>
      </ErrorBoundary>
    );
  }
  
  // Original Desktop View
  return (
    <ErrorBoundary>
      <div className="w-screen h-screen bg-background text-text-primary flex font-sans antialiased overflow-hidden">
        <LeftSidebar onLaunchFeature={handleLaunchFeature} />
        <main className="flex-1 relative">
            <DesktopView 
                windows={openWindows}
                minimizedWindows={minimizedWindows}
                activeId={activeId}
                onLaunch={handleLaunchFeature}
                onClose={handleCloseWindow}
                onMinimize={handleMinimizeWindow}
                onFocus={handleFocusWindow}
                onUpdate={handleUpdateWindow}
                onRestore={handleRestoreWindow}
            />
            <ActionManager />
        </main>
        <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} onSelect={handleLaunchFeature} />
        <VoiceCommandModal isOpen={isVoiceCommanderOpen} />
      </div>
    </ErrorBoundary>
  );
};
