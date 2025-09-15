import React, { useState, useCallback } from 'react';
import { streamContent } from '../../services/geminiCore';
import { DocumentTextIcon, SparklesIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

const exampleOriginal = `
Project Phoenix: Launch Plan

**Objective:**
Launch the new platform by the end of Q3.

**Key Stakeholders:**
- Design Team
- Engineering Team

**Action Items:**
1. Finalize UI mockups.
2. Complete backend development.
`;

const exampleEdits = `
Just a few quick thoughts:
- The objective should be more specific: "Launch the new platform with all core features by September 15th."
- Let's add the Marketing Team to the stakeholders.
- We also need to add an action item for "Deploy to staging environment for QA".
`;

export const AiDrivenCollaborativeDocumentEditing: React.FC = () => {
    const [originalDoc, setOriginalDoc] = useState<string>(exampleOriginal);
    const [edits, setEdits] = useState<string>(exampleEdits);
    const [mergedDoc, setMergedDoc] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleMerge = useCallback(async () => {
        if (!originalDoc.trim() || !edits.trim()) {
            setError('Please provide both an original document and suggested edits.');
            return;
        }
        setIsLoading(true);
        setError('');
        setMergedDoc('');

        const prompt = `
        You are an intelligent document editor. Your task is to merge a set of suggested edits into an original document.
        -  Incorporate the changes seamlessly.
        -  Resolve minor conflicting information logically.
        -  Maintain the original formatting (e.g., Markdown).
        -  Output only the final, merged document.

        **Original Document:**
        ---
        ${originalDoc}
        ---

        **Suggested Edits from Collaborator:**
        ---
        ${edits}
        ---

        **Merged Document:**
        `;

        try {
            const stream = streamContent(prompt, "You are an AI collaborative editor.");
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setMergedDoc(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred during the merge.');
        } finally {
            setIsLoading(false);
        }
    }, [originalDoc, edits]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6 flex-shrink-0">
                <h1 className="text-3xl font-bold flex items-center">
                    <DocumentTextIcon />
                    <span className="ml-3">AI Collaborative Document Editor</span>
                </h1>
                <p className="text-text-secondary mt-1">Provide a document and suggested changes, and the AI will merge them intelligently.</p>
            </header>

            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                <div className="flex flex-col gap-4 min-h-0">
                    <div className="flex flex-col flex-1 min-h-0">
                         <label htmlFor="original-doc" className="text-sm font-medium text-text-secondary mb-2">Original Document</label>
                         <textarea id="original-doc" value={originalDoc} onChange={e => setOriginalDoc(e.target.value)} className="flex-grow p-3 bg-surface border border-border rounded-md text-sm resize-y" />
                    </div>
                     <div className="flex flex-col flex-1 min-h-0">
                         <label htmlFor="edits-doc" className="text-sm font-medium text-text-secondary mb-2">Suggested Edits</label>
                         <textarea id="edits-doc" value={edits} onChange={e => setEdits(e.target.value)} className="flex-grow p-3 bg-surface border border-border rounded-md text-sm resize-y" />
                    </div>
                </div>

                <div className="flex flex-col min-h-0">
                     <label className="text-sm font-medium text-text-secondary mb-2">Merged Document</label>
                    <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                         {isLoading && (
                            <div className="flex justify-center items-center h-full">
                                <LoadingSpinner />
                            </div>
                        )}
                        {error && <p className="text-danger">{error}</p>}
                        {!isLoading && !mergedDoc && !error && <div className="text-text-secondary h-full flex items-center justify-center">Your merged document will appear here.</div>}
                        {mergedDoc && <MarkdownRenderer content={mergedDoc} />}
                    </div>
                </div>
            </div>

            <div className="flex-shrink-0 mt-6 flex justify-center">
                 <button onClick={handleMerge} disabled={isLoading} className="btn-primary w-full max-w-sm flex items-center justify-center gap-2 py-3">
                    <SparklesIcon/>
                    {isLoading ? 'Merging with AI...' : 'Merge & Reconcile Edits'}
                </button>
            </div>
        </div>
    );
};
