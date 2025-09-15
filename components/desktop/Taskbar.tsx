import React from 'react';
import type { Feature } from '../../types.ts';
import { FEATURES_MAP } from '../features/index.ts';

// ADDED: WindowState type to match the data being passed
interface WindowState {
  id: string;
  featureId: string;
  isMinimized: boolean;
}

interface TaskbarProps {
  minimizedWindows: WindowState[];
  onRestore: (id: string) => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({ minimizedWindows, onRestore }) => {
  if (minimizedWindows.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-0 left-20 right-0 h-12 bg-surface/50 backdrop-blur-md border-t border-border flex items-center px-2 gap-2 z-[999]">
      {/* FIX: Now correctly maps minimized windows to restore buttons */}
      {minimizedWindows.map(window => {
        const feature = FEATURES_MAP.get(window.featureId);
        if (!feature) return null;
        return (
            <button
            key={window.id}
            onClick={() => onRestore(window.id)}
            className="h-9 px-3 flex items-center gap-2 rounded-md bg-surface/70 hover:bg-surface-hover text-text-primary text-sm border border-border"
            title={`Restore ${feature.name}`}
            >
            <div className="w-4 h-4 text-primary">{feature.icon}</div>
            <span className="truncate">{feature.name}</span>
            </button>
        )
      })}
    </div>
  );
};
