import React, { useState, useCallback } from 'react';
import { suggestArchiveStructure } from '../../services/api';
import { ArchiveBoxIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

const exampleFileList = `
- /assets/logo_v1.png
- /assets/logo_v2.png
- /assets/logo_final.png
- /src/components/Button.js
- /src/components/OldComponent.js (unused)
- /docs/project-spec-draft.docx
- /docs/project-spec-final.docx
`;

export const SmartArchiveAssistant: React.FC = () => {
    const [fileList, setFileList] = useState<string>(exampleFileList);
    const [suggestion, setSuggestion] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleSuggest = useCallback(async () => {
        if (!fileList.trim()) {
            setError('Please provide a file list.');
            return;
        }
        setIsLoading(true);
        setError('');
        setSuggestion('');
        try {
            const stream = suggestArchiveStructure(fileList);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setSuggestion(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [fileList]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <ArchiveBoxIcon />
                    <span className="ml-3">Smart Archive Assistant</span>
                </h1>
                <p className="text-text-secondary mt-1">Identify old versions and unused assets to create an archive structure.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="file-list-input" className="text-sm font-medium text-text-secondary mb-2">Project File List</label>
                    <textarea
                        id="file-list-input"
                        value={fileList}
                        onChange={(e) => setFileList(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm"
                    />
                    <button onClick={handleSuggest} disabled={isLoading} className="btn-primary mt-4 w-full">
                        {isLoading ? <LoadingSpinner /> : 'Suggest Archive Structure'}
                    </button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">Archive Suggestion</label>
                    <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                        {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                        {error && <p className="text-red-500">{error}</p>}
                        {suggestion && <MarkdownRenderer content={suggestion} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
