import React, { useState, useCallback } from 'react';
import { streamContent } from '../../services/geminiCore';
import { NewspaperIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const SocialMediaContentCalendarGenerator: React.FC = () => {
    const [topic, setTopic] = useState<string>('A week of content for a new AI-powered developer tool.');
    const [calendar, setCalendar] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!topic.trim()) {
            setError('Please provide a topic for the content calendar.');
            return;
        }
        setIsLoading(true);
        setError('');
        setCalendar('');
        try {
            const prompt = `Generate a 7-day social media content calendar for the following topic. Include post ideas for Twitter, LinkedIn, and a blog. Format as a markdown table. Topic: "${topic}"`;
            const stream = streamContent(prompt, "You are a social media marketing expert.");
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setCalendar(fullResponse);
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
                    <NewspaperIcon />
                    <span className="ml-3">Social Media Content Calendar Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Generate a content calendar for your social media channels.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="topic-input" className="text-sm font-medium text-text-secondary mb-2">Content Topic / Goal</label>
                    <textarea
                        id="topic-input"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={3}
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Generate Calendar'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {calendar && <MarkdownRenderer content={calendar} />}
                </div>
            </div>
        </div>
    );
};
