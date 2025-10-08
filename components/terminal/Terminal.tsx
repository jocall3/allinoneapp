// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.


import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FitAddon } from 'xterm-addon-fit';
import { Terminal as XTerminal } from 'xterm';
import { executeCommand } from '../../services/terminalService';

// --- NEW TYPES AND INTERFACES (EXPORTED) ---

/**
 * Defines a terminal theme configuration.
 */
export interface TerminalTheme {
  background: string;
  foreground: string;
  cursor: string;
  selection: string;
  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  brightBlack: string;
  brightRed: string;
  brightGreen: string;
  brightYellow: string;
  brightBlue: string;
  brightMagenta: string;
  brightCyan: string;
  brightWhite: string;
}

/**
 * Defines a collection of commonly used terminal themes.
 */
export const TerminalThemes = {
  default: {
    background: '#000000',
    foreground: '#ffffff',
    cursor: '#ffffff',
    selection: 'rgba(255, 255, 255, 0.3)',
    black: '#000000',
    red: '#ff0000',
    green: '#33cc33',
    yellow: '#ffff00',
    blue: '#0066ff',
    magenta: '#cc00ff',
    cyan: '#00ffff',
    white: '#ffffff',
    brightBlack: '#808080',
    brightRed: '#ff6666',
    brightGreen: '#66ff66',
    brightYellow: '#ffff66',
    brightBlue: '#6699ff',
    brightMagenta: '#ff66ff',
    brightCyan: '#66ffff',
    brightWhite: '#ffffff',
  },
  solarizedDark: {
    background: '#002b36',
    foreground: '#839496',
    cursor: '#93a1a1',
    selection: 'rgba(147, 161, 161, 0.3)',
    black: '#073642',
    red: '#dc322f',
    green: '#859900',
    yellow: '#b58900',
    blue: '#268bd2',
    magenta: '#d33682',
    cyan: '#2aa198',
    white: '#eee8d5',
    brightBlack: '#002b36',
    brightRed: '#cb4b16',
    brightGreen: '#586e75',
    brightYellow: '#657b83',
    brightBlue: '#839496',
    brightMagenta: '#6c71c4',
    brightCyan: '#93a1a1',
    brightWhite: '#fdf6e3',
  },
  // Add more themes as needed
};

/**
 * Configuration options for the terminal.
 */
export interface TerminalOptions {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  scrollback: number;
  theme: TerminalTheme;
  allowTransparency: boolean;
  macOptionIsMeta: boolean;
}

/**
 * Default terminal options.
 */
export const DefaultTerminalOptions: TerminalOptions = {
  fontSize: 14,
  fontFamily: 'monospace',
  lineHeight: 1.2,
  scrollback: 1000,
  theme: TerminalThemes.default,
  allowTransparency: true,
  macOptionIsMeta: false,
};

// --- END NEW TYPES AND INTERFACES ---

type PathSegment = { name: string; handle: FileSystemDirectoryHandle };
interface TerminalProps {
  rootHandle: FileSystemDirectoryHandle;
  currentHandle: FileSystemDirectoryHandle;
  path: PathSegment[];
  changeDirectory: (path: PathSegment[]) => Promise<void>;
  openEditor: (fileName: string) => void;
  refresh: () => void;
  // New props for customization and event callbacks
  initialOptions?: Partial<TerminalOptions>;
  onCommandExecuted?: (command: string, output: string | null) => void;
  onTerminalReady?: (terminal: XTerminal) => void;
}

const HISTORY_STORAGE_KEY = 'terminal_command_history';
const ALIASES_STORAGE_KEY = 'terminal_aliases';
const DEFAULT_USER = 'user'; // Placeholder, could be dynamic later
const DEFAULT_HOSTNAME = 'web-os'; // Placeholder for the web-based OS

const Terminal: React.FC<TerminalProps> = ({ 
  rootHandle, 
  currentHandle, 
  path, 
  changeDirectory, 
  openEditor, 
  refresh,
  initialOptions,
  onCommandExecuted,
  onTerminalReady,
}) => {
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerminal | null>(null);
  const [height, setHeight] = useState(250);
  const [isResizing, setIsResizing] = useState(false);
  const [isCommandExecuting, setIsCommandExecuting] = useState(false); // New state for loading indicator
  const [terminalOptions, setTerminalOptions] = useState<TerminalOptions>(() => ({
    ...DefaultTerminalOptions,
    ...initialOptions,
  }));

  // Use a ref to keep props fresh inside effects without re-running them unnecessarily
  const propsRef = useRef({ rootHandle, currentHandle, path, changeDirectory, openEditor, refresh, onCommandExecuted, onTerminalReady });
  useEffect(() => {
    propsRef.current = { rootHandle, currentHandle, path, changeDirectory, openEditor, refresh, onCommandExecuted, onTerminalReady };
  }, [rootHandle, currentHandle, path, changeDirectory, openEditor, refresh, onCommandExecuted, onTerminalReady]);

  const fitAddonRef = useRef(new FitAddon());

  const inputRef = useRef('');
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const aliasesRef = useRef<Record<string, string>>({}); // New ref for aliases

  // Load history and aliases from localStorage on mount
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) {
        historyRef.current = JSON.parse(storedHistory);
        historyIndexRef.current = historyRef.current.length;
      }
    } catch (error) {
      console.error("Failed to load terminal history from localStorage:", error);
      historyRef.current = [];
    }

    try {
      const storedAliases = localStorage.getItem(ALIASES_STORAGE_KEY);
      if (storedAliases) {
        aliasesRef.current = JSON.parse(storedAliases);
      }
    } catch (error) {
      console.error("Failed to load terminal aliases from localStorage:", error);
      aliasesRef.current = {};
    }
  }, []);

  // Helper to persist history
  const saveHistory = useCallback(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historyRef.current));
    } catch (error) {
      console.error("Failed to save terminal history to localStorage:", error);
    }
  }, []);

  // Helper to persist aliases
  const saveAliases = useCallback(() => {
    try {
      localStorage.setItem(ALIASES_STORAGE_KEY, JSON.stringify(aliasesRef.current));
    } catch (error) {
      console.error("Failed to save terminal aliases to localStorage:", error);
    }
  }, []);

  // --- NEW: Directory Listing Helper for Autocompletion ---
  const listDirectoryContents = useCallback(async (dirHandle: FileSystemDirectoryHandle): Promise<string[]> => {
    const contents: string[] = [];
    try {
      for await (const entry of dirHandle.values()) {
        contents.push(entry.name);
      }
    } catch (error) {
      console.error('Error listing directory contents for autocompletion:', error);
      // Fallback or error handling for permissions
    }
    return contents.sort();
  }, []);

  // --- Core Terminal Initialization and Event Handling ---
  useEffect(() => {
    if (!terminalContainerRef.current) return;
    
    const term = new XTerminal({
        cursorBlink: true,
        convertEol: true,
        theme: terminalOptions.theme,
        fontSize: terminalOptions.fontSize,
        fontFamily: terminalOptions.fontFamily,
        lineHeight: terminalOptions.lineHeight,
        scrollback: terminalOptions.scrollback,
        allowTransparency: terminalOptions.allowTransparency,
        macOptionIsMeta: terminalOptions.macOptionIsMeta,
    });
    xtermRef.current = term;
    term.loadAddon(fitAddonRef.current);
    term.open(terminalContainerRef.current);
    fitAddonRef.current.fit();

    propsRef.current.onTerminalReady?.(term); // Notify parent component that terminal is ready

    // Enhanced prompt function
    const prompt = (clearInput: boolean = true) => {
        if (!term) return;
        const pathString = `/${propsRef.current.path.map(p => p.name).join('/')}`;
        // ANSI escape codes for colors: \x1b[1;32m (bold green), \x1b[1;34m (bold blue), \x1b[0m (reset)
        term.write(`\r\n\x1b[1;32m${DEFAULT_USER}@${DEFAULT_HOSTNAME}\x1b[0m:\x1b[1;34m${pathString}\x1b[0m$ `);
        if (clearInput) {
            inputRef.current = '';
        }
    };

    const handleCommand = async (rawCommand: string) => {
        let command = rawCommand.trim();

        // 1. Check for aliases
        const parts = command.split(' ');
        if (aliasesRef.current[parts[0]]) {
          command = aliasesRef.current[parts[0]] + ' ' + parts.slice(1).join(' ');
          term.writeln(`(alias) ${command}`); // Show expanded alias for clarity
        }

        // 2. Add to history
        if (rawCommand && historyRef.current[historyRef.current.length - 1] !== rawCommand) {
          historyRef.current.push(rawCommand); // Store raw command in history
          saveHistory();
        }
        historyIndexRef.current = historyRef.current.length; // Reset history index to end

        setIsCommandExecuting(true);
        term.write('\r\n'); // New line before command output for better readability

        let output: string | null = null;
        try {
            output = await executeCommand(command, {
              ...propsRef.current,
              terminal: term, // Pass terminal instance for direct interaction (e.g., printing progress)
              _listDir: listDirectoryContents, // Internal helper for executeCommand to list directory
              _setAlias: (name: string, value: string) => { // Internal alias management command
                aliasesRef.current[name] = value;
                saveAliases();
                term.writeln(`Alias '${name}' set to '${value}'.`);
              },
              _unsetAlias: (name: string) => { // Internal alias management command
                if (aliasesRef.current[name]) {
                  delete aliasesRef.current[name];
                  saveAliases();
                  term.writeln(`Alias '${name}' unset.`);
                } else {
                  term.writeln(`Alias '${name}' not found.`);
                }
              },
              _listAliases: () => { // Internal alias management command
                if (Object.keys(aliasesRef.current).length === 0) {
                  term.writeln('No aliases defined.');
                } else {
                  Object.entries(aliasesRef.current).forEach(([key, value]) => {
                    term.writeln(`${key}='${value}'`);
                  });
                }
              },
            });
        } catch (error: any) {
            output = `Error: ${error.message || 'An unknown error occurred during command execution.'}`;
            console.error('Command execution error:', error);
        } finally {
            setIsCommandExecuting(false);
        }
        
        // 3. Process output
        if (output === '__CLEAR_SCREEN__') { // Use a specific magic string for clear screen
            term.clear();
        } else if (output) {
            term.writeln(output.replace(/\n/g, '\r\n')); // Ensure consistent line endings
        }

        propsRef.current.onCommandExecuted?.(rawCommand, output); // Notify parent component
        prompt();
    };

    // Autocompletion logic for Tab key
    const autocomplete = async (currentInput: string) => {
      const term = xtermRef.current;
      if (!term) return;

      const trimmedInput = currentInput.trim();
      const inputParts = trimmedInput.split(' ');
      const commandPrefix = inputParts[0];
      const argumentPrefix = inputParts.length > 1 ? inputParts[inputParts.length - 1] : '';

      // Define internal commands for autocompletion
      const builtInCommands = ['ls', 'cd', 'mkdir', 'touch', 'rm', 'edit', 'clear', 'help', 'alias', 'unalias'];
      
      let allMatches: string[] = [];

      if (inputParts.length === 1) { // Autocompleting the command itself
        allMatches = builtInCommands.filter(cmd => cmd.startsWith(commandPrefix));
      } else { // Autocompleting arguments (files/directories)
        try {
          // Assume arguments are file/directory names in the current directory
          const contents = await listDirectoryContents(propsRef.current.currentHandle);
          const matchingContents = contents.filter(name => name.startsWith(argumentPrefix));
          allMatches = matchingContents.map(match => {
            // Append a slash if it's likely a directory (heuristic: no extension)
            // This is a basic heuristic; a more robust solution would check entry type
            return match.includes('.') ? match : `${match}/`;
          });
        } catch (error) {
          console.warn('Could not list directory for argument autocompletion:', error);
        }
      }

      allMatches = [...new Set(allMatches)].sort(); // Deduplicate and sort

      if (allMatches.length === 0) {
        // No matches, just refresh prompt and current input
        term.write('\r');
        prompt(false);
        term.write(currentInput);
        return;
      }

      if (allMatches.length === 1) {
        // Single match, complete the input
        const suggestion = allMatches[0];
        const currentPart = inputParts.length === 1 ? commandPrefix : argumentPrefix;
        const suffix = suggestion.substring(currentPart.length);
        term.write(suffix);
        inputRef.current += suffix;
      } else {
        // Multiple matches, list them and then refresh prompt + current input
        term.writeln(''); // New line for listing suggestions
        term.writeln(allMatches.join('   ').replace(/\n/g, '\r\n'));
        prompt(false); // Refresh prompt but keep current input
        term.write(currentInput);
      }
    };

    const onKeyDisposable = term.onKey(async ({ key, domEvent }: { key: string; domEvent: KeyboardEvent }) => {
        // Handle special control key combinations first
        if (domEvent.ctrlKey) {
            if (domEvent.key === 'l') { // Ctrl+L to clear screen
                term.clear();
                prompt(false); // Keep current input after clearing
                term.write(inputRef.current);
                domEvent.preventDefault(); // Prevent default browser behavior
                return;
            }
            // Add other Ctrl key combinations here (e.g., Ctrl+C for copy is handled by Xterm.js selection)
            // If we wanted to implement a SIGINT-like behavior, this would be the place.
        }
        
        // Prevent browser's default tab focus behavior
        if (domEvent.key === 'Tab') {
            domEvent.preventDefault();
            await autocomplete(inputRef.current);
            return;
        }

        if (domEvent.key === 'Enter') {
            const command = inputRef.current.trim();
            if (command) {
                await handleCommand(command);
            } else {
                prompt(); // Just show a new prompt if input is empty
            }
            inputRef.current = '';
        } else if (domEvent.key === 'Backspace') {
            if (inputRef.current.length > 0) {
                term.write('\b \b'); // Move cursor back, overwrite with space, move back again
                inputRef.current = inputRef.current.slice(0, -1);
            }
        } else if (domEvent.key === 'ArrowUp') {
            if (historyIndexRef.current > 0) {
                historyIndexRef.current--;
                const command = historyRef.current[historyIndexRef.current];
                term.write('\b \b'.repeat(inputRef.current.length)); // Clear current input visually
                term.write(command); // Write history command
                inputRef.current = command;
            }
        } else if (domEvent.key === 'ArrowDown') {
            if (historyIndexRef.current < historyRef.current.length - 1) {
                historyIndexRef.current++;
                const command = historyRef.current[historyIndexRef.current];
                term.write('\b \b'.repeat(inputRef.current.length)); // Clear current input visually
                term.write(command); // Write history command
                inputRef.current = command;
            } else if (historyIndexRef.current === historyRef.current.length - 1) {
                historyIndexRef.current++; // Go past the last command to clear input
                term.write('\b \b'.repeat(inputRef.current.length)); // Clear current input
                inputRef.current = '';
            }
        } else if (!domEvent.ctrlKey && !domEvent.altKey && !domEvent.metaKey) {
            // A simple way to filter out non-printable characters like Shift, ArrowLeft etc.
            if (key.length === 1) { // Only print single character keys
                term.write(key);
                inputRef.current += key;
            }
        }
    });

    // onData handler is useful for capturing all input data, including pasted content.
    // Xterm.js generally handles typical Ctrl+V paste directly by emitting characters
    // via the `onKey` event or processing them internally. This `onData` can be used
    // for more advanced scenarios or to observe raw input. For standard terminal emulation,
    // onKey and internal paste mechanisms are often sufficient.
    const onDataDisposable = term.onData((data: string) => {
        // Example: If 'data' contains pasted multi-line commands and we want to execute them.
        // For now, we rely on `onKey` for most input, and `xterm.js` for default paste.
        // This is a placeholder for potential future advanced input processing.
        // E.g., if a user pastes "cmd1\ncmd2", we might want to split and execute.
    });


    // Initial welcome messages and prompt
    term.writeln('Welcome to the integrated web terminal.');
    term.writeln(`Current user: \x1b[1;32m${DEFAULT_USER}\x1b[0m, Host: \x1b[1;34m${DEFAULT_HOSTNAME}\x1b[0m`);
    term.writeln('Type `help` for available commands, `alias` to manage aliases, or `clear` to clear the screen.');
    prompt();

    return () => {
      onKeyDisposable.dispose();
      onDataDisposable.dispose(); // Ensure onData handler is disposed
      term.dispose();
      xtermRef.current = null;
    };
  }, [terminalOptions, listDirectoryContents, saveHistory, saveAliases]); // Re-run effect if terminal options change

  // Effect to re-fit terminal when height or terminal options impacting dimensions change
  useEffect(() => {
    if (xtermRef.current) {
        fitAddonRef.current.fit();
    }
  }, [height, terminalOptions]); 
  
  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const onResize = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const newHeight = window.innerHeight - e.clientY;
      // Define reasonable minimum and maximum heights for the terminal pane
      const minHeight = 50; // Minimum height in pixels
      const maxHeight = window.innerHeight * 0.75; // Maximum 75% of window height
      if (newHeight > minHeight && newHeight < maxHeight) {
        setHeight(newHeight);
      }
    }
  }, [isResizing]);

  // Effect for global mouse events during resizing
  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', onResize);
      window.addEventListener('mouseup', stopResizing);
    } else {
      window.removeEventListener('mousemove', onResize);
      window.removeEventListener('mouseup', stopResizing);
    }
    // Cleanup function to remove event listeners
    return () => {
      window.removeEventListener('mousemove', onResize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, onResize, stopResizing]);

  return (
    <div
      className="flex-shrink-0 relative" // Added relative for absolute positioning of loader
      style={{ height: `${height}px` }}
    >
      <div
        className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 cursor-row-resize hover:bg-blue-500 transition-colors duration-200" // Added transition for smoother hover effect
        onMouseDown={startResizing}
        // Add visual feedback for resizing, making the handle more prominent when active
        style={{
          borderTop: isResizing ? '2px solid rgb(59, 130, 246)' : 'none', // Blue border when resizing
          borderBottom: isResizing ? '2px solid rgb(59, 130, 246)' : 'none',
          boxSizing: 'border-box', // Ensure border is included in height calculation
        }}
      />
      <div className="h-[calc(100%-6px)] w-full bg-black text-white">
        <div ref={terminalContainerRef} className="h-full w-full font-mono" /> {/* Added font-mono for better rendering */}
      </div>

      {isCommandExecuting && (
        <div className="absolute bottom-2 right-4 text-gray-400 text-sm animate-pulse">
          Executing...
        </div>
      )}
    </div>
  );
};

export default Terminal;