import React, { useState, useMemo } from 'react';
import { MarkdownRenderer } from '../shared';
import { BookOpenIcon } from '../icons';

// --- Import all markdown "dissertation" pages ---
import page1 from '../../../page1.md?raw';
import page2 from '../../../page2.md?raw';
import page3 from '../../../alchemy/page3.md?raw';
import page4 from '../../../alchemy/aetherlink/page4.md?raw';
import page5 from '../../../alchemy/alchemist/page5.md?raw';
import page6 from '../../../alchemy/alchemist/pipeline/page6.md?raw';
import page7 from '../../../alchemy/ethics/page7.md?raw';
import page8 from '../../../alchemy/tsal/page8.md?raw';
import page9 from '../../../alchemy/tsal/stdlib/page9.md?raw';
import page10 from '../../../alchemy/tsal/syntax/page10.md?raw';
import page11 from '../../page11.md?raw';
import page12 from '../../dashboard/page12.md?raw';
import page13 from '../../desktop/page13.md?raw';
import page14 from '../page14.md?raw';
import page15 from './omnistruct/page15.md?raw';
import page16 from './shared/page16.md?raw';
import page17 from './story-scaffolding/page17.md?raw';
import page18 from '../../layout/page18.md?raw';
import page19 from '../../modals/page19.md?raw';
import page20 from '../../shared/page20.md?raw';
import page21 from '../../terminal/page21.md?raw';
import page22 from '../../ui/page22.md?raw';
import page23 from '../../../contexts/page23.md?raw';
import page24 from '../../../hooks/page24.md?raw';
import page25 from '../../../services/page25.md?raw';

const allPagesRaw = [
    { raw: page1, path: 'Prequel' },
    { raw: page2, path: 'Project Root' },
    { raw: page3, path: 'alchemy/' },
    { raw: page4, path: 'alchemy/aetherlink/' },
    { raw: page5, path: 'alchemy/alchemist/' },
    { raw: page6, path: 'alchemy/alchemist/pipeline/' },
    { raw: page7, path: 'alchemy/ethics/' },
    { raw: page8, path: 'alchemy/tsal/' },
    { raw: page9, path: 'alchemy/tsal/stdlib/' },
    { raw: page10, path: 'alchemy/tsal/syntax/' },
    { raw: page11, path: 'components/' },
    { raw: page12, path: 'components/dashboard/' },
    { raw: page13, path: 'components/desktop/' },
    { raw: page14, path: 'components/features/' },
    { raw: page15, path: 'components/features/omnistruct/' },
    { raw: page16, path: 'components/features/shared/' },
    { raw: page17, path: 'components/features/story-scaffolding/' },
    { raw: page18, path: 'components/layout/' },
    { raw: page19, path: 'components/modals/' },
    { raw: page20, path: 'components/shared/' },
    { raw: page21, path: 'components/terminal/' },
    { raw: page22, path: 'components/ui/' },
    { raw: page23, path: 'contexts/' },
    { raw: page24, path: 'hooks/' },
    { raw: page25, path: 'services/' },
];

const parsePage = (page: { raw: string, path: string }, index: number) => {
    const titleMatch = page.raw.match(/^#\s*(.*)/m);
    let title = titleMatch ? titleMatch[1] : 'Untitled';
    title = title.replace(/^Page \d+:\s*/, '').replace(/PREQUEL:\s*/, '');

    const authorMatch = page.raw.match(/\*\(([^)]+)\)\*/);
    let author = 'Narrator';
    if(authorMatch) {
        author = authorMatch[1].replace('Written by ', '').replace('Dictated by ', '').replace('Transcribed by ', '');
    }

    return {
        id: index,
        title: title,
        author: author,
        content: page.raw,
        path: page.path,
    };
};

export const ProjectDissertations: React.FC = () => {
    const pages = useMemo(() => allPagesRaw.map(parsePage), []);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectedPage = pages[selectedIndex];

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary bg-background">
            <header className="mb-6 flex-shrink-0">
                <h1 className="text-3xl font-bold flex items-center">
                    <BookOpenIcon />
                    <span className="ml-3">Project Dissertations</span>
                </h1>
                <p className="text-text-secondary mt-1">
                    The lore and technical design papers behind the DevCore AI project.
                </p>
            </header>
            <div className="flex-grow flex gap-6 min-h-0">
                {/* Table of Contents */}
                <aside className="w-1/3 xl:w-1/4 bg-surface border border-border p-4 rounded-lg flex flex-col">
                    <h3 className="font-bold mb-3 text-lg text-text-primary">Table of Contents</h3>
                    <div className="flex-grow overflow-y-auto space-y-1 pr-2 -mr-4">
                        {pages.map((page, index) => (
                            <button 
                                key={page.id} 
                                onClick={() => setSelectedIndex(index)} 
                                className={`block w-full text-left p-2 rounded-md transition-colors text-sm ${selectedIndex === index ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 text-text-primary'}`}
                            >
                                <span className="font-semibold block">{index + 1}. {page.title}</span>
                                <span className="text-xs text-text-secondary pl-4 truncate">{page.path}</span>
                            </button>
                        ))}
                    </div>
                </aside>
                {/* Content Viewer */}
                <main className="w-2/3 xl:w-3/4 flex flex-col bg-surface border border-border rounded-lg overflow-hidden">
                    <div className="p-4 border-b border-border flex-shrink-0">
                        <h2 className="text-2xl font-bold text-text-primary">{selectedPage.title}</h2>
                        <p className="text-sm text-text-secondary">By: {selectedPage.author}</p>
                    </div>
                    <div className="flex-grow overflow-y-auto p-6">
                        <MarkdownRenderer content={selectedPage.content} />
                    </div>
                </main>
            </div>
        </div>
    );
};
