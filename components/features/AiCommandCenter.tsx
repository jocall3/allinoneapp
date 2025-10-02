// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback, useEffect } from 'react';
import { Type, FunctionDeclaration } from "@google/genai";
import { getInferenceFunction, CommandResponse, FEATURE_TAXONOMY, logError } from '../../services/index';
import { useAppContext } from '../../contexts/GlobalStateContext';
import { CommandLineIcon } from '../icons';
import { LoadingSpinner } from '../shared/index';
import { RAW_FEATURES } from '../../constants';

const functionDeclarations: FunctionDeclaration[] = [
    {
        name: 'navigateTo',
        description: 'Navigates to a specific feature page.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                featureId: { 
                    type: Type.STRING, 
                    description: 'The ID of the feature to navigate to.',
                    enum: RAW_FEATURES.map(f => f.id)
                },
            },
            required: ['featureId'],
        },
    },
    {
        name: 'runFeatureWithInput',
        description: 'Navigates to a feature and passes initial data to it.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                 featureId: { 
                    type: Type.STRING, 
                    description: 'The ID of the feature to run.',
                    enum: RAW_FEATURES.map(f => f.id)
                },
                props: {
                    type: Type.OBJECT,
                    description: 'An object containing the initial properties for the feature, based on its required inputs.',
                    properties: {
                        initialCode: { type: Type.STRING },
                        initialPrompt: { type: Type.STRING },
                        beforeCode: { type: Type.STRING },
                        afterCode: { type: Type.STRING },
                        logInput: { type: Type.STRING },
                        diff: { type: Type.STRING },
                        codeInput: { type: Type.STRING },
                        jsonInput: { type: Type.STRING },
                    }
                }
            },
            required: ['featureId', 'props']
        }
    }
];

const knowledgeBase = FEATURE_TAXONOMY.map(f => `- ${f.name} (${f.id}): ${f.description} Inputs: ${f.inputs}`).join('\n');

const ExamplePromptButton: React.FC<{ text: string, onClick: (text: string) => void }> = ({ text, onClick }) => (
    <button
        onClick={() => onClick(text)}
        className="px-3 py-1.5 bg-surface/80 border border-border rounded-full text-xs text-text-secondary hover:bg-surface-hover transition-colors"
    >
        {text}
    </button>
)

export const AiCommandCenter: React.FC<{ voiceCommand?: string }> = ({ voiceCommand }) => {
    const { dispatch } = useAppContext();
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [lastResponse, setLastResponse] = useState('');

    const handleCommand = useCallback(async (commandToRun: string) => {
        if (!commandToRun.trim()) return;

        setIsLoading(true);
        setLastResponse('');

        try {
            const response: CommandResponse = await getInferenceFunction(commandToRun, functionDeclarations, knowledgeBase);
            
            if (response.functionCalls && response.functionCalls.length > 0) {
                const call = response.functionCalls[0];
                const { name, args } = call;

                setLastResponse(`Understood! Executing command: ${name}`);

                switch (name) {
                    case 'navigateTo':
                        dispatch({ type: 'LAUNCH_FEATURE', payload: { featureId: args.featureId }});
                        break;
                    case 'runFeatureWithInput':
                         dispatch({ type: 'LAUNCH_FEATURE', payload: { featureId: args.featureId, props: args.props } });
                        break;
                    default:
                        setLastResponse(`Unknown command: ${name}`);
                }
                 setPrompt('');
            } else {
                 setLastResponse(response.text);
            }

        } catch (err) {
            logError(err as Error, { prompt: commandToRun });
            setLastResponse(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [dispatch]);

    useEffect(() => {
        if (voiceCommand) {
            setPrompt(voiceCommand);
            handleCommand(voiceCommand);
        }
    }, [voiceCommand, handleCommand]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleCommand(prompt);
        }
    };
    
    const handleExampleClick = (text: string) => {
        setPrompt(text);
        handleCommand(text);
    }

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight flex items-center justify-center">
                    <CommandLineIcon />
                    <span className="ml-3">AI Command Center</span>
                </h1>
                <p className="mt-2 text-lg text-text-secondary">What would you like to do?</p>
            </header>
            
            <div className="flex-grow flex flex-col justify-end max-w-3xl w-full mx-auto">
                {lastResponse && (
                    <div className="mb-4 p-4 bg-surface/50 rounded-lg text-text-primary border border-border">
                        <p><strong>AI:</strong> {lastResponse}</p>
                    </div>
                )}
                 <div className="relative">
                    <textarea
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                        placeholder='Try "explain this code: const a = 1;" or "open the theme designer"'
                        className="w-full p-4 pr-28 rounded-lg bg-surface/80 border border-border focus:ring-2 focus:ring-primary focus:outline-none resize-none shadow-sm"
                        rows={2}
                    />
                    <button
                        onClick={() => handleCommand(prompt)}
                        disabled={isLoading}
                        className="btn-primary absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2"
                    >
                       {isLoading ? <LoadingSpinner/> : 'Send'}
                    </button>
                </div>
                 <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                    <ExamplePromptButton text="Open Theme Designer" onClick={handleExampleClick} />
                    <ExamplePromptButton text="Generate a commit for a bug fix" onClick={handleExampleClick} />
                    <ExamplePromptButton text="Create a regex for email validation" onClick={handleExampleClick} />
                </div>
                 <p className="text-xs text-text-secondary text-center mt-2">Press Enter to send, Shift+Enter for new line.</p>
            </div>
        </div>
    );
};
