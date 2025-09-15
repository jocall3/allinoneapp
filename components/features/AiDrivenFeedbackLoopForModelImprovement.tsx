import React, { useState } from 'react';
import { streamContent } from '../../services/geminiCore';
import { ArrowPathIcon, SparklesIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';
import { logEvent } from '../../services';

const ThumbsButton = ({ active, onClick, type }: { active: boolean, onClick: () => void, type: 'up' | 'down' }) => (
    <button onClick={onClick} className={`p-2 rounded-md transition-colors ${active ? 'bg-primary/20 text-primary' : 'bg-surface-hover hover:bg-border'}`}>
        {type === 'up' ? '👍' : '👎'}
    </button>
);

export const AiDrivenFeedbackLoopForModelImprovement: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('Explain the concept of recursion in programming.');
    const [response, setResponse] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [feedback, setFeedback] = useState<{ rating: 'good' | 'bad' | null, text: string }>({ rating: null, text: '' });
    const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setResponse('');
        setFeedback({ rating: null, text: '' });
        setFeedbackSubmitted(false);

        try {
            const stream = streamContent(prompt, "You are a helpful AI assistant.");
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setResponse(fullResponse);
            }
        } catch (e) {
            setResponse('An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleFeedbackSubmit = () => {
        if (!feedback.rating) return;
        logEvent('ai_feedback_submitted', {
            prompt,
            responseLength: response.length,
            rating: feedback.rating,
            feedbackText: feedback.text
        });
        setFeedbackSubmitted(true);
        // In a real application, this data would be sent to a backend for model fine-tuning.
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6 flex-shrink-0">
                <h1 className="text-3xl font-bold flex items-center">
                    <ArrowPathIcon />
                    <span className="ml-3">AI Feedback Loop</span>
                </h1>
                <p className="text-text-secondary mt-1">This feature demonstrates how user feedback can be collected to improve AI models over time.</p>
            </header>

            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                {/* Left Column: Interaction */}
                <div className="flex flex-col gap-4">
                     <div>
                        <label className="text-sm font-medium text-text-secondary mb-2">Your Prompt</label>
                        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full h-24 p-3 bg-surface border border-border rounded-md text-sm resize-y" />
                    </div>
                     <button onClick={handleGenerate} disabled={isLoading} className="btn-primary w-full py-2 flex items-center justify-center gap-2">
                       <SparklesIcon /> {isLoading ? 'Generating...' : 'Generate AI Response'}
                    </button>
                    <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                        <h3 className="text-lg font-bold mb-2">AI Response:</h3>
                         {isLoading && !response && <LoadingSpinner />}
                        {response && <MarkdownRenderer content={response} />}
                    </div>
                </div>

                {/* Right Column: Feedback */}
                 <div className="flex flex-col min-h-0">
                    <label className="text-lg font-bold text-text-secondary mb-2">Provide Feedback</label>
                    <div className="flex-grow bg-surface p-6 rounded-lg border border-border flex flex-col gap-4">
                      {feedbackSubmitted ? (
                          <div className="flex flex-col items-center justify-center h-full text-center">
                              <h3 className="text-2xl font-bold text-primary">Thank You!</h3>
                              <p className="text-text-secondary mt-2">Your feedback helps us improve.</p>
                          </div>
                      ) : response && !isLoading ? (
                           <>
                               <div>
                                  <p className="font-semibold mb-2">How was the response?</p>
                                  <div className="flex gap-2">
                                     <ThumbsButton type="up" active={feedback.rating === 'good'} onClick={() => setFeedback(f => ({ ...f, rating: 'good' }))}/>
                                     <ThumbsButton type="down" active={feedback.rating === 'bad'} onClick={() => setFeedback(f => ({ ...f, rating: 'bad' }))}/>
                                  </div>
                               </div>
                                <div className="flex flex-col flex-grow">
                                    <label className="text-sm font-medium text-text-secondary mb-2">Additional Comments (Optional)</label>
                                     <textarea 
                                         value={feedback.text} 
                                         onChange={e => setFeedback(f => ({...f, text: e.target.value}))} 
                                         className="w-full flex-grow p-3 bg-background border border-border rounded-md text-sm resize-y"
                                         placeholder="What did you like or dislike?"
                                     />
                                </div>
                                <button onClick={handleFeedbackSubmit} disabled={!feedback.rating} className="btn-primary w-full py-2">
                                    Submit Feedback
                                </button>
                           </>
                      ) : (
                          <div className="flex items-center justify-center h-full text-text-secondary">
                              Generate a response to provide feedback.
                          </div>
                      )}
                    </div>
                </div>
            </div>
        </div>
    );
};
