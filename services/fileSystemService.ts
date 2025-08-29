import type { FileNode, OrganizationSuggestion, StorableFileNode } from '../types';
import * as db from './database';

// FIX: Helper function to recursively copy directory contents
async function copyEntry(entry: FileSystemHandle, destDirHandle: FileSystemDirectoryHandle): Promise<void> {
    if (entry.kind === 'file') {
        const file = await (entry as FileSystemFileHandle).getFile();
        const newFileHandle = await destDirHandle.getFileHandle(entry.name, { create: true });
        const writable = await newFileHandle.createWritable();
        await writable.write(file);
        await writable.close();
    } else if (entry.kind === 'directory') {
        const newDirHandle = await destDirHandle.getDirectoryHandle(entry.name, { create: true });
        for await (const subEntry of (entry as FileSystemDirectoryHandle).values()) {
            await copyEntry(subEntry, newDirHandle);
        }
    }
}

export async function openDirectoryAndIngest(): Promise<FileSystemDirectoryHandle | null> {
    try {
        const handle = await window.showDirectoryPicker();
        // FIX: Clear IndexedDB on new directory open only if successfully granted.
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
    // FIX: Request 'readwrite' permission explicitly for root to cover all operations.
    const permissionStatus = await directoryHandle.requestPermission({ mode: 'readwrite' });
    if (permissionStatus !== 'granted') {
      throw new Error("Read-write permission denied for the selected directory.");
    }

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

// FIX: Expanded renameItem to support directory renaming using copy-delete pattern.
export async function renameItem(parentHandle: FileSystemDirectoryHandle, target: FileNode, newName: string) {
    if (target.isDirectory) {
        const oldDirHandle = await parentHandle.getDirectoryHandle(target.name);
        const newDirHandle = await parentHandle.getDirectoryHandle(newName, { create: true });
        
        for await (const entry of oldDirHandle.values()) {
            await copyEntry(entry, newDirHandle);
        }

        await parentHandle.removeEntry(target.name, { recursive: true });
        // Update IndexedDB to reflect new path for the directory and all its descendants
        await db.updatePath(target.path, target.path.replace(target.name, newName));

    } else {
        const fileHandle = await parentHandle.getFileHandle(target.name);
        const file = await fileHandle.getFile();
        const newFileHandle = await parentHandle.getFileHandle(newName, { create: true });
        const writable = await newFileHandle.createWritable();
        await writable.write(file);
        await writable.close();
        await parentHandle.removeEntry(target.name);
        // Update IndexedDB for single file
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

// FIX: Improved applyOrganization for better robustness against failures.
export async function applyOrganization(directoryHandle: FileSystemDirectoryHandle, suggestions: OrganizationSuggestion[]) {
    for (const suggestion of suggestions) {
        let newFolderHandle: FileSystemDirectoryHandle | undefined;
        try {
            newFolderHandle = await directoryHandle.getDirectoryHandle(suggestion.folderName, { create: true });
        } catch (error) {
            console.error(`Failed to create folder ${suggestion.folderName}:`, error);
            continue; // Skip this suggestion if folder creation fails
        }

        for (const fileName of suggestion.fileNames) {
            try {
                const fileHandle = await directoryHandle.getFileHandle(fileName);
                const file = await fileHandle.getFile();
                
                // Copy to new location
                if (newFolderHandle) {
                  const newFileHandle = await newFolderHandle.getFileHandle(fileName, { create: true });
                  const writable = await newFileHandle.createWritable();
                  await writable.write(file);
                  await writable.close();
                } else {
                    throw new Error("New folder handle is undefined. This should not happen.");
                }
    
                // Delete from old location
                await directoryHandle.removeEntry(fileName);

                // Update IndexedDB entry
                const oldFilePath = `${(await db.getFilesForDirectory(directoryHandle.name)).find(f => f.name === fileName)?.path}`;
                if (oldFilePath && newFolderHandle) {
                    const newFilePath = `${(newFolderHandle as FileSystemDirectoryHandle).name}/${fileName}`;
                    await db.updatePath(oldFilePath, newFilePath);
                }

            } catch (e) {
                console.error(`Failed to move file ${fileName} to ${suggestion.folderName}:`, e);
                // Attempt to clean up partially created file in the new folder if something went wrong during write/close.
                if (newFolderHandle) {
                    try {
                        await newFolderHandle.removeEntry(fileName);
                        console.warn(`Cleaned up partially moved file: ${fileName} in ${suggestion.folderName}`);
                    } catch (cleanupError) {
                        console.error(`Failed to clean up partially moved file ${fileName}:`, cleanupError);
                    }
                }
            }
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