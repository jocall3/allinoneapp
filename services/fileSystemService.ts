
import type { FileNode, OrganizationSuggestion, StorableFileNode } from '../types';
import * as db from './database';

export async function openDirectoryAndIngest(): Promise<FileSystemDirectoryHandle | null> {
    try {
        const handle = await window.showDirectoryPicker();
        await db.clearAllFiles();
        return handle;
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            console.log('User cancelled the directory picker.');
        } else {
            console.error('Error opening directory:', error);
        }
        return null;
    }
}

export async function ingestDirectory(directoryHandle: FileSystemDirectoryHandle, parentPath: string | null = null) {
    const path = parentPath ? `${parentPath}/${directoryHandle.name}` : directoryHandle.name;

    for await (const entry of directoryHandle.values()) {
        const entryPath = `${path}/${entry.name}`;
        if (entry.kind === 'file') {
            const file = await entry.getFile();
            const fileNode: StorableFileNode = {
                id: entry.name,
                name: entry.name,
                isDirectory: false,
                path: entryPath,
                parentId: path,
                size: file.size,
                modified: file.lastModified,
            };
            await db.addFile(fileNode);
        } else if (entry.kind === 'directory') {
            const dirNode: StorableFileNode = {
                id: entry.name,
                name: entry.name,
                isDirectory: true,
                path: entryPath,
                parentId: path,
                size: 0,
                modified: Date.now(),
            };
            await db.addFile(dirNode);
            await ingestDirectory(entry, path);
        }
    }
}

export async function createDirectory(parentHandle: FileSystemDirectoryHandle, name: string) {
    await parentHandle.getDirectoryHandle(name, { create: true });
}

export async function renameItem(parentHandle: FileSystemDirectoryHandle, target: FileNode, newName: string) {
    if (target.isDirectory) {
        throw new Error("Renaming directories via this method is not directly supported by the File System Access API. A move operation is required.");
    } else {
        const fileHandle = await parentHandle.getFileHandle(target.name);
        const file = await fileHandle.getFile();
        const newFileHandle = await parentHandle.getFileHandle(newName, { create: true });
        const writable = await newFileHandle.createWritable();
        await writable.write(file);
        await writable.close();
        await parentHandle.removeEntry(target.name);
        await db.updatePath(target.path, target.path.replace(target.name, newName));
    }
}


export async function deleteFiles(directoryHandle: FileSystemDirectoryHandle, filesToDelete: FileNode[]) {
    for (const file of filesToDelete) {
        await directoryHandle.removeEntry(file.name, { recursive: file.isDirectory });
        if (file.isDirectory) {
            await db.deleteDescendantsAndSelf(file.path);
        } else {
            await db.deleteFileNode(file.path);
        }
    }
}

export async function applyOrganization(directoryHandle: FileSystemDirectoryHandle, suggestions: OrganizationSuggestion[]) {
    for (const suggestion of suggestions) {
        const newFolderHandle = await directoryHandle.getDirectoryHandle(suggestion.folderName, { create: true });
        for (const fileName of suggestion.fileNames) {
            // This is a simplified move. A real implementation would need to copy and delete.
            const fileHandle = await directoryHandle.getFileHandle(fileName);
            const file = await fileHandle.getFile();
            
            const newFileHandle = await newFolderHandle.getFileHandle(fileName, { create: true });
            const writable = await newFileHandle.createWritable();
            await writable.write(file);
            await writable.close();

            await directoryHandle.removeEntry(fileName);
        }
    }
}

export async function readFileContent(handle: FileSystemFileHandle): Promise<string> {
    const file = await handle.getFile();
    return file.text();
}

export async function saveFileContent(handle: FileSystemFileHandle, content: string): Promise<void> {
    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
}
