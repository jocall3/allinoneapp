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
            // Navigate to the command center and pass the voice command as a prop
            // FIX: Dispatch the correct action type 'LAUNCH_FEATURE' instead of the obsolete 'SET_VIEW'.
            dispatch({ type: 'LAUNCH_FEATURE', payload: { featureId: 'ai-command-center', props: { voiceCommand: command } } });
        }
        dispatch({ type: 'SET_VOICE_COMMANDER_OPEN', payload: false });
    };

    const { isListening, transcript, startListening, stopListening, error, isSupported } = useSpeechRecognition(handleCommand);

    useEffect(() => {
        if (isOpen && isSupported) {
            startListening();
        } else {
            stopListening();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, isSupported]);
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center fade-in" onClick={() => dispatch({ type: 'SET_VOICE_COMMANDER_OPEN', payload: false })}>
            <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-lg m-4 p-8 text-center animate-pop-in" onClick={e => e.stopPropagation()}>
                <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    {isListening && <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>}
                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white">
                        <MicrophoneIcon />
                    </div>
                </div>

                {!isSupported && <p className="text-red-500">Speech recognition is not supported in your browser.</p>}
                {error && <p className="text-red-500">{error}</p>}
                
                {isListening ? (
                    <p className="text-xl h-14">{transcript || 'Listening...'}</p>
                ) : (
                    <p className="text-xl h-14">Click the mic in the status bar to start.</p>
                )}

                <p className="text-sm text-text-secondary mt-4">Try "Open the theme designer" or "Explain this code..."</p>
            </div>
        </div>
    );
};