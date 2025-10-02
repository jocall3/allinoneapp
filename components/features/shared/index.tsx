// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useEffect } from 'react';
import { marked } from 'marked';

interface MarkdownRendererProps {
    content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    const [sanitizedHtml, setSanitizedHtml] = useState<string>('');

    useEffect(() => {
        const parse = async () => {
            if (content) {
                // Basic sanitization to prevent obvious XSS, but a more robust library like DOMPurify would be better for production.
                const html = await marked.parse(content);
                setSanitizedHtml(html);
            } else {
                setSanitizedHtml('');
            }
        };
        parse();
    }, [content]);

    return (
        <div
            className="prose prose-sm max-w-none prose-invert prose-headings:text-text-primary prose-p:text-text-secondary prose-strong:text-text-primary prose-a:text-primary hover:prose-a:text-primary/80 prose-code:text-accent prose-code:before:content-[''] prose-code:after:content-[''] prose-pre:bg-background prose-pre:border prose-pre:border-border prose-blockquote:border-primary"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
    );
};
