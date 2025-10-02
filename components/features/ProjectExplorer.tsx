// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.


import React, { useState, useEffect } from 'react';
// FIX: Renamed useGlobalState to useAppContext
import { useAppContext } from '../../contexts/GlobalStateContext';
import { getRepos, getRepoTree, getFileContent } from '../../services/index';
import type { Repo, FileNode } from '../../types';
import { FolderIcon, DocumentIcon } from '../icons';
import { LoadingSpinner } from '../shared/index';

const FileTree: React.FC<{ node: FileNode, onFileSelect: (path: string) => void }> = ({ node, onFileSelect }) => {
    const [isOpen, setIsOpen] = useState(true);

    // FIX: Use isDirectory boolean property instead of non-existent type property.
    if (!node.isDirectory) {
        return (
            <div
                className="flex items-center space-x-2 pl-4 py-1 cursor-pointer hover:bg-gray-100 rounded"
                onClick={() => onFileSelect(node.path)}
            >
                <DocumentIcon />
                <span>{node.name}</span>
            </div>
        );
    }

    return (
        <div>
            <div
                className="flex items-center space-x-2 py-1 cursor-pointer hover:bg-gray-100 rounded"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className={`transform transition-transform ${isOpen ? 'rotate-90' : ''}`}>▶</div>
                <FolderIcon />
                <span className="font-semibold">{node.name}</span>
            </div>
            {/* FIX: Check for children array before attempting to map over it. */}
            {isOpen && node.children && (
                <div className="pl-4 border-l border-border ml-3">
                    {node.children.map(child => <FileTree key={child.path} node={child} onFileSelect={onFileSelect} />)}
                </div>
            )}
        </div>
    );
};

export const ProjectExplorer: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { githubToken, selectedRepo, projectFiles } = state;
    const [repos, setRepos] = useState<Repo[]>([]);
    const [isLoading, setIsLoading] = useState<'repos' | 'tree' | null>(null);
    const [error, setError] = useState('');
    const [activeFileContent, setActiveFileContent] = useState<string | null>(null);

    useEffect(() => {
        if (githubToken) {
            setIsLoading('repos');
            setError('');
            getRepos()
                .then(setRepos)
                .catch(err => setError(err.message))
                .finally(() => setIsLoading(null));
        } else {
            setRepos([]);
        }
    }, [githubToken]);

    useEffect(() => {
        if (selectedRepo && githubToken) {
            setIsLoading('tree');
            setError('');
            setActiveFileContent(null);
            getRepoTree(selectedRepo.owner, selectedRepo.repo)
                .then(tree => dispatch({ type: 'LOAD_PROJECT_FILES', payload: tree }))
                .catch(err => setError(err.message))
                .finally(() => setIsLoading(null));
        }
    }, [selectedRepo, githubToken, dispatch]);

    const handleFileSelect = async (path: string) => {
        if (!selectedRepo) return;
        try {
            const content = await getFileContent(selectedRepo.owner, selectedRepo.repo, path);
            setActiveFileContent(content);
        } catch (err) {
            setError((err as Error).message);
        }
    };
    
    if (!githubToken) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center text-text-secondary p-4">
                <FolderIcon />
                <h2 className="text-lg font-semibold mt-2">Connect to GitHub</h2>
                <p>Please go to the "Connections" tab and provide a Personal Access Token to explore your repositories.</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col text-text-primary">
            <header className="p-4 border-b border-border flex-shrink-0">
                <h1 className="text-xl font-bold flex items-center"><FolderIcon /><span className="ml-3">Project Explorer</span></h1>
                <div className="mt-2">
                    <select
                        value={selectedRepo ? `${selectedRepo.owner}/${selectedRepo.repo}` : ''}
                        onChange={e => {
                            const [owner, repo] = e.target.value.split('/');
                            dispatch({ type: 'SET_SELECTED_REPO', payload: { owner, repo } });
                        }}
                        className="w-full p-2 bg-surface border border-border rounded-md text-sm"
                    >
                        <option value="" disabled>{isLoading === 'repos' ? 'Loading...' : 'Select a repository'}</option>
                        {repos.map(r => <option key={r.id} value={r.full_name}>{r.full_name}</option>)}
                    </select>
                </div>
                {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            </header>
            <div className="flex-grow flex min-h-0">
                <aside className="w-1/3 bg-background border-r border-border p-4 overflow-y-auto">
                    {isLoading === 'tree' && <div className="flex justify-center"><LoadingSpinner /></div>}
                    {projectFiles && <FileTree node={projectFiles} onFileSelect={handleFileSelect} />}
                </aside>
                <main className="flex-1 bg-surface">
                    <pre className="w-full h-full p-4 text-sm overflow-auto whitespace-pre-wrap">
                        <code>{activeFileContent ?? 'Select a file to view its content.'}</code>
                    </pre>
                </main>
            </div>
        </div>
    );
};
