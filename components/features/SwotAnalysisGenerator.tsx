import React, { useState, useCallback } from 'react';
import { generateSwotAnalysis } from '../../services/api';
import { ChartBarIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const SwotAnalysisGenerator: React.FC = () => {
    const [product, setProduct] = useState<string>('A new project management tool that uses AI to automatically assign tasks.');
    const [analysis, setAnalysis] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!product.trim()) {
            setError('Please describe the product.');
            return;
        }
        setIsLoading(true);
        setError('');
        setAnalysis('');
        try {
            const stream = generateSwotAnalysis(product);
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
    }, [product]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <ChartBarIcon />
                    <span className="ml-3">SWOT Analysis Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Describe a product to generate a SWOT analysis.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="product-input" className="text-sm font-medium text-text-secondary mb-2">Product/Company Description</label>
                    <textarea
                        id="product-input"
                        value={product}
                        onChange={(e) => setProduct(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={3}
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Generate SWOT Analysis'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {analysis && <MarkdownRenderer content={analysis} />}
                </div>
            </div>
        </div>
    );
};
