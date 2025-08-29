import React, { useState, useCallback } from 'react';
import { generateDisasterRecoveryPlan } from '../../services/api';
import { ShieldCheckIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const DisasterRecoveryPlanGenerator: React.FC = () => {
    const [system, setSystem] = useState<string>('An e-commerce website with a PostgreSQL database, a Redis cache, and a Node.js backend, all hosted on AWS.');
    const [plan, setPlan] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!system.trim()) {
            setError('Please describe the system.');
            return;
        }
        setIsLoading(true);
        setError('');
        setPlan('');
        try {
            const stream = generateDisasterRecoveryPlan(system);
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
    }, [system]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <ShieldCheckIcon />
                    <span className="ml-3">Disaster Recovery Plan Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Describe your system and get a drafted DR plan.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="system-input" className="text-sm font-medium text-text-secondary mb-2">System Description</label>
                    <textarea
                        id="system-input"
                        value={system}
                        onChange={(e) => setSystem(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={4}
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Generate DR Plan'}
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
