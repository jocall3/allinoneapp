// Copyright James Burvel OÃ¢â‚¬â„¢Callaghan III
// President Citibank Demo Business Inc.


import * as fss from './fileSystemService';
import * as db from './database';
import { getFilesForDirectoryWithHandles } from './database';
import type { FileNode } from '../types';

// Existing types (modified later to include TerminalSession)
type PathSegment = { name: string; handle: FileSystemDirectoryHandle };

// --- New Interfaces and Types ---

/**
 * Represents a single line of output from the terminal, including its type and timestamp.
 */
export interface TerminalOutput {
    type: 'text' | 'error' | 'clear' | 'system';
    content: string;
    timestamp: Date;
}

/**
 * Extends the basic CommandContext with internal utility methods for command handlers.
 * This separation helps keep the public CommandContext interface lean while providing
 * necessary internal helpers to command implementations.
 */
interface InternalCommandContext extends CommandContext {
    getCurrentPathString(): string;
    // Potentially add methods to interact with command history, env vars directly if not handled by TerminalSession
}

// --- TerminalSession Class ---

/**
 * `TerminalSession` is the core class responsible for managing the state and execution
 * of a single terminal instance. It encapsulates command history, environment variables,
 * aliases, and delegates file system operations to the appropriate services (`fss`, `db`).
 * This design promotes testability and separation of concerns, providing a robust
 * foundation for a "market-ready" terminal experience.
 */
export class TerminalSession {
    private history: string[] = [];
    private environment: Map<string, string> = new Map();
    private aliases: Map<string, string> = new Map(); // New: Store command aliases
    // commandContext is the external interface provided by the UI/framework for host interactions
    private commandContext: CommandContext;

    // A registry for all supported commands, mapping command names to their handler functions.
    // Using `bind(this)` for handlers ensures `this` context within the handler methods.
    private commands: Map<string, (context: InternalCommandContext, args: string[]) => Promise<string | TerminalOutput>> = new Map();

    /**
     * Creates a new TerminalSession instance.
     * @param initialContext The initial command context provided by the host environment.
     *                       This context allows the terminal to interact with the broader application,
     *                       e.g., changing directories, opening an editor, or refreshing the UI.
     */
    constructor(initialContext: CommandContext) {
        this.commandContext = initialContext;
        this.initializeEnvironment();
        this.registerBuiltinCommands();
    }

    /**
     * Initializes default environment variables for the session.
     * These can be later modified by commands like `export`.
     */
    private initializeEnvironment(): void {
        this.environment.set('USER', 'citibank_demo');
        this.environment.set('HOME', '/');
        this.environment.set('PATH', '/bin:/usr/bin'); // Mock typical PATH
        this.environment.set('TERM', 'xterm-256color'); // Indicate terminal capabilities for richer output
        this.environment.set('HOSTNAME', 'citibank-terminal'); // Mock hostname
    }

    /**
     * Registers all the built-in commands with their respective handler functions.
     * This method makes the `TerminalSession` easily extensible for new commands.
     */
    private registerBuiltinCommands(): void {
        this.commands.set('ls', this.handleLs.bind(this));
        this.commands.set('cd', this.handleCd.bind(this));
        this.commands.set('mkdir', this.handleMkdir.bind(this));
        this.commands.set('cat', this.handleCat.bind(this));
        this.commands.set('edit', this.handleEdit.bind(this));
        this.commands.set('rm', this.handleRm.bind(this));
        this.commands.set('clear', this.handleClear.bind(this));
        this.commands.set('pwd', this.handlePwd.bind(this));
        this.commands.set('help', this.handleHelp.bind(this));
        this.commands.set('man', this.handleMan.bind(this)); // New: man command
        this.commands.set('touch', this.handleTouch.bind(this));
        this.commands.set('echo', this.handleEcho.bind(this));
        this.commands.set('mv', this.handleMv.bind(this));
        this.commands.set('cp', this.handleCp.bind(this));
        this.commands.set('export', this.handleExport.bind(this));
        this.commands.set('history', this.handleHistory.bind(this));
        this.commands.set('env', this.handleEnv.bind(this)); // Alias for `export`
        this.commands.set('alias', this.handleAlias.bind(this)); // New: alias command
        this.commands.set('unalias', this.handleUnalias.bind(this)); // New: unalias command
        this.commands.set('which', this.handleWhich.bind(this)); // New: which command
        this.commands.set('date', this.handleDate.bind(this)); // New: date command
        this.commands.set('find', this.handleFind.bind(this)); // New: find command
        this.commands.set('whoami', this.handleWhoami.bind(this)); // New: whoami command
        this.commands.set('hostname', this.handleHostname.bind(this)); // New: hostname command
    }

    /**
     * Helper to get the current full path string from the `PathSegment` array.
     * This provides a consistent way for commands to refer to the current directory.
     * @param context The command context.
     * @returns The current path as a string (e.g., "/user/documents").
     */
    private getCurrentPathString(context: CommandContext): string {
        return context.path.length > 1 ? context.path.map(p => p.name).join('/') : '/';
    }

    // --- Command Handlers ---
    // Each handler method implements the logic for a specific terminal command.
    // They interact with `fss` (file system service), `db` (database service),
    // and the `CommandContext` to perform their operations.

    /**
     * Implements the `ls` command: Lists directory contents with detailed information.
     * Supports `ls`, `ls <directory>`, `ls <file>`, `ls ..`, `ls /absolute/path`.
     */
    private async handleLs(context: InternalCommandContext, args: string[]): Promise<string> {
        let targetHandle: FileSystemDirectoryHandle = context.currentHandle;
        let pathForDb: string = context.getCurrentPathString();
        let targetPathArg: string | undefined = args[0];

        // Handle path arguments (relative, absolute, '..')
        if (targetPathArg && targetPathArg !== '.') {
            try {
                if (targetPathArg.startsWith('/')) { // Absolute path
                    targetHandle = context.rootHandle;
                    const pathSegments = targetPathArg.split('/').filter(Boolean);
                    for (const segment of pathSegments) {
                        targetHandle = await targetHandle.getDirectoryHandle(segment, { create: false });
                    }
                    pathForDb = targetPathArg;
                } else if (targetPathArg === '..') {
                    if (context.path.length > 1) {
                        targetHandle = context.path[context.path.length - 2].handle;
                        pathForDb = context.path.slice(0, -1).map(p => p.name).join('/');
                        if (pathForDb === '') pathForDb = '/'; // Ensure root is '/'
                    }
                } else { // Relative path
                    targetHandle = await context.currentHandle.getDirectoryHandle(targetPathArg, { create: false });
                    pathForDb = pathForDb === '/' ? `/${targetPathArg}` : `${pathForDb}/${targetPathArg}`;
                }
            } catch (e) {
                // If it's not a directory, try to list it as a single file.
                try {
                    const fileHandle = await context.currentHandle.getFileHandle(targetPathArg, { create: false });
                    const file = await fileHandle.getFile();
                    const mockDate = new Date(file.lastModified || Date.now());
                    const permissions = '-rwxr-xr-x';
                    const owner = this.environment.get('USER') || 'user';
                    const group = 'group'; // Mock group
                    const formattedSize = this.formatSize(file.size);
                    const formattedDate = this.formatDate(mockDate);
                    return `${permissions} 1 ${owner} ${group} ${formattedSize.padStart(7)} ${formattedDate} ${file.name}`;
                } catch (fileError) {
                    return `ls: cannot access '${targetPathArg}': No such file or directory`;
                }
            }
        }

        const files = await getFilesForDirectoryWithHandles(targetHandle, pathForDb);

        let output = '';
        const now = new Date();

        // Sort directories first, then files, alphabetically.
        const sortedFiles = files.sort((a, b) => {
            if (a.isDirectory && !b.isDirectory) return -1;
            if (!a.isDirectory && b.isDirectory) return 1;
            return a.name.localeCompare(b.name);
        });

        for (const file of sortedFiles) {
            // Mock created and modified dates/sizes if not directly available from FileNode
            const mockDate = new Date(file.lastModified || now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
            const size = file.size !== undefined ? file.size : (file.isDirectory ? 0 : Math.floor(Math.random() * 10240));

            const permissions = file.isDirectory ? 'drwxr-xr-x' : '-rwxr-xr-x';
            const owner = this.environment.get('USER') || 'user';
            const group = 'group'; // Mock group
            const formattedSize = this.formatSize(size);
            const formattedDate = this.formatDate(mockDate);
            const name = file.isDirectory ? `\x1b[1;34m${file.name}/\x1b[0m` : file.name; // Bold blue for directories

            output += `${permissions} 1 ${owner} ${group} ${formattedSize.padStart(7)} ${formattedDate} ${name}\n`;
        }
        return output.trim();
    }

    /**
     * Implements the `cd` command: Changes the current working directory.
     * Supports `cd <directory>`, `cd ..`, `cd /absolute/path`.
     */
    private async handleCd(context: InternalCommandContext, args: string[]): Promise<string> {
        const targetPath = args[0];
        if (!targetPath || targetPath === '.') return ''; // No change for `cd` or `cd .`

        if (targetPath === '..') {
            if (context.path.length > 1) {
                await context.changeDirectory(context.path.slice(0, -1));
            }
            return '';
        }

        try {
            if (targetPath.startsWith('/')) { // Absolute path
                let tempHandle: FileSystemDirectoryHandle = context.rootHandle;
                const newPathSegments: PathSegment[] = [{ name: '/', handle: context.rootHandle }];
                const segments = targetPath.split('/').filter(Boolean);

                for (const segment of segments) {
                    tempHandle = await tempHandle.getDirectoryHandle(segment, { create: false });
                    newPathSegments.push({ name: segment, handle: tempHandle });
                }
                await context.changeDirectory(newPathSegments);
                return '';
            } else { // Relative path
                const newHandle = await context.currentHandle.getDirectoryHandle(targetPath, { create: false });
                await context.changeDirectory([...context.path, { name: newHandle.name, handle: newHandle }]);
                return '';
            }
        } catch (e) {
            return `cd: no such file or directory: ${targetPath}`;
        }
    }

    /**
     * Implements the `mkdir` command: Creates new directories.
     */
    private async handleMkdir(context: InternalCommandContext, args: string[]): Promise<string> {
        if (args.length === 0) return 'mkdir: missing operand';
        const dirName = args[0];
        try {
            await fss.createDirectory(context.currentHandle, dirName);
            await fss.ingestDirectory(context.currentHandle, context.getCurrentPathString()); // Update DB
            context.refresh(); // Notify UI to refresh
            return `Directory '${dirName}' created.`;
        } catch (e) {
            return `mkdir: cannot create directory '${dirName}': ${e instanceof Error ? e.message : String(e)}`;
        }
    }

    /**
     * Implements the `cat` command: Concatenates files and prints their content to standard output.
     */
    private async handleCat(context: InternalCommandContext, args: string[]): Promise<string> {
        if (args.length === 0) return 'cat: missing operand';
        const fileName = args[0];
        try {
            const fileHandle = await context.currentHandle.getFileHandle(fileName, { create: false });
            return await fss.readFileContent(fileHandle);
        } catch (e) {
            return `cat: ${fileName}: No such file or directory`;
        }
    }

    /**
     * Implements the `edit` command: Opens a file in the integrated editor.
     * This operation is delegated to the host `CommandContext`.
     */
    private async handleEdit(context: InternalCommandContext, args: string[]): Promise<string> {
        if (args.length === 0) return 'edit: missing operand';
        const fileName = args[0];
        try {
            // Ensure the file exists before attempting to open in editor
            await context.currentHandle.getFileHandle(fileName, { create: false });
            context.openEditor(fileName);
            return `Opening ${fileName} in the editor...`;
        } catch (e) {
            return `edit: ${fileName}: No such file or directory`;
        }
    }

    /**
     * Implements the `rm` command: Removes files or directories.
     * Supports `rm <file>` and `rm -r <directory>`.
     */
    private async handleRm(context: InternalCommandContext, args: string[]): Promise<string> {
        if (args.length === 0) return 'rm: missing operand';
        let itemName = args[0];
        let recursive = false;

        // Basic parsing for -r/--recursive
        if (args.includes('-r') || args.includes('-R')) {
            recursive = true;
            itemName = args.find(arg => arg !== '-r' && arg !== '-R') || '';
            if (!itemName) return 'rm: missing operand after -r';
        }

        try {
            let isDirectory = false;
            try {
                // Check if it's a file
                await context.currentHandle.getFileHandle(itemName, { create: false });
            } catch (e) {
                try {
                    // If not a file, check if it's a directory
                    await context.currentHandle.getDirectoryHandle(itemName, { create: false });
                    isDirectory = true;
                } catch (e2) {
                    return `rm: cannot remove '${itemName}': No such file or directory`;
                }
            }

            if (isDirectory) {
                if (!recursive) {
                    return `rm: cannot remove '${itemName}': Is a directory. Use -r to remove recursively.`;
                }
                await fss.deleteDirectory(context.currentHandle, itemName);
            } else {
                await fss.deleteFile(context.currentHandle, itemName);
            }

            await fss.ingestDirectory(context.currentHandle, context.getCurrentPathString()); // Update DB
            context.refresh(); // Notify UI
            return ''; // `rm` typically produces no output on success
        } catch (e) {
            return `rm: failed to remove '${itemName}': ${e instanceof Error ? e.message : String(e)}`;
        }
    }

    /**
     * Implements the `clear` command: Clears the terminal screen.
     * Returns a special `TerminalOutput` type to indicate a screen clear operation.
     */
    private async handleClear(_context: InternalCommandContext, _args: string[]): Promise<TerminalOutput> {
        return { type: 'clear', content: '', timestamp: new Date() };
    }

    /**
     * Implements the `pwd` command: Prints the current working directory path.
     */
    private async handlePwd(context: InternalCommandContext, _args: string[]): Promise<string> {
        return context.getCurrentPathString();
    }

    /**
     * Implements the `help` command: Displays information about available commands.
     * Supports `help` (lists all commands) and `help <command>` (details for a specific command).
     */
    private async handleHelp(_context: InternalCommandContext, args: string[]): Promise<string> {
        const commandNames = Array.from(this.commands.keys()).sort();

        if (args.length > 0) {
            const cmd = args[0];
            const description = this.getCommandDescription(cmd, false);
            return description || `help: no help topics match '${cmd}'`;
        }

        let helpText = 'Citibank Terminal Commands:\n';
        helpText += 'Type "help <command>" for more information about a specific command.\n\n';
        
        const maxLen = Math.max(...commandNames.map(c => c.length));

        for (const cmd of commandNames) {
            const description = this.getCommandDescription(cmd, true); // Short description for list
            helpText += `  \x1b[1m${cmd.padEnd(maxLen)}\x1b[0m  ${description}\n`;
        }
        return helpText.trim();
    }

    /**
     * Implements the `man` command: Provides detailed manual pages for commands.
     * Currently aliases to `help <command>`.
     */
    private async handleMan(context: InternalCommandContext, args: string[]): Promise<string> {
        if (args.length === 0) {
            return 'What manual page do you want? Try `man man` for information about man itself.';
        }
        // For now, `man` is an alias to `help` for detailed descriptions.
        return this.handleHelp(context, args);
    }

    /**
     * Implements the `touch` command: Changes file timestamps or creates empty files.
     */
    private async handleTouch(context: InternalCommandContext, args: string[]): Promise<string> {
        if (args.length === 0) return 'touch: missing file operand';
        const fileName = args[0];
        try {
            // `create: true` will create the file if it doesn't exist, or get it if it does.
            // In a real FS, this would update the mtime/atime. For FileSystem API, it mainly ensures existence.
            await context.currentHandle.getFileHandle(fileName, { create: true });
            await fss.ingestDirectory(context.currentHandle, context.getCurrentPathString()); // Update DB
            context.refresh(); // Notify UI
            return ''; // `touch` typically produces no output on success
        } catch (e) {
            return `touch: cannot touch '${fileName}': ${e instanceof Error ? e.message : String(e)}`;
        }
    }

    /**
     * Implements the `echo` command: Displays a line of text.
     * Supports basic environment variable expansion (e.g., `echo Hello $USER`).
     */
    private async handleEcho(_context: InternalCommandContext, args: string[]): Promise<string> {
        const processedArgs = args.map(arg => {
            if (arg.startsWith('$')) {
                const varName = arg.substring(1);
                return this.environment.get(varName) || '';
            }
            return arg;
        });
        return processedArgs.join(' ');
    }

    /**
     * Implements the `mv` command: Moves or renames files or directories.
     * Supports `mv <source> <destination>`.
     * This relies on `fss` methods for renaming/copying/deleting entries.
     */
    private async handleMv(context: InternalCommandContext, args: string[]): Promise<string> {
        if (args.length !== 2) return 'mv: missing file operand\nTry \'mv --help\' for more information.';
        const sourcePath = args[0];
        const destinationPath = args[1];
    
        try {
            let sourceEntry: FileSystemFileHandle | FileSystemDirectoryHandle;
            let sourceIsDirectory: boolean = false;
    
            // Determine if source is a file or directory
            try {
                sourceEntry = await context.currentHandle.getFileHandle(sourcePath, { create: false });
                sourceIsDirectory = false;
            } catch (e) {
                sourceEntry = await context.currentHandle.getDirectoryHandle(sourcePath, { create: false });
                sourceIsDirectory = true;
            }
    
            const currentPathForDb = context.getCurrentPathString();
            let destinationParentHandle: FileSystemDirectoryHandle = context.currentHandle;
            let destinationParentPathForDb: string = currentPathForDb;
            let finalDestinationName: string;
            
            // Determine the destination's actual parent handle and name
            let destIsDir = false;
            try {
                const potentialDestDirHandle = await context.currentHandle.getDirectoryHandle(destinationPath, { create: false });
                destinationParentHandle = potentialDestDirHandle;
                destinationParentPathForDb = currentPathForDb === '/' ? `/${destinationPath}` : `${currentPathForDb}/${destinationPath}`;
                finalDestinationName = sourcePath; // Moving into an existing directory, keep original name
                destIsDir = true;
            } catch (e) {
                // Destination path does not exist as a directory. It could be a new name or a path to a non-existent parent.
                const destPathSegments = destinationPath.split('/').filter(Boolean);
                finalDestinationName = destPathSegments.pop()!; // The new name for the item
    
                if (destPathSegments.length > 0) {
                    // Resolve the parent handle for the new destination path
                    let tempParentHandle: FileSystemDirectoryHandle = context.currentHandle;
                    let tempParentPath: string = currentPathForDb;
                    for (const segment of destPathSegments) {
                        tempParentHandle = await tempParentHandle.getDirectoryHandle(segment, { create: false });
                        tempParentPath = tempParentPath === '/' ? `/${segment}` : `${tempParentPath}/${segment}`;
                    }
                    destinationParentHandle = tempParentHandle;
                    destinationParentPathForDb = tempParentPath;
                }
            }
    
            // Edge case: moving an item onto itself (e.g., `mv fileA fileA`)
            if (context.currentHandle === destinationParentHandle && sourcePath === finalDestinationName) {
                return ''; // No actual move/rename needed, silently succeed
            }
            // Edge case: moving a directory into one of its subdirectories (e.g., `mv dirA dirA/subDir`)
            if (sourceIsDirectory && destIsDir && destinationParentPathForDb.startsWith(currentPathForDb + '/' + sourcePath)) {
                return `mv: cannot move '${sourcePath}' to '${destinationPath}': A subdirectory of itself.`;
            }
    
            // Check for existing destination item to prevent overwrite by default (`mv -i` would ask)
            const existingDestItems = await db.getFilesForDirectory(destinationParentPathForDb);
            if (existingDestItems.some(item => item.name === finalDestinationName)) {
                return `mv: cannot overwrite existing '${destinationParentPathForDb}/${finalDestinationName}'`;
            }
    
            // Perform the move/rename operation based on item type and location
            if (sourceIsDirectory) {
                if (context.currentHandle === destinationParentHandle) {
                    // Rename directory within the same parent (uses fss.renameEntry for directories)
                    await fss.renameEntry(context.currentHandle, sourcePath, finalDestinationName, true);
                } else {
                    // Move directory to a different parent (requires recursive copy then delete)
                    await fss.copyDirectoryRecursive(sourceEntry as FileSystemDirectoryHandle, destinationParentHandle, finalDestinationName);
                    await fss.deleteDirectory(context.currentHandle, sourcePath);
                }
            } else { // Source is a file
                if (context.currentHandle === destinationParentHandle) {
                    // Rename file within the same parent (uses fss.renameEntry for files)
                    await fss.renameEntry(context.currentHandle, sourcePath, finalDestinationName, false);
                } else {
                    // Move file to a different parent (copy content then delete source)
                    const newFileHandle = await destinationParentHandle.getFileHandle(finalDestinationName, { create: true });
                    await this.copyFileContent(sourceEntry as FileSystemFileHandle, newFileHandle);
                    await fss.deleteFile(context.currentHandle, sourcePath);
                }
            }
    
            // Re-ingest affected directories to update the database and UI
            await fss.ingestDirectory(context.currentHandle, currentPathForDb); // Source directory
            if (destinationParentHandle !== context.currentHandle) {
                await fss.ingestDirectory(destinationParentHandle, destinationParentPathForDb); // Destination directory if different
            }
            context.refresh();
            return '';
        } catch (e) {
            return `mv: failed to move '${sourcePath}' to '${destinationPath}': ${e instanceof Error ? e.message : String(e)}`;
        }
    }
    
    /**
     * Implements the `cp` command: Copies files or directories.
     * Supports `cp <source> <destination>`.
     * This relies on `fss` methods for copying entries.
     */
    private async handleCp(context: InternalCommandContext, args: string[]): Promise<string> {
        if (args.length !== 2) return 'cp: missing file operand\nTry \'cp --help\' for more information.';
        const sourcePath = args[0];
        const destinationPath = args[1];
    
        try {
            let sourceEntry: FileSystemFileHandle | FileSystemDirectoryHandle;
            let sourceIsDirectory: boolean = false;
    
            // Determine if source is a file or directory
            try {
                sourceEntry = await context.currentHandle.getFileHandle(sourcePath, { create: false });
                sourceIsDirectory = false;
            } catch (e) {
                sourceEntry = await context.currentHandle.getDirectoryHandle(sourcePath, { create: false });
                sourceIsDirectory = true;
            }
    
            const currentPathForDb = context.getCurrentPathString();
            let destParentHandle: FileSystemDirectoryHandle = context.currentHandle;
            let destParentPathForDb: string = currentPathForDb;
            let finalDestName: string;
            
            // Determine the destination's actual parent handle and name
            try {
                const potentialDestDirHandle = await context.currentHandle.getDirectoryHandle(destinationPath, { create: false });
                // If destinationPath is an existing directory, copy source into it with its original name
                destParentHandle = potentialDestDirHandle;
                destParentPathForDb = currentPathForDb === '/' ? `/${destinationPath}` : `${currentPathForDb}/${destinationPath}`;
                finalDestName = sourcePath;
            } catch (e) {
                // destinationPath does not exist as a directory. It should be the new name or a path.
                const destPathSegments = destinationPath.split('/').filter(Boolean);
                finalDestName = destPathSegments.pop()!;
    
                if (destPathSegments.length > 0) {
                    // Resolve the parent handle for the new destination
                    let tempParentHandle: FileSystemDirectoryHandle = context.currentHandle;
                    let tempParentPath: string = currentPathForDb;
                    for (const segment of destPathSegments) {
                        tempParentHandle = await tempParentHandle.getDirectoryHandle(segment, { create: false });
                        tempParentPath = tempParentPath === '/' ? `/${segment}` : `${tempParentPath}/${segment}`;
                    }
                    destParentHandle = tempParentHandle;
                    destParentPathForDb = tempParentPath;
                }
            }
    
            // Check for existing destination item to prevent overwrite by default
            const existingDestItems = await db.getFilesForDirectory(destParentPathForDb);
            if (existingDestItems.some(item => item.name === finalDestName)) {
                return `cp: cannot overwrite existing '${destParentPathForDb}/${finalDestName}'`;
            }
    
            if (sourceIsDirectory) {
                await fss.copyDirectoryRecursive(sourceEntry as FileSystemDirectoryHandle, destParentHandle, finalDestName);
            } else {
                const newFileHandle = await destParentHandle.getFileHandle(finalDestName, { create: true });
                await this.copyFileContent(sourceEntry as FileSystemFileHandle, newFileHandle);
            }
            
            // Re-ingest affected directories to update the database and UI
            await fss.ingestDirectory(destParentHandle, destParentPathForDb); // Destination directory
            // The source directory state does not change, so no need to re-ingest it.
            context.refresh();
            return '';
        } catch (e) {
            return `cp: failed to copy '${sourcePath}' to '${destinationPath}': ${e instanceof Error ? e.message : String(e)}`;
        }
    }

    /**
     * Implements the `export` command: Sets environment variables or lists current ones.
     * Supports `export KEY=VALUE` and `export` (to list all variables).
     */
    private async handleExport(_context: InternalCommandContext, args: string[]): Promise<string> {
        if (args.length === 0) {
            let output = 'Declared environment variables:\n';
            this.environment.forEach((value, key) => {
                output += `declare -x ${key}="${value}"\n`; // Bash-like output format
            });
            return output.trim();
        }
        
        const declaration = args[0];
        const match = declaration.match(/^([a-zA-Z_][a-zA-Z0-9_]*)=(.*)$/);
        if (match) {
            const [, key, value] = match;
            this.environment.set(key, value);
            return ''; // No output on successful assignment
        } else {
            return `export: invalid argument: '${declaration}' (expected KEY=VALUE)`;
        }
    }

    /**
     * Implements the `env` command: Lists all environment variables.
     * This acts as an alias for `export` without arguments.
     */
    private async handleEnv(context: InternalCommandContext, args: string[]): Promise<string> {
        return this.handleExport(context, []);
    }

    /**
     * Implements the `history` command: Displays or manages the command history list.
     * Supports `history` (to list) and `history -c` (to clear).
     */
    private async handleHistory(_context: InternalCommandContext, args: string[]): Promise<string> {
        if (args.length === 0) {
            return this.history.map((cmd, idx) => `  ${idx + 1}  ${cmd}`).join('\n');
        }
        if (args[0] === '-c' || args[0] === '--clear') {
            this.history = [];
            return 'history cleared.';
        }
        return `history: unsupported option ${args[0]}`;
    }

    /**
     * Implements the `alias` command: Defines or displays aliases.
     * Supports `alias name='command string'` or `alias` to list all aliases.
     */
    private async handleAlias(_context: InternalCommandContext, args: string[]): Promise<string> {
        if (args.length === 0) {
            if (this.aliases.size === 0) return 'No aliases defined.';
            let output = 'Aliases:\n';
            this.aliases.forEach((value, key) => {
                output += `alias ${key}='${value}'\n`;
            });
            return output.trim();
        }

        const declaration = args[0];
        const match = declaration.match(/^([a-zA-Z_][a-zA-Z0-9_]*)=['"](.+)['"]$/);
        if (match) {
            const [, key, value] = match;
            this.aliases.set(key, value);
            return '';
        } else {
            return `alias: invalid argument: '${declaration}' (expected NAME='COMMAND')`;
        }
    }

    /**
     * Implements the `unalias` command: Removes aliases.
     * Supports `unalias name`.
     */
    private async handleUnalias(_context: InternalCommandContext, args: string[]): Promise<string> {
        if (args.length === 0) return 'unalias: missing operand';
        const aliasName = args[0];
        if (this.aliases.has(aliasName)) {
            this.aliases.delete(aliasName);
            return '';
        } else {
            return `unalias: ${aliasName}: not found`;
        }
    }

    /**
     * Implements the `which` command: Shows the full path of (shell) commands.
     * For now, it indicates if a command is a built-in or an alias.
     */
    private async handleWhich(_context: InternalCommandContext, args: string[]): Promise<string> {
        if (args.length === 0) return 'which: missing operand';
        const cmdName = args[0];

        if (this.aliases.has(cmdName)) {
            return `${cmdName} is aliased to '${this.aliases.get(cmdName)}'`;
        }
        if (this.commands.has(cmdName)) {
            return `${cmdName} is a shell builtin`; // Mocking typical `which` output
        }
        return `which: no ${cmdName} in (${this.environment.get('PATH') || ''})`;
    }

    /**
     * Implements the `date` command: Displays the current date and time.
     */
    private async handleDate(_context: InternalCommandContext, _args: string[]): Promise<string> {
        return new Date().toLocaleString(); // Default locale string for simplicity
    }

    /**
     * Implements the `find` command: Searches for files or directories within a path.
     * Supports `find [path] -name <pattern>`
     */
    private async handleFind(context: InternalCommandContext, args: string[]): Promise<string> {
        let startPath = context.getCurrentPathString();
        let startHandle = context.currentHandle;
        let namePattern: string | undefined;

        // Simple arg parsing: [path] -name <pattern> or -name <pattern> [path]
        let pathArgIndex = -1;
        let nameArgIndex = args.indexOf('-name');

        if (nameArgIndex !== -1) {
            namePattern = args[nameArgIndex + 1];
            if (!namePattern) return 'find: missing argument to `-name`';
            
            // Check if there's an argument before -name that might be a path
            if (nameArgIndex > 0) {
                pathArgIndex = 0;
            } else if (nameArgIndex + 2 < args.length) {
                // Check if there's an argument after pattern that might be a path (less common but possible)
                // We'll prioritize the first argument if it's not -name or part of -name
                if (args.length === 3 && args[2]) { // e.g., find -name "*.txt" .
                    pathArgIndex = 2;
                }
            }
        } else {
            // No -name, assume the first arg is path if present, otherwise current dir
            if (args.length > 0) {
                pathArgIndex = 0;
            }
        }

        if (pathArgIndex !== -1) {
            const targetPath = args[pathArgIndex];
            try {
                if (targetPath === '.') {
                    // Do nothing, already defaults to current
                } else if (targetPath === '..') {
                    if (context.path.length > 1) {
                        startHandle = context.path[context.path.length - 2].handle;
                        startPath = context.path.slice(0, -1).map(p => p.name).join('/');
                        if (startPath === '') startPath = '/';
                    }
                } else if (targetPath.startsWith('/')) { // Absolute path
                    startHandle = context.rootHandle;
                    const pathSegments = targetPath.split('/').filter(Boolean);
                    for (const segment of pathSegments) {
                        startHandle = await startHandle.getDirectoryHandle(segment, { create: false });
                    }
                    startPath = targetPath;
                } else { // Relative path
                    startHandle = await context.currentHandle.getDirectoryHandle(targetPath, { create: false });
                    startPath = startPath === '/' ? `/${targetPath}` : `${startPath}/${targetPath}`;
                }
            } catch (e) {
                return `find: '${targetPath}': No such file or directory`;
            }
        }


        const results: string[] = [];
        const patternRegex = namePattern ? new RegExp(namePattern.replace(/\./g, '\\.').replace(/\*/g, '.*').replace(/\?/g, '.'), 'i') : null;

        await this.recursiveFind(startHandle, startPath, patternRegex, results);

        return results.join('\n').trim();
    }

    /**
     * Implements the `whoami` command: Displays the current effective username.
     */
    private async handleWhoami(_context: InternalCommandContext, _args: string[]): Promise<string> {
        return this.environment.get('USER') || 'unknown';
    }

    /**
     * Implements the `hostname` command: Displays the system's host name.
     */
    private async handleHostname(_context: InternalCommandContext, _args: string[]): Promise<string> {
        return this.environment.get('HOSTNAME') || 'localhost';
    }

    /**
     * Recursive helper for the `find` command to traverse directories.
     */
    private async recursiveFind(
        currentHandle: FileSystemDirectoryHandle,
        currentPath: string,
        patternRegex: RegExp | null,
        results: string[]
    ): Promise<void> {
        const entries = await getFilesForDirectoryWithHandles(currentHandle, currentPath);

        for (const entry of entries) {
            const fullPath = currentPath === '/' ? `/${entry.name}` : `${currentPath}/${entry.name}`;
            if (patternRegex && patternRegex.test(entry.name)) {
                results.push(fullPath);
            } else if (!patternRegex) { // If no pattern, list all
                 results.push(fullPath);
            }

            if (entry.isDirectory) {
                try {
                    const dirHandle = await currentHandle.getDirectoryHandle(entry.name, { create: false });
                    await this.recursiveFind(dirHandle, fullPath, patternRegex, results);
                } catch (e) {
                    // Ignore directories that might have been removed or become inaccessible during traversal
                    console.warn(`find: Could not access directory ${fullPath}: ${e}`);
                }
            }
        }
    }


    // --- Utility Methods for Formatting and Parsing ---

    /**
     * Helper to parse a command string into a command name and an array of arguments.
     * Applies alias resolution.
     * @param commandString The full command line input.
     * @returns An object containing the command name and its arguments.
     */
    private parseCommandArgs(commandString: string): { command: string; args: string[] } {
        const parts = commandString.trim().split(/\s+/);
        let command = parts[0];
        const initialArgs = parts.slice(1);

        // Alias resolution
        if (this.aliases.has(command)) {
            const aliasedCommand = this.aliases.get(command)!;
            // Re-parse the aliased command, prepend its parts to the initial args
            const aliasedParts = aliasedCommand.trim().split(/\s+/);
            command = aliasedParts[0];
            const aliasedArgs = aliasedParts.slice(1);
            return { command, args: [...aliasedArgs, ...initialArgs] };
        }

        return { command, args: initialArgs };
    }

    /**
     * Formats a file size in bytes into a human-readable string (e.g., "1.2K", "3.4M").
     * @param size The size in bytes.
     * @returns A formatted string representing the file size.
     */
    private formatSize(size: number): string {
        if (size < 1024) return `${size}B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}K`;
        if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)}M`;
        return `${(size / (1024 * 1024 * 1024)).toFixed(1)}G`;
    }

    /**
     * Formats a `Date` object into a short, human-readable string (e.g., "Jan 15 10:30").
     * @param date The `Date` object to format.
     * @returns A formatted date string.
     */
    private formatDate(date: Date): string {
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
        return date.toLocaleString('en-US', options);
    }

    /**
     * Retrieves a description for a given command.
     * @param cmd The command name.
     * @param short If true, returns a concise description; otherwise, a more detailed one.
     * @returns The command description string, or a 'not found' message.
     */
    private getCommandDescription(cmd: string, short: boolean = false): string {
        switch (cmd) {
            case 'ls': return short ? 'List directory contents' : 'ls [path]\n    List information about the FILEs (the current directory by default).\n    Supports relative and absolute paths.';
            case 'cd': return short ? 'Change the current directory' : 'cd <directory>\n    Change the shell working directory.\n    Supports relative paths (e.g., `cd ../foo`) and absolute paths (e.g., `cd /user/bar`).';
            case 'mkdir': return short ? 'Create directories' : 'mkdir <directory_name>\n    Create the DIRECTORY(ies), if they do not already exist.';
            case 'cat': return short ? 'Concatenate files and print' : 'cat <file>\n    Concatenate FILE(s) to standard output.';
            case 'edit': return short ? 'Open a file in the editor' : 'edit <file>\n    Open FILE in the integrated code editor.';
            case 'rm': return short ? 'Remove files or directories' : 'rm [-r] <item_name>\n    Remove (unlink) the FILE(s) or DIRECTORY(ies).\n    Use -r (recursive) to remove directories.';
            case 'clear': return short ? 'Clear the terminal screen' : 'clear\n    Clear the terminal screen.';
            case 'pwd': return short ? 'Print name of current directory' : 'pwd\n    Print the name of the current working directory.';
            case 'help': return short ? 'Display information about commands' : 'help [command]\n    Display information about builtin commands. Use `help <command_name>` for specific command details.';
            case 'man': return short ? 'An interface to the system reference manuals' : 'man <command>\n    Format and display the on-line manual pages. Currently aliases to `help <command>`.';
            case 'touch': return short ? 'Change file timestamps or create empty files' : 'touch <file_name>\n    Update the access and modification times of each FILE to the current time.\n    If FILE does not exist, it is created empty.';
            case 'echo': return short ? 'Display a line of text' : 'echo [string...]\n    Display STRING(s) to the standard output. Supports environment variable expansion (e.g., `echo $USER`).';
            case 'mv': return short ? 'Move or rename files or directories' : 'mv <source> <destination>\n    Rename SOURCE to DEST, or move SOURCE(s) to DIRECTORY. Destination cannot already exist.';
            case 'cp': return short ? 'Copy files and directories' : 'cp <source> <destination>\n    Copy SOURCE to DEST, or multiple SOURCE(s) to DIRECTORY. Destination cannot already exist.';
            case 'export': return short ? 'Set environment variables' : 'export [KEY=VALUE]\n    Set environment variables. With no arguments, list all exported variables.';
            case 'env': return short ? 'List environment variables' : 'env\n    Print a report on the current environment variables (alias for `export` without arguments).';
            case 'history': return short ? 'Display or manage command history' : 'history [-c]\n    Display or manage the command history list. Use -c (or --clear) to clear history.';
            case 'alias': return short ? 'Define or display aliases' : "alias [NAME='COMMAND']\n    Define or display aliases. Example: `alias ll='ls -l'`";
            case 'unalias': return short ? 'Remove aliases' : 'unalias <NAME>\n    Remove alias NAME from the list of defined aliases.';
            case 'which': return short ? 'Locate a command' : 'which <command_name>\n    Locate and print the path to the executable file (or builtin/alias) that would be executed in the current environment.';
            case 'date': return short ? 'Display the current date and time' : 'date\n    Print or set the system date and time.';
            case 'find': return short ? 'Search for files in a directory hierarchy' : 'find [path] -name <pattern>\n    Search for files or directories that match a specified pattern starting from a given path (current directory by default).';
            case 'whoami': return short ? 'Print effective user name' : 'whoami\n    Print the user name associated with the current effective user ID.';
            case 'hostname': return short ? 'Show or set the system\'s host name' : 'hostname\n    Display the current hostname.';
            default: return short ? 'No description available' : `help: no help topics match '${cmd}'`;
        }
    }

    /**
     * Helper to copy file content from one `FileSystemFileHandle` to another.
     * This abstracts the low-level file content manipulation.
     * Assumes the destination handle is already created and writable.
     * @param sourceHandle The handle to the source file.
     * @param destinationHandle The handle to the destination file.
     */
    private async copyFileContent(sourceHandle: FileSystemFileHandle, destinationHandle: FileSystemFileHandle): Promise<void> {
        const file = await sourceHandle.getFile();
        const content = await file.text(); // Read as text; consider ArrayBuffer for binary
        await fss.writeFileContent(destinationHandle, content);
    }

    /**
     * Provides autocomplete suggestions based on the current input.
     * @param currentInput The current command line string.
     * @returns An array of suggested strings.
     */
    public async getAutocompleteSuggestions(context: InternalCommandContext, currentInput: string): Promise<string[]> {
        const trimmedInput = currentInput.trimStart();
        const parts = trimmedInput.split(/\s+/);
        const lastPart = parts[parts.length - 1];
        const isCommandOrFirstArg = parts.length === 1 && !currentInput.endsWith(' ');
        const isPathArgument = parts.length > 1 && (lastPart.includes('/') || lastPart.startsWith('.') || lastPart.startsWith('..'));

        let suggestions: string[] = [];

        if (isCommandOrFirstArg) {
            // Suggest commands and aliases
            const allExecutableNames = new Set([...this.commands.keys(), ...this.aliases.keys()]);
            suggestions = Array.from(allExecutableNames).filter(name => name.startsWith(lastPart));
        } else {
            // Suggest file/directory names based on the current argument being typed
            try {
                let targetDirectoryHandle: FileSystemDirectoryHandle = context.currentHandle;
                let pathPrefix = '';
                let currentDirName = '';

                if (lastPart.includes('/')) {
                    const lastSlashIndex = lastPart.lastIndexOf('/');
                    pathPrefix = lastPart.substring(0, lastSlashIndex + 1); // e.g., 'dir1/sub/'
                    currentDirName = lastPart.substring(lastSlashIndex + 1); // e.g., 'file'

                    let resolvedHandle = await this.resolvePathToDirectoryHandle(context, pathPrefix);
                    if (resolvedHandle) {
                        targetDirectoryHandle = resolvedHandle;
                    } else {
                        return []; // Invalid path prefix, no suggestions
                    }
                } else {
                    currentDirName = lastPart;
                }
                
                const filesInDir = await getFilesForDirectoryWithHandles(targetDirectoryHandle, context.getCurrentPathString());
                
                suggestions = filesInDir
                    .filter(file => file.name.startsWith(currentDirName))
                    .map(file => {
                        const suffix = file.isDirectory ? '/' : '';
                        // Replace the partial argument with the full suggestion
                        const newPart = pathPrefix + file.name + suffix;
                        return parts.slice(0, -1).join(' ') + (parts.length > 1 ? ' ' : '') + newPart;
                    });
            } catch (e) {
                // Ignore errors during path resolution for suggestions
            }
        }
        return suggestions.sort();
    }

    /**
     * Resolves a path string (relative or absolute) to a FileSystemDirectoryHandle.
     * @param context The current command context.
     * @param pathString The path to resolve.
     * @returns The resolved FileSystemDirectoryHandle or null if not found.
     */
    private async resolvePathToDirectoryHandle(context: InternalCommandContext, pathString: string): Promise<FileSystemDirectoryHandle | null> {
        try {
            if (pathString.startsWith('/')) { // Absolute path
                let currentHandle: FileSystemDirectoryHandle = context.rootHandle;
                const segments = pathString.split('/').filter(Boolean);
                for (const segment of segments) {
                    currentHandle = await currentHandle.getDirectoryHandle(segment, { create: false });
                }
                return currentHandle;
            } else { // Relative path
                let currentHandle: FileSystemDirectoryHandle = context.currentHandle;
                const segments = pathString.split('/').filter(Boolean);
                for (const segment of segments) {
                    if (segment === '..') {
                        // This logic is tricky with FileSystemDirectoryHandle.
                        // A simple way is to traverse `context.path` if it's part of the current path.
                        // For pure FileSystem API, you can't get '..' handle directly.
                        // For this limited implementation, we'll assume relative segments refer to subdirectories
                        // or current directory's children for simplicity.
                        // More robust `..` handling for arbitrary relative paths would require
                        // reconstructing path from context.path or more complex traversal.
                        return null; // For now, don't try to resolve '..' in arbitrary path parts within a suggestion context.
                    }
                    currentHandle = await currentHandle.getDirectoryHandle(segment, { create: false });
                }
                return currentHandle;
            }
        } catch (e) {
            return null; // Path not found or inaccessible
        }
    }


    // --- Main Execution Method ---

    /**
     * The primary method to execute a command string within this terminal session.
     * It parses the command, dispatches it to the appropriate handler, and captures output.
     * @param commandString The full command line input from the user.
     * @returns A promise resolving to `TerminalOutput`, which wraps the command's result.
     */
    public async execute(commandString: string): Promise<TerminalOutput> {
        const trimmedCommand = commandString.trim();
        if (!trimmedCommand) {
            return { type: 'text', content: '', timestamp: new Date() }; // Empty input
        }

        this.history.push(trimmedCommand); // Add command to history

        const { command, args } = this.parseCommandArgs(trimmedCommand);

        const internalContext: InternalCommandContext = {
            ...this.commandContext,
            getCurrentPathString: () => this.getCurrentPathString(this.commandContext)
        };

        const handler = this.commands.get(command);

        if (handler) {
            try {
                const result = await handler(internalContext, args);
                if (typeof result === 'string') {
                    return { type: 'text', content: result, timestamp: new Date() };
                } else {
                    return result; // Already a TerminalOutput object (e.g., from 'clear')
                }
            } catch (e) {
                console.error(`TerminalSession: Error executing command '${command}':`, e);
                return { type: 'error', content: `${command}: ${e instanceof Error ? e.message : String(e)}`, timestamp: new Date() };
            }
        } else {
            return { type: 'error', content: `command not found: ${command}`, timestamp: new Date() };
        }
    }
}


// --- Updated CommandContext Definition ---
// To enable the `executeCommand` function to delegate to a stateful `TerminalSession`,
// the `CommandContext` interface is updated to include a mandatory `terminalSession` instance.
// This design assumes that the entity invoking `executeCommand` will first
// instantiate `TerminalSession` and pass it as part of the context.
export interface CommandContext {
    currentHandle: FileSystemDirectoryHandle;
    rootHandle: FileSystemDirectoryHandle;
    path: PathSegment[];
    changeDirectory: (path: PathSegment[]) => Promise<void>;
    openEditor: (fileName: string) => void;
    refresh: () => void;
    terminalSession: TerminalSession; // Mandate the presence of a TerminalSession instance
}


// --- Original `executeCommand` function (now a facade to `TerminalSession`) ---
// This function is kept to maintain the original export signature, but its implementation
// now delegates directly to the `TerminalSession` instance provided in the `CommandContext`.
// This allows the external API to remain consistent while benefiting from the enhanced
// capabilities and state management of `TerminalSession`.
export const executeCommand = async (commandString: string, context: CommandContext): Promise<string> => {
    try {
        // Delegate command execution to the TerminalSession instance
        const output = await context.terminalSession.execute(commandString);

        // Adapt the TerminalOutput result to the original Promise<string> signature.
        // Special handling for 'clear' command as it expects the string 'clear'.
        if (output.type === 'clear') {
            return 'clear';
        }
        return output.content;
    } catch (e) {
        // This catch block should ideally only handle unexpected errors if
        // TerminalSession's execute method fails to produce an error-type TerminalOutput.
        console.error("Unexpected error in executeCommand facade:", e);
        return e instanceof Error ? e.message : String(e);
    }
};

// --- Additional exports for better modularity or external usage ---
export { type PathSegment };