import React, { useState, useCallback } from 'react';
import { streamContent } from '../../services/geminiCore';
import { ServerStackIcon, SparklesIcon, ArrowDownTrayIcon, ClipboardDocumentIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';
import { downloadFile } from '../../services';
import Editor from '@monaco-editor/react';

const exampleSource = `{
  "id": "number",
  "user_info": {
    "fullName": "string",
    "emailAddress": "string"
  },
  "created_at": "timestamp"
}`;

const exampleTarget = `{
  "user_id": "number",
  "first_name": "string",
  "last_name": "string",
  "email": "string",
  "creation_date": "date"
}`;

const exampleMapping = `
- Map 'id' to 'user_id'.
- Split 'fullName' into 'first_name' and 'last_name'.
- Rename 'emailAddress' to 'email'.
- Convert 'created_at' timestamp to an ISO 8601 date string for 'creation_date'.
`;

export const AiDrivenDataMigration: React.FC = () => {
    const [sourceSchema, setSourceSchema] = useState<string>(exampleSource);
    const [targetSchema, setTargetSchema] = useState<string>(exampleTarget);
    const [mapping, setMapping] = useState<string>(exampleMapping);
    const [script, setScript] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!sourceSchema.trim() || !targetSchema.trim() || !mapping.trim()) {
            setError('Please define the source, target, and mapping rules.');
            return;
        }
        setIsLoading(true);
        setError('');
        setScript('');

        const prompt = `
        You are an expert data engineer who specializes in writing data migration scripts.
        Your task is to generate a Python script that transforms data from a source JSON structure to a target JSON structure based on a set of mapping rules.

        - The script should read a file named 'source_data.json'.
        - It should process each record according to the rules.
        - It should write the transformed data to a new file named 'target_data.json'.
        - The script must be well-commented, robust, and handle potential errors gracefully (e.g., missing fields).

        **Source Schema:**
        \`\`\`json
        ${sourceSchema}
        \`\`\`

        **Target Schema:**
        \`\`\`json
        ${targetSchema}
        \`\`\`

        **Mapping Rules:**
        ${mapping}

        Generate only the Python code, wrapped in a markdown code block.
        `;

        try {
            const stream = streamContent(prompt, "You are a data engineering expert AI.");
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setScript(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [sourceSchema, targetSchema, mapping]);
    
    const handleDownload = () => script && downloadFile(script.replace(/^```python\n|```$/g, ''), 'migration_script.py', 'text/python');
    const handleCopy = () => script && navigator.clipboard.writeText(script.replace(/^```python\n|```$/g, ''));

    const EditorPanel = ({ title, value, setter, lang = 'json' }: {title: string, value: string, setter: (val: string) => void, lang?: string}) => (
         <div className="flex flex-col flex-1 min-h-[150px]">
            <label className="text-sm font-medium text-text-secondary mb-1">{title}</label>
            <div className="border border-border rounded-md overflow-hidden flex-grow">
                <Editor height="100%" language={lang} value={value} onChange={v => setter(v || '')} theme="vs-dark" options={{ minimap: { enabled: false } }}/>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-4 flex-shrink-0">
                <h1 className="text-3xl font-bold flex items-center">
                    <ServerStackIcon />
                    <span className="ml-3">AI-Driven Data Migration</span>
                </h1>
                <p className="text-text-secondary mt-1">Define schemas and mapping rules to generate a data transformation script.</p>
            </header>

            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
                <div className="flex flex-col gap-4">
                    <EditorPanel title="Source Schema" value={sourceSchema} setter={setSourceSchema} />
                    <EditorPanel title="Target Schema" value={targetSchema} setter={setTargetSchema} />
                    <EditorPanel title="Mapping Rules" value={mapping} setter={setMapping} lang="markdown"/>
                </div>

                <div className="flex flex-col min-h-0">
                     <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-text-secondary">Generated Python Script</label>
                        {script && !isLoading && (
                            <div className="flex items-center gap-2">
                               <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1 bg-surface-hover text-xs rounded-md hover:bg-border"><ClipboardDocumentIcon className="w-4 h-4"/> Copy</button>
                               <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-1 bg-surface-hover text-xs rounded-md hover:bg-border"><ArrowDownTrayIcon className="w-4 h-4"/> Download</button>
                            </div>
                        )}
                    </div>
                    <div className="flex-grow p-1 bg-background border border-border rounded-md overflow-y-auto">
                        {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                        {error && <p className="text-danger p-4">{error}</p>}
                        {script && <MarkdownRenderer content={script} />}
                        {!isLoading && !script && !error && <div className="text-text-secondary h-full flex items-center justify-center">Migration script will appear here.</div>}
                    </div>
                     <button onClick={handleGenerate} disabled={isLoading} className="btn-primary w-full py-3 mt-4 flex items-center justify-center gap-2">
                        <SparklesIcon/>
                        {isLoading ? 'Generating Script...' : 'Generate Migration Script'}
                    </button>
                </div>
            </div>
        </div>
    );
};
