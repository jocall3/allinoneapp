/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { createContext, useReducer, useContext, useEffect, useCallback } from 'react';
import type { ViewType, FileNode, SortOption, ModalState, User, DashboardData, Repo } from '../types';
import { ingestDirectory, openDirectoryAndIngest } from '../services/fileSystemService';

interface AppState {
    rootHandle: FileSystemDirectoryHandle | null;
    currentHandle: FileSystemDirectoryHandle | null;
    path: { name: string; handle: FileSystemDirectoryHandle }[];
    files: FileNode[];
    loading: boolean;
    error: string | null;
    viewType: ViewType;
    sort: SortOption;
    modal: ModalState | null;
    isTerminalOpen: boolean;
    searchResults: FileNode[] | null;
    githubToken: string | null;
    githubUser: User | null;
    isGithubConnected: boolean;
    isDashboardVisible: boolean;
    dashboardData: DashboardData | null;
    isDashboardLoading: boolean;
    hiddenFeatures: string[];
    selectedRepo: { owner: string; repo: string } | null;
    projectFiles: FileNode | null;
    isVoiceCommanderOpen: boolean;
    // FIX: Add state to handle feature launch requests from anywhere in the app.
    launchRequest: { featureId: string; props?: any; id: number; } | null;
}

type Action =
    | { type: 'SET_ROOT_HANDLE'; payload: FileSystemDirectoryHandle | null }
    | { type: 'SET_CURRENT_HANDLE'; payload: { handle: FileSystemDirectoryHandle; path: { name: string; handle: FileSystemDirectoryHandle }[] } }
    | { type: 'SET_FILES'; payload: FileNode[] }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_VIEW_TYPE'; payload: ViewType }
    | { type: 'SET_SORT'; payload: SortOption }
    | { type: 'OPEN_MODAL'; payload: ModalState }
    | { type: 'CLOSE_MODAL' }
    | { type: 'TOGGLE_TERMINAL' }
    | { type: 'SET_SEARCH_RESULTS'; payload: FileNode[] | null }
    | { type: 'SET_GITHUB_TOKEN'; payload: { token: string | null, user: User | null } }
    | { type: 'LOGOUT' }
    | { type: 'TOGGLE_DASHBOARD' }
    | { type: 'SET_DASHBOARD_LOADING'; payload: boolean }
    | { type: 'SET_DASHBOARD_DATA'; payload: DashboardData | null }
    | { type: 'TOGGLE_FEATURE_VISIBILITY'; payload: { featureId: string } }
    | { type: 'SET_SELECTED_REPO'; payload: { owner: string; repo: string } }
    | { type: 'LOAD_PROJECT_FILES'; payload: FileNode }
    | { type: 'SET_VOICE_COMMANDER_OPEN'; payload: boolean }
    // FIX: Add actions for launching features to align with the desktop UI paradigm.
    | { type: 'LAUNCH_FEATURE'; payload: { featureId: string, props?: any } }
    | { type: 'LAUNCH_FEATURE_CONSUMED' };


const initialState: AppState = {
    rootHandle: null,
    currentHandle: null,
    path: [],
    files: [],
    loading: false,
    error: null,
    viewType: 'grid',
    sort: { field: 'name', direction: 'asc' },
    modal: null,
    isTerminalOpen: false,
    searchResults: null,
    githubToken: localStorage.getItem('github_pat'),
    githubUser: null,
    isGithubConnected: false,
    isDashboardVisible: false,
    dashboardData: null,
    isDashboardLoading: false,
    hiddenFeatures: [],
    selectedRepo: null,
    projectFiles: null,
    isVoiceCommanderOpen: false,
    // FIX: Initialize launchRequest state.
    launchRequest: null,
};

const reducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'SET_ROOT_HANDLE':
            return { 
                ...initialState, 
                rootHandle: action.payload, 
                githubToken: state.githubToken,
                githubUser: state.githubUser,
                isGithubConnected: state.isGithubConnected,
            };
        case 'SET_CURRENT_HANDLE':
            return {
                ...state,
                currentHandle: action.payload.handle,
                path: action.payload.path,
                dashboardData: null,
                isDashboardLoading: false,
            };
        case 'SET_FILES':
            return { ...state, files: action.payload };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };
        case 'SET_VIEW_TYPE':
            return { ...state, viewType: action.payload };
        case 'SET_SORT':
            return { ...state, sort: action.payload };
        case 'OPEN_MODAL':
            return { ...state, modal: action.payload };
        case 'CLOSE_MODAL':
            return { ...state, modal: null };
        case 'TOGGLE_TERMINAL':
            return { ...state, isTerminalOpen: !state.isTerminalOpen };
        case 'SET_SEARCH_RESULTS':
            return { ...state, searchResults: action.payload };
        case 'TOGGLE_DASHBOARD':
            return { ...state, isDashboardVisible: !state.isDashboardVisible };
        case 'SET_DASHBOARD_LOADING':
            return { ...state, isDashboardLoading: action.payload };
        case 'SET_DASHBOARD_DATA':
            return { ...state, dashboardData: action.payload, isDashboardLoading: false };
        case 'SET_GITHUB_TOKEN':
            if (action.payload.token) {
                localStorage.setItem('github_pat', action.payload.token);
            } else {
                localStorage.removeItem('github_pat');
            }
            return {
                ...state,
                githubToken: action.payload.token,
                githubUser: action.payload.user,
                isGithubConnected: !!action.payload.token,
            };
        case 'LOGOUT':
             localStorage.removeItem('github_pat');
             return {
                 ...state,
                 githubToken: null,
                 githubUser: null,
                 isGithubConnected: false,
                 selectedRepo: null,
                 projectFiles: null,
             };
        case 'TOGGLE_FEATURE_VISIBILITY': {
            const { featureId } = action.payload;
            const isHidden = state.hiddenFeatures.includes(featureId);
            return {
                ...state,
                hiddenFeatures: isHidden
                    ? state.hiddenFeatures.filter(id => id !== featureId)
                    : [...state.hiddenFeatures, featureId],
            };
        }
        case 'SET_SELECTED_REPO':
            return { ...state, selectedRepo: action.payload };
        case 'LOAD_PROJECT_FILES':
            return { ...state, projectFiles: action.payload };
        case 'SET_VOICE_COMMANDER_OPEN':
            return { ...state, isVoiceCommanderOpen: action.payload };
        // FIX: Add reducer cases for launching features.
        case 'LAUNCH_FEATURE':
            return { ...state, launchRequest: { ...action.payload, id: Date.now() } };
        case 'LAUNCH_FEATURE_CONSUMED':
            return { ...state, launchRequest: null };
        default:
            return state;
    }
};

// Renamed AppContext to GlobalStateAppContext for clarity, but AppContext is also fine if only one global context.
const AppContext = createContext<{ 
    state: AppState;
    dispatch: React.Dispatch<Action>;
    openFolder: () => Promise<void>;
}>({
    state: initialState,
    dispatch: () => null,
    openFolder: async () => {},
});

// RENAMED from AppProvider to GlobalStateProvider to match index.tsx import
export const GlobalStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    const openFolder = useCallback(async () => {
        const handle = await openDirectoryAndIngest();
        if (handle) {
            dispatch({ type: 'SET_ROOT_HANDLE', payload: handle });
        }
    }, []);

    useEffect(() => {
        if (state.rootHandle) {
            ingestDirectory(state.rootHandle).then(() => {
                dispatch({
                    type: 'SET_CURRENT_HANDLE',
                    payload: { handle: state.rootHandle!, path: [{ name: state.rootHandle!.name, handle: state.rootHandle! }] },
                });
            });
        }
    }, [state.rootHandle]);

    return (
        <AppContext.Provider value={{ state, dispatch, openFolder }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);