

import React, { Suspense, useCallback, useMemo, useState, useEffect } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { useAppContext } from './contexts/GlobalStateContext';
import { logEvent, initializeOctokit, validateToken } from './services/index';
import { ALL_FEATURES, FEATURES_MAP } from './components/features';
import type { ViewType, SidebarItem } from './types';
import { ActionManager } from './components/ActionManager';
import { LeftSidebar } from './components/LeftSidebar';
import { StatusBar } from './components/StatusBar';
import { CommandPalette } from './components/CommandPalette';
import { SettingsView } from './components/SettingsView';
import { Cog6ToothIcon, HomeIcon, FolderIcon, LinkIcon } from './components/icons';
import { LoginView } from './components/LoginView';


export const LoadingIndicator: React.FC = () => (
    <div className="w-full h-full flex items-center justify-center bg-surface">
        <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0s' }}></div>
            <div className="w-4 h-4 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-4 h-4 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            <span className="text-text-secondary ml-2">Loading Feature...</span>
        </div>
    </div>
);

interface LocalStorageConsentModalProps {
  onAccept: () => void;
  onDecline: () => void;
}

const LocalStorageConsentModal: React.FC<LocalStorageConsentModalProps> = ({ onAccept, onDecline }) => {
  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div 
        className="bg-surface border border-border rounded-2xl shadow-2xl shadow-black/50 w-full max-w-md m-4 p-8 text-center"
      >
        <h2 className="text-2xl mb-4">Store Data Locally?</h2>
        <p className="text-text-secondary mb-6">
          This application uses your browser's local storage to save your settings and remember your progress between sessions. This data stays on your computer and is not shared.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onDecline}
            className="px-6 py-2 bg-surface border border-border text-text-primary font-bold rounded-md hover:bg-gray-100 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={onAccept}
            className="btn-primary px-6 py-2"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { activeView, viewProps, hiddenFeatures, githubToken, isGithubConnected } = state;
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);

  useEffect(() => {
    try {
        const consent = localStorage.getItem('devcore_ls_consent');
        if (!consent) {
            setShowConsentModal(true);
        }
    } catch (e) {
        console.warn("Could not access localStorage.", e);
    }
  }, []);

   useEffect(() => {
    // On initial load, try to validate the token from local storage
    if(githubToken && !isGithubConnected) {
        validateToken(githubToken)
            .then(user => {
                initializeOctokit(githubToken);
                dispatch({ type: 'SET_GITHUB_TOKEN', payload: { token: githubToken, user } });
            })
            .catch(() => {
                // Token is invalid, clear it
                dispatch({ type: 'SET_GITHUB_TOKEN', payload: { token: null, user: null } });
            });
    }
  }, [githubToken, isGithubConnected, dispatch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            setCommandPaletteOpen(isOpen => !isOpen);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAcceptConsent = () => {
    try {
        localStorage.setItem('devcore_ls_consent', 'granted');
        window.location.reload();
    } catch (e) {
        console.error("Could not write to localStorage.", e);
        setShowConsentModal(false);
    }
  };

  const handleDeclineConsent = () => {
    try {
        localStorage.setItem('devcore_ls_consent', 'denied');
    } catch (e) {
        console.error("Could not write to localStorage.", e);
    }
    setShowConsentModal(false);
  };

  const handleViewChange = useCallback((view: ViewType, props: any = {}) => {
    dispatch({ type: 'SET_VIEW', payload: { view, props } });
    logEvent('view_changed', { view });
    setCommandPaletteOpen(false);
  }, [dispatch]);

  const sidebarItems: SidebarItem[] = useMemo(() => [
    { id: 'ai-command-center', label: 'Command Center', icon: <HomeIcon />, view: 'ai-command-center' },
    { id: 'project-explorer', label: 'Project Explorer', icon: <FolderIcon />, view: 'project-explorer' },
    ...ALL_FEATURES
        .filter(feature => !hiddenFeatures.includes(feature.id) && !['ai-command-center', 'project-explorer', 'connections'].includes(feature.id))
        .map(feature => ({
            id: feature.id,
            label: feature.name,
            icon: feature.icon,
            view: feature.id as ViewType,
        })),
    { id: 'connections', label: 'Connections', icon: <LinkIcon />, view: 'connections' },
    { id: 'settings', label: 'Settings', icon: <Cog6ToothIcon />, view: 'settings' },
  ], [hiddenFeatures]);

  const ActiveComponent = useMemo(() => {
      if (activeView === 'settings') return SettingsView;
      const featureComponent = FEATURES_MAP.get(activeView as string)?.component;
      // Fallback to command center's component from the map if the active one isn't found
      return featureComponent ?? FEATURES_MAP.get('ai-command-center')?.component ?? (() => <div>Component not found</div>);
  }, [activeView]);
  
  if (!isGithubConnected) {
    return <LoginView />;
  }

  return (
    <ErrorBoundary>
        <div className="h-screen w-screen font-sans overflow-hidden bg-background">
            {showConsentModal && <LocalStorageConsentModal onAccept={handleAcceptConsent} onDecline={handleDeclineConsent} />}
            <div className="relative flex h-full w-full">
                <LeftSidebar items={sidebarItems} activeView={state.activeView} onNavigate={handleViewChange} />
                <div className="flex-1 flex min-w-0">
                    <div className="flex-1 flex flex-col min-w-0">
                        <main className="relative flex-1 min-w-0 bg-surface/50 overflow-y-auto">
                            <Suspense fallback={<LoadingIndicator />}>
                                <div key={activeView} className="w-full h-full">
                                    <ActiveComponent {...viewProps} />
                                </div>
                            </Suspense>
                            <ActionManager />
                        </main>
                        <StatusBar bgImageStatus="loaded" />
                    </div>
                </div>
                <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} onSelect={handleViewChange} />
            </div>
        </div>
    </ErrorBoundary>
  );
};

export default App;