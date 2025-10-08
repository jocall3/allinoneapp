// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from 'react';
import type { ChapterScaffold, PageScaffold } from '../../../types'; // Original types from the system
import { ImagePlusIcon, FileTextIcon, WandIcon, ChevronDownIcon } from '../../icons.tsx';

// --- New and Expanded Type Definitions for a comprehensive Story Scaffolding Plan ---

/**
 * StoryScaffold: Represents the overall story structure.
 * This type encapsulates the entire narrative plan.
 * Exported to be used by the parent component that manages the full story state.
 */
export interface StoryScaffold {
    id: string;
    title: string;
    genre: string;
    logline: string;
    synopsis: string;
    chapters: ChapterScaffold[]; // Uses the imported ChapterScaffold
    ai_prompt?: string; // Optional: for top-level AI instructions for the story
}

/**
 * Interface for handlers related to overall story operations.
 * Exported for use by the parent component.
 */
export interface StoryHandlers {
    onUpdateStory: (storyId: string, data: Partial<StoryScaffold>) => void;
    onGenerateLogline: (storyId: string) => void;
    onGenerateSynopsis: (storyId: string) => void;
    onAddChapter: (storyId: string, afterChapterId?: string) => void; // Allows inserting a chapter after a specific one
    onReorderChapters: (storyId: string, chapterId: string, direction: 'up' | 'down') => void;
}

/**
 * Interface for handlers related to chapter operations.
 * Exported for use by the parent component and child components.
 */
export interface ChapterHandlers {
    onUpdateChapter: (chapterId: string, data: Partial<ChapterScaffold & { ai_prompt?: string }>) => void; // Allows updating chapter details including AI prompt
    onDeleteChapter: (chapterId: string) => void;
    onAddPageToChapter: (chapterId: string, afterPageId?: string) => void; // Allows inserting a page after a specific one
    onGenerateChapterSummary: (chapterId: string, context?: string) => void;
    onAutoWriteChapterPagesStream: (chapterId: string, context?: string) => void; // AI action to auto-write all pages in a chapter
}

/**
 * Extended interface for handlers related to page operations.
 * This replaces the original `PageHandlers` import with an expanded version
 * to support new page-level AI actions and management.
 * Exported for use by the parent component and child components.
 */
export interface PageHandlers {
    onUpdatePage: (chapterId: string, pageId: string, data: Partial<PageScaffold & { ai_prompt?: string }>) => void; // Allows updating page details including AI prompt
    onDeletePage: (chapterId: string, pageId: string) => void;
    onMovePage: (chapterId: string, pageId: string, direction: 'up' | 'down') => void;
    onGenerateImage: (chapterId: string, pageId: string, context?: string) => void;
    onAutoWritePageStream: (chapterId: string, pageId: string, context?: string) => void;
    onExpandTextStream: (chapterId: string, pageId: string, context?: string) => void;
    onSuggestNextPage: (chapterId: string, currentPageId: string, context?: string) => void; // New AI action to suggest the next page's content
}

// --- Page Card Component ---

interface PageCardProps {
    page: PageScaffold;
    chapterId: string;
    pageHandlers: PageHandlers; // Renamed for clarity, now uses the expanded PageHandlers
    chapterHandlers: ChapterHandlers; // Added to allow PageCard to trigger chapter-level actions like adding a page
    isActionLoading: boolean;
    canMoveUp: boolean;
    canMoveDown: boolean;
}

export const PageCard: React.FC<PageCardProps> = ({ page, chapterId, pageHandlers, chapterHandlers, isActionLoading, canMoveUp, canMoveDown }) => {
    const [mainImage, setMainImage] = useState(page.images[0] || null);
    const [isPromptExpanded, setIsPromptExpanded] = useState(false);
    // Assuming `ai_prompt` can be part of PageScaffold (or defaulted to empty string)
    const [customPrompt, setCustomPrompt] = useState((page as PageScaffold & { ai_prompt?: string }).ai_prompt || '');

    React.useEffect(() => {
        if (!mainImage && page.images.length > 0) setMainImage(page.images[0]);
        else if (page.images.length > 0 && !page.images.includes(mainImage!)) setMainImage(page.images[0]);
        else if (page.images.length === 0) setMainImage(null);
    }, [page.images, mainImage]);

    React.useEffect(() => {
        setCustomPrompt((page as PageScaffold & { ai_prompt?: string }).ai_prompt || '');
    }, [(page as PageScaffold & { ai_prompt?: string }).ai_prompt]);

    const handleUpdateCustomPrompt = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCustomPrompt(e.target.value);
        pageHandlers.onUpdatePage(chapterId, page.id, { ai_prompt: e.target.value });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700 relative">
            {/* Page Management Controls */}
            <div className="absolute top-2 right-2 flex space-x-1 z-10">
                <button
                    onClick={() => pageHandlers.onMovePage(chapterId, page.id, 'up')}
                    disabled={isActionLoading || !canMoveUp}
                    className="p-1 rounded-md text-gray-400 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Move page up"
                >
                    <ChevronDownIcon className="w-4 h-4 rotate-180" />
                </button>
                <button
                    onClick={() => pageHandlers.onMovePage(chapterId, page.id, 'down')}
                    disabled={isActionLoading || !canMoveDown}
                    className="p-1 rounded-md text-gray-400 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Move page down"
                >
                    <ChevronDownIcon className="w-4 h-4" />
                </button>
                <button
                    onClick={() => pageHandlers.onDeletePage(chapterId, page.id)}
                    disabled={isActionLoading}
                    className="p-1 rounded-md text-red-400 hover:bg-red-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Delete page"
                >
                    <span className="sr-only">Delete Page</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.813 21H7.187a2 2 0 01-1.92-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>

            <div className="flex flex-col">
                <h4 className="font-bold text-violet-300 mb-2">Page {page.page_number}</h4>
                <textarea
                    value={page.page_text}
                    onChange={(e) => pageHandlers.onUpdatePage(chapterId, page.id, { page_text: e.target.value })}
                    className="w-full flex-grow bg-gray-900/50 border border-gray-600 rounded-md p-2 text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none min-h-[200px]"
                    placeholder="Start writing or use an AI action..."
                    disabled={isActionLoading}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                     <button
                        onClick={() => pageHandlers.onAutoWritePageStream(chapterId, page.id, customPrompt)}
                        disabled={isActionLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                     >
                        <WandIcon className="w-4 h-4" /> AI Write Page
                     </button>
                     <button
                        onClick={() => pageHandlers.onExpandTextStream(chapterId, page.id, customPrompt)}
                        disabled={isActionLoading || !page.page_text}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                     >
                        <FileTextIcon className="w-4 h-4" /> Expand Text
                     </button>
                     <button
                        onClick={() => pageHandlers.onSuggestNextPage(chapterId, page.id, customPrompt)}
                        disabled={isActionLoading || !page.page_text}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                     >
                        <WandIcon className="w-4 h-4" /> Suggest Next
                     </button>
                </div>

                {/* AI Prompt Customization */}
                <div className="mt-2">
                    <button
                        onClick={() => setIsPromptExpanded(!isPromptExpanded)}
                        className="w-full flex items-center justify-between text-left text-sm text-gray-400 hover:text-gray-200 transition-colors py-1"
                    >
                        <span className="flex items-center gap-1"><WandIcon className="w-4 h-4"/> Custom AI Instructions</span>
                        <ChevronDownIcon className={`w-4 h-4 transform transition-transform ${isPromptExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    {isPromptExpanded && (
                        <textarea
                            value={customPrompt}
                            onChange={handleUpdateCustomPrompt}
                            className="w-full bg-gray-900/50 border border-gray-600 rounded-md p-2 text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none min-h-[80px] mt-1"
                            placeholder="Add specific instructions for AI generation (e.g., 'Make it more dramatic', 'Focus on character X'). These will be appended to the default prompts."
                            disabled={isActionLoading}
                        />
                    )}
                </div>
            </div>
            <div className="flex flex-col">
                <div className="aspect-video bg-gray-700 rounded-lg border border-gray-600 flex items-center justify-center overflow-hidden flex-grow">
                     {mainImage ? <img src={mainImage} alt={`Illustration for page ${page.page_number}`} className="w-full h-full object-cover"/> : <p className="text-gray-500 text-sm">No Image</p>}
                </div>
                {page.images.length > 1 && (
                    <div className="flex gap-2 mt-2">
                        {page.images.map((img, idx) => <button type="button" key={idx} onClick={() => setMainImage(img)} className={`w-16 h-10 rounded-md overflow-hidden border-2 ${mainImage === img ? 'border-violet-400' : 'border-transparent'}`}><img src={img} alt={`Thumbnail ${idx+1}`} className="w-full h-full object-cover" /></button>)}
                    </div>
                )}
                 <button
                    onClick={() => pageHandlers.onGenerateImage(chapterId, page.id, customPrompt)}
                    disabled={isActionLoading}
                    className="w-full mt-2 flex items-center justify-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                 >
                    <ImagePlusIcon className="w-5 h-5"/><span>{page.images.length > 0 ? 'Add Another Image' : 'Generate Image'}</span>
                 </button>
                 <button
                    onClick={() => chapterHandlers.onAddPageToChapter(chapterId, page.id)} // Uses chapterHandlers to add a page after this one
                    disabled={isActionLoading}
                    className="w-full mt-2 flex items-center justify-center space-x-2 px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                 >
                    <FileTextIcon className="w-5 h-5"/><span>Add New Page Below</span>
                 </button>
            </div>
        </div>
    );
};

// --- Chapter Card Component ---

interface ChapterCardProps {
    chapter: ChapterScaffold;
    pageHandlers: PageHandlers;
    chapterHandlers: ChapterHandlers; // Now uses the expanded ChapterHandlers
    isActionLoading: boolean;
    canMoveUp: boolean;
    canMoveDown: boolean;
    storyId: string; // Needed for some chapter handlers that interact with the story
}

export const ChapterCard: React.FC<ChapterCardProps> = ({ chapter, pageHandlers, chapterHandlers, isActionLoading, canMoveUp, canMoveDown, storyId }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [title, setTitle] = useState(chapter.title);
    const [summary, setSummary] = useState(chapter.summary);
    const [isPromptExpanded, setIsPromptExpanded] = useState(false);
    // Assuming `ai_prompt` can be part of ChapterScaffold
    const [customPrompt, setCustomPrompt] = useState((chapter as ChapterScaffold & { ai_prompt?: string }).ai_prompt || '');

    React.useEffect(() => {
        setTitle(chapter.title);
        setSummary(chapter.summary);
        setCustomPrompt((chapter as ChapterScaffold & { ai_prompt?: string }).ai_prompt || '');
    }, [chapter.title, chapter.summary, (chapter as ChapterScaffold & { ai_prompt?: string }).ai_prompt]);

    const handleUpdateTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        chapterHandlers.onUpdateChapter(chapter.id, { title: e.target.value });
    };

    const handleUpdateSummary = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setSummary(e.target.value);
        chapterHandlers.onUpdateChapter(chapter.id, { summary: e.target.value });
    };

    const handleUpdateCustomPrompt = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCustomPrompt(e.target.value);
        chapterHandlers.onUpdateChapter(chapter.id, { ai_prompt: e.target.value });
    };

    return (
        <div className="mb-4 bg-gray-800/30 rounded-lg border border-gray-700 overflow-hidden relative">
            {/* Chapter Management Controls */}
            <div className="absolute top-2 right-2 flex space-x-1 z-10">
                <button
                    onClick={() => chapterHandlers.onMoveChapter(chapter.id, 'up')} // Move chapter uses storyHandlers if story manages chapter order
                    disabled={isActionLoading || !canMoveUp}
                    className="p-1 rounded-md text-gray-400 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Move chapter up"
                >
                    <ChevronDownIcon className="w-4 h-4 rotate-180" />
                </button>
                <button
                    onClick={() => chapterHandlers.onMoveChapter(chapter.id, 'down')} // Move chapter uses storyHandlers if story manages chapter order
                    disabled={isActionLoading || !canMoveDown}
                    className="p-1 rounded-md text-gray-400 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Move chapter down"
                >
                    <ChevronDownIcon className="w-4 h-4" />
                </button>
                <button
                    onClick={() => chapterHandlers.onDeleteChapter(chapter.id)}
                    disabled={isActionLoading}
                    className="p-1 rounded-md text-red-400 hover:bg-red-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Delete chapter"
                >
                    <span className="sr-only">Delete Chapter</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.813 21H7.187a2 2 0 01-1.92-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex justify-between items-center p-4 pr-12 bg-gray-700/50 hover:bg-gray-700/80 transition-colors"
            >
                <div className="flex flex-col items-start w-full pr-8">
                    <input
                        type="text"
                        value={title}
                        onChange={handleUpdateTitle}
                        onClick={(e) => e.stopPropagation()} // Prevent collapsing when editing
                        className="text-xl font-bold bg-transparent border-b border-transparent focus:border-gray-500 outline-none text-left mb-1 w-full text-violet-300"
                        placeholder="Chapter Title"
                        disabled={isActionLoading}
                        aria-label="Chapter Title"
                    />
                    <textarea
                        value={summary}
                        onChange={handleUpdateSummary}
                        onClick={(e) => e.stopPropagation()} // Prevent collapsing when editing
                        className="text-sm text-gray-400 bg-transparent border-b border-transparent focus:border-gray-500 outline-none text-left resize-none w-full min-h-[40px]"
                        placeholder="Chapter Summary"
                        rows={2}
                        disabled={isActionLoading}
                        aria-label="Chapter Summary"
                    />
                </div>
                <ChevronDownIcon className={`w-6 h-6 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
            {isExpanded && (
                <div className="p-4 space-y-4">
                     {/* AI Prompt Customization for Chapter */}
                    <div className="mt-2">
                        <button
                            onClick={() => setIsPromptExpanded(!isPromptExpanded)}
                            className="w-full flex items-center justify-between text-left text-sm text-gray-400 hover:text-gray-200 transition-colors py-1"
                        >
                            <span className="flex items-center gap-1"><WandIcon className="w-4 h-4"/> Custom AI Instructions for Chapter</span>
                            <ChevronDownIcon className={`w-4 h-4 transform transition-transform ${isPromptExpanded ? 'rotate-180' : ''}`} />
                        </button>
                        {isPromptExpanded && (
                            <textarea
                                value={customPrompt}
                                onChange={handleUpdateCustomPrompt}
                                className="w-full bg-gray-900/50 border border-gray-600 rounded-md p-2 text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none min-h-[80px] mt-1"
                                placeholder="Add specific instructions for AI generation for this chapter (e.g., 'Ensure a tragic tone', 'Introduce plot twist')."
                                disabled={isActionLoading}
                            />
                        )}
                    </div>
                    {/* Chapter-level AI Actions and Page Management */}
                    <div className="flex flex-wrap gap-2 mt-2">
                        <button
                            onClick={() => chapterHandlers.onAddPageToChapter(chapter.id)}
                            disabled={isActionLoading}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                        >
                            <FileTextIcon className="w-4 h-4" /> Add New Page
                        </button>
                        <button
                            onClick={() => chapterHandlers.onGenerateChapterSummary(chapter.id, customPrompt)}
                            disabled={isActionLoading || !chapter.pages.some(p => p.page_text)} // Only enable if there's content to summarize
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-600 hover:bg-orange-500 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                        >
                            <WandIcon className="w-4 h-4" /> Generate Summary
                        </button>
                        <button
                            onClick={() => chapterHandlers.onAutoWriteChapterPagesStream(chapter.id, customPrompt)}
                            disabled={isActionLoading || chapter.pages.some(p => p.page_text)} // Disable if pages already have text (to avoid overwriting without warning)
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-violet-700 hover:bg-violet-600 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                        >
                            <WandIcon className="w-4 h-4" /> AI Auto-Write All Pages
                        </button>
                    </div>

                    {chapter.pages.length > 0 ?
                        chapter.pages.map((page, index) => (
                            <PageCard
                                key={page.id}
                                page={page}
                                chapterId={chapter.id}
                                pageHandlers={pageHandlers}
                                chapterHandlers={chapterHandlers} // Pass chapterHandlers down
                                isActionLoading={isActionLoading}
                                canMoveUp={index > 0}
                                canMoveDown={index < chapter.pages.length - 1}
                            />
                        )) :
                        <p className="text-center py-8 text-gray-500">This chapter has no pages yet. Click "Add New Page" to start.</p>
                    }
                </div>
            )}
        </div>
    );
};

// --- Story Overview Card Component ---

interface StoryOverviewCardProps {
    story: StoryScaffold;
    storyHandlers: StoryHandlers;
    isActionLoading: boolean;
}

export const StoryOverviewCard: React.FC<StoryOverviewCardProps> = ({ story, storyHandlers, isActionLoading }) => {
    const [title, setTitle] = useState(story.title);
    const [genre, setGenre] = useState(story.genre);
    const [logline, setLogline] = useState(story.logline);
    const [synopsis, setSynopsis] = useState(story.synopsis);
    // Assuming `ai_prompt` can be part of StoryScaffold
    const [isPromptExpanded, setIsPromptExpanded] = useState(false);
    const [customPrompt, setCustomPrompt] = useState((story as StoryScaffold & { ai_prompt?: string }).ai_prompt || '');


    React.useEffect(() => {
        setTitle(story.title);
        setGenre(story.genre);
        setLogline(story.logline);
        setSynopsis(story.synopsis);
        setCustomPrompt((story as StoryScaffold & { ai_prompt?: string }).ai_prompt || '');
    }, [story.title, story.genre, story.logline, story.synopsis, (story as StoryScaffold & { ai_prompt?: string }).ai_prompt]);

    const handleUpdateTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        storyHandlers.onUpdateStory(story.id, { title: e.target.value });
    };

    const handleUpdateGenre = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGenre(e.target.value);
        storyHandlers.onUpdateStory(story.id, { genre: e.target.value });
    };

    const handleUpdateLogline = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setLogline(e.target.value);
        storyHandlers.onUpdateStory(story.id, { logline: e.target.value });
    };

    const handleUpdateSynopsis = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setSynopsis(e.target.value);
        storyHandlers.onUpdateStory(story.id, { synopsis: e.target.value });
    };

    const handleUpdateCustomPrompt = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCustomPrompt(e.target.value);
        storyHandlers.onUpdateStory(story.id, { ai_prompt: e.target.value });
    };

    return (
        <div className="mb-6 bg-gray-800/30 rounded-lg border border-gray-700 p-6">
            <h2 className="text-2xl font-bold text-violet-200 mb-4">Story Overview</h2>
            <div className="space-y-4">
                <div>
                    <label htmlFor="story-title" className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                    <input
                        id="story-title"
                        type="text"
                        value={title}
                        onChange={handleUpdateTitle}
                        className="w-full bg-gray-900/50 border border-gray-600 rounded-md p-2 text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        placeholder="My Epic Story"
                        disabled={isActionLoading}
                    />
                </div>
                <div>
                    <label htmlFor="story-genre" className="block text-sm font-medium text-gray-400 mb-1">Genre</label>
                    <input
                        id="story-genre"
                        type="text"
                        value={genre}
                        onChange={handleUpdateGenre}
                        className="w-full bg-gray-900/50 border border-gray-600 rounded-md p-2 text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        placeholder="Fantasy, Sci-Fi, Thriller..."
                        disabled={isActionLoading}
                    />
                </div>
                <div>
                    <label htmlFor="story-logline" className="block text-sm font-medium text-gray-400 mb-1">Logline</label>
                    <textarea
                        id="story-logline"
                        value={logline}
                        onChange={handleUpdateLogline}
                        className="w-full bg-gray-900/50 border border-gray-600 rounded-md p-2 text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none min-h-[80px]"
                        placeholder="A concise, one-sentence summary of your story."
                        disabled={isActionLoading}
                    />
                    <button
                        onClick={() => storyHandlers.onGenerateLogline(story.id)}
                        disabled={isActionLoading || !story.synopsis} // Needs some input to generate a good logline
                        className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        <WandIcon className="w-4 h-4" /> AI Generate Logline
                    </button>
                </div>
                <div>
                    <label htmlFor="story-synopsis" className="block text-sm font-medium text-gray-400 mb-1">Synopsis</label>
                    <textarea
                        id="story-synopsis"
                        value={synopsis}
                        onChange={handleUpdateSynopsis}
                        className="w-full bg-gray-900/50 border border-gray-600 rounded-md p-2 text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none min-h-[150px]"
                        placeholder="A brief overview of your story's plot, characters, and themes."
                        disabled={isActionLoading}
                    />
                     <button
                        onClick={() => storyHandlers.onGenerateSynopsis(story.id)}
                        disabled={isActionLoading || !story.title} // Needs at least a title for a synopsis
                        className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        <WandIcon className="w-4 h-4" /> AI Generate Synopsis
                    </button>
                </div>
                {/* AI Prompt Customization for Story */}
                <div className="mt-2">
                    <button
                        onClick={() => setIsPromptExpanded(!isPromptExpanded)}
                        className="w-full flex items-center justify-between text-left text-sm text-gray-400 hover:text-gray-200 transition-colors py-1"
                    >
                        <span className="flex items-center gap-1"><WandIcon className="w-4 h-4"/> Global AI Instructions for Story</span>
                        <ChevronDownIcon className={`w-4 h-4 transform transition-transform ${isPromptExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    {isPromptExpanded && (
                        <textarea
                            value={customPrompt}
                            onChange={handleUpdateCustomPrompt}
                            className="w-full bg-gray-900/50 border border-gray-600 rounded-md p-2 text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none min-h-[80px] mt-1"
                            placeholder="Add global instructions for AI generation across the entire story (e.g., 'Maintain a whimsical tone', 'Avoid excessive violence')."
                            disabled={isActionLoading}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Main Plan Display Component ---

interface PlanDisplayProps {
    story: StoryScaffold; // The full story object to display and manage
    storyHandlers: StoryHandlers;
    chapterHandlers: ChapterHandlers;
    pageHandlers: PageHandlers;
    isActionLoading: boolean; // Global loading state for AI actions
    loadingMessage?: string; // Optional message for the global loading overlay
}

/**
 * PlanDisplay is the main component that orchestrates the display and
 * interaction for a story's entire scaffolding plan, including story overview,
 * chapters, and individual pages. It provides comprehensive editing and AI tools.
 */
export const PlanDisplay: React.FC<PlanDisplayProps> = ({
    story,
    storyHandlers,
    chapterHandlers,
    pageHandlers,
    isActionLoading,
    loadingMessage
}) => {
    // A more prominent global loading indicator overlay
    const LoadingOverlay: React.FC<{ message?: string }> = ({ message }) => (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center">
            <div className="flex flex-col items-center p-8 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 mb-4"></div>
                <p className="text-violet-300 text-lg font-medium">{message || "AI is working..."}</p>
                <p className="text-gray-400 text-sm mt-2">Please wait, this might take a moment.</p>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            {isActionLoading && <LoadingOverlay message={loadingMessage} />}

            <StoryOverviewCard
                story={story}
                storyHandlers={storyHandlers}
                isActionLoading={isActionLoading}
            />

            <div className="flex justify-between items-center mb-4 mt-8">
                <h3 className="text-xl font-bold text-violet-300">Chapters ({story.chapters.length})</h3>
                <button
                    onClick={() => storyHandlers.onAddChapter(story.id)}
                    disabled={isActionLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                    <FileTextIcon className="w-4 h-4" /> Add New Chapter
                </button>
            </div>

            <div className="space-y-4">
                {story.chapters.length > 0 ? (
                    story.chapters.map((chapter, index) => (
                        <ChapterCard
                            key={chapter.id}
                            chapter={chapter}
                            pageHandlers={pageHandlers}
                            // Pass storyHandlers' reorder chapter function via chapterHandlers
                            chapterHandlers={{
                                ...chapterHandlers,
                                onMoveChapter: (chapterId, direction) => storyHandlers.onReorderChapters(story.id, chapterId, direction)
                            }}
                            isActionLoading={isActionLoading}
                            canMoveUp={index > 0}
                            canMoveDown={index < story.chapters.length - 1}
                            storyId={story.id}
                        />
                    ))
                ) : (
                    <p className="text-center py-12 text-gray-500 bg-gray-800/30 rounded-lg border border-gray-700">
                        No chapters yet. Start by adding your first chapter!
                        <button
                            onClick={() => storyHandlers.onAddChapter(story.id)}
                            disabled={isActionLoading}
                            className="ml-4 px-3 py-1 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            Add First Chapter
                        </button>
                    </p>
                )}
            </div>
        </div>
    );
};

export default PlanDisplay;