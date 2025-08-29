// globals.d.ts
declare global {
  /**
   * Loads the Pyodide WebAssembly module.
   * @param config Optional configuration for Pyodide.
   */
  function loadPyodide(config?: { indexURL?: string }): Promise<any>;

  interface Window {
    google?: {
      accounts: {
        id: {
          disableAutoSelect: () => void;
        };
      };
    };
    // For File System Access API
    showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
    // For PDF.js
    pdfjsLib: any;
  }

  // File System Access API interfaces
  interface FileSystemHandlePermissionDescriptor {
    mode?: 'read' | 'readwrite';
  }

  interface FileSystemHandle {
    // FIX: Add readonly modifier to match derived interfaces
    readonly kind: 'file' | 'directory';
    // FIX: Add readonly modifier to match derived interfaces
    readonly name: string;
    isSameEntry(other: FileSystemHandle): Promise<boolean>;
    queryPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
    requestPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
  }

  interface FileSystemCreateWritableOptions {
    keepExistingData?: boolean;
  }

  interface FileSystemFileHandle extends FileSystemHandle {
    readonly kind: 'file';
    getFile(): Promise<File>;
    createWritable(options?: FileSystemCreateWritableOptions): Promise<FileSystemWritableFileStream>;
  }

  interface FileSystemDirectoryHandle extends FileSystemHandle {
    readonly kind: 'directory';
    getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FileSystemDirectoryHandle>;
    getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
    removeEntry(name: string, options?: { recursive?: boolean }): Promise<void>;
    resolve(possibleDescendant: FileSystemHandle): Promise<string[] | null>;
    keys(): AsyncIterable<string>;
    values(): AsyncIterable<FileSystemFileHandle | FileSystemDirectoryHandle>;
    entries(): AsyncIterable<[string, FileSystemFileHandle | FileSystemDirectoryHandle]>;
  }
}

// This export statement is required to make the file a module.
export {};