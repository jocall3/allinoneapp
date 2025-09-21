import React, { Suspense, useCallback, useState, useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAppStore } from './store/useAppStore';
import { LeftSidebar } from './components/LeftSidebar';
import { CommandPalette } from './components/CommandPalette';
import { VoiceCommandModal } from './components/VoiceCommandModal';
import { DesktopView } from './components/desktop/DesktopView';
import { Alchemist } from './alchemy/alchemist/compiler';
import exampleTsal from './alchemy/example.tsal?raw';
import { ActionManager } from './components/ActionManager';

export const App: React.FC = () => {
  const { 
    isVoiceCommanderOpen, 
    launchRequest,
    consumeLaunchRequest,
    openWindow,
    closeWindow,
    minimizeWindow,
    focusWindow,
    updateWindow,
    windows,
    setVoiceCommanderOpen
  } = useAppStore();
  
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  
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
    openWindow(featureId, props);
    setCommandPaletteOpen(false);
  }, [openWindow]);


  useEffect(() => {
    if (launchRequest) {
        handleLaunchFeature(launchRequest.featureId, launchRequest.props);
        consumeLaunchRequest();
    }
  }, [launchRequest, consumeLaunchRequest, handleLaunchFeature]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(k => !k);
      }
      if(e.key.toLowerCase() === 'v' && e.altKey) {
        e.preventDefault();
        setVoiceCommanderOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setVoiceCommanderOpen]);
  
  return (
    <ErrorBoundary>
      <div className="w-screen h-screen bg-background text-text-primary flex font-sans antialiased overflow-hidden">
        <LeftSidebar onLaunchFeature={handleLaunchFeature} />
        <main className="flex-1 relative">
            <DesktopView 
                windows={Object.values(windows)}
                onLaunch={handleLaunchFeature}
                onClose={closeWindow}
                onMinimize={minimizeWindow}
                onFocus={focusWindow}
                onUpdate={updateWindow}
            />
            <ActionManager />
        </main>
        <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} onSelect={handleLaunchFeature} />
        <VoiceCommandModal isOpen={isVoiceCommanderOpen} />
      </div>
    </ErrorBoundary>
  );
};
