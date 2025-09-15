import React, { useState, useCallback } from 'react';
import { streamContent } from '../../services/geminiCore'; // Using streamContent for real-time feedback
import { CodeBracketSquareIcon, ArrowDownTrayIcon, ClipboardDocumentIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';
import { downloadFile } from '../../services';
import Editor from '@monaco-editor/react';

const exampleSpec = `openapi: 3.0.0
info:
  title: Simple User API
  version: 1.0.0
paths:
  /users:
    get:
      summary: Get all users
      responses:
        '200':
          description: A list of users.
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    id:
                      type: integer
                    name:
                      type: string
  /users/{id}:
    get:
      summary: Get a user by ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: A single user.
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: integer
                  name:
                    type: string
`;

const languageOptions = [
    { value: 'typescript-fetch', label: 'TypeScript - Fetch Client' },
    { value: 'python-requests', label: 'Python - Requests Client' },
    { value: 'java-okhttp', label: 'Java - OkHttp Client' },
];

export const AiDrivenApiClientGeneration: React.FC = () => {
    const [spec, setSpec] = useState<string>(exampleSpec);
    const [language, setLanguage] = useState<string>(languageOptions[0].value);
    const [clientCode, setClientCode] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!spec.trim()) {
            setError('Please provide an OpenAPI/Swagger specification.');
            return;
        }
        setIsLoading(true);
        setError('');
        setClientCode('');
        
        const selectedLanguageLabel = languageOptions.find(opt => opt.value === language)?.label || 'client';
        const prompt = `Based on the following OpenAPI 3.0 specification, generate a complete, functional, and type-safe API client library for ${selectedLanguageLabel}. 
        The code should be well-commented, handle basic error scenarios, and be ready to use in a production environment. 
        Only output the raw code for the client file, without any extra explanations or markdown formatting.

        **OpenAPI Specification:**
        \`\`\`yaml
        ${spec}
        \`\`\`
        `;

        try {
            const stream = streamContent(prompt, "You are an expert AI software engineer specializing in API client generation.");
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setClientCode(fullResponse.replace(/^```(\w+\n)?|```$/g, '').trim());
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred while generating the client.');
        } finally {
            setIsLoading(false);
        }
    }, [spec, language]);

    const handleDownload = () => {
        if (!clientCode) return;
        const extension = language.split('-')[0] === 'typescript' ? 'ts' : 'py';
        downloadFile(clientCode, `apiClient.${extension}`, 'text/plain');
    };
    
    const handleCopy = () => {
        if (!clientCode) return;
        navigator.clipboard.writeText(clientCode);
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6 flex-shrink-0">
                <h1 className="text-3xl font-bold flex items-center">
                    <CodeBracketSquareIcon />
                    <span className="ml-3">AI API Client Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Provide an OpenAPI/Swagger specification, and AI will generate a type-safe API client.</p>
            </header>
            
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
                <div className="flex flex-col min-h-0">
                    <label htmlFor="spec-input" className="text-sm font-medium text-text-secondary mb-2">OpenAPI / Swagger Specification (YAML or JSON)</label>
                    <div className="flex-grow border border-border rounded-md overflow-hidden">
                        <Editor
                            height="100%"
                            language="yaml"
                            value={spec}
                            onChange={(value) => setSpec(value || '')}
                            theme="vs-dark"
                            options={{ minimap: { enabled: false }, wordWrap: 'on' }}
                        />
                    </div>
                </div>

                <div className="flex flex-col min-h-0">
                     <div className="flex justify-between items-center mb-2">
                        <label htmlFor="language-select" className="text-sm font-medium text-text-secondary">Generated Client Code</label>
                         {clientCode && !isLoading && (
                            <div className="flex items-center gap-2">
                                <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1 bg-surface-hover text-xs rounded-md hover:bg-border">
                                    <ClipboardDocumentIcon className="w-4 h-4"/> Copy Code
                                </button>
                                <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-1 bg-surface-hover text-xs rounded-md hover:bg-border">
                                    <ArrowDownTrayIcon className="w-4 h-4"/> Download
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex-grow border border-border rounded-md overflow-hidden">
                        {isLoading && (
                            <div className="w-full h-full flex items-center justify-center">
                                <LoadingSpinner />
                            </div>
                        )}
                        {!isLoading && clientCode && (
                            <Editor
                                height="100%"
                                language={language.split('-')[0]}
                                value={clientCode}
                                theme="vs-dark"
                                options={{ readOnly: true, minimap: { enabled: false } }}
                            />
                        )}
                        {!isLoading && !clientCode && (
                           <div className="w-full h-full flex items-center justify-center text-text-secondary text-sm">
                             {error ? <p className="text-danger p-4">{error}</p> : <p>Generated client code will appear here.</p>}
                           </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-shrink-0 mt-4 flex items-center justify-center gap-4">
                 <div className="w-full max-w-sm">
                    <label htmlFor="language-select" className="block text-sm font-medium text-text-secondary text-center mb-1">Target Language</label>
                    <select
                        id="language-select"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full p-2 bg-surface border border-border rounded-md"
                    >
                        {languageOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                 </div>
                 <button onClick={handleGenerate} disabled={isLoading} className="btn-primary self-end px-8 py-2">
                    {isLoading ? 'Generating...' : 'Generate API Client'}
                </button>
            </div>
        </div>
    );
};
