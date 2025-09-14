import React, { useState, useEffect } from 'react';
import { GithubIcon } from '../icons.tsx';
// FIX: Renamed useGlobalState to useAppContext
import { useAppContext } from '../../contexts/GlobalStateContext.tsx';
import { initializeOctokit, validateToken } from '../../services/index.ts';
import { LoadingSpinner } from '../shared/LoadingSpinner.tsx';
import type { User } from '../../types.ts';

const GitHubConnection: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { githubToken, isGithubConnected, githubUser } = state;
    const [tokenInput, setTokenInput] = useState(githubToken || '');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [error, setError] = useState('');

    useEffect(() => {
        // When the component loads, if there's a token in the global state,
        // try to initialize octokit with it.
        if (githubToken && !isGithubConnected) {
             handleConnect(githubToken);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [githubToken]);

    const handleConnect = async (tokenToConnect: string) => {
        if (!tokenToConnect.trim()) {
            setError('Please enter a token.');
            setStatus('error');
            return;
        }
        setStatus('loading');
        setError('');
        try {
            const user: User = await validateToken(tokenToConnect);
            initializeOctokit(tokenToConnect);
            dispatch({ type: 'SET_GITHUB_TOKEN', payload: { token: tokenToConnect, user } });
            setStatus('success');
        } catch (err) {
            setError(err instanceof Error ? `Invalid Token: ${err.message}` : 'An unknown error occurred.');
            setStatus('error');
            initializeOctokit('');
            dispatch({ type: 'SET_GITHUB_TOKEN', payload: { token: null, user: null } });
        }
    };
    
    const handleDisconnect = () => {
        setTokenInput('');
        initializeOctokit('');
        dispatch({ type: 'SET_GITHUB_TOKEN', payload: { token: null, user: null } });
        setStatus('idle');
    };

    return (
        <div className="bg-surface border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10"><GithubIcon /></div>
                    <div>
                        <h3 className="text-lg font-bold text-text-primary">GitHub</h3>
                        {isGithubConnected && githubUser ? (
                             <p className="text-sm text-green-600">Connected as {githubUser.login}</p>
                        ) : (
                             <p className="text-sm text-text-secondary">Not Connected</p>
                        )}
                    </div>
                </div>
                 {isGithubConnected && (
                    <button onClick={handleDisconnect} className="px-4 py-2 bg-red-500/10 text-red-600 font-semibold rounded-lg hover:bg-red-500/20">
                        Disconnect
                    </button>
                 )}
            </div>
            
            {!isGithubConnected && (
                <div className="mt-4 pt-4 border-t border-border">
                    <label htmlFor="github-pat" className="block text-sm font-medium text-text-secondary mb-1">Personal Access Token (Classic)</label>
                    <div className="flex gap-2">
                        <input
                            id="github-pat"
                            type="password"
                            value={tokenInput}
                            onChange={(e) => setTokenInput(e.target.value)}
                            placeholder="ghp_..."
                            className="flex-grow p-2 bg-background border border-border rounded-md text-sm"
                        />
                         <button onClick={() => handleConnect(tokenInput)} disabled={status === 'loading'} className="btn-primary px-6 py-2 flex items-center justify-center min-w-[100px]">
                            {status === 'loading' ? <LoadingSpinner /> : 'Connect'}
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                    <p className="text-xs text-text-secondary mt-2">
                        Your token is stored only in your browser's local storage. Required scopes: `repo`, `read:user`.
                    </p>
                </div>
            )}
        </div>
    );
};

export const Connections: React.FC = () => {
    return (
        <div className="h-full p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-4xl font-extrabold tracking-tight">Connections</h1>
                    <p className="mt-2 text-lg text-text-secondary">Manage your GitHub connection to unlock powerful workflows.</p>
                </header>

                <div className="space-y-6">
                    <GitHubConnection />
                </div>
            </div>
        </div>
    );
};