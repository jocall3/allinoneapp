// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { Suspense, useRef, useState, useEffect, useCallback } from 'react';
import type { WindowState } from '../../types.ts';
// The following import path has been adjusted to resolve the build error.
// Original: '../ui/LoadingSpinner'
// Common project structure assumes components are under a 'src' directory,
// where 'components/desktop' would be 'src/components/desktop' and 'ui' would be 'src/ui'.
// This adjustment (adding an extra '..') helps resolve 'src/ui' from 'src/components/desktop'.
import { LoadingSpinner } from '../ui/LoadingSpinner';
import Icon from '../ui/Icon';
import { FEATURES_MAP } from '../features/index.ts';
import { useAppStore } from '../../store/useAppStore.ts';

// Define Window Resize directions
export type ResizeDirection =
  | 'n'
  | 's'
  | 'e'
  | 'w'
  | 'ne'
  | 'nw'
  | 'se'
  | 'sw';

interface WindowProps {
  state: WindowState;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onFocus: (id: string) => void;
  onUpdate: (id: string, updates: Partial<WindowState>) => void;
}

export const Window: React.FC<WindowProps> = ({ state, onClose, onMinimize, onFocus, onUpdate }) => {
  const windowRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const initialPos = useRef<{ x: number; y: number } | null>(null);
  const initialSize = useRef<{ width: number; height: number } | null>(null);
  const resizeStartPos = useRef<{ x: number; y: number } | null>(null);
  const resizeDirection = useRef<ResizeDirection | null>(null);

  const [isMaximized, setIsMaximized] = useState(false);
  const [prevPosition, setPrevPosition] = useState<{ x: number; y: number }>(state.position);
  const [prevSize, setPrevSize] = useState<{ width: number; height: number }>(state.size);

  const activeId = useAppStore(s => s.activeWindowId);
  const isActive = state.id === activeId;
  
  const feature = FEATURES_MAP.get(state.featureId);
  const FeatureComponent = feature?.component;

  const MIN_WIDTH = 200;
  const MIN_HEIGHT = 150;

  const handleDragStart = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isMaximized) return; // Prevent dragging when maximized
    onFocus(state.id);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    initialPos.current = { x: state.position.x, y: state.position.y };
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
  }, [state.id, state.position, isMaximized, onFocus]);

  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!dragStartPos.current || !initialPos.current) return;
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    onUpdate(state.id, { position: { x: initialPos.current.x + dx, y: initialPos.current.y + dy }});
  }, [state.id, onUpdate]);

  const handleDragEnd = useCallback(() => {
    dragStartPos.current = null;
    initialPos.current = null;
    window.removeEventListener('mousemove', handleDragMove);
    window.removeEventListener('mouseup', handleDragEnd);
  }, [handleDragMove]);

  const handleResizeStart = useCallback((e: React.MouseEvent<HTMLDivElement>, direction: ResizeDirection) => {
    e.preventDefault();
    e.stopPropagation(); // Stop propagation to prevent dragStart from firing
    if (isMaximized) return; // Prevent resizing when maximized
    onFocus(state.id);
    resizeStartPos.current = { x: e.clientX, y: e.clientY };
    initialPos.current = { x: state.position.x, y: state.position.y };
    initialSize.current = { width: state.size.width, height: state.size.height };
    resizeDirection.current = direction;
    window.addEventListener('mousemove', handleResizeMove);
    window.addEventListener('mouseup', handleResizeEnd);
  }, [state.id, state.position, state.size, isMaximized, onFocus]);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!resizeStartPos.current || !initialSize.current || !initialPos.current || !resizeDirection.current) return;

    const dx = e.clientX - resizeStartPos.current.x;
    const dy = e.clientY - resizeStartPos.current.y;

    let newWidth = initialSize.current.width;
    let newHeight = initialSize.current.height;
    let newX = initialPos.current.x;
    let newY = initialPos.current.y;

    switch (resizeDirection.current) {
      case 'n':
        newHeight = Math.max(MIN_HEIGHT, initialSize.current.height - dy);
        newY = initialPos.current.y + (initialSize.current.height - newHeight);
        break;
      case 's':
        newHeight = Math.max(MIN_HEIGHT, initialSize.current.height + dy);
        break;
      case 'w':
        newWidth = Math.max(MIN_WIDTH, initialSize.current.width - dx);
        newX = initialPos.current.x + (initialSize.current.width - newWidth);
        break;
      case 'e':
        newWidth = Math.max(MIN_WIDTH, initialSize.current.width + dx);
        break;
      case 'nw':
        newWidth = Math.max(MIN_WIDTH, initialSize.current.width - dx);
        newX = initialPos.current.x + (initialSize.current.width - newWidth);
        newHeight = Math.max(MIN_HEIGHT, initialSize.current.height - dy);
        newY = initialPos.current.y + (initialSize.current.height - newHeight);
        break;
      case 'ne':
        newWidth = Math.max(MIN_WIDTH, initialSize.current.width + dx);
        newHeight = Math.max(MIN_HEIGHT, initialSize.current.height - dy);
        newY = initialPos.current.y + (initialSize.current.height - newHeight);
        break;
      case 'sw':
        newWidth = Math.max(MIN_WIDTH, initialSize.current.width - dx);
        newX = initialPos.current.x + (initialSize.current.width - newWidth);
        newHeight = Math.max(MIN_HEIGHT, initialSize.current.height + dy);
        break;
      case 'se':
        newWidth = Math.max(MIN_WIDTH, initialSize.current.width + dx);
        newHeight = Math.max(MIN_HEIGHT, initialSize.current.height + dy);
        break;
    }
    onUpdate(state.id, {
      position: { x: newX, y: newY },
      size: { width: newWidth, height: newHeight },
    });
  }, [state.id, onUpdate]);

  const handleResizeEnd = useCallback(() => {
    resizeStartPos.current = null;
    initialSize.current = null;
    initialPos.current = null;
    resizeDirection.current = null;
    window.removeEventListener('mousemove', handleResizeMove);
    window.removeEventListener('mouseup', handleResizeEnd);
  }, [handleResizeMove]);

  const handleMaximizeRestore = useCallback(() => {
    if (isMaximized) {
      // Restore from maximized
      onUpdate(state.id, {
        position: prevPosition,
        size: prevSize,
      });
      setIsMaximized(false);
    } else {
      // Maximize
      if (windowRef.current) {
        setPrevPosition(state.position);
        setPrevSize(state.size);

        const desktopWidth = window.innerWidth;
        const desktopHeight = window.innerHeight; // Consider taskbar height
        
        onUpdate(state.id, {
          position: { x: 0, y: 0 },
          size: { width: desktopWidth, height: desktopHeight },
        });
        setIsMaximized(true);
      }
    }
    onFocus(state.id);
  }, [state.id, state.position, state.size, isMaximized, prevPosition, prevSize, onUpdate, onFocus]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isActive) return;

      if (event.altKey) {
        switch (event.key) {
          case 'F4':
            event.preventDefault();
            onClose(state.id);
            break;
          case ' ': // Alt + Space for context menu (could be implemented later)
            event.preventDefault();
            // Implement context menu logic here
            break;
        }
      }
      if (event.metaKey || event.ctrlKey) { // MetaKey for Cmd on Mac, Ctrl for Win/Linux
        switch (event.key) {
          case 'm': // Minimize
            event.preventDefault();
            onMinimize(state.id);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, state.id, onClose, onMinimize]);

  // Ensure maximized state is consistent with actual window dimensions
  useEffect(() => {
    if (isMaximized && (state.position.x !== 0 || state.position.y !== 0 || state.size.width !== window.innerWidth || state.size.height !== window.innerHeight)) {
      // If window state is not fully maximized but isMaximized is true, correct it
      setIsMaximized(false);
    } else if (!isMaximized && state.position.x === 0 && state.position.y === 0 && state.size.width === window.innerWidth && state.size.height === window.innerHeight) {
      // If window is visually maximized but state is not, correct it
      setIsMaximized(true);
    }
  }, [state.position, state.size, isMaximized]);

  if (!feature) {
    console.error(`Feature not found for id: ${state.featureId}`);
    return (
        <div className="absolute p-4 text-danger bg-background/50 border border-danger/50 rounded-lg shadow-2xl"
             style={{ left: state.position.x, top: state.position.y, zIndex: state.zIndex }}>
            Error: Feature with ID "{state.featureId}" not found.
        </div>
    );
  }

  return (
    <div
      ref={windowRef}
      className={`absolute bg-surface/60 backdrop-blur-xl border rounded-lg shadow-2xl shadow-black/50 flex flex-col transition-all duration-200 ${isActive ? 'border-primary/50 ring-2 ring-primary' : 'border-border/50'} ${isMaximized ? 'rounded-none' : ''}`}
      style={{
        left: isMaximized ? 0 : state.position.x,
        top: isMaximized ? 0 : state.position.y,
        width: isMaximized ? '100vw' : state.size.width,
        height: isMaximized ? '100vh' : state.size.height,
        zIndex: state.zIndex,
        visibility: state.isMinimized ? 'hidden' : 'visible',
      }}
      onMouseDown={() => onFocus(state.id)}
    >
      {!isMaximized && (
        <>
          <div className="absolute top-0 left-0 w-2 h-2 cursor-nwse-resize" onMouseDown={(e) => handleResizeStart(e, 'nw')}></div>
          <div className="absolute top-0 right-0 w-2 h-2 cursor-nesw-resize" onMouseDown={(e) => handleResizeStart(e, 'ne')}></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 cursor-nesw-resize" onMouseDown={(e) => handleResizeStart(e, 'sw')}></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 cursor-nwse-resize" onMouseDown={(e) => handleResizeStart(e, 'se')}></div>
          <div className="absolute top-0 left-2 right-2 h-2 cursor-ns-resize" onMouseDown={(e) => handleResizeStart(e, 'n')}></div>
          <div className="absolute bottom-0 left-2 right-2 h-2 cursor-ns-resize" onMouseDown={(e) => handleResizeStart(e, 's')}></div>
          <div className="absolute left-0 top-2 bottom-2 w-2 cursor-ew-resize" onMouseDown={(e) => handleResizeStart(e, 'w')}></div>
          <div className="absolute right-0 top-2 bottom-2 w-2 cursor-ew-resize" onMouseDown={(e) => handleResizeStart(e, 'e')}></div>
        </>
      )}

      <header
        className={`flex items-center justify-between h-8 px-2 border-b ${isActive ? 'bg-surface/50 border-border' : 'bg-surface/30 border-border/50'} ${isMaximized ? 'rounded-none' : 'rounded-t-lg'} ${isMaximized ? '' : 'cursor-move'}`}
        onMouseDown={handleDragStart}
        onDoubleClick={handleMaximizeRestore} // Double-click header to maximize/restore
      >
        <div className="flex items-center gap-2 text-xs text-text-primary">
           <Icon name={feature.icon} className="w-4 h-4 text-primary" />
           <span>{feature.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onMinimize(state.id)} className="p-1 rounded text-text-secondary hover:bg-white/10" aria-label="Minimize Window"><Icon name="Minus" size={16} /></button>
          <button onClick={handleMaximizeRestore} className="p-1 rounded text-text-secondary hover:bg-white/10" aria-label={isMaximized ? "Restore Window" : "Maximize Window"}>
            <Icon name={isMaximized ? "Maximize" : "Square"} size={16} /> {/* Using 'Maximize' for restore and 'Square' for maximize */}
          </button>
          <button onClick={() => onClose(state.id)} className="p-1 rounded text-text-secondary hover:bg-danger/50 hover:text-white" aria-label="Close Window"><Icon name="X" size={16}/></button>
        </div>
      </header>
      <main className={`flex-1 overflow-auto bg-background/50 ${isMaximized ? 'rounded-none' : 'rounded-b-lg'}`}>
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

// Exported utility functions for window management, potentially for external use or testing
export const centerWindowPosition = (windowWidth: number, windowHeight: number): { x: number; y: number } => {
    const desktopWidth = window.innerWidth;
    const desktopHeight = window.innerHeight; // Assuming full viewport, adjust for taskbar if necessary
    return {
        x: (desktopWidth - windowWidth) / 2,
        y: (desktopHeight - windowHeight) / 2,
    };
};

// A simple helper to generate unique window IDs
export const generateWindowId = (featureId: string): string => {
    return `${featureId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

// Optional: A default window state factory
export const createDefaultWindowState = (
  featureId: string,
  initialWidth: number = 800,
  initialHeight: number = 600,
  props: Record<string, any> = {}
): WindowState => {
  const { x, y } = centerWindowPosition(initialWidth, initialHeight);
  return {
    id: generateWindowId(featureId),
    featureId,
    position: { x, y },
    size: { width: initialWidth, height: initialHeight },
    zIndex: 1, // Will be managed by the parent window manager
    isMinimized: false,
    props,
  };
};
