// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { suggestVariableNames } from '../../services/api';
import { PencilIcon } from '../icons';
import { LoadingSpinner } from '../shared';

const exampleCode = `
function proc(arr) {
  let temp = 0;
  for (let i = 0; i < arr.length; i++) {
    temp += arr[i];
  }
  return temp;
}
`;

export const SuggestBetterVariableNames: React.FC = () => {
    const [code, setCode] = useState<string>(exampleCode);
    const [suggestions, setSuggestions] = useState<{ original: string; suggested: string }[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleSuggest = useCallback(async () => {
        if (!code.trim()) {
            setError('Please enter code to analyze.');
            return;
        }
        setIsLoading(true);
        setError('');
        setSuggestions([]);
        try {
            const result = await suggestVariableNames(code);
            setSuggestions(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [code]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <PencilIcon />
                    <span className="ml-3">Suggest Better Variable Names</span>
                </h1>
                <p className="text-text-secondary mt-1">Get suggestions for more descriptive variable names.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="code-input" className="text-sm font-medium text-text-secondary mb-2">Code</label>
                    <textarea
                        id="code-input"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm"
                    />
                    <button onClick={handleSuggest} disabled={isLoading} className="btn-primary mt-4 w-full">
                        {isLoading ? <LoadingSpinner /> : 'Get Suggestions'}
                    </button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">Suggestions</label>
                    <div className="flex-grow p-4 bg-background border border-border rounded-md">
                        {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                        {error && <p className="text-red-500">{error}</p>}
                        {suggestions.length > 0 && (
                            <ul className="space-y-2">
                                {suggestions.map((s, i) => <li key={i} className="font-mono text-sm"><span className="text-red-500">{s.original}</span> → <span className="text-green-500">{s.suggested}</span></li>)}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
