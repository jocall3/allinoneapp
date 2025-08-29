import React, { useState, useCallback } from 'react';
import { getContextualSuggestions } from '../../services/api';
import { SparklesIcon } from '../icons.tsx';
import { LoadingSpinner } from '../shared';

export const ContextAwareCommandSuggestions: React.FC = () => {
    const [context, setContext] = useState<string>('Editing a CSS file for a login button.');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleSuggest = useCallback(async () => {
        if (!context.trim()) {
            setError('Please provide a context.');
            return;
        }
        setIsLoading(true);
        setError('');
        setSuggestions([]);
        try {
            const result = await getContextualSuggestions(context);
            setSuggestions(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [context]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary items-center">
            <header className="mb-6 text-center">
                <h1 className="text-3xl font-bold flex items-center justify-center">
                    <SparklesIcon />
                    <span className="ml-3">Context-Aware Command Suggestions</span>
                </h1>
                <p className="text-text-secondary mt-1">AI suggests commands based on your current task.</p>
            </header>
            <div className="w-full max-w-2xl space-y-4">
                <div>
                    <label htmlFor="context-input" className="text-sm font-medium text-text-secondary mb-2">Your Current Context</label>
                    <textarea
                        id="context-input"
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={3}
                    />
                </div>
                <button onClick={handleSuggest} disabled={isLoading} className="btn-primary w-full">
                    {isLoading ? <LoadingSpinner /> : 'Get Suggestions'}
                </button>
                <div className="p-4 bg-background border border-border rounded-md min-h-[10rem]">
                    <h3 className="font-semibold mb-2">Suggestions:</h3>
                    {isLoading && <LoadingSpinner />}
                    {error && <p className="text-red-500">{error}</p>}
                    {suggestions.length > 0 && (
                        <ul className="list-disc list-inside space-y-2">
                            {suggestions.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};
