import React, { useState, useCallback } from 'react';
import { debugFromErrorLog } from '../../services/api';
import { BugAntIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const AiPoweredCodeDebugger: React.FC = () => {
    const [code, setCode] = useState<string>(`function getUser(id) {\n  const data = fetchData(id);\n  return data.user.name;\n}`);
    const [errorLog, setErrorLog] = useState<string>(`TypeError: Cannot read properties of null (reading 'user')`);
    const [analysis, setAnalysis] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleDebug = useCallback(async () => {
        if (!code.trim() || !errorLog.trim()) {
            setError('Please provide both code and an error log.');
            return;
        }
        setIsLoading(true);
        setError('');
        setAnalysis('');
        try {
            const stream = debugFromErrorLog(`Error:\n${errorLog}\n\nCode:\n\`\`\`\n${code}\n\`\`\``);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setAnalysis(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [code, errorLog]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <BugAntIcon />
                    <span className="ml-3">AI-Powered Code Debugger</span>
                </h1>
                <p className="text-text-secondary mt-1">Paste an error and related code to get a root cause analysis and a suggested fix.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="error-input" className="text-sm font-medium text-text-secondary mb-2">Error Log / Message</label>
                        <textarea id="error-input" value={errorLog} onChange={e => setErrorLog(e.target.value)} className="w-full p-2 bg-surface border border-border rounded-md resize-y font-mono text-sm" rows={3}/>
                    </div>
                    <div>
                        <label htmlFor="code-input" className="text-sm font-medium text-text-secondary mb-2">Related Code</label>
                        <textarea id="code-input" value={code} onChange={e => setCode(e.target.value)} className="w-full p-2 bg-surface border border-border rounded-md resize-y font-mono text-sm h-48"/>
                    </div>
                    <button onClick={handleDebug} disabled={isLoading} className="btn-primary w-full">
                        {isLoading ? <LoadingSpinner /> : 'Debug with AI'}
                    </button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">Debugging Analysis</label>
                    <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                        {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                        {error && <p className="text-red-500">{error}</p>}
                        {analysis && <MarkdownRenderer content={analysis} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
