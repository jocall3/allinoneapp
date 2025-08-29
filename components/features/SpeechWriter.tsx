import React, { useState, useCallback } from 'react';
import { writeSpeech } from '../../services/api';
import { MicrophoneIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const SpeechWriter: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('A 5-minute motivational speech for a company all-hands meeting about overcoming challenges.');
    const [speech, setSpeech] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) {
            setError('Please provide a topic and occasion.');
            return;
        }
        setIsLoading(true);
        setError('');
        setSpeech('');
        try {
            const stream = writeSpeech(prompt);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setSpeech(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <MicrophoneIcon />
                    <span className="ml-3">Speech Writer</span>
                </h1>
                <p className="text-text-secondary mt-1">Input a topic and occasion to get a compelling speech.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="prompt-input" className="text-sm font-medium text-text-secondary mb-2">Topic & Occasion</label>
                    <textarea
                        id="prompt-input"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={3}
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Write Speech'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {speech && <MarkdownRenderer content={speech} />}
                </div>
            </div>
        </div>
    );
};
