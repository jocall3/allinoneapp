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

// FIX: This type was too restrictive. It's used for feature navigation as well.
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

// --- New types for Project Dashboard ---
export interface DashboardKeyFile {
  fileName: string;
  reason: string;
}

export interface DashboardAction {
  action: string;
  command?: string; // e.g., 'npm install'
}

export interface DashboardData {
  summary: string;
  projectType: string;
  keyFiles: DashboardKeyFile[];
  suggestedActions: DashboardAction[];
  techStack: string[];
}


// --- New types to add ---

// For GitHub integration
export interface User {
  login: string;
  id: number;
  avatar_url: string;
  name?: string | null;
}

export interface Repo {
  id: number;
  name: string;
  full_name: string;
  owner: User;
}

// For features system
export interface Feature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  component?: React.FC<any>; // Lazy-loaded component
  aiConfig?: {
    model: string;
  };
}
export type FeatureId = string;

// For sidebar navigation
export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  view: ViewType;
  props?: any;
  action?: () => void;
}

// For file generation
export interface GeneratedFile {
  filePath: string;
  content: string;
  description?: string;
}

// For AI service responses
export interface StructuredExplanation {
  summary: string;
  lineByLine: { lines: string; explanation: string }[];
  complexity: { time: string; space: string };
  suggestions: string[];
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

export interface CronParts {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}

// For Story Scaffolding Feature
export interface PageScaffold {
    id: string;
    page_number: number;
    page_text: string;
    ai_suggestions: string[];
    images: string[];
}
export interface ChapterScaffold {
    id: string;
    title: string;
    summary: string;
    pages: PageScaffold[];
}
export interface StoryDocument {
    id: string;
    title: string;
    mood: string;
    chapters: ChapterScaffold[];
}
export type AppState = 'INPUT' | 'EDITING' | 'PREVIEW';
export type RobotState = 'idle' | 'thinking' | 'writing' | 'illustrating';

export interface EditorActions {
    onAutoDraftAll: () => Promise<void>;
    onSuggestTitles: () => Promise<void>;
    onSummarizeChapters: () => Promise<void>;
}

export interface PageHandlers {
    onUpdatePage: (chapterId: string, pageId: string, updates: Partial<PageScaffold>) => void;
    onExpandTextStream: (chapterId: string, pageId: string) => Promise<void>;
    onGenerateImage: (chapterId: string, pageId: string) => Promise<void>;
    onAutoWritePageStream: (chapterId: string, pageId: string) => Promise<void>;
}


// --- OmniStruct Types ---
interface FunctionBlock {
  [key: string]: string;
}

interface Purpose {
  description: string;
  functions: FunctionBlock;
}

interface Plan {
  milestones: Record<string, string>;
  functions: FunctionBlock;
}

interface Instructions {
  steps: string[];
  functions: FunctionBlock;
}

interface UseCases {
  scenarios: string[];
  functions: FunctionBlock;
}

interface Logic {
  description: string;
  decisionTrees: Record<string, string>;
  functions: FunctionBlock;
}

interface Classification {
  riskCategories: string[];
  functions: FunctionBlock;
}

interface SecurityLevel {
  level: string;
  encryptionProtocols: string[];
  functions: FunctionBlock;
}

interface Ownership {
  currentOwner: string;
  authorizedEntities: string[];
  functions: FunctionBlock;
}

interface Version {
  version: string;
  changes: string;
}

interface Versioning {
  currentVersion: string;
  changeLog: Version[];
  functions: FunctionBlock;
}

interface IntegrationPoints {
  externalAPIs: string[];
  functions: FunctionBlock;
}

interface ResourceLinks {
  documentation: string;
  datasetRepo: string;
  functions: FunctionBlock;
}

interface Dependencies {
  requiredLibraries: string[];
  hardwareRequirements: string[];
  functions: FunctionBlock;
}

interface PerformanceMetrics {
  currentPerformance: Record<string, string | number>;
  functions: FunctionBlock;
}

interface AITrainingParameters {
  hyperparameters: Record<string, string | number>;
  functions: FunctionBlock;
}

interface TestingDatasets {
  availableDatasets: string[];
  functions: FunctionBlock;
}

interface AccessControl {
  entity: string;
  permissions: string;
}

interface Permissions {
  accessControls: AccessControl[];
  functions: FunctionBlock;
}

interface RevocationProtocols {
  strategy: string;
  functions: FunctionBlock;
}

interface RollbackPoint {
  timestamp: string;
  versionRef: string;
}

interface RollbackMechanisms {
  rollbackPoints: RollbackPoint[];
  functions: FunctionBlock;
}

interface AuditRecord {
  action: string;
  time: string;
  performedBy: string;
}

interface AuditLogs {
  records: AuditRecord[];
  functions: FunctionBlock;
}

interface CodeExamples {
  sampleSnippets: Record<string, string>;
  functions: FunctionBlock;
}

export interface OmniStruct {
  Purpose: Purpose;
  Plan: Plan;
  Instructions: Instructions;
  UseCases: UseCases;
  Logic: Logic;
  Classification: Classification;
  SecurityLevel: SecurityLevel;
  Ownership: Ownership;
  Versioning: Versioning;
  IntegrationPoints: IntegrationPoints;
  ResourceLinks: ResourceLinks;
  Dependencies: Dependencies;
  PerformanceMetrics: PerformanceMetrics;
  AITrainingParameters: AITrainingParameters;
  TestingDatasets: TestingDatasets;
  Permissions: Permissions;
  RevocationProtocols: RevocationProtocols;
  RollbackMechanisms: RollbackMechanisms;
  AuditLogs: AuditLogs;
  CodeExamples: CodeExamples;
}
