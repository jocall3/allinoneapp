
import { useState, useEffect } from 'react';
import type { FileNode } from '../types';
import { generatePreview } from '../services/geminiService';
import { readFileContent } from '../services/fileSystemService';

const isPreviewableFile = (fileName: string) => {
    const textExtensions = ['.txt', '.md', '.json', '.js', '.ts', '.tsx', '.html', '.css', '.py', '.rb', '.java', '.c', '.cpp', '.go', '.rs', '.php'];
    return textExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
};

export const useAIPreview = (file: FileNode, isHovered: boolean) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let timeoutId: number;
        let isCancelled = false;

        const fetchPreview = async () => {
            if (isCancelled || !isPreviewableFile(file.name) || file.isDirectory || !file.handle) return;
            setIsLoading(true);
            setPreview(null);
            try {
                const content = await readFileContent(file.handle as FileSystemFileHandle);
                if (isCancelled) return;
                const summary = await generatePreview(file.name, content);
                if (!isCancelled) setPreview(summary);
            } catch (e) {
                if (!isCancelled) console.error("Preview failed:", e);
            } finally {
                if (!isCancelled) setIsLoading(false);
            }
        };

        if (isHovered) {
            timeoutId = window.setTimeout(fetchPreview, 500);
        }

        return () => {
            isCancelled = true;
            clearTimeout(timeoutId);
            if(isLoading) setIsLoading(false);
        };
    }, [file, isHovered, isLoading]);

    return { preview, isLoading };
};
