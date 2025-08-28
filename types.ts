
// Represents the serializable file metadata stored in IndexedDB.
// It purposefully omits the non-serializable `handle`.
export interface StorableFileNode {
  id: string; // The file name, used as a local ID within its directory
  name: string;
  isDirectory: boolean;
  path: string; // Full path relative to the root handle
  parentId: string | null;
  size: number;
  modified: number;
  cid?: string; // Content ID (hash) for files
}

// Represents a live file node in the application's memory.
// It includes the `StorableFileNode` data plus the live `handle`.
export interface FileNode extends StorableFileNode {
  handle?: FileSystemHandle;
  content?: string; // File content for the editor
  children?: FileNode[];
}


// FIX: Changed ViewType to a generic string to allow for feature IDs as views.
export type ViewType = string;

export type SortField = 'name' | 'size' | 'modified';
export type SortDirection = 'asc' | 'desc';

export interface SortOption {
  field: SortField;
  direction: SortDirection;
}

export interface OrganizationSuggestion {
  folderName: string;
  fileNames: string[];
}

export type AIAction = 'summarize' | 'explain_code';

export interface AIActionRequest {
  action: AIAction;
  file: FileNode;
}

// Discriminated union for managing all modals from a single state
export type ModalState =
  | { type: 'smart-organize' }
  | { type: 'explain-folder' }
  | { type: 'ai-action'; request: AIActionRequest }
  | { type: 'create-folder' }
  | { type: 'rename'; target: FileNode }
  | { type: 'edit-file'; file: FileNode };

// FIX: Added missing type exports

export interface Repo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
  };
  [key: string]: any;
}

export interface User {
    login: string;
    id: number;
    avatar_url: string;
    name?: string;
    [key: string]: any;
}

export interface Feature {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    category: string;
    component?: React.FC<any>;
    aiConfig?: { model: string };
}

export interface SidebarItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    view: ViewType;
    props?: any;
    action?: () => void;
}

export interface StructuredExplanation {
  summary: string;
  lineByLine: { lines: string; explanation: string }[];
  complexity: { time: string; space: string };
  suggestions: string[];
}

export interface GeneratedFile {
  filePath: string;
  content: string;
  description?: string;
}

export interface StructuredPrSummary {
  title: string;
  summary: string;
  changes: string[];
}

export interface ColorTheme {
    primary: string;
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
}

export type Theme = 'light' | 'dark';
