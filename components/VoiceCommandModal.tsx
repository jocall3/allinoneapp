// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useEffect } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useAppContext } from '../contexts/GlobalStateContext';
import { MicrophoneIcon } from './icons';

interface VoiceCommandModalProps {
    isOpen: boolean;
}

export const VoiceCommandModal: React.FC<VoiceCommandModalProps> = ({ isOpen }) => {
    const { dispatch } = useAppContext();

    const handleCommand = (command: string) => {
        if (command) {
            dispatch({ type: 'LAUNCH_FEATURE', payload: { featureId: 'ai-command-center', props: { voiceCommand: command } } });
        }
        dispatch({ type: 'SET_VOICE_COMMANDER_OPEN', payload: false });
    };

    const { isListening, transcript, startListening, stopListening, error, isSupported } = useSpeechRecognition(handleCommand);

    useEffect(() => {
        if (isOpen && isSupported) {
            startListening();
        } else if (!isOpen) {
            stopListening();
        }
    }, [isOpen, isSupported, startListening, stopListening]);
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => dispatch({ type: 'SET_VOICE_COMMANDER_OPEN', payload: false })}>
            <div className="bg-surface/80 backdrop-blur-xl border border-border rounded-2xl shadow-2xl w-full max-w-lg m-4 p-8 text-center animate-scale-in" onClick={e => e.stopPropagation()}>
                <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    {isListening && <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>}
                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-background">
                        <MicrophoneIcon />
                    </div>
                </div>

                {!isSupported && <p className="text-danger">Speech recognition is not supported in your browser.</p>}
                {error && <p className="text-danger">{error}</p>}
                
                {isListening ? (
                    <p className="text-xl h-14 text-text-primary">{transcript || 'Listening...'}</p>
                ) : (
                    <p className="text-xl h-14 text-text-secondary">Click the mic in the status bar to start.</p>
                )}

                <p className="text-sm text-text-secondary mt-4">Try "Open the theme designer" or "Explain this code..."</p>
            </div>
        </div>
    );
};
