// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { generateProductRoadmap } from '../../services/api';
import { MapIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const ProductRoadmapGenerator: React.FC = () => {
    const [goals, setGoals] = useState<string>('Goal: Increase user engagement by 20% in Q3.\nFeatures: New dashboard, gamification elements, weekly email summaries.');
    const [roadmap, setRoadmap] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!goals.trim()) {
            setError('Please provide goals and features.');
            return;
        }
        setIsLoading(true);
        setError('');
        setRoadmap('');
        try {
            const stream = generateProductRoadmap(goals);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setRoadmap(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [goals]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <MapIcon />
                    <span className="ml-3">Product Roadmap Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Input goals and features to create a visual roadmap.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="goals-input" className="text-sm font-medium text-text-secondary mb-2">High-Level Goals & Features</label>
                    <textarea
                        id="goals-input"
                        value={goals}
                        onChange={(e) => setGoals(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={4}
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Generate Roadmap'}
                    </button>
                </div>
                <div className="flex-grow p-1 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="p-4 text-red-500">{error}</p>}
                    {roadmap && <MarkdownRenderer content={roadmap} />}
                </div>
            </div>
        </div>
    );
};
