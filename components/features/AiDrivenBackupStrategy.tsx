import React, { useState, useCallback } from 'react';
import { streamContent } from '../../services/geminiCore';
import { ArchiveBoxIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

const backupTargets = [
    { value: 'rsync', label: 'rsync (Local/Remote Server)' },
    { value: 'gcs', label: 'Google Cloud Storage (gsutil)' },
    { value: 'aws-s3', label: 'Amazon S3 (aws s3 sync)' },
    { value: 'powershell', label: 'Windows PowerShell (Robocopy)'},
];

export const AiDrivenBackupStrategy: React.FC = () => {
    const [projectDesc, setProjectDesc] = useState<string>('A Node.js web application project. The `node_modules` directory should be excluded. Critical files are in `src/` and `.env`. The database dump is in `/backups/db.sql`.');
    const [target, setTarget] = useState<string>(backupTargets[0].value);
    const [strategy, setStrategy] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!projectDesc.trim()) {
            setError('Please describe your project files and requirements.');
            return;
        }
        setIsLoading(true);
        setError('');
        setStrategy('');

        const selectedTargetLabel = backupTargets.find(opt => opt.value === target)?.label || 'a backup script';

        const prompt = `
        You are a senior DevOps engineer specializing in data integrity and backup solutions.
        A user has described their project and wants a backup strategy. 
        
        Your task is to:
        1.  Provide a clear, high-level backup strategy in Markdown. This should include:
            - What to back up (e.g., source code, database dumps, assets).
            - What to exclude (e.g., dependencies, build artifacts, temporary files).
            - A recommended backup frequency (e.g., daily, weekly).
        2.  Generate a sample, well-commented shell script to perform the backup using the user-selected tool (${selectedTargetLabel}). 
            - Use placeholder variables like \`/path/to/source\`, \`/path/to/destination\`, or \`your-gcs-bucket\` where appropriate.
            - Ensure the script is safe and uses common best practices (like `--dry-run` options where applicable).

        **Project Description:**
        ${projectDesc}

        Please provide the full response in Markdown format, with the script in a shell code block.
        `;

        try {
            const stream = streamContent(prompt, "You are a DevOps and data integrity expert.");
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setStrategy(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [projectDesc, target]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6 flex-shrink-0">
                <h1 className="text-3xl font-bold flex items-center">
                    <ArchiveBoxIcon />
                    <span className="ml-3">AI-Driven Backup Strategy Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Describe your project to get a comprehensive backup strategy and a sample script.</p>
            </header>

            <div className="flex-grow flex flex-col lg:flex-row gap-6 min-h-0">
                {/* Left Column: Inputs */}
                <div className="lg:w-1/3 flex flex-col gap-4">
                    <div>
                        <label htmlFor="project-desc" className="text-sm font-medium text-text-secondary mb-2">Project Description</label>
                        <textarea
                            id="project-desc"
                            value={projectDesc}
                            onChange={e => setProjectDesc(e.target.value)}
                            className="w-full h-48 p-3 bg-surface border border-border rounded-md text-sm resize-y"
                            placeholder="Describe your project, what's important, and what to ignore..."
                        />
                    </div>
                    <div>
                        <label htmlFor="target-select" className="text-sm font-medium text-text-secondary mb-2">Backup Tool / Target</label>
                        <select 
                          id="target-select"
                          value={target}
                          onChange={e => setTarget(e.target.value)}
                          className="w-full p-2 bg-surface border border-border rounded-md text-sm"
                        >
                          {backupTargets.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary w-full py-3 mt-auto">
                        {isLoading ? <LoadingSpinner /> : 'Generate Strategy'}
                    </button>
                </div>

                {/* Right Column: Output */}
                <div className="lg:w-2/3 flex flex-col min-h-0">
                    <label className="text-sm font-medium text-text-secondary mb-2">Generated Backup Plan & Script</label>
                    <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                        {isLoading && (
                            <div className="flex justify-center items-center h-full">
                                <LoadingSpinner />
                            </div>
                        )}
                        {error && <p className="text-danger">{error}</p>}
                        {!isLoading && !strategy && !error && <div className="text-text-secondary h-full flex items-center justify-center">Your backup strategy will appear here.</div>}
                        {strategy && <MarkdownRenderer content={strategy} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
