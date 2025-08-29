import React, { useState, useEffect, useRef } from 'react';
import type { StoryDocument, PageHandlers, EditorActions } from '../../../types';
import ChapterComponent from './PlanDisplay';
import MagazinePreview from './MagazinePreview';
import { PlusIcon, DocumentPlusIcon, WandIcon, ChatBubbleBottomCenterTextIcon, SparklesIcon, PlayIcon, StopIcon } from '../../icons.tsx';

interface StoryEditorProps {
    doc: StoryDocument;
    setDoc: React.Dispatch<React.SetStateAction<StoryDocument | null>>;
    pageHandlers: PageHandlers;
    editorActions: EditorActions;
    generationStatus: { active: boolean, completed: number, total: number };
    onStopGeneration: () => void;
    onContinueGeneration: () => void;
}

const StoryEditor: React.FC<StoryEditorProps> = ({ doc, setDoc, pageHandlers, editorActions, generationStatus, onStopGeneration, onContinueGeneration }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeChapterId, setActiveChapterId] = useState<string | null>(null);

    useEffect(() => {
        if (doc && doc.chapters.length > 0 && !activeChapterId) {
            setActiveChapterId(doc.chapters[0].id);
        }
    }, [doc, activeChapterId]);

    const activeChapter = doc.chapters.find(c => c.id === activeChapterId);
    
    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full p-4">
            <aside className="xl:col-span-3 bg-gray-900/60 p-4 rounded-lg border border-gray-700 flex flex-col">
                <h3 className="font-bold mb-3 text-violet-300">Table of Contents</h3>
                <div className="flex-grow overflow-y-auto space-y-1 pr-2 -mr-2">
                    {doc.chapters.map((chapter, index) => (
                        <button key={chapter.id} onClick={() => setActiveChapterId(chapter.id)} className={`block w-full text-left p-2 rounded-md transition-colors text-sm ${activeChapterId === chapter.id ? 'bg-violet-900/50 text-white' : 'hover:bg-gray-700/50 text-gray-300'}`}>
                            <span className="font-semibold text-gray-500 mr-2">{index + 1}.</span>
                            <span className="font-semibold">{chapter.title}</span>
                             <p className="text-xs text-gray-400 pl-6 truncate">{chapter.summary}</p>
                        </button>
                    ))}
                </div>
                {generationStatus.total > 0 && generationStatus.completed < generationStatus.total && (
                    <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-sm font-medium text-gray-300">{generationStatus.active ? 'Generating Chapters...' : 'Generation Paused'}</p>
                            <p className="text-sm text-gray-400">{generationStatus.completed} / {generationStatus.total}</p>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-2 mb-2">
                            <div className="bg-violet-500 h-2 rounded-full" style={{ width: `${(generationStatus.completed / generationStatus.total) * 100}%` }}></div>
                        </div>
                        {generationStatus.active ? <button onClick={onStopGeneration} className="w-full flex items-center justify-center gap-2 text-sm p-2 bg-red-600/50 hover:bg-red-600/80 rounded-md"><StopIcon className="w-4 h-4" /> Stop</button> : <button onClick={onContinueGeneration} className="w-full flex items-center justify-center gap-2 text-sm p-2 bg-green-600/50 hover:bg-green-600/80 rounded-md"><PlayIcon className="w-4 h-4" /> Continue</button>}
                    </div>
                )}
                 <div className="mt-4 space-y-2 border-t border-gray-700 pt-4">
                    <div className="relative group">
                        <button className="w-full flex items-center justify-center gap-2 text-sm p-2 bg-violet-600/80 hover:bg-violet-600 rounded-md"><WandIcon className="w-4 h-4"/> AI Assist</button>
                        <div className="absolute bottom-full mb-2 w-full bg-gray-800 border border-gray-700 rounded-lg p-2 space-y-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                            <button onClick={editorActions.onSuggestTitles} className="w-full text-left text-sm p-2 hover:bg-gray-700 rounded-md flex items-center gap-2"><SparklesIcon className="w-4 h-4"/> Improve Titles</button>
                            <button onClick={editorActions.onSummarizeChapters} className="w-full text-left text-sm p-2 hover:bg-gray-700 rounded-md flex items-center gap-2"><ChatBubbleBottomCenterTextIcon className="w-4 h-4"/> Update Summaries</button>
                        </div>
                    </div>
                 </div>
            </aside>
            <div className="xl:col-span-5 overflow-y-auto pr-2 -mr-2">
                <button onClick={editorActions.onAutoDraftAll} className="w-full mb-4 flex items-center justify-center gap-2 p-3 bg-violet-800 hover:bg-violet-700 rounded-lg font-bold"><WandIcon className="w-5 h-5"/> AI, Write Full Draft</button>
                {activeChapter ? <ChapterComponent chapter={activeChapter} pageHandlers={pageHandlers} isActionLoading={false} /> : <p className="flex items-center justify-center h-full text-gray-500">Select a chapter to begin editing.</p>}
            </div>
            <aside className="xl:col-span-4 bg-gray-900/60 p-4 rounded-lg border border-gray-700 overflow-y-auto">
                <MagazinePreview doc={doc} />
            </aside>
        </div>
    );
};

export default StoryEditor;
