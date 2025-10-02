// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useEffect } from 'react';
import type { OmniStruct } from '../../../types';
import { executeReference } from '../../../services/omniStructService';
import { downloadFile } from '../../../services/fileUtils';
import Editor from '@monaco-editor/react';
import { HomeIcon, ArrowDownTrayIcon } from '../../icons';
import { LoadingSpinner } from '../../shared';

interface OmniStructViewerProps {
    initialOmniStruct: OmniStruct;
    onNewOmniStruct: () => void;
}

const OmniStructViewer: React.FC<OmniStructViewerProps> = ({ initialOmniStruct, onNewOmniStruct }) => {
    const [omniStruct, setOmniStruct] = useState(initialOmniStruct);
    const [ref, setRef] = useState('Plan:getPlanDetails');
    const [args, setArgs] = useState('{}');
    const [result, setResult] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // If the initial prop changes, update the state
        setOmniStruct(initialOmniStruct);
    }, [initialOmniStruct]);

    const handleRun = () => {
        setIsLoading(true);
        setResult(null);
        try {
            const parsedArgs = args.trim() ? JSON.parse(args) : {};
            const { newOmniStruct, result: executionResult } = executeReference(omniStruct, ref, parsedArgs);
            setOmniStruct(newOmniStruct);
            setResult(executionResult);
        } catch (e) {
            setResult({ error: `Invalid JSON in arguments: ${(e as Error).message}` });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        const omniJson = JSON.stringify(omniStruct, null, 2);
        downloadFile(omniJson, 'my_omnistruct.omni', 'application/json');
    };

    return (
        <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: OmniStruct JSON and Actions */}
            <div className="flex flex-col h-full bg-surface p-4 rounded-lg border border-border">
                <div className="flex justify-between items-center mb-2 flex-shrink-0">
                    <h2 className="text-xl font-bold">OmniStruct Generated</h2>
                    <div className="flex gap-2">
                        <button onClick={onNewOmniStruct} className="flex items-center gap-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-xs rounded-md"><HomeIcon /> Go Home</button>
                        <button onClick={handleDownload} className="flex items-center gap-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-xs rounded-md"><ArrowDownTrayIcon className="w-4 h-4" /> Download .omni</button>
                    </div>
                </div>
                <div className="flex-grow min-h-0 border border-border rounded-md overflow-hidden">
                    <Editor
                        height="100%"
                        language="json"
                        value={JSON.stringify(omniStruct, null, 2)}
                        options={{ readOnly: true, minimap: { enabled: false } }}
                        theme="vs-dark"
                    />
                </div>
            </div>

            {/* Right Column: Function Runner and Results */}
            <div className="flex flex-col h-full space-y-4">
                <div className="flex flex-col bg-surface p-4 rounded-lg border border-border">
                    <h2 className="text-xl font-bold mb-2">Execute a Function</h2>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Function Reference:</label>
                        <input type="text" value={ref} onChange={e => setRef(e.target.value)} placeholder="e.g., *Plan:getPlanDetails*" className="w-full mt-1 p-2 bg-background border border-border rounded-md font-mono text-sm" />
                    </div>
                    <div className="mt-2 flex-grow flex flex-col">
                        <label className="block text-sm font-medium text-text-secondary">Arguments (JSON):</label>
                        <div className="mt-1 h-32 border border-border rounded-md overflow-hidden">
                             <Editor
                                height="100%"
                                language="json"
                                value={args}
                                onChange={(value) => setArgs(value || '')}
                                options={{ minimap: { enabled: false }, lineNumbers: 'off' }}
                                theme="vs-dark"
                            />
                        </div>
                    </div>
                    <button onClick={handleRun} disabled={isLoading} className="btn-primary w-full mt-4 py-2">
                        {isLoading ? <LoadingSpinner /> : 'Run'}
                    </button>
                </div>
                <div className="flex-grow flex flex-col bg-surface p-4 rounded-lg border border-border">
                    <h2 className="text-xl font-bold mb-2">Execution Result</h2>
                    <div className="flex-grow min-h-0 bg-background border border-border rounded-md overflow-hidden">
                        <Editor
                            height="100%"
                            language="json"
                            value={result ? JSON.stringify(result, null, 2) : '// Result will appear here'}
                            options={{ readOnly: true, minimap: { enabled: false } }}
                            theme="vs-dark"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OmniStructViewer;
