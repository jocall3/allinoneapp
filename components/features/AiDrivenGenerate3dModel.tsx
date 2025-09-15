import React, { useState, useCallback } from 'react';
import { streamContent } from '../../services/geminiCore';
import { PuzzlePieceIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

interface Primitive {
    type: 'box' | 'sphere' | 'plane';
    position: { x: number; y: number; z: number };
    size: { width: number; height: number; depth: number };
    color: string;
}

interface Scene {
    description: string;
    objects: Primitive[];
}

export const AiDrivenGenerate3dModel: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('A simple desk scene with a red lamp on a brown table.');
    const [scene, setScene] = useState<Scene | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) {
            setError('Please describe the 3D model or scene.');
            return;
        }
        setIsLoading(true);
        setError('');
        setScene(null);
        
        const fullPrompt = `
        You are an AI assistant that generates 3D scene descriptions in JSON format.
        Based on the user's prompt, create a scene composed of simple primitive shapes (box, sphere, plane).
        
        For each object, define its:
        - type: 'box', 'sphere', or 'plane'
        - position: {x, y, z} coordinates (center of the object)
        - size: {width, height, depth} dimensions
        - color: a valid CSS color string (e.g., '#FF0000', 'blue')
        
        Respond ONLY with the JSON object, without any markdown formatting or extra text.

        Prompt: "${prompt}"
        `;

        try {
            const stream = streamContent(fullPrompt, "You are a 3D scene generator AI.");
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
            }
            setScene(JSON.parse(fullResponse));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6 flex-shrink-0">
                <h1 className="text-3xl font-bold flex items-center">
                    <PuzzlePieceIcon />
                    <span className="ml-3">AI 3D Scene Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Describe an object or scene, and AI will generate a descriptive JSON and a simple preview.</p>
            </header>

            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="prompt-input" className="text-sm font-medium text-text-secondary mb-2">Scene Description</label>
                    <textarea
                        id="prompt-input"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md text-sm resize-y h-24"
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary w-full py-2 mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Generate Scene'}
                    </button>

                    <label className="text-sm font-medium text-text-secondary mb-2 mt-4">Generated Scene JSON</label>
                     <div className="flex-grow p-1 bg-background border border-border rounded-md overflow-y-auto min-h-[200px]">
                        {scene && <MarkdownRenderer content={'```json\n' + JSON.stringify(scene, null, 2) + '\n```'}/>}
                    </div>
                </div>

                <div className="flex flex-col min-h-0">
                    <label className="text-sm font-medium text-text-secondary mb-2">3D Preview (CSS)</label>
                    <div className="flex-grow bg-background border-2 border-dashed border-border rounded-lg flex items-center justify-center p-4 overflow-hidden [perspective:1000px]">
                         {isLoading && <LoadingSpinner/>}
                         {error && <p className="text-danger">{error}</p>}
                         {scene && !isLoading && (
                            <div className="w-64 h-64 relative [transform-style:preserve-3d] [transform:rotateX(-20deg)_rotateY(-30deg)] scale-150">
                                {scene.objects.map((obj, i) => {
                                    const style: React.CSSProperties = {
                                        position: 'absolute',
                                        width: `${obj.size.width}px`,
                                        height: `${obj.size.height}px`,
                                        background: obj.color,
                                        transform: `translate3d(${obj.position.x}px, ${obj.position.y}px, ${obj.position.z}px)`,
                                        borderRadius: obj.type === 'sphere' ? '50%' : '0'
                                    };
                                    return <div key={i} style={style} />;
                                })}
                            </div>
                         )}
                    </div>
                </div>
            </div>
        </div>
    );
};
