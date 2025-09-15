import React from 'react';
import { Window } from './Window.tsx';
import { Taskbar } from './Taskbar.tsx';
import { FeatureDock } from './FeatureDock.tsx';
import { ALL_FEATURES } from '../features/index.ts';
import type { Feature } from '../../types.ts';

// ADDED: Explicit WindowState to match App.tsx
interface WindowState {
  id: string;
  featureId: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isMinimized: boolean;
  props?: any;
}

interface DesktopViewProps {
    windows: WindowState[];
    minimizedWindows: WindowState[]; // FIX: Now accepts minimized windows separately
    activeId: string | null;
    onLaunch: (featureId: string, props?: any) => void;
    onClose: (id: string) => void;
    onMinimize: (id: string) => void;
    onFocus: (id: string) => void;
    onUpdate: (id: string, updates: Partial<WindowState>) => void;
    onRestore: (id: string) => void; // ADDED: Restore handler for the taskbar
}

const featuresMap = new Map(ALL_FEATURES.map(f => [f.id, f]));

export const DesktopView: React.FC<DesktopViewProps> = ({ 
    windows, minimizedWindows, activeId, onLaunch, onClose, onMinimize, onFocus, onUpdate, onRestore 
}) => {
    return (
        <div className="h-full flex flex-col bg-transparent relative">
            <FeatureDock onOpen={onLaunch} />
            <div className="flex-grow relative overflow-hidden pt-24">
                <div className="absolute inset-0 bg-grid"></div>
                
                {/* FIX: This now maps over only the OPEN windows */}
                {windows.map(win => {
                    const feature = featuresMap.get(win.featureId);
                    if (!feature) return null;
                    return (
                        <Window
                            key={win.id}
                            state={win}
                            isActive={win.id === activeId}
                            onClose={onClose}
                            onMinimize={onMinimize}
                            onFocus={onFocus}
                            onUpdate={onUpdate}
                        />
                    );
                })}
            </div>
            {/* FIX: Taskbar now receives the minimized windows and onRestore handler */}
            <Taskbar
                minimizedWindows={minimizedWindows}
                onRestore={onRestore}
            />
        </div>
    );
};
