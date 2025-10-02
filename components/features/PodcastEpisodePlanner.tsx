// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { planPodcastEpisode } from '../../services/api';
import { MicrophoneIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const PodcastEpisodePlanner: React.FC = () => {
    const [topic, setTopic] = useState<string>('An interview with a senior software engineer about the future of AI in coding.');
    const [plan, setPlan] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!topic.trim()) {
            setError('Please provide an episode topic.');
            return;
        }
        setIsLoading(true);
        setError('');
        setPlan('');
        try {
            const stream = planPodcastEpisode(topic);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setPlan(fullResponse);
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
                    <MicrophoneIcon />
                    <span className="ml-3">Podcast Episode Planner</span>
                </h1>
                <p className="text-text-secondary mt-1">Input a topic to outline segments, talking points, and questions.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="topic-input" className="text-sm font-medium text-text-secondary mb-2">Episode Topic</label>
                    <textarea
                        id="topic-input"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={3}
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Plan Episode'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {plan && <MarkdownRenderer content={plan} />}
                </div>
            </div>
        </div>
    );
};