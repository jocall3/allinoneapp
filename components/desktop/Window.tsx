import React, { Suspense, useRef } from 'react';
import type { Feature } from '../../types.ts';
import { LoadingSpinner } from '../shared/index.tsx';
import { MinimizeIcon, XMarkIcon } from '../icons.tsx';
import { FEATURES_MAP } from '../features/index.ts';

interface WindowState {
  id: string;
  featureId: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isMinimized: boolean;
  props?: any;
}

interface WindowProps {
  state: WindowState;
  isActive: boolean;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onFocus: (id: string) => void;
  onUpdate: (id: string, updates: Partial<WindowState>) => void;
}

export const Window: React.FC<WindowProps> = ({ state, isActive, onClose, onMinimize, onFocus, onUpdate }) => {
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const initialPos = useRef<{ x: number; y: number } | null>(null);
  
  const feature = FEATURES_MAP.get(state.featureId);
  const FeatureComponent = feature?.component;

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    onFocus(state.id);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    initialPos.current = { x: state.position.x, y: state.position.y };
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
  };

  const handleDragMove = (e: MouseEvent) => {
    if (!dragStartPos.current || !initialPos.current) return;
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    onUpdate(state.id, { position: { x: initialPos.current.x + dx, y: initialPos.current.y + dy }});
  };

  const handleDragEnd = () => {
    dragStartPos.current = null;
    initialPos.current = null;
    window.removeEventListener('mousemove', handleDragMove);
    window.removeEventListener('mouseup', handleDragEnd);
  };
  
  if (!feature) {
    return null; // or some error component
  }

  return (
    <div
      className={`absolute bg-surface/60 backdrop-blur-xl border rounded-lg shadow-2xl shadow-black/50 flex flex-col transition-all duration-200 ${isActive ? 'border-primary/50 ring-2 ring-primary' : 'border-border/50'}`}
      style={{
        left: state.position.x,
        top: state.position.y,
        width: state.size.width,
        height: state.size.height,
        zIndex: state.zIndex,
        visibility: state.isMinimized ? 'hidden' : 'visible',
      }}
      onMouseDown={() => onFocus(state.id)}
    >
      <header
        className={`flex items-center justify-between h-8 px-2 border-b ${isActive ? 'bg-surface/50 border-border' : 'bg-surface/30 border-border/50'} rounded-t-lg cursor-move`}
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-2 text-xs text-text-primary">
           <div className="w-4 h-4 text-primary">{feature.icon}</div>
           <span>{feature.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onMinimize(state.id)} className="p-1 rounded text-text-secondary hover:bg-white/10"><MinimizeIcon /></button>
          <button onClick={() => onClose(state.id)} className="p-1 rounded text-text-secondary hover:bg-danger/50 hover:text-white"><XMarkIcon className="w-4 h-4"/></button>
        </div>
      </header>
      <main className="flex-1 overflow-auto bg-background/50 rounded-b-lg">
        {FeatureComponent ? (
          <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><LoadingSpinner/></div>}>
            <FeatureComponent feature={feature} {...state.props} />
          </Suspense>
        ) : (
            <div className="p-4 text-danger">Error: Component not found for {feature.name}</div>
        )}
      </main>
    </div>
  );
};
