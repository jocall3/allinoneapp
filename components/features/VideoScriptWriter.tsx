import React, { useState, useCallback } from 'react';
import { writeVideoScript } from '../../services/api';
import { VideoCameraIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const VideoScriptWriter: React.FC = () => {
    const [topic, setTopic] = useState<string>('A 5-minute tutorial on how to use the CSS Grid Editor feature.');
    const [script, setScript] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!topic.trim()) {
            setError('Please provide a video topic.');
            return;
        }
        setIsLoading(true);
        setError('');
        setScript('');
        try {
            const stream = writeVideoScript(topic);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setScript(fullResponse);
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
                    <VideoCameraIcon />
                    <span className="ml-3">Video Script Writer</span>
                </h1>
                <p className="text-text-secondary mt-1">Describe a topic and get a complete script for a YouTube video.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="topic-input" className="text-sm font-medium text-text-secondary mb-2">Video Topic</label>
                    <textarea
                        id="topic-input"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={3}
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Write Script'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {script && <MarkdownRenderer content={script} />}
                </div>
            </div>
        </div>
    );
};
