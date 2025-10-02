// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { generateSyntheticData } from '../../services/api';
import { JsonTreeIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const SyntheticDataGenerator: React.FC = () => {
    const [schema, setSchema] = useState<string>('A CSV with columns: user_id (integer), email (string), country (string, from [USA, Canada, UK]), and last_login (datetime).');
    const [data, setData] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!schema.trim()) {
            setError('Please describe the data schema.');
            return;
        }
        setIsLoading(true);
        setError('');
        setData('');
        try {
            const stream = generateSyntheticData(schema);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setData(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [schema]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <JsonTreeIcon />
                    <span className="ml-3">Synthetic Data Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Describe a schema to generate realistic but fake data for testing.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="schema-input" className="text-sm font-medium text-text-secondary mb-2">Schema Description</label>
                    <textarea
                        id="schema-input"
                        value={schema}
                        onChange={(e) => setSchema(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={4}
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Generate Data'}
                    </button>
                </div>
                <div className="flex-grow p-1 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="p-4 text-red-500">{error}</p>}
                    {data && <MarkdownRenderer content={data} />}
                </div>
            </div>
        </div>
    );
};
