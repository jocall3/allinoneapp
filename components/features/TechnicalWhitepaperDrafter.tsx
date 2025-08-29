import React, { useState, useCallback } from 'react';
import { streamContent } from '../../services/geminiCore';
import { DocumentTextIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const TechnicalWhitepaperDrafter: React.FC = () => {
    const [topic, setTopic] = useState<string>('The architecture of a distributed SQL database.');
    const [paper, setPaper] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!topic.trim()) {
            setError('Please provide a topic.');
            return;
        }
        setIsLoading(true);
        setError('');
        setPaper('');
        try {
            const prompt = `Draft a technical whitepaper on the topic: "${topic}". Include an abstract, introduction, key architectural components, and a conclusion.`;
            const stream = streamContent(prompt, "You are a technical writer with a PhD in computer science.");
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setPaper(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [topic]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <DocumentTextIcon />
                    <span className="ml-3">Technical Whitepaper Drafter</span>
                </h1>
                <p className="text-text-secondary mt-1">Input a technical topic to generate a draft whitepaper.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="topic-input" className="text-sm font-medium text-text-secondary mb-2">Whitepaper Topic</label>
                    <textarea
                        id="topic-input"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={3}
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Draft Whitepaper'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {paper && <MarkdownRenderer content={paper} />}
                </div>
            </div>
        </div>
    );
};
