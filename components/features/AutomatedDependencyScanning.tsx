import React, { useState, useCallback } from 'react';
import { checkLicenseCompliance } from '../../services/api';
import { BugAntIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

const examplePackageJson = `{
  "dependencies": {
    "react": "^18.0.0",
    "express": "^4.17.1",
    "lodash": "^4.17.20"
  }
}`;

export const AutomatedDependencyScanning: React.FC = () => {
    const [packageJson, setPackageJson] = useState<string>(examplePackageJson);
    const [report, setReport] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleScan = useCallback(async () => {
        if (!packageJson.trim()) {
            setError('Please provide a package.json content.');
            return;
        }
        setIsLoading(true);
        setError('');
        setReport('');
        try {
            const result = await checkLicenseCompliance(packageJson);
            setReport(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [packageJson]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <BugAntIcon />
                    <span className="ml-3">AI Dependency Vulnerability Scanner</span>
                </h1>
                <p className="text-text-secondary mt-1">Scan project dependencies for known security vulnerabilities.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="package-json-input" className="text-sm font-medium text-text-secondary mb-2">package.json</label>
                    <textarea
                        id="package-json-input"
                        value={packageJson}
                        onChange={(e) => setPackageJson(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm"
                    />
                    <button onClick={handleScan} disabled={isLoading} className="btn-primary mt-4 w-full">
                        {isLoading ? <LoadingSpinner /> : 'Scan Dependencies'}
                    </button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">Security Report</label>
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
