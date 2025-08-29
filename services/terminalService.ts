
import * as fss from './fileSystemService';
import * as db from './database';
import { getFilesForDirectoryWithHandles } from './database';
import type { FileNode } from '../types';

type PathSegment = { name: string; handle: FileSystemDirectoryHandle };
interface CommandContext {
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
                const files = await getFilesForDirectoryWithHandles(context.currentHandle, context.path.map(p=>p.name).join('/'));
                return files.map(f => f.isDirectory ? `\x1b[1;34m${f.name}/\x1b[0m` : f.name).join('\n');

            case 'cd':
                const targetPath = args[0];
                if (!targetPath || targetPath === '.') return '';
                if (targetPath === '..') {
                    if (context.path.length > 1) {
                        await context.changeDirectory(context.path.slice(0, -1));
                    }
                    return '';
                }
                const newHandle = await context.currentHandle.getDirectoryHandle(targetPath, { create: false });
                await context.changeDirectory([...context.path, { name: newHandle.name, handle: newHandle }]);
                return '';

            case 'mkdir':
                await fss.createDirectory(context.currentHandle, args[0]);
                await fss.ingestDirectory(context.currentHandle, context.path.map(p=>p.name).join('/'));
                context.refresh();
                return `Directory '${args[0]}' created.`;
            
            case 'cat':
                const fileHandle = await context.currentHandle.getFileHandle(args[0]);
                return await fss.readFileContent(fileHandle);

            case 'edit':
                 context.openEditor(args[0]);
                 return `Opening ${args[0]} in the editor...`;

            case 'rm':
                const itemToDelete = (await db.getFilesForDirectory(context.path.map(p=>p.name).join('/'))).find(f => f.name === args[0]);
                if (!itemToDelete) return `rm: cannot remove '${args[0]}': No such file or directory`;
                await fss.deleteFiles(context.currentHandle, [{...itemToDelete, handle: undefined} as FileNode]);
                context.refresh();
                return '';
                
            case 'clear':
                return 'clear';

            case '':
                return '';

            default:
                return `command not found: ${command}`;
        }
    } catch (e) {
        return e instanceof Error ? e.message : String(e);
    }
};
