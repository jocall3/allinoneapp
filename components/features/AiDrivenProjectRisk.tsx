import React, { useState, useCallback } from 'react';
import { assessProjectRisk } from '../../services/api';
import { ShieldCheckIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const AiDrivenProjectRisk: React.FC = () => {
    const [description, setDescription] = useState<string>('We are building a new real-time collaborative editing tool using WebSockets and a microservices architecture. The deadline is in 3 months and we have a team of 4 junior developers.');
    const [report, setReport] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleAssess = useCallback(async () => {
        if (!description.trim()) {
            setError('Please provide a project description.');
            return;
        }
        setIsLoading(true);
        setError('');
        setReport('');
        try {
            const stream = assessProjectRisk(description);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setReport(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [description]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <ShieldCheckIcon />
                    <span className="ml-3">AI Project Risk Assessment</span>
                </h1>
                <p className="text-text-secondary mt-1">Analyze project descriptions to identify potential risks.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="description-input" className="text-sm font-medium text-text-secondary mb-2">Project Description</label>
                    <textarea
                        id="description-input"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={5}
                    />
                    <button onClick={handleAssess} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Assess Risks'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {report && <MarkdownRenderer content={report} />}
                </div>
            </div>
        </div>
    );
};
