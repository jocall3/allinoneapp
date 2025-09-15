import React, { useState, useCallback } from 'react';
import { streamContent } from '../../services/geminiCore';
import { VideoCameraIcon, PlusIcon, TrashIcon, SparklesIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

interface AssetItem {
    id: number;
    type: 'Image' | 'Video' | 'Text' | 'Audio';
    description: string;
}

export const AiDrivenCreativeRemixTool: React.FC = () => {
    const [assets, setAssets] = useState<AssetItem[]>([
        { id: 1, type: 'Image', description: 'A futuristic cityscape at sunset.' },
        { id: 2, type: 'Video', description: 'A 5-second drone shot flying over a busy highway.' },
        { id: 3, type: 'Text', description: 'Headline: "The Future is Now."' },
        { id: 4, type: 'Audio', description: 'An upbeat, inspiring synthwave music track.' },
    ]);
    const [prompt, setPrompt] = useState<string>('Create a 30-second promotional video script for a new tech product. Use the available assets to build a compelling narrative.');
    const [script, setScript] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleAddAsset = () => {
        const newAsset: AssetItem = {
            id: Date.now(),
            type: 'Text',
            description: '',
        };
        setAssets([...assets, newAsset]);
    };

    const handleRemoveAsset = (id: number) => {
        setAssets(assets.filter(asset => asset.id !== id));
    };

    const handleUpdateAsset = (id: number, updates: Partial<AssetItem>) => {
        setAssets(assets.map(asset => asset.id === id ? { ...asset, ...updates } : asset));
    };

    const handleGenerate = useCallback(async () => {
        if (assets.length === 0 || !prompt.trim()) {
            setError('Please add at least one asset and provide a creative prompt.');
            return;
        }
        setIsLoading(true);
        setError('');
        setScript('');

        const assetsDescription = assets.map(a => `- **[${a.type}]** ${a.description}`).join('\n');
        const fullPrompt = `
        You are a creative director and video editor. A user has provided a list of creative assets and a prompt.
        Your task is to generate a detailed script or storyboard for a short video presentation that utilizes these assets.

        The output should be in Markdown and include:
        1.  **Title:** A compelling title for the creative piece.
        2.  **Concept:** A one-paragraph summary of the creative vision.
        3.  **Storyboard/Script:** A scene-by-scene breakdown, specifying which assets are used, timing, on-screen text, and voiceover/narration.

        **Creative Prompt:**
        ${prompt}

        **Available Assets:**
        ${assetsDescription}
        `;

        try {
            const stream = streamContent(fullPrompt, "You are a creative director AI.");
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
    }, [assets, prompt]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6 flex-shrink-0">
                <h1 className="text-3xl font-bold flex items-center">
                    <VideoCameraIcon />
                    <span className="ml-3">AI Creative Remix Tool</span>
                </h1>
                <p className="text-text-secondary mt-1">Provide creative assets and a prompt to generate a video script or storyboard.</p>
            </header>

            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col flex-grow min-h-0">
                        <label className="text-sm font-medium text-text-secondary mb-2">Creative Assets</label>
                        <div className="bg-surface p-3 rounded-lg border border-border flex-grow overflow-y-auto space-y-2">
                            {assets.map(asset => (
                                <div key={asset.id} className="flex items-center gap-2 p-2 bg-background rounded-md">
                                    <select
                                        value={asset.type}
                                        onChange={e => handleUpdateAsset(asset.id, { type: e.target.value as AssetItem['type'] })}
                                        className="bg-surface border border-border rounded px-2 py-1 text-xs"
                                    >
                                        <option>Image</option>
                                        <option>Video</option>
                                        <option>Text</option>
                                        <option>Audio</option>
                                    </select>
                                    <input
                                        type="text"
                                        value={asset.description}
                                        onChange={e => handleUpdateAsset(asset.id, { description: e.target.value })}
                                        className="flex-grow bg-transparent focus:outline-none text-sm"
                                        placeholder="Describe asset..."
                                    />
                                    <button onClick={() => handleRemoveAsset(asset.id)} className="p-1 text-text-secondary hover:text-danger"><TrashIcon /></button>
                                </div>
                            ))}
                            <button onClick={handleAddAsset} className="w-full flex items-center justify-center gap-2 text-sm p-2 bg-surface-hover hover:bg-border rounded-md">
                               <PlusIcon/> Add Asset
                            </button>
                        </div>
                    </div>
                     <div className="flex flex-col">
                        <label htmlFor="prompt" className="text-sm font-medium text-text-secondary mb-2">Creative Prompt</label>
                         <textarea id="prompt" value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full h-24 p-3 bg-surface border border-border rounded-md text-sm resize-y" />
                    </div>
                </div>

                <div className="flex flex-col min-h-0">
                    <label className="text-sm font-medium text-text-secondary mb-2">Generated Script / Storyboard</label>
                    <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                        {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                        {error && <p className="text-danger p-4">{error}</p>}
                        {!isLoading && !script && !error && <div className="text-text-secondary h-full flex items-center justify-center text-center">Your generated creative plan will appear here.</div>}
                        {script && <MarkdownRenderer content={script} />}
                    </div>
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary w-full py-3 mt-4 flex items-center justify-center gap-2">
                        <SparklesIcon />
                        {isLoading ? 'Generating Creative...' : 'Remix Assets with AI'}
                    </button>
                </div>
            </div>
        </div>
    );
};
