import React, { useState, useCallback } from 'react';
import { analyzeSentiment } from '../../services/api';
import { SparklesIcon } from '../icons';
import { LoadingSpinner } from '../shared';

export const SentimentClassifier: React.FC = () => {
    const [text, setText] = useState<string>('The customer service was exceptionally helpful and resolved my issue quickly!');
    const [sentiment, setSentiment] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleClassify = useCallback(async () => {
        if (!text.trim()) {
            setError('Please enter text to classify.');
            return;
        }
        setIsLoading(true);
        setError('');
        setSentiment('');
        try {
            const result = await analyzeSentiment(text);
            setSentiment(result);
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
                    <SparklesIcon />
                    <span className="ml-3">Sentiment Classifier</span>
                </h1>
                <p className="text-text-secondary mt-1">Classify text as positive, negative, or neutral.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="text-input" className="text-sm font-medium text-text-secondary mb-2">Text to Classify</label>
                    <textarea
                        id="text-input"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={5}
                    />
                    <button onClick={handleClassify} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Classify Sentiment'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md">
                    <h3 className="font-semibold mb-2">Result:</h3>
                    {isLoading && <LoadingSpinner />}
                    {error && <p className="text-red-500">{error}</p>}
                    {sentiment && <p className="text-lg font-bold">{sentiment}</p>}
                </div>
            </div>
        </div>
    );
};
