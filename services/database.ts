// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.


import { openDB, IDBPDatabase } from 'idb';
import type { FileNode, StorableFileNode } from '../types';

const DB_NAME = 'GeminiFileManagerDB';
const DB_VERSION = 1;
const FILE_STORE_NAME = 'files';

let dbPromise: Promise<IDBPDatabase> | null = null;

const initDB = () => {
  if (dbPromise) {
    return dbPromise;
  }
  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(FILE_STORE_NAME)) {
        const store = db.createObjectStore(FILE_STORE_NAME, {
          keyPath: 'path',
        });
        store.createIndex('parentId', 'parentId', { unique: false });
      }
    },
  });
  return dbPromise;
};

export async function addFile(fileNode: StorableFileNode) {
  const db = await initDB();
  await db.put(FILE_STORE_NAME, fileNode);
}

export async function getFilesForDirectory(directoryPath: string): Promise<StorableFileNode[]> {
  const db = await initDB();
  const index = db.transaction(FILE_STORE_NAME).store.index('parentId');
  return index.getAll(directoryPath);
}

export async function getFilesForDirectoryWithHandles(directoryHandle: FileSystemDirectoryHandle, directoryPath: string): Promise<FileNode[]> {
    const storableFiles = await getFilesForDirectory(directoryPath);
    const liveFiles: FileNode[] = [];

    for (const file of storableFiles) {
        try {
            const handle = file.isDirectory 
                ? await directoryHandle.getDirectoryHandle(file.name)
                : await directoryHandle.getFileHandle(file.name);
            liveFiles.push({ ...file, handle });
        } catch (e) {
            console.warn(`Could not get handle for ${file.path}. It may have been moved or deleted.`, e);
            await deleteFileNode(file.path);
        }
    }
    return liveFiles;
}

export async function getAllFilesFromDB(): Promise<StorableFileNode[]> {
    const db = await initDB();
    return db.getAll(FILE_STORE_NAME);
}

export async function clearAllFiles() {
    const db = await initDB();
    await db.clear(FILE_STORE_NAME);
}

export async function deleteFileNode(path: string) {
  const db = await initDB();
  await db.delete(FILE_STORE_NAME, path);
}

export async function getDescendants(path: string): Promise<StorableFileNode[]> {
    const db = await initDB();
    const allFiles = await db.getAll(FILE_STORE_NAME);
    return allFiles.filter(f => f.path.startsWith(`${path}/`));
}

export async function deleteDescendantsAndSelf(path: string): Promise<void> {
    const db = await initDB();
    const tx = db.transaction(FILE_STORE_NAME, 'readwrite');
    const store = tx.store;
    const descendants = await getDescendants(path);
    
    await Promise.all([
        ...descendants.map(d => store.delete(d.path)),
        store.delete(path),
    ]);
    
    await tx.done;
}

export async function updatePath(oldPath: string, newPath: string) {
    const db = await initDB();
    const tx = db.transaction(FILE_STORE_NAME, 'readwrite');
    const store = tx.store;

    const originalNode = await store.get(oldPath);
    if (!originalNode) return;

    const descendants = originalNode.isDirectory ? await getDescendants(oldPath) : [];
    
    const nodesToAdd = [];
    const newParentPath = newPath.substring(0, newPath.lastIndexOf('/')) || newPath.substring(0, newPath.lastIndexOf('\\')) || null;
    
    const updatedOriginalNode: StorableFileNode = {
        ...originalNode,
        path: newPath,
        name: newPath.split(/[\\/]/).pop()!,
        parentId: newParentPath,
    };
    nodesToAdd.push(updatedOriginalNode);
    
    for (const d of descendants) {
        nodesToAdd.push({
            ...d,
            path: d.path.replace(oldPath, newPath),
            parentId: d.parentId?.replace(oldPath, newPath),
        });
    }

    await Promise.all([
        store.delete(oldPath),
        ...descendants.map(d => store.delete(d.path))
    ]);
    await Promise.all(nodesToAdd.map(n => store.put(n)));

    await tx.done;
}
