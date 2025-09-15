import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { CommandContext, executeCommand } from '../../services/terminalService';
import { XMarkIcon } from '../icons';

interface TerminalProps {
  onClose: () => void;
  commandContext: CommandContext;
}

export const Terminal: React.FC<TerminalProps> = ({ onClose, commandContext }) => {
    const termRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<XTerm | null>(null);
    const [currentLine, setCurrentLine] = useState('');

    const PROMPT = `\x1b[1;36m${commandContext.path.map(p=>p.name).join('/')}\x1b[0m \x1b[1;32m$ \x1b[0m`;

    useEffect(() => {
        if (!termRef.current || xtermRef.current) return;

        const xterm = new XTerm({
            cursorBlink: true,
            fontFamily: 'monospace',
            fontSize: 14,
            theme: {
                background: 'hsl(var(--surface))',
                foreground: 'hsl(var(--text-primary))',
                cursor: 'hsl(var(--primary))',
            }
        });
        
        const fitAddon = new FitAddon();
        xterm.loadAddon(fitAddon);
        
        xterm.open(termRef.current);
        fitAddon.fit();

        xtermRef.current = xterm;

        xterm.write(PROMPT);

        xterm.onKey(({ key, domEvent }) => {
            domEvent.preventDefault();
            
            if (domEvent.key === 'Enter') {
                if (currentLine.trim()) {
                    xterm.write('\r\n'); // New line
                    executeCommand(currentLine, commandContext).then(output => {
                        if (output === 'clear') {
                            xterm.clear();
                        } else {
                            xterm.write(output.replace(/\n/g, '\r\n'));
                            xterm.write('\r\n');
                        }
                        xterm.write(PROMPT);
                    });
                } else {
                     xterm.write('\r\n');
                     xterm.write(PROMPT);
                }
                setCurrentLine('');
            } else if (domEvent.key === 'Backspace') {
                if (currentLine.length > 0) {
                    xterm.write('\b \b'); // Move back, write space, move back again
                    setCurrentLine(currentLine.slice(0, -1));
                }
            } else if (!domEvent.ctrlKey && !domEvent.metaKey && !domEvent.altKey) {
                xterm.write(key);
                setCurrentLine(currentLine + key);
            }
        });

        const resizeObserver = new ResizeObserver(() => {
            fitAddon.fit();
        });
        if(termRef.current) resizeObserver.observe(termRef.current);

        return () => {
            resizeObserver.disconnect();
            xterm.dispose();
        };

    }, [commandContext]);

    return (
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-surface border-t-2 border-primary z-50 flex flex-col animate-slide-up">
            <header className="h-8 bg-border flex items-center justify-between px-4 text-xs font-semibold">
                <span>Terminal</span>
                 <button onClick={onClose} className="p-1 rounded-full text-text-secondary hover:bg-surface-hover transition-colors">
                    <XMarkIcon />
                </button>
            </header>
            <div ref={termRef} className="flex-grow p-2" />
        </div>
    );
};
