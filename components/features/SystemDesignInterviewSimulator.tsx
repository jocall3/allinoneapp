import React, { useState, useCallback, useRef, useEffect } from 'react';
import { simulateSystemDesignInterview } from '../../services/api';
import { AcademicCapIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

const prompts = ["Design a social media feed like Twitter.", "Design a ride-sharing service like Uber.", "Design a video streaming service like YouTube."];

interface Message {
    sender: 'user' | 'ai';
    text: string;
}

export const SystemDesignInterviewSimulator: React.FC = () => {
    const [prompt, setPrompt] = useState(prompts[0]);
    const [conversation, setConversation] = useState<Message[]>([]);
    const [userResponse, setUserResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const handleNextResponse = useCallback(async () => {
        if (!userResponse.trim()) return;
        
        // FIX: Use 'as const' to ensure the string literal 'user' matches the 'Message' type.
        const newConversation = [...conversation, { sender: 'user' as const, text: userResponse }];
        setConversation(newConversation);
        setUserResponse('');
        setIsLoading(true);

        try {
            const stream = simulateSystemDesignInterview(prompt, userResponse);
            let aiResponse = '';
            for await (const chunk of stream) {
                aiResponse += chunk;
                // FIX: Use 'as const' to ensure the string literal 'ai' matches the 'Message' type.
                setConversation([...newConversation, { sender: 'ai' as const, text: aiResponse }]);
            }
        } catch (err) {
            // FIX: Use 'as const' to ensure the string literal 'ai' matches the 'Message' type.
            setConversation([...newConversation, { sender: 'ai' as const, text: "Sorry, I encountered an error." }]);
        } finally {
            setIsLoading(false);
        }
    }, [prompt, userResponse, conversation]);
    
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation]);
    
    const startNewInterview = () => {
        setConversation([]);
        setPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
    }

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-4">
                <h1 className="text-3xl font-bold flex items-center">
                    <AcademicCapIcon />
                    <span className="ml-3">System Design Interview Simulator</span>
                </h1>
                <p className="text-text-secondary mt-1">Practice for your next system design interview with an AI.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                <div className="bg-surface p-4 rounded-lg border border-border">
                    <p className="font-bold">Your Prompt: <span className="font-normal">{prompt}</span></p>
                    <button onClick={startNewInterview} className="text-xs text-primary hover:underline mt-1">Get a new prompt</button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto space-y-4">
                    {conversation.map((msg, i) => (
                        <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xl p-3 rounded-lg ${msg.sender === 'user' ? 'bg-primary/20' : 'bg-surface'}`}>
                                <MarkdownRenderer content={msg.text} />
                            </div>
                        </div>
                    ))}
                     {isLoading && <div className="flex justify-start"><div className="p-3 rounded-lg bg-surface"><LoadingSpinner /></div></div>}
                    <div ref={chatEndRef} />
                </div>
                <div className="flex items-center gap-4">
                    <textarea
                        value={userResponse}
                        onChange={(e) => setUserResponse(e.target.value)}
                        onKeyDown={e => {if (e.key === 'Enter' && !e.shiftKey) {e.preventDefault(); handleNextResponse();}}}
                        placeholder="Describe your approach..."
                        className="flex-grow p-3 bg-surface border border-border rounded-md resize-none"
                        rows={3}
                        disabled={isLoading}
                    />
                    <button onClick={handleNextResponse} disabled={isLoading || !userResponse} className="btn-primary self-stretch">
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};