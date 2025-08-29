import React, { useState, useCallback } from 'react';
import { analyzeSentiment } from '../../services/api';
import { PromptCraftPadIcon } from '../icons';
import { LoadingSpinner } from '../shared';

export const SentimentAwareResponseGeneration: React.FC = () => {
    const [text, setText] = useState<string>('The new update is fantastic! However, I did notice a small bug with the login button.');
    const [analysis, setAnalysis] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleAnalyze = useCallback(async () => {
        if (!text.trim()) {
            setError('Please enter text to analyze.');
            return;
        }
        setIsLoading(true);
        setError('');
        setAnalysis('');
        try {
            const result = await analyzeSentiment(text);
            setAnalysis(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [text]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <PromptCraftPadIcon />
                    <span className="ml-3">Sentiment-Aware Analysis</span>
                </h1>
                <p className="text-text-secondary mt-1">AI adjusts its tone and verbosity based on inferred user sentiment.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="text-input" className="text-sm font-medium text-text-secondary mb-2">Text to Analyze</label>
                    <textarea
                        id="text-input"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={4}
                    />
                    <button onClick={handleAnalyze} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Analyze Sentiment'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md">
                    <h3 className="font-semibold mb-2">Analysis:</h3>
                    {isLoading && <LoadingSpinner />}
                    {error && <p className="text-red-500">{error}</p>}
                    {analysis && <p>{analysis}</p>}
                </div>
            </div>
        </div>
    );
};
