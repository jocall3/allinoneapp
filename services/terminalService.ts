
import * as fileSystemService from './fileSystemService';
import { getFilesForDirectory } from './database';
import { FileNode } from '../types';

type PathSegment = { name: string; handle: FileSystemDirectoryHandle };

interface CommandContext {
    currentHandle: FileSystemDirectoryHandle;
    rootHandle: FileSystemDirectoryHandle;
    path: PathSegment[];
    changeDirectory: (path: PathSegment[]) => Promise<void>;
    openEditor: (fileName: string) => void;
    refresh: () => void;
}

function getManualPage(command: string): string {
    if (!command) {
        return 'What manual page do you want?';
    }
    const pages: { [key: string]: string } = {
        'ls': 'NAME\n    ls - list directory contents\n\nSYNOPSIS\n    ls\n\nDESCRIPTION\n    List information about the files in the current directory.',
        'pwd': 'NAME\n    pwd - print name of current/working directory\n\nSYNOPSIS\n    pwd\n\nDESCRIPTION\n    Print the full filename of the current working directory.',
        'cd': 'NAME\n    cd - change the shell working directory\n\nSYNOPSIS\n    cd <directory>\n\nDESCRIPTION\n    Change the current directory to <directory>. Supports "..", "/", and relative paths.',
        'mkdir': 'NAME\n    mkdir - make directories\n\nSYNOPSIS\n    mkdir <directory_name>\n\nDESCRIPTION\n    Create the directory named <directory_name>.',
        'touch': 'NAME\n    touch - create an empty file\n\nSYNOPSIS\n    touch <file_name>\n\nDESCRIPTION\n    Create an empty file with the given name.',
        'rm': 'NAME\n    rm - remove files or directories\n\nSYNOPSIS\n    rm <name>\n\nDESCRIPTION\n    Removes the specified file or directory. Note: Directory removal is recursive by default.',
        'cat': 'NAME\n    cat - concatenate files and print on the standard output\n\nSYNOPSIS\n    cat <file_name>\n\nDESCRIPTION\n    Display the contents of <file_name>.',
        'vim': 'NAME\n    vim - open a file in the editor\n\nSYNOPSIS\n    vim <file_name>\n\nDESCRIPTION\n    Opens the specified file in the integrated Monaco editor with Vim keybindings.',
        'mv': 'NAME\n    mv - move (rename) files\n\nSYNOPSIS\n    mv <source> <destination>\n    mv <source...> <directory>\n\nDESCRIPTION\n    Rename source to destination, or move source(s) to directory.',
        'clear': 'NAME\n    clear - clear the terminal screen\n\nSYNOPSIS\n    clear',
        'help': 'NAME\n    help - display information about builtin commands\n\nSYNOPSIS\n    help',
        'man': 'NAME\n    man - an interface to the on-line reference manuals\n\nSYNOPSIS\n    man <command>'
    };

    const page = pages[command.toLowerCase()];
    if (page) {
        return page;
    } else {
        return `No manual entry for ${command}`;
    }
}

export async function executeCommand(commandString: string, context: CommandContext): Promise<string> {
    const [command, ...args] = commandString.trim().split(/\s+/).filter(Boolean);
    if (!command) return '';

    try {
        switch (command.toLowerCase()) {
            case 'ls':
                return await listDirectory(context.currentHandle, args);
            case 'pwd':
                return `/${context.path.map(p => p.name).join('/')}`;
            case 'cd':
                return await changeDirectory(args[0], context);
            case 'mkdir':
                return await makeDirectory(args[0], context);
            case 'touch':
                return await createFile(args[0], context);
            case 'rm':
                return await removeFile(args, context);
            case 'cat':
                return await catFile(args[0], context);
            case 'vim':
                return await openVim(args[0], context);
            case 'mv':
                 // FIX: Added call to the missing moveOrRename function
                 return await moveOrRename(args, context);
            case 'man':
                return getManualPage(args[0]);
            case 'clear':
                return 'clear';
            case 'help':
                return 'Available commands: ls, pwd, cd, mkdir, touch, rm, cat, vim, mv, man, clear, help';
            default:
                return `command not found: ${command}`;
        }
    } catch (e) {
        return e instanceof Error ? e.message : 'An unknown error occurred.';
    }
}

// FIX: Added args parameter to function signature
async function listDirectory(handle: FileSystemDirectoryHandle, args: string[]): Promise<string> {
    let output = [];
    for await (const entry of handle.values()) {
        output.push(entry.name + (entry.kind === 'directory' ? '/' : ''));
    }
    return output.join('\n');
}

async function changeDirectory(targetPath: string, context: CommandContext): Promise<string> {
    if (!targetPath) return 'Usage: cd <directory>';

    let newPath: PathSegment[];

    if (targetPath === '..') {
        if (context.path.length > 1) {
            newPath = context.path.slice(0, -1);
        } else {
            return 'Already at root.';
        }
    } else if (targetPath === '/') {
        newPath = [context.path[0]];
    } else {
        try {
            const targetHandle = await context.currentHandle.getDirectoryHandle(targetPath, { create: false });
            newPath = [...context.path, { name: targetHandle.name, handle: targetHandle }];
        } catch (e) {
            return `cd: no such file or directory: ${targetPath}`;
        }
    }

    await context.changeDirectory(newPath);
    return '';
}

async function makeDirectory(name: string, context: CommandContext): Promise<string> {
    if (!name) return 'Usage: mkdir <directory_name>';
    const parentId = context.path.map(p => p.name).join('/');
    await fileSystemService.createDirectory(context.currentHandle, name, parentId);
    context.refresh();
    return '';
}

async function createFile(name: string, context: CommandContext): Promise<string> {
    if (!name) return 'Usage: touch <file_name>';
    await fileSystemService.createFile(context.currentHandle, name);
    context.refresh();
    return '';
}

async function removeFile(names: string[], context: CommandContext): Promise<string> {
    if (names.length === 0) return 'Usage: rm <file_or_directory_name>';
    
    const parentId = context.path.map(p => p.name).join('/');
    const filesInDir = await getFilesForDirectory(parentId);
    
    const storableFilesToDelete = filesInDir.filter(f => names.includes(f.name));

    if(storableFilesToDelete.length === 0) {
        return `rm: cannot remove '${names[0]}': No such file or directory`;
    }

    try {
        const filesToDeleteWithHandles: FileNode[] = await Promise.all(
            storableFilesToDelete.map(async (storableFile) => {
                const handle = storableFile.isDirectory
                    ? await context.currentHandle.getDirectoryHandle(storableFile.name)
                    : await context.currentHandle.getFileHandle(storableFile.name);
                return { ...storableFile, handle } as FileNode;
            })
        );
        await fileSystemService.deleteFiles(context.currentHandle, filesToDeleteWithHandles);
    } catch (e) {
         return e instanceof Error ? e.message : 'Error removing file(s).';
    }

    context.refresh();
    return '';
}

async function catFile(fileName: string, context: CommandContext): Promise<string> {
    if (!fileName) return 'Usage: cat <filename>';
    try {
        const fileHandle = await context.currentHandle.getFileHandle(fileName, { create: false });
        return await fileSystemService.readFileContent(fileHandle);
    } catch(e) {
        return `cat: ${fileName}: No such file or directory`;
    }
}

// FIX: Added function implementation
async function openVim(fileName: string, context: CommandContext): Promise<string> {
    if (!fileName) return 'Usage: vim <filename>';
    context.openEditor(fileName);
    return `Opening ${fileName} in editor...`;
}

// FIX: Added missing function implementation
async function moveOrRename(args: string[], context: CommandContext): Promise<string> {
    if (args.length < 2) {
        return 'Usage: mv <source> <destination> OR mv <source...> <directory>';
    }

    const currentDirectoryPath = context.path.map(p => p.name).join('/');
    const destinationName = args[args.length - 1];

    try {
        // Check if destination is a directory
        const destHandle = await context.currentHandle.getDirectoryHandle(destinationName, { create: false });
        // It's a directory, so we move files into it
        const sources = args.slice(0, -1);
        const destPath = `${currentDirectoryPath}/${destinationName}`;
        await fileSystemService.moveItems(context.currentHandle, currentDirectoryPath, sources, destHandle, destPath);
        context.refresh();
        return '';
    } catch (e) {
        // Destination is not a directory, assume it's a rename operation
        if (args.length > 2) {
            return `mv: target '${destinationName}' is not a directory`;
        }
        const sourceName = args[0];
        await fileSystemService.renameItem(context.currentHandle, currentDirectoryPath, sourceName, destinationName);
        context.refresh();
        return '';
    }
}
