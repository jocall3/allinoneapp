// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback, useEffect } from 'react';
import { refactorCodeRealtime } from '../../services/api';
import { SparklesIcon } from '../icons';
import { LoadingSpinner } from '../shared';

export const RealTimeAiCodeRefactoring: React.FC = () => {
    const [code, setCode] = useState<string>('const x = arr.filter(i => i > 10);');
    const [suggestion, setSuggestion] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleRefactor = useCallback(async (codeToRefactor: string) => {
        if (!codeToRefactor.trim()) {
            setSuggestion('');
            return;
        }
        setIsLoading(true);
        try {
            const stream = refactorCodeRealtime(codeToRefactor);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
            }
            setSuggestion(fullResponse);
        } catch (err) {
            console.error(err);
            setSuggestion('Could not get suggestion.');
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    useEffect(() => {
        const handler = setTimeout(() => {
            handleRefactor(code);
        }, 1000); // Debounce for 1 second

        return () => {
            clearTimeout(handler);
        };
    }, [code, handleRefactor]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <SparklesIcon />
                    <span className="ml-3">Real-time AI Code Refactoring</span>
                </h1>
                <p className="text-text-secondary mt-1">As you code, AI provides real-time suggestions for refactoring.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                <div className="flex flex-col flex-grow">
                    <label htmlFor="code-input" className="text-sm font-medium text-text-secondary mb-2">Your Code</label>
                    <textarea
                        id="code-input"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm"
                    />
                </div>
                <div className="p-4 bg-background border border-border rounded-md min-h-[6rem]">
                    <h3 className="font-semibold mb-2">AI Suggestion:</h3>
                    {isLoading && <LoadingSpinner />}
                    {suggestion && !isLoading && <pre className="whitespace-pre-wrap font-mono text-sm text-green-500">{suggestion}</pre>}
                </div>
            </div>
        </div>
    );
};
