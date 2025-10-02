// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from 'react';
import type { WindowState } from '../../types.ts';
import { FEATURES_MAP } from '../features/index.ts';
import Icon from '../ui/Icon.tsx';

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
      {minimizedWindows.map(win => {
        const feature = FEATURES_MAP.get(win.featureId);
        if (!feature) return null;

        return (
          <button
            key={win.id}
            onClick={() => onRestore(win.id)}
            className="h-9 px-3 flex items-center gap-2 rounded-md bg-surface/70 hover:bg-surface-hover text-text-primary text-sm border border-border"
            title={`Restore ${feature.name}`}
          >
            <Icon name={feature.icon} className="w-4 h-4 text-primary" />
            <span className="truncate">{feature.name}</span>
          </button>
        )
      })}
    </div>
  );
};
