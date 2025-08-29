import React, { useState, useCallback } from 'react';
import { streamContent } from '../../services/geminiCore';
import { ChartBarIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const PortfolioOptimizationTool: React.FC = () => {
    const [portfolio, setPortfolio] = useState<string>('Stocks: 60% AAPL, 40% GOOG. Risk Tolerance: Medium.');
    const [advice, setAdvice] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleAnalyze = useCallback(async () => {
        if (!portfolio.trim()) {
            setError('Please describe your portfolio.');
            return;
        }
        setIsLoading(true);
        setError('');
        setAdvice('');
        try {
            const prompt = `Analyze this investment portfolio and suggest optimizations based on Modern Portfolio Theory. Portfolio: ${portfolio}`;
            const stream = streamContent(prompt, "You are a financial advisor AI.");
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setAdvice(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [portfolio]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <ChartBarIcon />
                    <span className="ml-3">Portfolio Optimization Tool</span>
                </h1>
                <p className="text-text-secondary mt-1">Get AI-driven advice on optimizing your investment portfolio.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="portfolio-input" className="text-sm font-medium text-text-secondary mb-2">Your Portfolio</label>
                    <textarea
                        id="portfolio-input"
                        value={portfolio}
                        onChange={(e) => setPortfolio(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none"
                    />
                    <button onClick={handleAnalyze} disabled={isLoading} className="btn-primary mt-4 w-full">
                        {isLoading ? <LoadingSpinner /> : 'Optimize Portfolio'}
                    </button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">Optimization Advice</label>
                    <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                        {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                        {error && <p className="text-red-500">{error}</p>}
                        {advice && <MarkdownRenderer content={advice} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
