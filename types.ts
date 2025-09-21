import React from 'react';
import * as icons from 'lucide-react';

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

export type IconName = keyof typeof icons;


// For features system
export interface Feature {
  id: string;
  name: string;
  description: string;
  icon: IconName;
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
  icon: IconName;
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
export interface FunctionBlock {
  [key: string]: string;
}

export interface Purpose {
  description: string;
  functions: FunctionBlock;
}

export interface Plan {
  milestones: { [key: string]: string };
  functions: FunctionBlock;
}

export interface Instructions {
  steps: string[];
  functions: FunctionBlock;
}

export interface UseCases {
  scenarios: string[];
  functions: FunctionBlock;
}

export interface Logic {
  description: string;
  decisionTrees: { [key: string]: string };
  functions: FunctionBlock;
}

export interface Classification {
  riskCategories: string[];
  functions: FunctionBlock;
}

export interface SecurityLevel {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  encryptionProtocols: string[];
  functions: FunctionBlock;
}

export interface Ownership {
  currentOwner: string;
  authorizedEntities: string[];
  functions: FunctionBlock;
}

export interface ChangeLogEntry {
  version: string;
  changes: string;
}

export interface Versioning {
  currentVersion: string;
  changeLog: ChangeLogEntry[];
  functions: FunctionBlock;
}

export interface IntegrationPoints {
  externalAPIs: string[];
  functions: FunctionBlock;
}

export interface ResourceLinks {
  documentation: string;
  datasetRepo: string;
  functions: FunctionBlock;
}

export interface Dependencies {
  requiredLibraries: string[];
  hardwareRequirements: string[];
  functions: FunctionBlock;
}

export interface PerformanceMetrics {
  currentPerformance: { [key: string]: string };
  functions: FunctionBlock;
}

export interface AITrainingParameters {
  hyperparameters: { [key: string]: any };
  functions: FunctionBlock;
}

export interface TestingDatasets {
  availableDatasets: string[];
  functions: FunctionBlock;
}

export interface Permissions {
  accessControls: string[];
  functions: FunctionBlock;
}

export interface RevocationProtocols {
  strategy: 'Manual' | 'Automatic' | 'Scheduled';
  functions: FunctionBlock;
}

export interface RollbackMechanisms {
  rollbackPoints: string[];
  functions: FunctionBlock;
}

export interface AuditLogs {
  records: string[];
  functions: FunctionBlock;
}

export interface CodeExamples {
  sampleSnippets: { [key: string]: string };
  functions: FunctionBlock;
}

export interface OmniStruct {
  Purpose: { description: string; functions: { updateDescription: string; getPurpose: string; } };
  Plan: { milestones: { [key: string]: string }; functions: { getPlanDetails: string; addMilestone: string; } };
  Instructions: { steps: string[]; functions: { getSteps: string; addStep: string; } };
  UseCases: { scenarios: string[]; functions: { getScenarios: string; addScenario: string; } };
  Logic: { description: string; decisionTrees: { [key: string]: string }; functions: { getDecisionTrees: string; runHeuristics: string; } };
  Classification: { riskCategories: string[]; functions: { classify: string; getRiskCategories: string; } };
  SecurityLevel: { level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; encryptionProtocols: string[]; functions: { setSecurityLevel: string; getSecurityLevel: string; } };
  Ownership: { currentOwner: string; authorizedEntities: string[]; functions: { transferOwnership: string; getOwnershipDetails: string; } };
  Versioning: { currentVersion: string; changeLog: ChangeLogEntry[]; functions: { createNewVersion: string; getVersionHistory: string; } };
  IntegrationPoints: { externalAPIs: string[]; functions: { listIntegrationPoints: string; addIntegrationPoint: string; } };
  ResourceLinks: { documentation: string; datasetRepo: string; functions: { getResourceLinks: string; updateResourceLink: string; } };
  Dependencies: { requiredLibraries: string[]; hardwareRequirements: string[]; functions: { listDependencies: string; addDependency: string; } };
  PerformanceMetrics: { currentPerformance: { [key: string]: string }; functions: { getPerformanceMetrics: string; logPerformanceMetric: string; } };
  AITrainingParameters: { hyperparameters: { [key: string]: any }; functions: { getTrainingParams: string; setTrainingParams: string; } };
  TestingDatasets: { availableDatasets: string[]; functions: { listDatasets: string; addDataset: string; } };
  Permissions: { accessControls: string[]; functions: { grantPermission: string; checkPermission: string; } };
  RevocationProtocols: { strategy: 'Manual' | 'Automatic' | 'Scheduled'; functions: { setRevocationStrategy: string; getRevocationStrategy: string; } };
  RollbackMechanisms: { rollbackPoints: string[]; functions: { createRollbackPoint: string; listRollbackPoints: string; } };
  AuditLogs: { records: string[]; functions: { getAuditLogs: string; logAuditEvent: string; } };
  CodeExamples: { sampleSnippets: { [key: string]: string }; functions: { getCodeExample: string; addCodeExample: string; } };
}

// --- Window Manager Types ---
export interface WindowState {
  id: string;
  featureId: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isMinimized: boolean;
  props?: any;
}