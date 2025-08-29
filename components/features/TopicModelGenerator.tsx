import React, { useState, useCallback } from 'react';
import { streamContent } from '../../services/geminiCore';
import { DocumentTextIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

const exampleText = `Artificial intelligence is a transformative technology. Machine learning, a subset of AI, focuses on building systems that learn from data. Deep learning is a further specialization within machine learning.`;

export const TopicModelGenerator: React.FC = () => {
    const [text, setText] = useState<string>(exampleText);
    const [topics, setTopics] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!text.trim()) {
            setError('Please provide text to analyze.');
            return;
        }
        setIsLoading(true);
        setError('');
        setTopics('');
        try {
            const prompt = `Analyze the following document and identify the main topics or themes. Present them as a list. Document:\n${text}`;
            const stream = streamContent(prompt, "You are a topic modeling expert.");
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setTopics(fullResponse);
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
                    <span className="ml-3">Topic Model Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Identify main topics and themes from a body of text.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="text-input" className="text-sm font-medium text-text-secondary mb-2">Document Text</label>
                    <textarea
                        id="text-input"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none"
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-4 w-full">
                        {isLoading ? <LoadingSpinner /> : 'Identify Topics'}
                    </button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">Identified Topics</label>
                    <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                        {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                        {error && <p className="text-red-500">{error}</p>}
                        {topics && <MarkdownRenderer content={topics} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
