import React from 'react';
import { Window } from './Window.tsx';
import { Taskbar } from './Taskbar.tsx';
import { FeatureDock } from './FeatureDock.tsx';
import { ALL_FEATURES } from '../features/index.ts';
import type { Feature } from '../../types.ts';

// FIX: Update WindowState to include featureId and optional props.
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
    activeId: string | null;
    onLaunch: (featureId: string, props?: any) => void;
    onClose: (id: string) => void;
    onMinimize: (id: string) => void;
    onFocus: (id: string) => void;
    onUpdate: (id: string, updates: Partial<WindowState>) => void;
}

const featuresMap = new Map(ALL_FEATURES.map(f => [f.id, f]));

export const DesktopView: React.FC<DesktopViewProps> = ({ windows, activeId, onLaunch, onClose, onMinimize, onFocus, onUpdate }) => {
    
    const openWindows = windows.filter(w => !w.isMinimized);
    const minimizedWindows = windows.filter(w => w.isMinimized);

    return (
        <div className="h-full flex flex-col bg-transparent relative">
            <FeatureDock onOpen={onLaunch} />
            <div className="flex-grow relative overflow-hidden pt-60"> {/* Added padding top for the dock */}
                {/* Desktop Background - can be customized later */}
                <div className="absolute inset-0 bg-gray-800 bg-grid-gray-700/[0.2]"></div>
                
                {openWindows.map(win => {
                    const feature = featuresMap.get(win.featureId);
                    if (!feature) return null;
                    return (
                        <Window
                            key={win.id}
                            feature={feature}
                            state={win}
                            isActive={win.id === activeId}
                            onClose={() => onClose(win.id)}
                            onMinimize={() => onMinimize(win.id)}
                            onFocus={() => onFocus(win.id)}
                            onUpdate={onUpdate}
                        />
                    );
                })}
            </div>
            <Taskbar
                minimizedWindows={minimizedWindows.map(w => featuresMap.get(w.featureId)).filter(Boolean) as Feature[]}
                onRestore={onLaunch}
            />
        </div>
    );
};