// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { optimizeSqlQuery } from '../../services/api';
import { ServerStackIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

const exampleQuery = `SELECT * FROM users WHERE status = 'active' AND country = 'USA'`;

export const SqlOptimizer: React.FC = () => {
    const [query, setQuery] = useState<string>(exampleQuery);
    const [report, setReport] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleOptimize = useCallback(async () => {
        if (!query.trim()) {
            setError('Please provide a SQL query.');
            return;
        }
        setIsLoading(true);
        setError('');
        setReport('');
        try {
            const stream = optimizeSqlQuery(query);
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
    }, [query]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <ServerStackIcon />
                    <span className="ml-3">SQL Query Optimizer</span>
                </h1>
                <p className="text-text-secondary mt-1">Paste a slow SQL query and get optimization suggestions.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="query-input" className="text-sm font-medium text-text-secondary mb-2">SQL Query</label>
                    <textarea
                        id="query-input"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm"
                    />
                    <button onClick={handleOptimize} disabled={isLoading} className="btn-primary mt-4 w-full">
                        {isLoading ? <LoadingSpinner /> : 'Optimize Query'}
                    </button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">Optimization Report</label>
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
