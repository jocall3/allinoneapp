import React, { useState, useCallback } from 'react';
import { generateUserPersonas } from '../../services/api';
import { BuildingStorefrontIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const UserPersonaGenerator: React.FC = () => {
    const [audience, setAudience] = useState<string>('Busy professionals who work remotely and need to collaborate with their team.');
    const [persona, setPersona] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!audience.trim()) {
            setError('Please describe the target audience.');
            return;
        }
        setIsLoading(true);
        setError('');
        setPersona('');
        try {
            const stream = generateUserPersonas(audience);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setPersona(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [audience]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <BuildingStorefrontIcon />
                    <span className="ml-3">User Persona Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Describe a target audience to create detailed user personas.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="audience-input" className="text-sm font-medium text-text-secondary mb-2">Target Audience Description</label>
                    <textarea
                        id="audience-input"
                        value={audience}
                        onChange={(e) => setAudience(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={3}
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Generate Persona'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {persona && <MarkdownRenderer content={persona} />}
                </div>
            </div>
        </div>
    );
};
