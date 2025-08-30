import React from 'react';
import type { Feature } from '../../types.ts';

interface TaskbarProps {
  minimizedWindows: Feature[];
  onRestore: (id: string) => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({ minimizedWindows, onRestore }) => {
  if (minimizedWindows.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-0 left-20 right-0 h-12 bg-surface/50 backdrop-blur-md border-t border-border flex items-center px-2 gap-2 z-[999]">
      {minimizedWindows.map(feature => (
        <button
          key={feature.id}
          onClick={() => onRestore(feature.id)}
          className="h-9 px-3 flex items-center gap-2 rounded-md bg-surface/70 hover:bg-surface-hover text-text-primary text-sm border border-border"
          title={`Restore ${feature.name}`}
        >
          <div className="w-4 h-4 text-primary">{feature.icon}</div>
          <span className="truncate">{feature.name}</span>
        </button>
      ))}
    </div>
  );
};
