import React, { useState, useCallback } from 'react';
import { streamContent } from '../../services/geminiCore';
import { ChartBarIcon, SparklesIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

const exampleBillingData = `
Date,Service,Cost,Region,InstanceType
2024-07-01,EC2,50.00,us-east-1,t3.medium
2024-07-01,S3,10.50,us-east-1,-
2024-07-02,EC2,51.00,us-east-1,t3.medium
2024-07-02,S3,10.55,us-east-1,-
2024-07-03,EC2,150.00,us-east-1,m5.large
2024-07-03,S3,10.60,us-east-1,-
2024-07-04,EC2,52.00,us-east-1,t3.medium
2024-07-04,Lambda,5.00,us-west-2,-
`;

export const AiDrivenCostOptimizationForCloud: React.FC = () => {
    const [billingData, setBillingData] = useState<string>(exampleBillingData);
    const [report, setReport] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleAnalyze = useCallback(async () => {
        if (!billingData.trim()) {
            setError('Please provide billing data for analysis.');
            return;
        }
        setIsLoading(true);
        setError('');
        setReport('');

        const prompt = `
        You are a FinOps expert AI, specializing in cloud cost optimization for AWS, GCP, and Azure.
        Analyze the following cloud billing data (provided in CSV format) and generate a detailed cost optimization report in Markdown.

        Your report must include:
        1.  **Executive Summary:** A brief, high-level overview of the cost trends and key findings.
        2.  **Cost Anomaly Detection:** Explicitly identify any unusual cost spikes, their likely cause, and the date they occurred.
        3.  **Optimization Recommendations:** Provide a bulleted list of specific, actionable recommendations. For each recommendation, include:
            -   **Finding:** What the issue is (e.g., "Unused EBS volumes", "Underutilized EC2 instances").
            -   **Recommendation:** The specific action to take (e.g., "Delete unattached volumes", "Downsize t3.large to t3.medium").
            -   **Estimated Monthly Savings:** A dollar amount representing the potential savings.
        4.  **Overall Savings Potential:** A concluding sentence summarizing the total estimated monthly savings.

        **Billing Data (CSV):**
        \`\`\`csv
        ${billingData}
        \`\`\`
        `;

        try {
            const stream = streamContent(prompt, "You are a FinOps expert AI assistant.");
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
    }, [billingData]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6 flex-shrink-0">
                <h1 className="text-3xl font-bold flex items-center">
                    <ChartBarIcon />
                    <span className="ml-3">AI Cloud Cost Optimization</span>
                </h1>
                <p className="text-text-secondary mt-1">Analyze cloud resource usage and get actionable cost-saving recommendations.</p>
            </header>

            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="billing-data-input" className="text-sm font-medium text-text-secondary mb-2">Cloud Billing Data (CSV Format)</label>
                    <textarea
                        id="billing-data-input"
                        value={billingData}
                        onChange={(e) => setBillingData(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm"
                        placeholder="Paste your CSV billing data here..."
                    />
                    <button onClick={handleAnalyze} disabled={isLoading} className="btn-primary mt-4 w-full flex items-center justify-center gap-2 py-3">
                       <SparklesIcon /> {isLoading ? 'Analyzing Costs...' : 'Generate Optimization Report'}
                    </button>
                </div>
                
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">Optimization Report</label>
                    <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                        {isLoading && !report && (
                            <div className="flex flex-col justify-center items-center h-full">
                                <LoadingSpinner />
                                <p className="mt-4 text-text-secondary">Analyzing cost data...</p>
                            </div>
                        )}
                        {error && <p className="text-danger p-4">{error}</p>}
                        {!isLoading && !report && !error && (
                            <div className="text-text-secondary h-full flex items-center justify-center">
                                Your detailed cost report will appear here.
                            </div>
                        )}
                        {report && <MarkdownRenderer content={report} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
