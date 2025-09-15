import * as fss from './fileSystemService';
import * as db from './database';
import { getFilesForDirectoryWithHandles } from './database';
import type { FileNode } from '../types';
import { Alchemist } from '../alchemy/alchemist/compiler';

type PathSegment = { name: string; handle: FileSystemDirectoryHandle };

// FIX: The context is now passed into the command executor to make it powerful.
export interface CommandContext {
    currentHandle: FileSystemDirectoryHandle;
    rootHandle: FileSystemDirectoryHandle;
    path: PathSegment[];
    changeDirectory: (path: PathSegment[]) => Promise<void>;
    openEditor: (fileName: string) => void;
    refresh: () => void;
}

export const executeCommand = async (commandString: string, context: CommandContext): Promise<string> => {
    const [command, ...args] = commandString.trim().split(/\s+/);

    try {
        switch (command) {
            case 'ls':
            case 'dir':
                const files = await getFilesForDirectoryWithHandles(context.currentHandle, context.path.map(p => p.name).join('/'));
                if (files.length === 0) return 'Directory is empty.';
                return files.map(f => f.isDirectory ? `\x1b[1;34m${f.name}/\x1b[0m` : f.name).join('  ');

            case 'cd':
                const targetPath = args[0];
                if (!targetPath || targetPath === '.') return '';

                if (targetPath === '..') {
                    if (context.path.length > 1) {
                        await context.changeDirectory(context.path.slice(0, -1));
                    }
                    return '';
                }
                
                // Handle absolute paths from root
                if (targetPath.startsWith('/')) {
                    const parts = targetPath.split('/').filter(Boolean);
                    let newHandle = context.rootHandle;
                    const newPath = [context.path[0]];
                    for (const part of parts) {
                        newHandle = await newHandle.getDirectoryHandle(part, { create: false });
                        newPath.push({ name: newHandle.name, handle: newHandle });
                    }
                    await context.changeDirectory(newPath);
                    return '';
                }

                // Handle relative paths
                const newHandle = await context.currentHandle.getDirectoryHandle(targetPath, { create: false });
                await context.changeDirectory([...context.path, { name: newHandle.name, handle: newHandle }]);
                return '';

            case 'mkdir':
                if (!args[0]) return 'mkdir: missing operand';
                await fss.createDirectory(context.currentHandle, args[0]);
                await fss.ingestDirectory(context.currentHandle, context.path.map(p => p.name).join('/'));
                context.refresh();
                return `Directory '${args[0]}' created.`;
            
            case 'cat':
                if (!args[0]) return 'cat: missing operand';
                const fileHandle = await context.currentHandle.getFileHandle(args[0]);
                return await fss.readFileContent(fileHandle);

            case 'edit':
                 if (!args[0]) return 'edit: missing operand';
                 context.openEditor(args[0]);
                 return `Opening ${args[0]}...`;

            case 'rm':
                if (!args[0]) return 'rm: missing operand';
                const itemToDelete = (await db.getFilesForDirectory(context.path.map(p => p.name).join('/'))).find(f => f.name === args[0]);
                if (!itemToDelete) return `rm: cannot remove '${args[0]}': No such file or directory`;
                
                // A quick confirmation for safety
                // In a real terminal this is more complex, but good for UX here.
                // const confirmed = confirm(`Are you sure you want to delete ${itemToDelete.path}?`);
                // if (!confirmed) return 'Operation cancelled.';

                await fss.deleteFiles(context.currentHandle, [{...itemToDelete, handle: undefined} as FileNode]);
                context.refresh();
                return `Removed '${args[0]}'`;
            
            // --- The star of the show ---
            case 'alchemize':
                if (!args[0]) return 'alchemize: missing file operand. Usage: alchemize <file.tsal>';
                const tsalFileName = args[0];
                let tsalFileHandle;
                try {
                   tsalFileHandle = await context.currentHandle.getFileHandle(tsalFileName);
                } catch (e) {
                   return `\x1b[1;31mError:\x1b[0m Cannot find file '${tsalFileName}' in current directory.`;
                }
                const tsalContent = await fss.readFileContent(tsalFileHandle);
                const alchemist = new Alchemist();
                
                let output = '🔥 \x1b[1;33mInitializing Alchemist Engine...\x1b[0m\n';
                try {
                    output += `🔬 Compiling ${tsalFileName}...\n`;
                    const { wat } = await alchemist.compile(tsalContent);
                    const watFileName = tsalFileName.replace('.tsal', '.wat');
                    const watFileHandle = await context.currentHandle.getFileHandle(watFileName, { create: true });
                    await fss.saveFileContent(watFileHandle, wat);
                    
                    output += `\x1b[1;32m✅ Compilation successful.\x1b[0m\n`;
                    output += `✨ Wrote WebAssembly Text Format to \x1b[1;36m${watFileName}\x1b[0m`;
                    context.refresh();
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown compilation error';
                    output += `\n☠️ \x1b[1;31mAlchemy Engine FAILED:\x1b[0m ${errorMessage}`;
                }
                return output;

            case 'help':
                return `Available commands: ls, cd, mkdir, cat, edit, rm, alchemize, help, clear`;

            case 'clear':
                return 'clear';

            case '':
                return '';

            default:
                return `command not found: ${command}. Type 'help' for a list of commands.`;
        }
    } catch (e) {
        return e instanceof Error ? e.message : String(e);
    }
};
