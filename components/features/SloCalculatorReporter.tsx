import React, { useState, useCallback } from 'react';
import { calculateSlo } from '../../services/api';
import { ChartBarIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const SloCalculatorReporter: React.FC = () => {
    const [metrics, setMetrics] = useState<string>('Uptime: 99.95%, Average Latency: 150ms');
    const [report, setReport] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!metrics.trim()) {
            setError('Please provide metrics.');
            return;
        }
        setIsLoading(true);
        setError('');
        setReport('');
        try {
            const stream = calculateSlo(metrics);
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
    }, [metrics]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <ChartBarIcon />
                    <span className="ml-3">SLA/SLO Calculator & Reporter</span>
                </h1>
                <p className="text-text-secondary mt-1">Input performance metrics to generate an SLO report.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="metrics-input" className="text-sm font-medium text-text-secondary mb-2">Performance Metrics</label>
                    <textarea
                        id="metrics-input"
                        value={metrics}
                        onChange={(e) => setMetrics(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={3}
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Generate Report'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {report && <MarkdownRenderer content={report} />}
                </div>
            </div>
        </div>
    );
};
