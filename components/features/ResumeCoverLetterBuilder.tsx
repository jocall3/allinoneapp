// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { buildResume } from '../../services/api';
import { DocumentTextIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

const exampleExperience = `Job Title: Senior Software Engineer at Tech Corp (2020-2024). Responsibilities: Led a team of 5 engineers, developed a new microservice architecture, improved system performance by 30%. Skills: TypeScript, React, Node.js, AWS. Applying for: Lead Engineer at Innovate AI.`;

export const ResumeCoverLetterBuilder: React.FC = () => {
    const [experience, setExperience] = useState<string>(exampleExperience);
    const [documents, setDocuments] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!experience.trim()) {
            setError('Please provide your experience and the job you are applying for.');
            return;
        }
        setIsLoading(true);
        setError('');
        setDocuments('');
        try {
            const stream = buildResume(experience);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setDocuments(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [experience]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <DocumentTextIcon />
                    <span className="ml-3">Resume & Cover Letter Builder</span>
                </h1>
                <p className="text-text-secondary mt-1">Input your experience and get an AI-crafted resume and tailored cover letter.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="experience-input" className="text-sm font-medium text-text-secondary mb-2">Your Experience & Target Job</label>
                    <textarea
                        id="experience-input"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={5}
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Build Documents'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {documents && <MarkdownRenderer content={documents} />}
                </div>
            </div>
        </div>
    );
};
