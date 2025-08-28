

import React, { useState } from 'react';
import { PhotoIcon } from '../icons.tsx';
import { useLocalStorage } from '../../hooks/useLocalStorage.ts';

interface Note {
    id: number;
    text: string;
    x: number;
    y: number;
    color: string;
}

const colors = ['bg-yellow-400', 'bg-green-400', 'bg-blue-400', 'bg-pink-400', 'bg-purple-400', 'bg-orange-400'];
const textColors = ['text-yellow-900', 'text-green-900', 'text-blue-900', 'text-pink-900', 'text-purple-900', 'text-orange-900'];

export const ProjectMoodboard: React.FC = () => {
    const [notes, setNotes] = useLocalStorage<Note[]>('devcore_moodboard', []);
    const [dragging, setDragging] = useState<{ id: number; offsetX: number; offsetY: number } | null>(null);

    const addNote = () => {
        const newNote: Note = {
            id: Date.now(),
            text: 'New idea...',
            x: 50,
            y: 50,
            color: colors[notes.length % colors.length],
        };
        setNotes([...notes, newNote]);
    };
    
    const deleteNote = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setNotes(notes.filter((n) => n.id !== id));
    };

    const updateNote = (id: number, updates: Partial<Note>) => {
        setNotes(notes.map((n) => n.id === id ? { ...n, ...updates } : n));
    };

    const onMouseDown = (e: React.MouseEvent<HTMLDivElement>, id: number) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'TEXTAREA' || target.dataset.role === 'button') return;
        
        const noteElement = e.currentTarget;
        const rect = noteElement.getBoundingClientRect();
        setDragging({ id, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top });
    };

    const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!dragging) return;
        const boardRect = e.currentTarget.getBoundingClientRect();
        updateNote(dragging.id, {
            x: e.clientX - dragging.offsetX - boardRect.left,
            y: e.clientY - dragging.offsetY - boardRect.top
        });
    };

    const onMouseUp = () => setDragging(null);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6 flex justify-between items-center">
                 <div>
                    <h1 className="text-3xl font-bold flex items-center"><PhotoIcon /><span className="ml-3">Project Moodboard</span></h1>
                    <p className="text-text-secondary mt-1">Organize your ideas with interactive sticky notes.</p>
                </div>
                <button onClick={addNote} className="btn-primary px-6 py-2">Add Note</button>
            </header>
            <div
                className="relative flex-grow bg-background border-2 border-dashed border-border rounded-lg overflow-hidden"
                onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
            >
                {notes.map((note) => (
                    <div
                        key={note.id}
                        className={`group absolute w-56 h-56 p-2 flex flex-col shadow-lg cursor-grab active:cursor-grabbing rounded-md transition-transform duration-100 border border-black/40 ${note.color} ${textColors[colors.indexOf(note.color)]}`}
                        style={{ top: note.y, left: note.x, transform: dragging?.id === note.id ? 'scale(1.05)' : 'scale(1)' }}
                        onMouseDown={e => onMouseDown(e, note.id)}
                    >
                        <button data-role="button" onClick={(e) => deleteNote(note.id, e)} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-700 text-white font-bold text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all">&times;</button>
                        <textarea
                            value={note.text}
                            onChange={(e) => updateNote(note.id, { text: e.target.value })}
                            className="w-full h-full bg-transparent resize-none focus:outline-none font-medium p-1"
                        />
                        <div data-role="button" className="flex-shrink-0 flex justify-center gap-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {colors.map((c, i) => <button key={c} onClick={() => updateNote(note.id, { color: c })} className={`w-4 h-4 rounded-full ${c} border border-black/20 ${note.color === c ? 'ring-2 ring-offset-1 ring-black/50' : ''}`}/>)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};