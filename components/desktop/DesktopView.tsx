import React from 'react';
import { Window } from './Window.tsx';
import { Taskbar } from './Taskbar.tsx';
import { FeatureDock } from './FeatureDock.tsx';
import { ALL_FEATURES } from '../features/index.ts';
import type { Feature, WindowState } from '../../types.ts';
import { useAppStore } from '../../store/useAppStore.ts';

interface DesktopViewProps {
    windows: WindowState[];
    onLaunch: (featureId: string, props?: any) => void;
    onClose: (id: string) => void;
    onMinimize: (id: string) => void;
    onFocus: (id: string) => void;
    onUpdate: (id: string, updates: Partial<WindowState>) => void;
}

const featuresMap = new Map(ALL_FEATURES.map(f => [f.id, f]));

export const DesktopView: React.FC<DesktopViewProps> = ({ windows, onLaunch, onClose, onMinimize, onFocus, onUpdate }) => {
    
    const openWindows = windows.filter(w => !w.isMinimized);
    const minimizedWindows = windows.filter(w => w.isMinimized);

    const restoreWindow = useAppStore(s => s.restoreWindow);

    return (
        <div className="h-full flex flex-col bg-transparent relative">
            <FeatureDock onOpen={onLaunch} />
            <div className="flex-grow relative overflow-hidden pt-48">
                <div className="absolute inset-0 bg-grid"></div>
                
                {openWindows.map(win => {
                    const feature = featuresMap.get(win.featureId);
                    if (!feature) return null;
                    return (
                        <Window
                            key={win.id}
                            state={win}
                            onClose={onClose}
                            onMinimize={onMinimize}
                            onFocus={onFocus}
                            onUpdate={onUpdate}
                        />
                    );
                })}
            </div>
            <Taskbar
                minimizedWindows={minimizedWindows}
                onRestore={restoreWindow}
            />
        </div>
    );
};
