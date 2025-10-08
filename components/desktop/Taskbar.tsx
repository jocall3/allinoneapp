import React, { useState, useEffect } from 'react';
import type { WindowState } from '../../types.ts';
import { FEATURES_MAP } from '../features/index.ts';
import Icon from '../ui/Icon.tsx';

// --- New Exported Components ---

/**
 * Displays the current time and date in the system tray.
 */
export const Clock: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second
    return () => clearInterval(timerId); // Cleanup on unmount
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col text-xs text-text-secondary items-center leading-none">
      <span className="font-medium">{formatTime(currentTime)}</span>
      <span className="font-light">{formatDate(currentTime)}</span>
    </div>
  );
};

interface TaskbarItemProps {
  window: WindowState;
  feature: typeof FEATURES_MAP extends Map<any, infer V> ? V : never;
  onRestore: (id: string) => void;
  isActive: boolean;
}

/**
 * Represents an individual application window button in the taskbar.
 * Shows its icon and name, and highlights if it's the active window.
 */
export const TaskbarItem: React.FC<TaskbarItemProps> = ({ window, feature, onRestore, isActive }) => {
  const itemClasses = [
    "h-9 px-3 flex items-center gap-2 rounded-md text-text-primary text-sm border border-border transition-all duration-200 ease-in-out",
    isActive ? "bg-primary/80 hover:bg-primary-darker text-white" : "bg-surface/70 hover:bg-surface-hover text-text-primary"
  ].join(' ');

  return (
    <button
      onClick={() => onRestore(window.id)}
      className={itemClasses}
      title={isActive ? `${feature.name} (Active)` : `Restore ${feature.name}`}
    >
      <Icon name={feature.icon} className={`w-4 h-4 ${isActive ? 'text-white' : 'text-primary'}`} />
      <span className="truncate">{feature.name}</span>
    </button>
  );
};

interface StartButtonProps {
  onToggleStartMenu: () => void;
}

/**
 * The Start button on the far left of the taskbar.
 */
export const StartButton: React.FC<StartButtonProps> = ({ onToggleStartMenu }) => {
  return (
    <button
      onClick={onToggleStartMenu}
      className="h-9 w-12 flex items-center justify-center rounded-md bg-accent/70 hover:bg-accent focus:ring-2 focus:ring-accent focus:ring-opacity-75 transition-colors duration-200 text-white text-sm font-semibold border border-border mr-2"
      title="Start"
      aria-label="Start menu"
    >
      {/* Assuming 'home' or 'windows' is an available icon. Using 'home' for generality. */}
      <Icon name="home" className="w-5 h-5" />
    </button>
  );
};

interface PinnedAppIconProps {
  featureId: string;
  onLaunch: (featureId: string) => void;
}

/**
 * Represents a pinned application icon on the taskbar.
 */
export const PinnedAppIcon: React.FC<PinnedAppIconProps> = ({ featureId, onLaunch }) => {
  const feature = FEATURES_MAP.get(featureId);
  if (!feature) return null;

  return (
    <button
      onClick={() => onLaunch(featureId)}
      className="h-9 w-9 flex items-center justify-center rounded-md bg-surface/70 hover:bg-surface-hover focus:ring-2 focus:ring-primary focus:ring-opacity-75 transition-colors duration-200 text-text-primary border border-border"
      title={feature.name}
      aria-label={`Launch ${feature.name}`}
    >
      <Icon name={feature.icon} className="w-5 h-5 text-primary" />
    </button>
  );
};

/**
 * The system tray area, containing the clock and other system indicators (e.g., notifications).
 */
export const SystemTray: React.FC = () => {
  const [notificationCount, setNotificationCount] = useState(2); // Example static count

  return (
    <div className="flex items-center gap-2 px-2 border-l border-border ml-auto">
      {/* Placeholder for other system icons like network, volume, etc. */}
      {/* <button className="p-1 rounded-md hover:bg-surface-hover transition-colors duration-200" title="Network Status">
        <Icon name="wifi" className="w-4 h-4 text-text-secondary" />
      </button>
      <button className="p-1 rounded-md hover:bg-surface-hover transition-colors duration-200" title="Volume Control">
        <Icon name="volume-up" className="w-4 h-4 text-text-secondary" />
      </button> */}

      {/* Notifications icon with badge */}
      <button className="relative p-1 rounded-md hover:bg-surface-hover transition-colors duration-200" title="Notifications">
        <Icon name="bell" className="w-4 h-4 text-text-secondary" />
        {notificationCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] rounded-full w-3 h-3 flex items-center justify-center font-bold">
            {notificationCount}
          </span>
        )}
      </button>

      <Clock />
    </div>
  );
};

// --- Updated Taskbar Component ---

interface TaskbarProps {
  minimizedWindows: WindowState[];
  onRestore: (id: string) => void;
  activeWindowId: string | null; // ID of the currently active window
  onToggleStartMenu: () => void; // Function to show/hide the start menu
  onShowDesktop: () => void; // Function to minimize all windows and show desktop
  onLaunchApp: (featureId: string) => void; // Function to launch an app (for pinned icons)
  pinnedAppIds: string[]; // Array of feature IDs for pinned applications
}

/**
 * The main Taskbar component for the desktop environment.
 * It displays the Start button, pinned applications, running applications,
 * system tray, and a show desktop button.
 */
export const Taskbar: React.FC<TaskbarProps> = ({
  minimizedWindows,
  onRestore,
  activeWindowId,
  onToggleStartMenu,
  onShowDesktop,
  onLaunchApp,
  pinnedAppIds
}) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-12 bg-surface/50 backdrop-blur-md border-t border-border flex items-center px-2 gap-2 z-[999] shadow-lg">
      {/* Left side: Start Button */}
      <StartButton onToggleStartMenu={onToggleStartMenu} />

      {/* Pinned Applications */}
      {pinnedAppIds.length > 0 && (
        <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
          {pinnedAppIds.map(featureId => (
            <PinnedAppIcon key={featureId} featureId={featureId} onLaunch={onLaunchApp} />
          ))}
        </div>
      )}

      {/* Running/Minimized Applications */}
      {minimizedWindows.length > 0 && (
        <div className="flex-grow flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {minimizedWindows.map(win => {
            const feature = FEATURES_MAP.get(win.featureId);
            if (!feature) return null;
            const isActive = win.id === activeWindowId;
            return (
              <TaskbarItem
                key={win.id}
                window={win}
                feature={feature}
                onRestore={onRestore}
                isActive={isActive}
              />
            );
          })}
        </div>
      )}

      {/* Right side: System Tray */}
      <SystemTray />

      {/* Show Desktop Button */}
      <button
        onClick={onShowDesktop}
        className="ml-2 h-9 w-10 flex items-center justify-center rounded-md bg-surface/70 hover:bg-surface-hover focus:ring-2 focus:ring-primary focus:ring-opacity-75 transition-colors duration-200 text-text-primary border border-border"
        title="Show Desktop"
        aria-label="Show desktop"
      >
        {/* Assuming 'monitor' or 'desktop' icon exists. Using 'monitor'. */}
        <Icon name="monitor" className="w-4 h-4 text-primary" />
      </button>
    </div>
  );
};