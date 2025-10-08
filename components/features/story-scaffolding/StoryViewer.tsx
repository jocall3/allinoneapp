// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { StoryDocument, Chapter, PageHandlers, EditorActions } from '../../../types';
import ChapterComponent from './PlanDisplay';
import MagazinePreview from './MagazinePreview';
import { 
    PlusIcon, DocumentPlusIcon, WandIcon, ChatBubbleBottomCenterTextIcon, SparklesIcon, PlayIcon, StopIcon,
    Bars3Icon, DocumentTextIcon, Cog6ToothIcon, UsersIcon, GlobeAltIcon, RocketLaunchIcon, // New icons for tabs/features
    ArrowPathIcon, TrashIcon, ShareIcon, BookOpenIcon, MegaphoneIcon // More utility icons
} from '../../icons.tsx';

// --- NEW LOCAL TYPES (would ideally be in a shared types file like '../../../types') ---
// Since we cannot modify '../../../types', these are defined here for the new features.
// We assume StoryDocument can be extended with these properties for UI purposes
// and `setDoc` can handle updates to them.
export interface Character {
    id: string;
    name: string;
    description: string;
    role: string; // e.g., 'Protagonist', 'Antagonist', 'Support'
    traits: string[]; // e.g., 'Brave', 'Loyal', 'Cunning'
    backstory?: string;
    appearance?: string;
}

export interface WorldSetting {
    id: string;
    name: string;
    description: string;
    type: 'location' | 'lore' | 'magic_system' | 'organization' | 'artifact' | 'event';
    details?: string;
    relatedChapters?: string[]; // IDs of chapters where this setting is prominent
}

export interface StoryGoal {
    id: string;
    description: string;
    type: 'word_count' | 'chapter_count' | 'completion_percentage';
    target: number;
    current: number;
    unit: string; // e.g., 'words', 'chapters', '%'
    isComplete: boolean;
}

// --- STORY EDITOR PROPS (EXISTING) ---
interface StoryEditorProps {
    doc: StoryDocument;
    setDoc: React.Dispatch<React.SetStateAction<StoryDocument | null>>;
    pageHandlers: PageHandlers;
    editorActions: EditorActions;
    generationStatus: { active: boolean, completed: number, total: number };
    onStopGeneration: () => void;
    onContinueGeneration: () => void;
}

// --- NEW EXPORTED COMPONENTS ---

/**
 * Manages global story settings like title, genre, synopsis, target audience, and keywords.
 * Interacts directly with the StoryDocument.
 */
export const StorySettingsPanel: React.FC<{
    doc: StoryDocument;
    setDoc: React.Dispatch<React.SetStateAction<StoryDocument | null>>;
    editorActions: EditorActions; // For actions like generating synopsis
}> = ({ doc, setDoc, editorActions }) => {
    // Helper to safely update StoryDocument with new fields
    const handleChange = useCallback((field: keyof StoryDocument | 'genre' | 'targetAudience' | 'keywords' | 'synopsis', value: any) => {
        setDoc(prevDoc => {
            if (!prevDoc) return null;
            let updatedDoc = { ...prevDoc };

            if (field === 'keywords') {
                (updatedDoc as any)[field] = typeof value === 'string' ? value.split(',').map(k => k.trim()).filter(k => k.length > 0) : value;
            } else {
                // For 'genre', 'targetAudience', 'synopsis', 'title'
                (updatedDoc as any)[field] = value;
            }
            return updatedDoc;
        });
    }, [setDoc]);

    // Helper to access potentially non-existent fields gracefully
    const getDocValue = useCallback((field: keyof StoryDocument | 'genre' | 'targetAudience' | 'keywords' | 'synopsis') => {
        if (field === 'keywords') {
            return ((doc as any)[field] || []).join(', ');
        }
        return (doc as any)[field] || '';
    }, [doc]);

    return (
        <div className="p-6 bg-gray-900/60 rounded-lg border border-gray-700 space-y-6">
            <h2 className="text-2xl font-bold text-violet-300">Story Settings</h2>
            
            <div>
                <label htmlFor="story-title" className="block text-sm font-medium text-gray-300 mb-1">Story Title</label>
                <input
                    id="story-title"
                    type="text"
                    value={getDocValue('title')}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:ring-violet-500 focus:border-violet-500"
                />
            </div>

            <div>
                <label htmlFor="story-genre" className="block text-sm font-medium text-gray-300 mb-1">Genre</label>
                <input
                    id="story-genre"
                    type="text"
                    value={getDocValue('genre')}
                    onChange={(e) => handleChange('genre', e.target.value)}
                    placeholder="e.g., Fantasy, Sci-Fi, Thriller"
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:ring-violet-500 focus:border-violet-500"
                />
            </div>

            <div>
                <label htmlFor="story-target-audience" className="block text-sm font-medium text-gray-300 mb-1">Target Audience</label>
                <input
                    id="story-target-audience"
                    type="text"
                    value={getDocValue('targetAudience')}
                    onChange={(e) => handleChange('targetAudience', e.target.value)}
                    placeholder="e.g., Young Adult, Adults, Children"
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:ring-violet-500 focus:border-violet-500"
                />
            </div>

            <div>
                <label htmlFor="story-keywords" className="block text-sm font-medium text-gray-300 mb-1">Keywords (comma-separated)</label>
                <input
                    id="story-keywords"
                    type="text"
                    value={getDocValue('keywords')}
                    onChange={(e) => handleChange('keywords', e.target.value)}
                    placeholder="e.g., magic, dragons, adventure"
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:ring-violet-500 focus:border-violet-500"
                />
            </div>
            
            <div>
                <label htmlFor="story-synopsis" className="block text-sm font-medium text-gray-300 mb-1 flex justify-between items-center">
                    Synopsis
                    <button 
                        onClick={() => editorActions.onSummarizeChapters()} // Reusing onSummarizeChapters for a global synopsis
                        className="text-violet-400 hover:text-violet-300 text-xs flex items-center gap-1"
                        aria-label="AI Generate Synopsis"
                    >
                        <WandIcon className="w-3 h-3"/> AI Generate
                    </button>
                </label>
                <textarea
                    id="story-synopsis"
                    value={getDocValue('synopsis')}
                    onChange={(e) => handleChange('synopsis', e.target.value)}
                    rows={6}
                    placeholder="A brief overview of your story..."
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:ring-violet-500 focus:border-violet-500 resize-y"
                ></textarea>
            </div>
        </div>
    );
};

/**
 * Manages characters within the story document.
 */
export const CharacterManager: React.FC<{
    doc: StoryDocument;
    setDoc: React.Dispatch<React.SetStateAction<StoryDocument | null>>;
}> = ({ doc, setDoc }) => {
    // Ensure characters array exists on doc (cast to any for assumed properties)
    const currentCharacters = (doc as any).characters as Character[] || [];
    const [newCharacterName, setNewCharacterName] = useState('');

    const addCharacter = useCallback(() => {
        if (newCharacterName.trim()) {
            const newChar: Character = {
                id: `char-${Date.now()}`,
                name: newCharacterName.trim(),
                description: '',
                role: 'Supporting',
                traits: []
            };
            setDoc(prevDoc => {
                if (!prevDoc) return null;
                const updatedDoc = { ...prevDoc, characters: [...(currentCharacters || []), newChar] };
                return updatedDoc;
            });
            setNewCharacterName('');
        }
    }, [newCharacterName, setDoc, currentCharacters]);

    const updateCharacter = useCallback((id: string, field: keyof Character, value: any) => {
        setDoc(prevDoc => {
            if (!prevDoc) return null;
            const updatedCharacters = currentCharacters.map((char: Character) =>
                char.id === id ? { ...char, [field]: value } : char
            );
            return { ...prevDoc, characters: updatedCharacters };
        });
    }, [setDoc, currentCharacters]);

    const deleteCharacter = useCallback((id: string) => {
        if (window.confirm("Are you sure you want to delete this character?")) {
            setDoc(prevDoc => {
                if (!prevDoc) return null;
                const updatedCharacters = currentCharacters.filter((char: Character) => char.id !== id);
                return { ...prevDoc, characters: updatedCharacters };
            });
        }
    }, [setDoc, currentCharacters]);

    return (
        <div className="p-6 bg-gray-900/60 rounded-lg border border-gray-700 space-y-6">
            <h2 className="text-2xl font-bold text-violet-300">Characters</h2>
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    placeholder="New character name"
                    value={newCharacterName}
                    onChange={(e) => setNewCharacterName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCharacter()}
                    className="flex-grow p-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:ring-violet-500 focus:border-violet-500"
                />
                <button onClick={addCharacter} className="flex-shrink-0 p-2 bg-violet-600/80 hover:bg-violet-600 rounded-md text-white flex items-center gap-1">
                    <PlusIcon className="w-4 h-4"/> Add
                </button>
            </div>

            <div className="space-y-4">
                {currentCharacters.length === 0 && <p className="text-gray-500 text-center">No characters defined yet.</p>}
                {currentCharacters.map((char: Character) => (
                    <div key={char.id} className="bg-gray-800 p-4 rounded-md border border-gray-700 space-y-2">
                        <div className="flex items-center justify-between">
                            <input
                                type="text"
                                value={char.name}
                                onChange={(e) => updateCharacter(char.id, 'name', e.target.value)}
                                className="font-semibold text-lg bg-transparent border-b border-gray-700 focus:border-violet-500 outline-none p-1 text-gray-200"
                                aria-label={`Character name: ${char.name}`}
                            />
                            <button onClick={() => deleteCharacter(char.id)} className="text-red-500 hover:text-red-400 p-1 rounded-full hover:bg-gray-700" aria-label={`Delete ${char.name}`}>
                                <TrashIcon className="w-5 h-5"/>
                            </button>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                            <input
                                type="text"
                                value={char.role}
                                onChange={(e) => updateCharacter(char.id, 'role', e.target.value)}
                                className="w-full p-2 bg-gray-700/50 border border-gray-600 rounded-md text-gray-300 text-sm focus:ring-violet-500 focus:border-violet-500"
                                placeholder="e.g., Protagonist"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                            <textarea
                                value={char.description}
                                onChange={(e) => updateCharacter(char.id, 'description', e.target.value)}
                                rows={3}
                                className="w-full p-2 bg-gray-700/50 border border-gray-600 rounded-md text-gray-300 text-sm focus:ring-violet-500 focus:border-violet-500 resize-y"
                                placeholder="Brief description of the character..."
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Traits (comma-separated)</label>
                            <input
                                type="text"
                                value={char.traits.join(', ')}
                                onChange={(e) => updateCharacter(char.id, 'traits', e.target.value.split(',').map(t => t.trim()).filter(t => t.length > 0))}
                                className="w-full p-2 bg-gray-700/50 border border-gray-600 rounded-md text-gray-300 text-sm focus:ring-violet-500 focus:border-violet-500"
                                placeholder="e.g., brave, loyal, cunning"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

/**
 * Manages world-building elements within the story document.
 */
export const WorldbuildingManager: React.FC<{
    doc: StoryDocument;
    setDoc: React.Dispatch<React.SetStateAction<StoryDocument | null>>;
}> = ({ doc, setDoc }) => {
    const currentSettings = (doc as any).worldSettings as WorldSetting[] || [];
    const [newSettingName, setNewSettingName] = useState('');
    const [newSettingType, setNewSettingType] = useState<WorldSetting['type']>('location');

    const addSetting = useCallback(() => {
        if (newSettingName.trim()) {
            const newSetting: WorldSetting = {
                id: `world-${Date.now()}`,
                name: newSettingName.trim(),
                description: '',
                type: newSettingType,
            };
            setDoc(prevDoc => {
                if (!prevDoc) return null;
                const updatedDoc = { ...prevDoc, worldSettings: [...(currentSettings || []), newSetting] };
                return updatedDoc;
            });
            setNewSettingName('');
        }
    }, [newSettingName, newSettingType, setDoc, currentSettings]);

    const updateSetting = useCallback((id: string, field: keyof WorldSetting, value: any) => {
        setDoc(prevDoc => {
            if (!prevDoc) return null;
            const updatedSettings = currentSettings.map((setting: WorldSetting) =>
                setting.id === id ? { ...setting, [field]: value } : setting
            );
            return { ...prevDoc, worldSettings: updatedSettings };
        });
    }, [setDoc, currentSettings]);

    const deleteSetting = useCallback((id: string) => {
        if (window.confirm("Are you sure you want to delete this world setting?")) {
            setDoc(prevDoc => {
                if (!prevDoc) return null;
                const updatedSettings = currentSettings.filter((setting: WorldSetting) => setting.id !== id);
                return { ...prevDoc, worldSettings: updatedSettings };
            });
        }
    }, [setDoc, currentSettings]);

    const settingTypes: WorldSetting['type'][] = ['location', 'lore', 'magic_system', 'organization', 'artifact', 'event'];

    return (
        <div className="p-6 bg-gray-900/60 rounded-lg border border-gray-700 space-y-6">
            <h2 className="text-2xl font-bold text-violet-300">World Building</h2>
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <input
                    type="text"
                    placeholder="New setting name"
                    value={newSettingName}
                    onChange={(e) => setNewSettingName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSetting()}
                    className="flex-grow p-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:ring-violet-500 focus:border-violet-500"
                />
                <select
                    value={newSettingType}
                    onChange={(e) => setNewSettingType(e.target.value as WorldSetting['type'])}
                    className="flex-shrink-0 p-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:ring-violet-500 focus:border-violet-500"
                    aria-label="New setting type"
                >
                    {settingTypes.map(type => (
                        <option key={type} value={type}>{type.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</option>
                    ))}
                </select>
                <button onClick={addSetting} className="flex-shrink-0 p-2 bg-violet-600/80 hover:bg-violet-600 rounded-md text-white flex items-center gap-1">
                    <PlusIcon className="w-4 h-4"/> Add
                </button>
            </div>

            <div className="space-y-4">
                {currentSettings.length === 0 && <p className="text-gray-500 text-center">No world settings defined yet.</p>}
                {currentSettings.map((setting: WorldSetting) => (
                    <div key={setting.id} className="bg-gray-800 p-4 rounded-md border border-gray-700 space-y-2">
                        <div className="flex items-center justify-between">
                            <input
                                type="text"
                                value={setting.name}
                                onChange={(e) => updateSetting(setting.id, 'name', e.target.value)}
                                className="font-semibold text-lg bg-transparent border-b border-gray-700 focus:border-violet-500 outline-none p-1 text-gray-200"
                                aria-label={`World setting name: ${setting.name}`}
                            />
                            <span className="text-sm text-gray-400 bg-gray-700/50 px-2 py-1 rounded-full">{setting.type.replace(/_/g, ' ')}</span>
                            <button onClick={() => deleteSetting(setting.id)} className="text-red-500 hover:text-red-400 p-1 rounded-full hover:bg-gray-700" aria-label={`Delete ${setting.name}`}>
                                <TrashIcon className="w-5 h-5"/>
                            </button>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                            <textarea
                                value={setting.description}
                                onChange={(e) => updateSetting(setting.id, 'description', e.target.value)}
                                rows={3}
                                className="w-full p-2 bg-gray-700/50 border border-gray-600 rounded-md text-gray-300 text-sm focus:ring-violet-500 focus:border-violet-500 resize-y"
                                placeholder="Describe this world element..."
                            ></textarea>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

/**
 * Provides an AI Co-Pilot chat interface for contextual assistance.
 */
export const AICoPilotChat: React.FC<{
    doc: StoryDocument;
    activeChapter: Chapter | undefined; // Make it aware of the active chapter
    editorActions: EditorActions; // For potential AI action triggers
}> = ({ doc, activeChapter, editorActions }) => {
    const [messages, setMessages] = useState<{ sender: 'user' | 'ai', text: string }[]>([]);
    const [input, setInput] = useState('');
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (input.trim() && !isLoading) {
            const userMessage = { sender: 'user', text: input.trim() };
            setMessages(prev => [...prev, userMessage]);
            setInput('');
            setIsLoading(true);

            // Simulate AI response based on context
            let aiResponse = "I'm processing your request. Please bear with me!";
            const lowerInput = userMessage.text.toLowerCase();

            if (lowerInput.includes("summarize chapter") && activeChapter) {
                aiResponse = `Okay, here's a summary for Chapter "${activeChapter.title}": "${activeChapter.summary || 'No summary available yet. Would you like me to generate one?'}"`;
                if (!activeChapter.summary) {
                    // Trigger actual summarize action if desired
                    setTimeout(() => editorActions.onSummarizeChapters(), 1500);
                }
            } else if (lowerInput.includes("title ideas")) {
                aiResponse = "Based on your story outline, here are some title ideas: 'The Obsidian Heart', 'Whispers of Eldoria', 'Chronicles of the Last Star'. What do you think?";
            } else if (lowerInput.includes("character ideas")) {
                aiResponse = "How about a mischievous goblin sidekick named Fizzwick, or a wise ancient elf elder, Elara? Or perhaps you'd like to explore a villain?";
            } else if (lowerInput.includes("world details")) {
                aiResponse = "To help me, tell me what aspect of your world needs detailing. Are you thinking of a new location, a magic system, or historical lore?";
            } else if (lowerInput.includes("help") || lowerInput.includes("what can you do")) {
                aiResponse = "I can help with chapter summaries, title suggestions, character ideas, world-building prompts, or even provide writing advice. Just ask!";
            } else if (!activeChapter && lowerInput.includes("chapter")) {
                aiResponse = "Please select a chapter from the 'Chapter Editor' tab first so I can provide more relevant assistance.";
            } else {
                aiResponse = "That's an interesting thought! Could you elaborate, or ask me something specific about your story?";
            }

            setTimeout(() => {
                setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
                setIsLoading(false);
            }, 1500 + Math.random() * 1000); // Simulate varying AI response time
        }
    };

    return (
        <div className="p-6 bg-gray-900/60 rounded-lg border border-gray-700 flex flex-col h-full">
            <h2 className="text-2xl font-bold text-violet-300 mb-4">AI Co-Pilot</h2>
            <div ref={chatContainerRef} className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-4 mb-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                        <SparklesIcon className="w-10 h-10 mx-auto mb-2 text-violet-400"/>
                        <p>Ask your AI Co-Pilot anything about your story!</p>
                        <p className="text-sm text-gray-600">e.g., "Summarize chapter 3", "Give me title ideas", "What character should I add?"</p>
                    </div>
                )}
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] p-3 rounded-lg ${msg.sender === 'user' ? 'bg-violet-700 text-white' : 'bg-gray-700 text-gray-100'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="max-w-[70%] p-3 rounded-lg bg-gray-700 text-gray-100 flex items-center gap-2">
                            <span className="animate-pulse">Thinking...</span>
                            <SparklesIcon className="w-4 h-4 animate-spin-slow"/>
                        </div>
                    </div>
                )}
            </div>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Message AI Co-Pilot..."
                    className="flex-grow p-3 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:ring-violet-500 focus:border-violet-500"
                    disabled={isLoading}
                    aria-label="AI Co-Pilot chat input"
                />
                <button onClick={handleSendMessage} className="p-3 bg-violet-600/80 hover:bg-violet-600 rounded-md text-white flex items-center gap-2" disabled={isLoading}>
                    {isLoading ? <span className="animate-spin-slow"><SparklesIcon className="w-5 h-5"/></span> : <ChatBubbleBottomCenterTextIcon className="w-5 h-5"/>} Send
                </button>
            </div>
        </div>
    );
};

/**
 * Panel for managing export options.
 */
export const ExportOptionsPanel: React.FC<{ doc: StoryDocument }> = ({ doc }) => {
    const handleExport = (format: string) => {
        // In a real application, this would trigger a backend process
        // or client-side generation for static formats like TXT, JSON.
        console.log(`Exporting story "${doc.title}" to ${format}...`);
        
        switch (format) {
            case 'TXT': {
                const textContent = `Title: ${doc.title || 'Untitled Story'}\n\nSynopsis: ${doc.synopsis || 'N/A'}\n\n`;
                const chaptersContent = doc.chapters.map(chapter =>
                    `--- Chapter ${chapter.chapterNumber}: ${chapter.title} ---\n\n${chapter.content || chapter.summary || 'No content.'}\n\n`
                ).join('');
                const fullText = textContent + chaptersContent;
                const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${(doc.title || 'untitled').replace(/[^a-z0-9]/gi, '_')}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                alert(`Story exported as TXT!`);
                break;
            }
            case 'JSON': {
                const jsonContent = JSON.stringify(doc, null, 2);
                const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${(doc.title || 'untitled').replace(/[^a-z0-9]/gi, '_')}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                alert(`Story exported as JSON!`);
                break;
            }
            case 'PDF':
            case 'EPUB':
            case 'DOCX':
                alert(`Exporting to ${format} is a premium feature currently in development! (Simulated for ${format})`);
                break;
            default:
                alert(`Unsupported export format: ${format}`);
        }
    };

    return (
        <div className="p-6 bg-gray-900/60 rounded-lg border border-gray-700 space-y-6">
            <h2 className="text-2xl font-bold text-violet-300">Export Story</h2>
            <p className="text-gray-300">Select a format to export your masterpiece.</p>
            <div className="space-y-3">
                <button
                    onClick={() => handleExport('PDF')}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-indigo-700/80 hover:bg-indigo-700 rounded-md text-white font-medium"
                >
                    <DocumentTextIcon className="w-5 h-5"/> Export as PDF (Coming Soon)
                </button>
                <button
                    onClick={() => handleExport('EPUB')}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-emerald-700/80 hover:bg-emerald-700 rounded-md text-white font-medium"
                >
                    <BookOpenIcon className="w-5 h-5"/> Export as EPUB (Coming Soon)
                </button>
                <button
                    onClick={() => handleExport('DOCX')}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-blue-700/80 hover:bg-blue-700 rounded-md text-white font-medium"
                >
                    <DocumentPlusIcon className="w-5 h-5"/> Export as DOCX (Coming Soon)
                </button>
                <button
                    onClick={() => handleExport('TXT')}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-gray-700/80 hover:bg-gray-700 rounded-md text-white font-medium"
                >
                    <DocumentTextIcon className="w-5 h-5"/> Export as TXT
                </button>
                <button
                    onClick={() => handleExport('JSON')}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-purple-700/80 hover:bg-purple-700 rounded-md text-white font-medium"
                >
                    <Bars3Icon className="w-5 h-5"/> Export as JSON
                </button>
            </div>
            <p className="text-sm text-gray-500 text-center">More advanced export options are on the horizon!</p>
        </div>
    );
};

/**
 * Manages chapter reordering, deletion, and addition from the sidebar.
 */
export const ChapterManagementControls: React.FC<{
    doc: StoryDocument;
    setDoc: React.Dispatch<React.SetStateAction<StoryDocument | null>>;
    setActiveChapterId: React.Dispatch<React.SetStateAction<string | null>>;
}> = ({ doc, setDoc, setActiveChapterId }) => {
    const moveChapter = useCallback((chapterId: string, direction: 'up' | 'down') => {
        setDoc(prevDoc => {
            if (!prevDoc) return null;
            const chapters = [...prevDoc.chapters];
            const index = chapters.findIndex(c => c.id === chapterId);
            if (index === -1) return prevDoc;

            const newIndex = direction === 'up' ? index - 1 : index + 1;
            if (newIndex < 0 || newIndex >= chapters.length) return prevDoc;

            const [movedChapter] = chapters.splice(index, 1);
            chapters.splice(newIndex, 0, movedChapter);

            // Re-assign chapter numbers
            const updatedChapters = chapters.map((c, i) => ({ ...c, chapterNumber: i + 1 }));
            return { ...prevDoc, chapters: updatedChapters };
        });
    }, [setDoc]);

    const deleteChapter = useCallback((chapterId: string) => {
        if (window.confirm("Are you sure you want to delete this chapter? This action cannot be undone.")) {
            setDoc(prevDoc => {
                if (!prevDoc) return null;
                const updatedChapters = prevDoc.chapters.filter(c => c.id !== chapterId);
                // Re-assign chapter numbers
                const renumberedChapters = updatedChapters.map((c, i) => ({ ...c, chapterNumber: i + 1 }));

                // If the deleted chapter was active, set active to null or first chapter
                if (chapterId === prevDoc.chapters.find(c => c.id === chapterId)?.id) {
                    setActiveChapterId(renumberedChapters.length > 0 ? renumberedChapters[0].id : null);
                }
                return { ...prevDoc, chapters: renumberedChapters };
            });
        }
    }, [setDoc, setActiveChapterId]);

    const addNewChapter = useCallback(() => {
        setDoc(prevDoc => {
            if (!prevDoc) return null;
            const newChapter: Chapter = {
                id: `chap-${Date.now()}`,
                title: `New Chapter ${prevDoc.chapters.length + 1}`,
                summary: 'An exciting new chapter awaits!',
                content: '',
                status: 'outline',
                chapterNumber: prevDoc.chapters.length + 1,
            };
            const updatedChapters = [...prevDoc.chapters, newChapter];
            setActiveChapterId(newChapter.id); // Set the new chapter as active
            return { ...prevDoc, chapters: updatedChapters };
        });
    }, [setDoc, setActiveChapterId]);

    return (
        <div className="mt-4 space-y-2 pt-2">
            <h4 className="font-semibold text-gray-400">Chapter Tools</h4>
            <button onClick={addNewChapter} className="w-full flex items-center justify-center gap-2 text-sm p-2 bg-gray-700/50 hover:bg-gray-700 rounded-md text-gray-300">
                <PlusIcon className="w-4 h-4" /> Add New Chapter
            </button>
            {doc.chapters.length > 0 && (
                <div className="space-y-1 mt-2">
                    {doc.chapters.map((chapter, index) => (
                        <div key={chapter.id} className="flex items-center gap-2 p-1 text-sm text-gray-400">
                            <span className="flex-grow truncate">{chapter.title}</span>
                            <div className="flex-shrink-0 flex items-center gap-1">
                                <button
                                    onClick={() => moveChapter(chapter.id, 'up')}
                                    disabled={index === 0}
                                    className="p-1 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label={`Move chapter ${chapter.title} up`}
                                >
                                    <ArrowPathIcon className="w-4 h-4 rotate-90 text-gray-300"/> {/* Up arrow */}
                                </button>
                                <button
                                    onClick={() => moveChapter(chapter.id, 'down')}
                                    disabled={index === doc.chapters.length - 1}
                                    className="p-1 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label={`Move chapter ${chapter.title} down`}
                                >
                                    <ArrowPathIcon className="w-4 h-4 -rotate-90 text-gray-300"/> {/* Down arrow */}
                                </button>
                                <button
                                    onClick={() => deleteChapter(chapter.id)}
                                    className="p-1 rounded-md hover:bg-gray-600 text-red-400"
                                    aria-label={`Delete chapter ${chapter.title}`}
                                >
                                    <TrashIcon className="w-4 h-4"/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


// --- Helper Component for Tab Buttons ---
// Exported as a convenience for potential reuse or external styling control
export const TabButton: React.FC<{
    icon: React.ElementType; // Icon component type
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon: Icon, label, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`flex-grow flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium rounded-t-lg transition-colors
                        ${isActive ? 'bg-gray-900/60 text-violet-300 border-b-2 border-violet-500' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200 border-b border-transparent'}`}
            aria-selected={isActive}
            role="tab"
        >
            <Icon className="w-5 h-5" />
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
};


// --- MAIN STORY EDITOR COMPONENT (MODIFIED) ---

const StoryEditor: React.FC<StoryEditorProps> = ({ doc, setDoc, pageHandlers, editorActions, generationStatus, onStopGeneration, onContinueGeneration }) => {
    const fileInputRef = useRef<HTMLInputElement>(null); // Kept, as it might be used for future "import doc" features
    const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'editor' | 'settings' | 'characters' | 'world' | 'ai-copilot' | 'export'>('editor');

    useEffect(() => {
        if (doc && doc.chapters.length > 0 && !activeChapterId) {
            setActiveChapterId(doc.chapters[0].id);
        } else if (doc && doc.chapters.length === 0 && activeChapterId) {
            // If all chapters are deleted, clear active chapter
            setActiveChapterId(null);
        }
    }, [doc, activeChapterId]);

    const activeChapter = doc.chapters.find(c => c.id === activeChapterId);

    // Calculate progress for goals (mock/example)
    const totalWordCount = doc.chapters.reduce((acc, chapter) => acc + (chapter.content?.split(/\s+/).filter(word => word.length > 0).length || 0), 0);
    const mockGoals: StoryGoal[] = [
        { id: 'goal-1', description: 'Finish First Draft (50k words)', type: 'word_count', target: 50000, current: totalWordCount, unit: 'words', isComplete: totalWordCount >= 50000 },
        { id: 'goal-2', description: 'Complete 10 Chapters', type: 'chapter_count', target: 10, current: doc.chapters.length, unit: 'chapters', isComplete: doc.chapters.length >= 10 },
    ];

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full p-4">
            {/* Left Sidebar: Table of Contents & Global Tools */}
            <aside className="xl:col-span-3 bg-gray-900/60 p-4 rounded-lg border border-gray-700 flex flex-col">
                <h3 className="font-bold mb-3 text-violet-300">Table of Contents</h3>
                <div className="flex-grow overflow-y-auto space-y-1 pr-2 -mr-2">
                    {doc.chapters.length === 0 && <p className="text-gray-500 text-center py-4">No chapters yet. Use "Add New Chapter" below.</p>}
                    {doc.chapters.map((chapter, index) => (
                        <button key={chapter.id} onClick={() => { setActiveChapterId(chapter.id); setActiveTab('editor'); }} className={`block w-full text-left p-2 rounded-md transition-colors text-sm ${activeChapterId === chapter.id && activeTab === 'editor' ? 'bg-violet-900/50 text-white' : 'hover:bg-gray-700/50 text-gray-300'}`} aria-label={`Select chapter ${chapter.chapterNumber}: ${chapter.title}`}>
                            <span className="font-semibold text-gray-500 mr-2">{index + 1}.</span>
                            <span className="font-semibold">{chapter.title}</span>
                            <p className="text-xs text-gray-400 pl-6 truncate">{chapter.summary}</p>
                        </button>
                    ))}
                </div>
                
                {/* Generation Status & Controls */}
                {generationStatus.total > 0 && generationStatus.completed < generationStatus.total && (
                    <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-sm font-medium text-gray-300">{generationStatus.active ? 'Generating Chapters...' : 'Generation Paused'}</p>
                            <p className="text-sm text-gray-400">{generationStatus.completed} / {generationStatus.total}</p>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-2 mb-2">
                            <div className="bg-violet-500 h-2 rounded-full" style={{ width: `${(generationStatus.completed / generationStatus.total) * 100}%` }}></div>
                        </div>
                        {generationStatus.active ? <button onClick={onStopGeneration} className="w-full flex items-center justify-center gap-2 text-sm p-2 bg-red-600/50 hover:bg-red-600/80 rounded-md" aria-label="Stop generation"><StopIcon className="w-4 h-4" /> Stop</button> : <button onClick={onContinueGeneration} className="w-full flex items-center justify-center gap-2 text-sm p-2 bg-green-600/50 hover:bg-green-600/80 rounded-md" aria-label="Continue generation"><PlayIcon className="w-4 h-4" /> Continue</button>}
                    </div>
                )}
                
                {/* AI Assist & Chapter Management */}
                <div className="mt-4 space-y-2 border-t border-gray-700 pt-4">
                    <ChapterManagementControls doc={doc} setDoc={setDoc} setActiveChapterId={setActiveChapterId} />
                    <div className="relative group">
                        <button className="w-full flex items-center justify-center gap-2 text-sm p-2 bg-violet-600/80 hover:bg-violet-600 rounded-md" aria-expanded="false" aria-controls="ai-assist-menu"><WandIcon className="w-4 h-4"/> AI Assist</button>
                        <div id="ai-assist-menu" className="absolute bottom-full mb-2 w-full bg-gray-800 border border-gray-700 rounded-lg p-2 space-y-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto" role="menu">
                            <button onClick={editorActions.onSuggestTitles} className="w-full text-left text-sm p-2 hover:bg-gray-700 rounded-md flex items-center gap-2" role="menuitem"><SparklesIcon className="w-4 h-4"/> Improve Titles</button>
                            <button onClick={editorActions.onSummarizeChapters} className="w-full text-left text-sm p-2 hover:bg-gray-700 rounded-md flex items-center gap-2" role="menuitem"><ChatBubbleBottomCenterTextIcon className="w-4 h-4"/> Update Summaries</button>
                        </div>
                    </div>
                </div>

                {/* Story Goals (New Feature) */}
                <div className="mt-4 space-y-2 border-t border-gray-700 pt-4">
                    <h4 className="font-semibold text-gray-400">Story Goals</h4>
                    {mockGoals.map(goal => (
                        <div key={goal.id} className="text-sm text-gray-300 p-2 bg-gray-800 rounded-md flex flex-col">
                            <span className="font-medium flex justify-between items-center">
                                {goal.description}
                                {goal.isComplete && <span className="text-green-400 text-xs px-2 py-0.5 rounded-full bg-green-900/50">Complete</span>}
                            </span>
                            <div className="flex justify-between items-center text-xs text-gray-400 mt-1">
                                <span>{goal.current} / {goal.target} {goal.unit}</span>
                                <div className="w-1/2 bg-gray-600 rounded-full h-1.5 ml-2">
                                    <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${Math.min(100, (goal.current / goal.target) * 100)}%` }}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <button className="w-full flex items-center justify-center gap-2 text-sm p-2 bg-gray-700/50 hover:bg-gray-700 rounded-md text-gray-300" aria-label="Add new goal">
                        <PlusIcon className="w-4 h-4"/> Add New Goal
                    </button>
                </div>
            </aside>

            {/* Main Content Area: Tabs for Editor, Settings, Characters, World, AI Co-Pilot, Export */}
            <div className="xl:col-span-5 flex flex-col">
                <div className="flex border-b border-gray-700 mb-4 px-1" role="tablist">
                    <TabButton icon={DocumentTextIcon} label="Editor" isActive={activeTab === 'editor'} onClick={() => setActiveTab('editor')} />
                    <TabButton icon={Cog6ToothIcon} label="Settings" isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                    <TabButton icon={UsersIcon} label="Characters" isActive={activeTab === 'characters'} onClick={() => setActiveTab('characters')} />
                    <TabButton icon={GlobeAltIcon} label="World" isActive={activeTab === 'world'} onClick={() => setActiveTab('world')} />
                    <TabButton icon={SparklesIcon} label="AI Co-Pilot" isActive={activeTab === 'ai-copilot'} onClick={() => setActiveTab('ai-copilot')} />
                    <TabButton icon={ShareIcon} label="Export" isActive={activeTab === 'export'} onClick={() => setActiveTab('export')} />
                </div>
                
                <div className="flex-grow overflow-y-auto pr-2 -mr-2">
                    {activeTab === 'editor' && (
                        <>
                            <button onClick={editorActions.onAutoDraftAll} className="w-full mb-4 flex items-center justify-center gap-2 p-3 bg-violet-800 hover:bg-violet-700 rounded-lg font-bold" aria-label="AI Write Full Draft for all chapters"><WandIcon className="w-5 h-5"/> AI, Write Full Draft</button>
                            {activeChapter ? <ChapterComponent chapter={activeChapter} pageHandlers={pageHandlers} isActionLoading={false} /> : <p className="flex items-center justify-center h-full text-gray-500">Select a chapter from the left to begin editing, or add a new one.</p>}
                        </>
                    )}
                    {activeTab === 'settings' && <StorySettingsPanel doc={doc} setDoc={setDoc} editorActions={editorActions} />}
                    {activeTab === 'characters' && <CharacterManager doc={doc} setDoc={setDoc} />}
                    {activeTab === 'world' && <WorldbuildingManager doc={doc} setDoc={setDoc} />}
                    {activeTab === 'ai-copilot' && <AICoPilotChat doc={doc} activeChapter={activeChapter} editorActions={editorActions} />}
                    {activeTab === 'export' && <ExportOptionsPanel doc={doc} />}
                </div>
            </div>

            {/* Right Sidebar: Magazine Preview */}
            <aside className="xl:col-span-4 bg-gray-900/60 p-4 rounded-lg border border-gray-700 overflow-y-auto">
                <MagazinePreview doc={doc} />
            </aside>
        </div>
    );
};

export default StoryEditor;