import React, { useState, useCallback } from 'react';
import { getVoiceCommandAction } from '../../services/api';
import { MicrophoneIcon } from '../icons';
import { LoadingSpinner } from '../shared';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

export const VoiceCommandIntegration: React.FC = () => {
    const [action, setAction] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleCommandResult = useCallback(async (command: string) => {
        setIsLoading(true);
        setError('');
        setAction('');
        try {
            const result = await getVoiceCommandAction(command);
            setAction(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const { isListening, transcript, startListening, error: speechError } = useSpeechRecognition(handleCommandResult);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary items-center justify-center">
            <header className="mb-6 text-center">
                <h1 className="text-3xl font-bold flex items-center justify-center">
                    <MicrophoneIcon />
                    <span className="ml-3">Voice Command Integration</span>
                </h1>
                <p className="text-text-secondary mt-1">Control all Toolkit features and navigation using voice commands.</p>
            </header>
            <div className="w-full max-w-lg space-y-4">
                <button onClick={startListening} disabled={isListening || isLoading} className="btn-primary w-full text-lg py-4">
                    {isListening ? 'Listening...' : 'Start Voice Command'}
                </button>
                <div className="p-4 bg-surface border border-border rounded-md min-h-[8rem] text-center">
                    <h3 className="font-semibold mb-2">Transcript:</h3>
                    <p className="italic text-text-secondary">{transcript || '...'}</p>
                    {speechError && <p className="text-red-500 mt-2">{speechError}</p>}
                </div>
                <div className="p-4 bg-background border border-border rounded-md min-h-[8rem] text-center">
                    <h3 className="font-semibold mb-2">Interpreted Action:</h3>
                    {isLoading && <LoadingSpinner />}
                    {error && <p className="text-red-500">{error}</p>}
                    {action && <p className="font-mono text-primary">{action}</p>}
                </div>
            </div>
        </div>
    );
};
