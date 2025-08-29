import React, { useState, useCallback } from 'react';
import { checkFileIntegrity } from '../../services/api';
import { ShieldCheckIcon } from '../icons';
import { LoadingSpinner } from '../shared';

export const AiDrivenFileIntegrityChecks: React.FC = () => {
    const [content, setContent] = useState<string>('This is the content of a perfectly normal file.');
    const [report, setReport] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleCheck = useCallback(async () => {
        if (!content.trim()) {
            setError('Please provide file content to check.');
            return;
        }
        setIsLoading(true);
        setError('');
        setReport('');
        try {
            const result = await checkFileIntegrity(content);
            setReport(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [content]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <ShieldCheckIcon />
                    <span className="ml-3">AI-Powered File Integrity Check</span>
                </h1>
                <p className="text-text-secondary mt-1">Monitor files for unexpected changes or potential corruption.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                <div className="flex flex-col flex-grow">
                    <label htmlFor="content-input" className="text-sm font-medium text-text-secondary mb-2">File Content</label>
                    <textarea
                        id="content-input"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none"
                    />
                </div>
                <button onClick={handleCheck} disabled={isLoading} className="btn-primary">
                    {isLoading ? <LoadingSpinner /> : 'Check Integrity'}
                </button>
                <div className="p-4 bg-background border border-border rounded-md">
                    <h3 className="font-semibold mb-2">Analysis Report:</h3>
                    {isLoading && <LoadingSpinner />}
                    {error && <p className="text-red-500">{error}</p>}
                    {report && <p>{report}</p>}
                </div>
            </div>
        </div>
    );
};
