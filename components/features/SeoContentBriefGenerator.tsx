import React, { useState, useCallback } from 'react';
import { generateSeoBrief } from '../../services/api';
import { DocumentTextIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const SeoContentBriefGenerator: React.FC = () => {
    const [keyword, setKeyword] = useState<string>('best productivity apps for developers');
    const [brief, setBrief] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!keyword.trim()) {
            setError('Please provide a target keyword.');
            return;
        }
        setIsLoading(true);
        setError('');
        setBrief('');
        try {
            const stream = generateSeoBrief(keyword);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setBrief(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [keyword]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <DocumentTextIcon />
                    <span className="ml-3">SEO Content Brief Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Input a keyword to create a detailed content brief for a writer.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="keyword-input" className="text-sm font-medium text-text-secondary mb-2">Target Keyword</label>
                    <input
                        id="keyword-input"
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md"
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Generate Brief'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {brief && <MarkdownRenderer content={brief} />}
                </div>
            </div>
        </div>
    );
};
