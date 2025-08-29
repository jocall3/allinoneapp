import React, { useState, useCallback } from 'react';
import { suggestStatisticalModel } from '../../services/api';
import { BeakerIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const StatisticalModelSuggester: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('I have customer data with age, income, and purchase history. I want to predict if a customer will churn.');
    const [suggestions, setSuggestions] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) {
            setError('Please describe your dataset and goal.');
            return;
        }
        setIsLoading(true);
        setError('');
        setSuggestions('');
        try {
            const stream = suggestStatisticalModel(prompt);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setSuggestions(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <BeakerIcon />
                    <span className="ml-3">Statistical Model Suggester</span>
                </h1>
                <p className="text-text-secondary mt-1">Describe a dataset and goal to get suggestions for appropriate statistical models.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="prompt-input" className="text-sm font-medium text-text-secondary mb-2">Dataset & Goal Description</label>
                    <textarea
                        id="prompt-input"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={4}
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Suggest Models'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {suggestions && <MarkdownRenderer content={suggestions} />}
                </div>
            </div>
        </div>
    );
};
