import React, { useState, useCallback } from 'react';
import { analyzeSentimentTrends } from '../../services/api';
import { ChartBarIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

const exampleData = `
date:2024-07-01, text: "The new update is amazing!"
date:2024-07-02, text: "I'm having trouble with the login page, it's very frustrating."
date:2024-07-03, text: "Customer support was very helpful today."
`;

export const SentimentTrendAnalysis: React.FC = () => {
    const [data, setData] = useState<string>(exampleData);
    const [report, setReport] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleAnalyze = useCallback(async () => {
        if (!data.trim()) {
            setError('Please provide time-series text data.');
            return;
        }
        setIsLoading(true);
        setError('');
        setReport('');
        try {
            const stream = analyzeSentimentTrends(data);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setReport(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [data]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <ChartBarIcon />
                    <span className="ml-3">Sentiment Trend Analysis</span>
                </h1>
                <p className="text-text-secondary mt-1">Input time-series text data to analyze sentiment trends.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="data-input" className="text-sm font-medium text-text-secondary mb-2">Time-Series Text Data</label>
                    <textarea
                        id="data-input"
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none"
                    />
                    <button onClick={handleAnalyze} disabled={isLoading} className="btn-primary mt-4 w-full">
                        {isLoading ? <LoadingSpinner /> : 'Analyze Trends'}
                    </button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">Trend Report</label>
                    <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                        {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                        {error && <p className="text-red-500">{error}</p>}
                        {report && <MarkdownRenderer content={report} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
