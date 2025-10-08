// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import type { Feature } from '../types'; // Existing import, must not be removed.

/**
 * Defines the standardized data types that features can consume or produce.
 * This helps in type-checking and automated chaining of features.
 */
export type FeatureDataType =
    | 'text/plain'              // Raw text, e.g., log files, simple strings
    | 'text/markdown'           // Markdown formatted text
    | 'application/json'        // JSON object
    | 'application/javascript'  // JavaScript code
    | 'text/x-python'           // Python code
    | 'text/x-typescript'       // TypeScript code
    | 'text/x-java'             // Java code
    | 'text/html'               // HTML content
    | 'image/jpeg'              // JPEG image data
    | 'image/png'               // PNG image data
    | 'audio/mpeg'              // MPEG audio data
    | 'video/mp4'               // MP4 video data
    | 'application/octet-stream' // Generic binary data (e.g., compiled binaries, zipped files)
    | 'reference/file-path'     // A string path to a local or remote file
    | 'reference/url'           // A URL string
    | 'user_interaction'        // Represents an event or data from user input (e.g., button click, form submission)
    | 'system_event'            // Represents an event or data from the system (e.g., CI/CD trigger, cron job completion)
    | 'model_weights_tensor';   // Raw tensor data for AI model weights

/**
 * Categorizes features for better organization, discovery, and management.
 */
export type FeatureCategory =
    | 'CodeGeneration'          // Features that generate code
    | 'CodeAnalysis'            // Features that analyze code (e.g., linting, security scanning, refactoring suggestions)
    | 'Documentation'           // Features for creating or improving documentation
    | 'NaturalLanguageProcessing' // General NLP tasks (e.g., summarization, sentiment analysis)
    | 'DataTransformation'      // Features for converting or processing data between formats
    | 'MultimediaProcessing'    // Features for handling images, audio, video
    | 'SystemIntegration'       // Features for interacting with external systems (e.g., APIs, databases)
    | 'UserInterfaceAutomation' // Features for automating UI interactions or generating UI components
    | 'Testing'                 // Features for generating tests, executing tests, or analyzing test results
    | 'Deployment'              // Features for deploying applications or infrastructure
    | 'Monitoring'              // Features for observing system health and performance
    | 'Utility'                 // General purpose helper features
    | 'KnowledgeManagement';    // Features related to managing and retrieving information

/**
 * Describes the current development and stability stage of a feature.
 */
export type FeatureLifecycleStage =
    | 'Alpha'                   // Early development, may change significantly, not for production
    | 'Beta'                    // Feature complete, undergoing testing, may have minor breaking changes
    | 'Stable'                  // Production ready, API stable, well-tested
    | 'Deprecated'              // Still functional but planned for removal, users should migrate
    | 'Retired';                // No longer maintained or available

/**
 * Indicates the perceived complexity level of a feature, influencing resource allocation or user expectations.
 */
export type FeatureComplexity =
    | 'Low'                     // Simple, straightforward, minimal dependencies
    | 'Medium'                  // Moderate logic, some dependencies, manageable
    | 'High'                    // Complex logic, significant dependencies, requires careful handling
    | 'VeryHigh';               // Extremely complex, critical dependencies, potentially high resource usage

/**
 * Represents the AI's semantic understanding of a single feature.
 * This expanded interface provides a comprehensive meta-description for feature discovery, orchestration, and management.
 */
export interface SemanticFeature {
    id: string;
    name: string;
    // A concise, human-readable summary of the feature's function.
    description: string;
    // The core purpose of the feature, as understood by the AI.
    purpose: string;
    // Semantic versioning for the feature's interface and behavior (e.g., "1.0.0").
    version: string;
    // Primary category for the feature.
    category: FeatureCategory;
    // Current lifecycle stage, indicating stability and support.
    lifecycleStage: FeatureLifecycleStage;
    // Estimated complexity of the feature.
    complexity: FeatureComplexity;
    // Keywords or labels for advanced search and filtering.
    tags: string[];

    // What kind of data or input does this feature primarily operate on?
    expectedInput: FeatureDataType;
    // What is the primary output or result of this feature?
    primaryOutput: FeatureDataType;

    // Optional detailed schema references for input/output, facilitating validation and tooling.
    // This could be a URL to a JSON schema definition, or a canonical name within a schema registry.
    inputSchemaRef?: string;
    outputSchemaRef?: string;

    // Connections and Dependencies
    // A list of other feature IDs that this feature could logically connect to (e.g., output of A is input for B).
    potentialConnections: string[];
    // Features that *must* be available and operational for this feature to function correctly.
    requiredFeatures?: string[];
    // Features that cannot be used simultaneously or are functionally exclusive with this one.
    exclusiveFeatures?: string[];

    // Operational aspects and resource implications
    // List of specific runtime requirements (e.g., "GPU_V100", "InternetAccess", "LocalFilesystemRW").
    runtimeRequirements?: string[];
    // Estimated impact on operational costs (e.g., compute, API calls).
    estimatedCostImpact?: 'Low' | 'Medium' | 'High' | 'VeryHigh';
    // Expected latency characteristics of the feature.
    estimatedLatency?: 'Realtime' | 'Short' | 'Medium' | 'Long' | 'Batch';
    // Details regarding any rate limits applicable to this feature's usage.
    rateLimitDetails?: {
        requestsPerMinute: number;
        burstLimit?: number; // Optional: maximum requests allowed in a short burst
    };

    // Example and documentation references
    // Structured examples demonstrating typical input and expected output.
    exampleUsage?: {
        input: any; // Example input data conforming to expectedInput type
        output: any; // Expected output data conforming to primaryOutput type
        description?: string; // Short description for this specific example
    }[];
    // URL to comprehensive documentation for the feature.
    documentationUrl?: string;
    // A markdown snippet for quick inline documentation.
    quickDocumentation?: string;
}

/**
 * The complete, self-generated knowledge base of the application's capabilities.
 * The keys are the feature IDs, mapping to their detailed semantic descriptions.
 * This acts as the central registry for all discoverable features.
 */
export type FeatureCatalog = Record<string, SemanticFeature>;


/**
 * Defines the mode of execution for a semantic workflow.
 */
export type WorkflowExecutionMode = 'Sequential' | 'Parallel' | 'Conditional';

/**
 * Describes how an input for a specific feature step within a workflow is mapped
 * from the overall workflow input or the output of previous steps.
 */
export interface WorkflowInputMapping {
    /**
     * The name of the input parameter for the `SemanticFeature` being executed in this step.
     */
    targetInputName: string;
    /**
     * A path (e.g., JSONPath, JMESPath, or custom query language) to extract data
     * from the current workflow context (overall workflow input or previous step's outputs).
     * Example: "workflow.input.code_snippet" or "steps.stepA.output.markdown_report".
     */
    sourcePath: string;
    /**
     * If true, the input is optional for the feature; workflow continues even if `sourcePath` yields no data.
     */
    isOptional?: boolean;
    /**
     * A default value to use if `sourcePath` is not found and `isOptional` is true.
     */
    defaultValue?: any;
    /**
     * Optional transformation to apply to the extracted data before passing it to the feature.
     * Could be a function name or a mini-script.
     */
    transformation?: string;
}

/**
 * Describes how the output of a specific feature step contributes to the overall
 * workflow output or becomes available for subsequent steps.
 */
export interface WorkflowOutputMapping {
    /**
     * A path (e.g., JSONPath) to extract data from this step's output.
     */
    sourceOutputPath: string;
    /**
     * The name under which this data will be stored in the workflow context,
     * making it available for subsequent steps or as part of the overall workflow output.
     */
    targetOutputName: string;
    /**
     * Optional transformation to apply to the extracted output data.
     */
    transformation?: string;
}

/**
 * Defines a single step within a `SemanticWorkflow`, specifying which feature to run
 * and how its inputs/outputs are handled.
 */
export interface SemanticWorkflowStep {
    stepId: string;
    /** The ID of the `SemanticFeature` to execute in this step. */
    featureId: string;
    name: string;
    description?: string;

    /** Mappings from workflow context to the feature's inputs. */
    inputMappings: WorkflowInputMapping[];
    /** Mappings from the feature's output back into the workflow context. */
    outputMappings: WorkflowOutputMapping[];

    /**
     * Optional conditional execution logic. If provided, the step only runs if the
     * condition evaluates to true.
     * `expression`: e.g., 'workflow.context.previousStepOutput.status === "success"' (JS-like or JSONPath comparison).
     */
    condition?: {
        type: 'JSCondition' | 'JSONPathCondition'; // Type of expression language
        expression: string;
    };

    /**
     * Defines behavior if this step encounters an error.
     * 'Continue': Workflow proceeds to next steps if possible.
     * 'FailWorkflow': Workflow immediately terminates with an error.
     * 'Retry': Attempt to re-run the step.
     */
    onError?: 'Continue' | 'FailWorkflow' | 'Retry';
    /** Maximum number of retries if `onError` is 'Retry'. */
    maxRetries?: number;
    /** Delay in milliseconds between retries. */
    retryDelayMs?: number;

    /**
     * For parallel or complex workflows, specifies `stepId`s that this step must
     * wait for before starting.
     */
    dependsOn?: string[];
}

/**
 * Represents a higher-level capability composed of a sequence or graph of `SemanticFeature`s.
 * Workflows enable orchestration of multiple features to achieve complex goals.
 */
export interface SemanticWorkflow {
    id: string;
    name: string;
    description: string;
    version: string;
    category: FeatureCategory; // Primary category for the workflow
    lifecycleStage: FeatureLifecycleStage;
    complexity: FeatureComplexity;
    tags?: string[];

    /**
     * Optional: Reference to a schema defining the overall input structure expected by the workflow.
     */
    workflowInputSchemaRef?: string;
    /**
     * Optional: Reference to a schema defining the overall output structure produced by the workflow.
     */
    workflowOutputSchemaRef?: string;

    /**
     * The ordered or structured sequence of steps that make up this workflow.
     */
    steps: SemanticWorkflowStep[];

    /**
     * The primary execution paradigm for the workflow (e.g., strictly sequential, or allowing parallel steps).
     */
    executionMode: WorkflowExecutionMode;

    /**
     * Optional initial context variables or global configuration available to all steps.
     */
    contextVariables?: Record<string, any>;

    /**
     * URL to detailed documentation for the workflow.
     */
    documentationUrl?: string;
}

/**
 * Categorizes the high-level intent of a user, aiding in feature discovery and recommendation.
 */
export type UserIntentCategory =
    | 'CodeRelated'             // Generating, debugging, refactoring code
    | 'DocumentationRelated'    // Creating or enhancing documentation
    | 'DataAnalysis'            // Processing, visualizing, interpreting data
    | 'ProjectManagement'       // Planning, tracking, reporting on project tasks
    | 'Learning'                // Explaining concepts, providing tutorials
    | 'CreativeContentGeneration' // Generating text, images, or other creative assets
    | 'SystemConfiguration';    // Setting up or modifying system parameters

/**
 * Captures relevant contextual information about the user's current environment and activity.
 * This context is crucial for intelligent feature discovery and pre-filling inputs.
 */
export interface UserContext {
    userId?: string;
    currentProjectId?: string;
    currentFilePath?: string;
    /** The code snippet or text currently selected by the user. */
    selectedText?: string;
    /** The programming language of the active editor. */
    activeEditorLanguage?: string;
    /** IDs of recently used features or commands, indicating user preferences or common workflows. */
    recentActions?: string[];
    /** Generic user preferences or settings. */
    preferences?: Record<string, any>;
    /** Current state of relevant application variables or settings. */
    applicationState?: Record<string, any>;
}

/**
 * Input parameters for a feature discovery or recommendation engine.
 * Helps the AI understand what the user is trying to achieve to suggest relevant features or workflows.
 */
export interface FeatureDiscoveryContext {
    /** A natural language description of the user's current goal or problem. */
    intent: string;
    /** AI's inferred category of the user's intent. */
    category?: UserIntentCategory;
    /** Detailed context about the user's environment and activity. */
    userContext: UserContext;
    /** The complete feature catalog from which to discover. */
    availableFeatures: FeatureCatalog;
    /** Optional list of feature IDs that should explicitly not be suggested. */
    excludedFeatures?: string[];
    /** Maximum number of discovery results to return. */
    maxResults?: number;
    /** Optional: What kind of output is primarily desired (e.g., 'code', 'report'). */
    desiredOutputType?: FeatureDataType;
}

/**
 * Represents a feature (or workflow) suggested by the discovery engine,
 * along with its relevance and potential usage.
 */
export interface DiscoveredFeature {
    /** The ID of the suggested `SemanticFeature` or `SemanticWorkflow`. */
    id: string; // Can be a featureId or a workflowId
    /** Type of the discovered item. */
    type: 'Feature' | 'Workflow';
    /** A score (0.0 - 1.0) indicating how relevant this item is to the user's context and intent. */
    relevanceScore: number;
    /** A natural language explanation of why this item is relevant. */
    reasoning: string;
    /** Suggested input parameters, pre-filled based on the `FeatureDiscoveryContext`. */
    suggestedInput?: Record<string, any>;
    /** A human-interpretable priority, e.g., 1 (highest) to 5 (lowest). */
    priority?: number;
    /** If this is a workflow, provides context about the steps involved. */
    workflowDetails?: {
        stepsCount: number;
        firstStepFeatureId?: string;
    };
}

/**
 * Describes the operational status of a feature or an external dependency.
 */
export type FeatureHealthStatus =
    | 'Operational'             // Functioning normally.
    | 'Degraded'                // Experiencing minor issues, but still functional.
    | 'Offline'                 // Currently unavailable.
    | 'Maintenance'             // Under scheduled maintenance.
    | 'Unknown';                // Status cannot be determined.

/**
 * Represents a single operational metric for a feature, useful for monitoring and performance analysis.
 */
export interface FeatureMetric {
    /** ISO 8601 timestamp of when the metric was recorded. */
    timestamp: string;
    /** Name of the metric (e.g., "latency_ms", "error_rate", "requests_per_minute"). */
    metricName: string;
    /** The numerical value of the metric. */
    value: number;
    /** The unit of the metric (e.g., "ms", "count", "%"). */
    unit: string;
    /** Optional labels for filtering or grouping metrics (e.g., { region: "us-east-1", version: "1.2.0" }). */
    labels?: Record<string, string>;
}

/**
 * Provides a comprehensive report on the current health and operational status of a `SemanticFeature`.
 */
export interface FeatureHealthReport {
    featureId: string;
    /** Overall health status of the feature. */
    status: FeatureHealthStatus;
    /** ISO 8601 timestamp of when this report was generated. */
    lastUpdated: string;
    /** An optional human-readable message providing more details on the status. */
    message?: string;
    /** A collection of relevant operational metrics for the feature. */
    operationalMetrics?: FeatureMetric[];
    /** Status of any external services or other features that this feature depends on. */
    dependenciesStatus?: Record<string, FeatureHealthStatus>;
    /** List of active or recent incidents affecting this feature. */
    incidents?: {
        id: string;
        startTime: string; // ISO 8601
        endTime?: string;   // ISO 8601
        description: string;
        severity?: 'Low' | 'Medium' | 'High' | 'Critical';
    }[];
}