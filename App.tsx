import React, { Suspense, useCallback, useState, useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAppContext } from './contexts/GlobalStateContext';
import { ALL_FEATURES } from './components/features';
import type { Feature } from './types';
import { LeftSidebar } from './components/LeftSidebar';
import { CommandPalette } from './components/CommandPalette';
import { VoiceCommandModal } from './components/VoiceCommandModal';
import { DesktopView } from './components/desktop/DesktopView';
import { AlchemistEngine } from './alchemy/engine';

// FIX: Added a new WindowState interface to manage the state of each open window in the new desktop environment.
// FIX: Added optional props to window state to support features launched with initial data.
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
const featuresMap = new Map(ALL_FEATURES.map(f => [f.id, f]));

export const App: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { isVoiceCommanderOpen, launchRequest } = state;
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  
  // FIX: State management for the desktop environment is now centralized in App.tsx.
  const [windows, setWindows] = useState<Record<string, WindowState>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [nextZIndex, setNextZIndex] = useState(Z_INDEX_BASE);

  // --- Alchemy Engine Initialization ---
  useEffect(() => {
    const initializeAlchemy = async () => {
        console.log("Initializing Alchemy Engine...");
        const engine = new AlchemistEngine();
        try {
            // For this proof-of-concept, we'll just catalog the first few features
            // to demonstrate the capability without excessive API calls on startup.
            const featuresToCatalog = ALL_FEATURES.slice(0, 5); 
            const catalog = await engine.buildCatalog(featuresToCatalog);
            console.log("🔥 Alchemy Catalog Generated:", catalog);
        } catch (error) {
            console.error("Failed to initialize Alchemy Engine:", error);
        }
    };
    initializeAlchemy();
  }, []);


  // FIX: New function to handle launching features in new windows. This replaces the old navigation logic.
  // FIX: Updated to accept optional props for the feature component.
  const handleLaunchFeature = useCallback((featureId: string, props?: any) => {
    const newZIndex = nextZIndex + 1;
    setNextZIndex(newZIndex);
    setActiveId(featureId);

    setWindows(prev => {
        const existingWindow = prev[featureId];
        if (existingWindow) {
            // If window exists, bring it to front and un-minimize it
            return {
                ...prev,
                [featureId]: {
                    ...existingWindow,
                    isMinimized: false,
                    zIndex: newZIndex,
                    props: props || existingWindow.props, // Update props if provided
                }
            };
        }
        
        const openWindowsCount = Object.values(prev).filter(w => !w.isMinimized).length;
        const newWindow: WindowState = {
            id: featureId,
            featureId: featureId,
            position: { x: 100 + openWindowsCount * 30, y: 50 + openWindowsCount * 30 },
            size: { width: 800, height: 600 },
            zIndex: newZIndex,
            isMinimized: false,
            props: props,
        };
        return { ...prev, [featureId]: newWindow };
    });
    setCommandPaletteOpen(false); // Close palette after launching
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

  // FIX: Add an effect to handle feature launch requests from the global state.
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
  
  // FIX: The main component structure is now a flexible desktop environment.
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
        </main>
        <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} onSelect={handleLaunchFeature} />
        <VoiceCommandModal isOpen={isVoiceCommanderOpen} />
      </div>
    </ErrorBoundary>
  );
};
