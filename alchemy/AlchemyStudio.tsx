// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.


import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Alchemist } from './alchemist/compiler';
import { SparklesIcon } from '../components/icons';
import { LoadingSpinner } from '../components/shared';
import Editor from '@monaco-editor/react';
import initialTsalCode from './example.tsal.txt?raw';

export const AlchemyStudio: React.FC = () => {
    const [tsalCode, setTsalCode] = useState<string>(initialTsalCode);
    const [watCode, setWatCode] = useState<string>('');
    const [output, setOutput] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const alchemistRef = useRef<Alchemist | null>(null);

    useEffect(() => {
        alchemistRef.current = new Alchemist();
    }, []);

    const log = (message: string) => {
        setOutput(prev => [...prev, message]);
    };

    const handleCompileAndRun = useCallback(async () => {
        if (!alchemistRef.current) {
            log("❌ Alchemist engine not initialized.");
            return;
        }
        setIsLoading(true);
        setOutput([]);
        log("🔥 Initializing Alchemist Engine...");

        try {
            log("🔬 Compiling TSAL source...");
            const { instance, wat } = await alchemistRef.current.compile(tsalCode);
            setWatCode(wat);
            log("✅ Compilation successful.");
            log("🚀 Executing Wasm module...");

            const add = instance.exports.add as (a: number, b: number) => number;
            if (typeof add !== 'function') {
                throw new Error("Exported 'add' function not found in Wasm module.");
            }
            
            const result = add(40, 2);
            log(`▶️ Wasm execution result: add(40, 2) = ${result}`);

            if (result !== 42) {
                log("❌ VALIDATION FAILED! The universe is broken.");
            } else {
                log("✨ Billion-dollar code confirmed. The machine is alive.");
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            log(`☠️ Alchemy Engine FAILED: ${errorMessage}`);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [tsalCode]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <SparklesIcon />
                    <span className="ml-3">Alchemy Studio (TSAL Compiler)</span>
                </h1>
                <p className="text-text-secondary mt-1">Write TypeScript Assembly Language (TSAL), compile it to WebAssembly, and run it in the browser.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="tsal-input" className="text-sm font-medium text-text-secondary mb-2">TSAL Code</label>
                    <div className="flex-grow border border-border rounded-md overflow-hidden">
                        <Editor
                            height="100%"
                            language="typescript"
                            value={tsalCode}
                            onChange={(value) => setTsalCode(value || '')}
                            theme="vs-dark"
                            options={{ minimap: { enabled: false } }}
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex-grow flex flex-col h-1/2">
                         <label className="text-sm font-medium text-text-secondary mb-2">Generated WebAssembly Text (WAT)</label>
                         <div className="flex-grow border border-border rounded-md overflow-hidden">
                            <Editor
                                height="100%"
                                language="wat"
                                value={watCode}
                                options={{ readOnly: true, minimap: { enabled: false } }}
                                theme="vs-dark"
                            />
                        </div>
                    </div>
                     <div className="flex-grow flex flex-col h-1/2">
                        <label className="text-sm font-medium text-text-secondary mb-2">Console Output</label>
                        <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto font-mono text-xs">
                            {output.map((line, i) => <p key={i}>{line}</p>)}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex-shrink-0 mt-4">
                <button onClick={handleCompileAndRun} disabled={isLoading} className="btn-primary w-full max-w-sm mx-auto">
                    {isLoading ? <LoadingSpinner /> : 'Compile & Run'}
                </button>
            </div>
        </div>
    );
};
