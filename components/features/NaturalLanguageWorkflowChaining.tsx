import React from 'react';
import { LogicFlowBuilderIcon } from '../icons.tsx';

export const NaturalLanguageWorkflowChaining: React.FC = () => {
    return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center text-text-primary">
            <div className="text-6xl mb-4 text-primary" aria-hidden="true">
                <LogicFlowBuilderIcon />
            </div>
            <h1 className="text-3xl font-bold mb-2">
                Natural Language Workflow Chaining
            </h1>
            <p className="text-lg text-text-secondary max-w-lg">
                This feature showcases the future of AI command centers. Instead of single commands, you could chain multiple actions together in one sentence.
            </p>
            <div className="mt-6 bg-surface border border-border rounded-lg p-4 text-sm text-left space-y-2">
                <p className="font-semibold">Example Prompt:</p>
                <p className="text-text-secondary font-mono bg-background p-2 rounded">"Analyze the code in 'utils.js' for performance, generate unit tests for it, and then create a commit message for the new test file."</p>
                <p className="font-semibold mt-2">AI Execution Plan:</p>
                <ol className="list-decimal list-inside text-text-secondary">
                    <li>Open <span className="font-semibold text-primary">AI Performance Bottleneck ID</span> with 'utils.js' content.</li>
                    <li>Open <span className="font-semibold text-primary">AI Unit Test Generator</span> with 'utils.js' content.</li>
                    <li>Open <span className="font-semibold text-primary">AI Commit Message Generator</span> with the newly generated test file content.</li>
                </ol>
            </div>
        </div>
    );
};
