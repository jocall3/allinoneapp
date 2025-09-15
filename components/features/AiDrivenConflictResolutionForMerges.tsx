import React, { useState, useCallback } from 'react';
import { streamContent } from '../../services/geminiCore';
import { GitBranchIcon, SparklesIcon, ClipboardDocumentIcon } from '../icons';
import { LoadingSpinner } from '../shared';
import Editor from '@monaco-editor/react';

const exampleBase = `
function calculate(a, b) {
  // Original function
  return a + b;
}
`;

const exampleCurrent = `
function calculate(a, b) {
  // My changes: logging the operation
  console.log('Calculating sum...');
  return a + b;
}
`;

const exampleIncoming = `
function calculate(a, b, enableLogging) {
  // Incoming changes: adding a logging feature flag
  if (enableLogging) {
    console.log('Performing calculation...');
  }
  return a + b;
}
`;

const MERGE_MARKER_CURRENT = '<<<<<<< Current Changes';
const MERGE_MARKER_BASE = '=======';
const MERGE_MARKER_INCOMING = '>>>>>>> Incoming Changes';

export const AiDrivenConflictResolutionForMerges: React.FC = () => {
    const [baseCode, setBaseCode] = useState<string>(exampleBase);
    const [currentCode, setCurrentCode] = useState<string>(exampleCurrent);
    const [incomingCode, setIncomingCode] = useState<string>(exampleIncoming);
    const [resolvedCode, setResolvedCode] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const generateConflictFile = () => `${MERGE_MARKER_CURRENT}\n${currentCode}\n${MERGE_MARKER_BASE}\n${incomingCode}\n${MERGE_MARKER_INCOMING}`;

    const handleResolve = useCallback(async () => {
        setIsLoading(true);
        setError('');
        setResolvedCode('');

        const prompt = `
        You are an expert software engineer specializing in resolving complex Git merge conflicts.
        Your task is to analyze a Git conflict marker file containing a BASE version, CURRENT changes, and INCOMING changes.
        You must logically merge the conflicting versions into a single, functional, and clean piece of code that incorporates the intent of both changes.

        -   Prioritize preserving functionality from both branches.
        -   Clean up any merge conflict markers.
        -   If logic is truly incompatible, make an intelligent decision and add a \`// TODO: [AI] Review required\` comment explaining the choice you made.
        -   Output ONLY the final, resolved code without any markdown formatting or extra explanations.

        **Base Version (for context):**
        \`\`\`
        ${baseCode}
        \`\`\`

        **Conflict File to Resolve:**
        \`\`\`
        ${generateConflictFile()}
        \`\`\`
        `;

        try {
            const stream = streamContent(prompt, "You are a Git expert AI for resolving merge conflicts.");
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setResolvedCode(fullResponse.replace(/^```(\w+\n)?|```$/g, '').trim());
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [baseCode, currentCode, incomingCode]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-4 flex-shrink-0">
                <h1 className="text-3xl font-bold flex items-center">
                    <GitBranchIcon />
                    <span className="ml-3">AI Merge Conflict Resolution</span>
                </h1>
                <p className="text-text-secondary mt-1">Provide the conflicting code versions, and let AI suggest a clean resolution.</p>
            </header>

            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                {/* Left Side: Inputs */}
                <div className="flex flex-col gap-4 min-h-0">
                    <div className="flex flex-col flex-1 min-h-0">
                        <label className="text-sm font-medium text-text-secondary mb-1">Current Changes (Yours)</label>
                        <div className="border border-border rounded-md overflow-hidden flex-grow">
                           <Editor height="100%" language="javascript" value={currentCode} onChange={(v) => setCurrentCode(v || '')} theme="vs-dark" options={{ minimap: { enabled: false } }}/>
                        </div>
                    </div>
                     <div className="flex flex-col flex-1 min-h-0">
                        <label className="text-sm font-medium text-text-secondary mb-1">Incoming Changes (Theirs)</label>
                         <div className="border border-border rounded-md overflow-hidden flex-grow">
                           <Editor height="100%" language="javascript" value={incomingCode} onChange={(v) => setIncomingCode(v || '')} theme="vs-dark" options={{ minimap: { enabled: false } }}/>
                        </div>
                    </div>
                </div>

                {/* Right Side: Output */}
                <div className="flex flex-col min-h-0">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-text-secondary">AI-Suggested Resolution</label>
                        {resolvedCode && !isLoading && (
                             <button onClick={() => navigator.clipboard.writeText(resolvedCode)} className="flex items-center gap-1.5 px-3 py-1 bg-surface-hover text-xs rounded-md hover:bg-border">
                                <ClipboardDocumentIcon className="w-4 h-4"/> Copy
                            </button>
                        )}
                    </div>
                    <div className="flex-grow border border-border rounded-md overflow-hidden">
                       {isLoading ? (
                            <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>
                        ) : error ? (
                            <div className="p-4 text-danger">{error}</div>
                        ) : (
                             <Editor
                                height="100%"
                                language="javascript"
                                value={resolvedCode}
                                onChange={(v) => setResolvedCode(v || '')}
                                theme="vs-dark"
                                options={{ minimap: { enabled: false }, readOnly: isLoading }}
                            />
                        )}
                    </div>
                    <button onClick={handleResolve} disabled={isLoading} className="btn-primary w-full py-3 mt-4 flex items-center justify-center gap-2">
                        <SparklesIcon />
                        {isLoading ? 'Resolving...' : 'Resolve with AI'}
                    </button>
                </div>
            </div>
        </div>
    );
};
