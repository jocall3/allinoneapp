import React, { useState, useCallback } from 'react';
import { proactivelyIdentifyProblems } from '../../services/api';
import { BugAntIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

const exampleCode = `
let user = null;

function fetchUser() {
    // Simulates fetching a user
    setTimeout(() => {
        user = { name: "Alice" };
    }, 500);
}

function displayUser() {
    // This will throw an error because user is null initially
    console.log(user.name); 
}

fetchUser();
displayUser(); // Problem: this runs before fetchUser completes
`;

export const ProactiveProblemIdentification: React.FC = () => {
    const [code, setCode] = useState<string>(exampleCode);
    const [report, setReport] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleAnalyze = useCallback(async () => {
        if (!code.trim()) {
            setError('Please enter code to analyze.');
            return;
        }
        setIsLoading(true);
        setError('');
        setReport('');
        try {
            const stream = proactivelyIdentifyProblems(code);
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
    }, [code]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <BugAntIcon />
                    <span className="ml-3">Proactive Problem Identification</span>
                </h1>
                <p className="text-text-secondary mt-1">AI proactively suggests actions if issues are detected in your code.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="code-input" className="text-sm font-medium text-text-secondary mb-2">Code to Analyze</label>
                    <textarea
                        id="code-input"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm"
                    />
                    <button onClick={handleAnalyze} disabled={isLoading} className="btn-primary mt-4 w-full">
                        {isLoading ? <LoadingSpinner /> : 'Identify Problems'}
                    </button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">Analysis Report</label>
                    <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                        {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                        {error && <p className="text-red-500">{error}</p>}
                        {report && <MarkdownRenderer content={report} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
