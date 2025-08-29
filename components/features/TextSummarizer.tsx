import React, { useState, useCallback } from 'react';
import { generateFileSummary } from '../../services/api';
import { DocumentTextIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const TextSummarizer: React.FC = () => {
    const [text, setText] = useState<string>('The Industrial Revolution was the transition to new manufacturing processes in Europe and the United States, in the period from about 1760 to sometime between 1820 and 1840. This transition included going from hand production methods to machines, new chemical manufacturing and iron production processes, the increasing use of steam power and water power, the development of machine tools and the rise of the mechanized factory system.');
    const [summary, setSummary] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleSummarize = useCallback(async () => {
        if (!text.trim()) {
            setError('Please provide text to summarize.');
            return;
        }
        setIsLoading(true);
        setError('');
        setSummary('');
        try {
            const stream = generateFileSummary(text);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setSummary(fullResponse);
            }
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
                    <DocumentTextIcon />
                    <span className="ml-3">Text Summarizer</span>
                </h1>
                <p className="text-text-secondary mt-1">Generate a concise summary of a long piece of text.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="text-input" className="text-sm font-medium text-text-secondary mb-2">Original Text</label>
                    <textarea
                        id="text-input"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none"
                    />
                    <button onClick={handleSummarize} disabled={isLoading} className="btn-primary mt-4 w-full">
                        {isLoading ? <LoadingSpinner /> : 'Summarize'}
                    </button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">Summary</label>
                    <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                        {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                        {error && <p className="text-red-500">{error}</p>}
                        {summary && <MarkdownRenderer content={summary} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
