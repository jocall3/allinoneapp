// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { streamContent } from '../../services/geminiCore';
import { ShieldCheckIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const RiskAnalysisTool: React.FC = () => {
    const [scenario, setScenario] = useState<string>('Launching a new mobile application in a highly competitive market.');
    const [analysis, setAnalysis] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleAnalyze = useCallback(async () => {
        if (!scenario.trim()) {
            setError('Please describe the scenario.');
            return;
        }
        setIsLoading(true);
        setError('');
        setAnalysis('');
        try {
            const prompt = `Perform a risk analysis for the following business scenario, identifying key risks and suggesting mitigation strategies. Scenario: ${scenario}`;
            const stream = streamContent(prompt, "You are a risk management consultant.");
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setAnalysis(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [scenario]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <ShieldCheckIcon />
                    <span className="ml-3">Risk Analysis Tool</span>
                </h1>
                <p className="text-text-secondary mt-1">Identify key risks and mitigation strategies for a business scenario.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="scenario-input" className="text-sm font-medium text-text-secondary mb-2">Business Scenario</label>
                    <textarea
                        id="scenario-input"
                        value={scenario}
                        onChange={(e) => setScenario(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={4}
                    />
                    <button onClick={handleAnalyze} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Analyze Risks'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {analysis && <MarkdownRenderer content={analysis} />}
                </div>
            </div>
        </div>
    );
};
