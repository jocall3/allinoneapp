import React, { useState, useCallback } from 'react';
import { generateTerraform } from '../../services/api';
import { CloudArrowUpIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const TerraformIaCGenerator: React.FC = () => {
    const [description, setDescription] = useState<string>('An AWS S3 bucket for static website hosting with public read access.');
    const [code, setCode] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!description.trim()) {
            setError('Please describe the infrastructure.');
            return;
        }
        setIsLoading(true);
        setError('');
        setCode('');
        try {
            const stream = generateTerraform(description);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setCode(fullResponse);
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
                    <CloudArrowUpIcon />
                    <span className="ml-3">Terraform/IaC Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Describe your desired infrastructure and get Terraform HCL code.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="description-input" className="text-sm font-medium text-text-secondary mb-2">Infrastructure Description</label>
                    <textarea
                        id="description-input"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={3}
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Generate Terraform Code'}
                    </button>
                </div>
                <div className="flex-grow p-1 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="p-4 text-red-500">{error}</p>}
                    {code && <MarkdownRenderer content={code} />}
                </div>
            </div>
        </div>
    );
};
