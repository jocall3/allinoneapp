// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

// Define the lifecycle status for a feature.
export type FeatureStatus = 'stable' | 'beta' | 'deprecated' | 'experimental' | 'planned';

/**
 * Represents a single feature or tool within the application's taxonomy.
 * This interface defines the structure and metadata for each tool.
 */
export interface FeatureTaxonomy {
    /**
     * A unique identifier for the feature, typically used for programmatic access.
     * Example: "ai-command-center"
     */
    id: string;
    /**
     * A user-friendly name for the feature.
     * Example: "AI Command Center"
     */
    name: string;
    /**
     * A concise description of what the feature does.
     */
    description: string;
    /**
     * The primary category the feature belongs to, for grouping and navigation.
     * Example: "AI Tools", "Git", "Testing"
     */
    category: string;
    /**
     * A description of the expected input(s) for the feature.
     * This could be a natural language prompt, code snippets, etc.
     */
    inputs: string;
    /**
     * An optional array of keywords or tags associated with the feature,
     * aiding in discoverability and more granular categorization.
     */
    tags?: string[];
    /**
     * The current development lifecycle status of the feature.
     * @see FeatureStatus
     */
    status?: FeatureStatus;
    /**
     * An optional version string for the feature, useful for tracking changes.
     */
    version?: string;
    /**
     * The date when the feature's metadata was last updated (ISO 8601 format).
     */
    lastUpdated?: string;
    /**
     * An optional array of IDs of other features that are related or complementary.
     */
    relatedFeatures?: string[];
    /**
     * Optional internal notes for developers or product managers.
     */
    developerNotes?: string;
    /**
     * Optional examples of how the feature can be used, formatted as strings.
     */
    usageExamples?: string[];
}

/**
 * The definitive list of all features and their taxonomy data.
 * This array serves as the primary data source for the TaxonomyService.
 * Each entry is enriched with metadata to support a comprehensive feature management system.
 */
export const FEATURE_TAXONOMY: FeatureTaxonomy[] = [
    {
        id: "ai-command-center",
        name: "AI Command Center",
        description: "The main entry point. Use natural language to navigate and control the entire toolkit. Can call other tools.",
        category: "Core",
        inputs: "A natural language prompt describing what the user wants to do. Examples: 'explain this code: ...', 'design a theme with space vibes'.",
        tags: ["core", "natural language", "orchestration", "tool router", "AI assistant"],
        status: "stable",
        version: "1.0.0",
        lastUpdated: "2023-10-26T10:00:00Z",
        relatedFeatures: ["ai-code-explainer", "theme-designer", "ai-prompt-engineer"],
        developerNotes: "Central control for user interaction, high priority. Core AI orchestration module.",
        usageExamples: [
            "Explain the concept of reactive programming in TypeScript.",
            "Design a UI theme with a 'cyberpunk' aesthetic.",
            "Find me the best tool for analyzing git logs."
        ]
    },
    {
        id: "ai-code-explainer",
        name: "AI Code Explainer",
        description: "Accepts a code snippet and provides a detailed, structured analysis including summary, line-by-line breakdown, time/space complexity, and suggestions for improvement.",
        category: "AI Tools",
        inputs: "A string containing a code snippet.",
        tags: ["code analysis", "explanation", "complexity", "refactoring", "documentation", "AI assist"],
        status: "stable",
        version: "1.1.0",
        lastUpdated: "2023-10-25T15:30:00Z",
        relatedFeatures: ["ai-pr-summary-generator", "ai-code-migrator", "ai-commit-generator"],
        developerNotes: "Integrates with various language parsers. Focus on comprehensive output and actionable insights.",
        usageExamples: [
            "Explain this JavaScript code: `function factorial(n) { if (n === 0) return 1; return n * factorial(n - 1); }`",
            "Analyze this Python snippet for complexity: `def bubble_sort(arr): n = len(arr); for i in range(n-1): for j in range(0, n-i-1): if arr[j] > arr[j+1]: arr[j], arr[j+1] = arr[j+1], arr[j]`"
        ]
    },
    {
        id: "theme-designer",
        name: "AI Theme Designer",
        description: "Generates a complete UI color theme (primary, background, text colors) from a simple text description.",
        category: "AI Tools",
        inputs: "A string describing the desired aesthetic. Example: 'a calm, minimalist theme for a blog'.",
        tags: ["UI", "design", "colors", "frontend", "branding", "AI assist"],
        status: "stable",
        version: "1.0.0",
        lastUpdated: "2023-10-24T09:15:00Z",
        relatedFeatures: ["ai-command-center"],
        developerNotes: "Uses a generative AI model for color palettes. Explore integration with CSS frameworks and export options.",
        usageExamples: [
            "Design a vibrant, energetic theme for a sports app with a focus on blue and orange.",
            "Create a professional, dark-mode theme for a coding IDE, prioritizing readability.",
            "Generate a subtle, earthy theme for an environmental non-profit website."
        ]
    },
    {
        id: "regex-sandbox",
        name: "RegEx Sandbox",
        description: "Generates a regular expression from a natural language description. Also allows testing expressions against a string.",
        category: "Testing",
        inputs: "A string describing the pattern to match. Example: 'find all email addresses'.",
        tags: ["regex", "pattern matching", "testing", "utility", "text processing"],
        status: "stable",
        version: "1.0.0",
        lastUpdated: "2023-10-23T11:00:00Z",
        relatedFeatures: ["ai-code-explainer"], // Can be used to explain regex generated by this
        developerNotes: "Future: add visual regex builder and common regex pattern library.",
        usageExamples: [
            "Generate regex for valid URLs including http(s) and www.",
            "Test regex `/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/` against string `(123) 456-7890`."
        ]
    },
    {
        id: "pr-summary-generator",
        name: "AI PR Summary Generator",
        description: "Takes 'before' and 'after' code snippets, calculates the diff, and generates a structured pull request summary including a title, a prose description, and a bulleted list of changes.",
        category: "AI Tools",
        inputs: "Two strings: 'beforeCode' and 'afterCode'.",
        tags: ["git", "code review", "documentation", "AI assist", "workflow automation"],
        status: "stable",
        version: "1.0.0",
        lastUpdated: "2023-10-26T14:00:00Z",
        relatedFeatures: ["ai-commit-generator", "visual-git-tree", "ai-code-explainer"],
        developerNotes: "Crucial for development workflow. Emphasize diff accuracy and conciseness in summaries.",
        usageExamples: [
            "Generate a PR summary from old and new code versions of a feature branch.",
            "Create a changelog entry from a code diff for a critical bug fix."
        ]
    },
     {
        id: "visual-git-tree",
        name: "AI Git Log Analyzer",
        description: "Intelligently parses a raw 'git log' output to create a categorized and well-formatted changelog, separating new features from bug fixes.",
        category: "Git",
        inputs: "A string containing the raw output of a 'git log' command.",
        tags: ["git", "history", "changelog", "visualization", "AI assist", "version control"],
        status: "beta",
        version: "0.9.0",
        lastUpdated: "2023-10-22T16:45:00Z",
        relatedFeatures: ["pr-summary-generator", "ai-commit-generator"],
        developerNotes: "Needs robust parsing for various git log formats and commit message conventions.",
        usageExamples: [
            "Analyze `git log --pretty=format:%H%n%s%n%b%n` output to summarize recent development.",
            "Generate a summary of recent commits, highlighting features, fixes, and chores."
        ]
    },
    {
        id: "cron-job-builder",
        name: "AI Cron Job Builder",
        description: "Generates a valid cron expression from a natural language description of a schedule.",
        category: "Deployment",
        inputs: "A string describing a schedule. Example: 'every weekday at 5pm'.",
        tags: ["automation", "scheduling", "deployment", "utility", "devops"],
        status: "stable",
        version: "1.0.0",
        lastUpdated: "2023-10-21T08:30:00Z",
        relatedFeatures: [],
        developerNotes: "Support for various cron syntax extensions (e.g., AWS, standard). Validation is key.",
        usageExamples: [
            "Generate cron for 'run every Monday at 9 AM and Friday at 3 PM'.",
            "What's the cron expression for 'daily at midnight, except weekends'?"
        ]
    },
    {
        id: "ai-code-migrator",
        name: "AI Code Migrator",
        description: "Translate code between languages & frameworks.",
        category: "AI Tools",
        inputs: "A string of code to convert, a string for the source language, and a string for the target language. e.g. 'migrate this SASS to CSS: ...'",
        tags: ["code conversion", "refactoring", "multi-language", "AI assist", "modernization"],
        status: "beta",
        version: "0.9.5",
        lastUpdated: "2023-10-26T11:00:00Z",
        relatedFeatures: ["ai-code-explainer"],
        developerNotes: "Complex feature, requires robust language model for accurate translation and semantic equivalence.",
        usageExamples: [
            "Migrate this Java code to Kotlin, focusing on idiomatic Kotlin patterns.",
            "Convert React class component to functional component with Hooks.",
            "Translate Python 2 code to Python 3."
        ]
    },
    {
        id: "ai-commit-generator",
        name: "AI Commit Message Generator",
        description: "Generates a conventional commit message from a git diff.",
        category: "AI Tools",
        inputs: "A string containing a git diff.",
        tags: ["git", "commit", "conventional commits", "AI assist", "documentation"],
        status: "stable",
        version: "1.0.0",
        lastUpdated: "2023-10-26T09:00:00Z",
        relatedFeatures: ["pr-summary-generator", "visual-git-tree"],
        developerNotes: "Adheres strictly to Conventional Commits specification. Good for maintaining clean git history and automated changelogs.",
        usageExamples: [
            "Generate a commit message for the following diff: `diff --git a/file.js b/file.js ...`",
            "Suggest a `fix` commit message for a bug introduced in the login module.",
            "Create a `feat` commit message for a new user profile page."
        ]
    },
    {
        id: "worker-thread-debugger",
        name: "AI Concurrency Analyzer",
        description: "Analyzes JavaScript code for potential Web Worker concurrency issues like race conditions, deadlocks, and shared memory access problems.",
        category: "Testing",
        inputs: "A string of JavaScript code to analyze for concurrency issues.",
        tags: ["concurrency", "web workers", "debugging", "performance", "JavaScript", "static analysis"],
        status: "experimental",
        version: "0.5.0",
        lastUpdated: "2023-10-20T17:00:00Z",
        relatedFeatures: ["ai-code-explainer"],
        developerNotes: "Advanced static analysis; requires deep understanding of JS runtime and Web Worker patterns. High false-positive rate potential.",
        usageExamples: [
            "Analyze this Web Worker code for race conditions in global state updates: `self.onmessage = (e) => { sharedData.count += e.data; }`",
            "Identify potential deadlocks in shared memory operations between main thread and worker."
        ]
    },
    {
        id: "xbrl-converter",
        name: "XBRL Converter",
        description: "Converts a JSON object into a simplified XBRL-like XML format, facilitating financial data exchange and reporting.",
        category: "Data",
        inputs: "A string containing valid JSON.",
        tags: ["data conversion", "XBRL", "XML", "financial", "reporting", "compliance"],
        status: "beta",
        version: "0.9.0",
        lastUpdated: "2023-10-19T14:00:00Z",
        relatedFeatures: [],
        developerNotes: "Focus on common XBRL taxonomy elements and extensible linkbase support. Performance critical for large datasets.",
        usageExamples: [
            "Convert financial JSON data for quarterly earnings to XBRL for regulatory filing.",
            "Transform stock performance data from JSON to XBRL XML for analysis."
        ]
    },
    {
        id: "ai-prompt-engineer",
        name: "AI Prompt Engineer",
        description: "Helps users craft effective prompts for various AI models, optimizing for clarity, completeness, and desired output format, including few-shot examples.",
        category: "AI Tools",
        inputs: "A description of the desired AI task and initial prompt ideas.",
        tags: ["prompt engineering", "AI interaction", "optimization", "generative AI", "AI assistant"],
        status: "beta",
        version: "0.8.0",
        lastUpdated: "2023-10-27T09:30:00Z",
        relatedFeatures: ["ai-command-center", "ai-code-explainer", "theme-designer", "ai-pr-summary-generator"],
        developerNotes: "Crucial for maximizing AI utility across other tools. Should guide users through prompt structure and best practices.",
        usageExamples: [
            "Optimize a prompt for generating a Python function that sorts an array.",
            "Improve a prompt for creating a marketing slogan for a new coffee brand.",
            "Develop a prompt for summarizing legal documents."
        ]
    },
    {
        id: "ai-data-cleaner",
        name: "AI Data Cleaner",
        description: "Uses AI to identify and suggest corrections for inconsistencies, missing values, outliers, and errors in structured and semi-structured datasets.",
        category: "Data",
        inputs: "A string containing data (e.g., CSV, JSON, XML) and a description of cleaning goals.",
        tags: ["data cleaning", "data quality", "AI assist", "data preparation", "ETL"],
        status: "experimental",
        version: "0.4.0",
        lastUpdated: "2023-10-27T11:00:00Z",
        relatedFeatures: [],
        developerNotes: "Integrates with various data formats. Challenge is handling diverse data anomalies and user-defined cleaning rules.",
        usageExamples: [
            "Clean a CSV file with missing addresses, standardizing state abbreviations.",
            "Standardize date formats and remove duplicate entries in a JSON array of records.",
            "Identify and flag outliers in a numerical dataset."
        ]
    },
    {
        id: "ai-unit-test-generator",
        name: "AI Unit Test Generator",
        description: "Generates unit tests for given code snippets in various languages, focusing on common test cases, edge cases, and mocking dependencies.",
        category: "Testing",
        inputs: "A string containing a code snippet and desired testing framework/language (e.g., 'Jest for JavaScript').",
        tags: ["unit testing", "test automation", "code quality", "AI assist", "TDD"],
        status: "beta",
        version: "0.7.0",
        lastUpdated: "2023-10-28T10:00:00Z",
        relatedFeatures: ["ai-code-explainer", "worker-thread-debugger"],
        developerNotes: "Requires strong understanding of language specifics and testing frameworks. Good for improving code coverage.",
        usageExamples: [
            "Generate Jest unit tests for this React component.",
            "Create Python unit tests for a utility function that processes lists.",
            "Write C# unit tests for a data access layer method."
        ]
    }
];

/**
 * A service class for managing and querying the application's feature taxonomy.
 * It provides methods to retrieve, filter, and search for features,
 * acting as a central repository for tool metadata.
 *
 * This service is designed to be a singleton, providing consistent access
 * to the taxonomy data throughout the application.
 */
export class TaxonomyService {
    private features: FeatureTaxonomy[];
    // A simple mock for usage tracking, for demonstrating market-ready features.
    // In a real application, this would persist to a database or analytics service.
    private featureUsage: Map<string, number> = new Map();

    /**
     * Constructs a new TaxonomyService instance.
     * @param initialFeatures An array of FeatureTaxonomy objects to initialize the service.
     */
    constructor(initialFeatures: FeatureTaxonomy[]) {
        // Deep clone the array to prevent external modifications to the service's internal state.
        this.features = JSON.parse(JSON.stringify(initialFeatures));

        // Initialize mock usage counts for existing features to 0.
        this.features.forEach(feature => this.featureUsage.set(feature.id, 0));
    }

    /**
     * Retrieves all available features.
     * @returns An array of all FeatureTaxonomy objects. Returns a shallow copy to prevent external mutation.
     */
    public getAllFeatures(): FeatureTaxonomy[] {
        return [...this.features];
    }

    /**
     * Retrieves a single feature by its unique ID.
     * @param id The unique identifier of the feature. Case-sensitive.
     * @returns The FeatureTaxonomy object if found, otherwise undefined.
     */
    public getFeatureById(id: string): FeatureTaxonomy | undefined {
        if (!id) {
            console.warn("TaxonomyService.getFeatureById received an empty or null ID.");
            return undefined;
        }
        return this.features.find(feature => feature.id === id);
    }

    /**
     * Retrieves features belonging to a specific category.
     * The category comparison is case-insensitive.
     * @param category The category name to filter by.
     * @returns An array of FeatureTaxonomy objects that match the category. Returns an empty array if no matches or invalid input.
     */
    public getFeaturesByCategory(category: string): FeatureTaxonomy[] {
        if (!category) {
            return [];
        }
        const lowerCaseCategory = category.toLowerCase();
        return this.features.filter(feature =>
            feature.category.toLowerCase() === lowerCaseCategory
        );
    }

    /**
     * Retrieves features that have at least one of the specified tags.
     * The tag comparison is case-insensitive.
     * @param tags An array of tag strings to filter by.
     * @returns An array of FeatureTaxonomy objects that match any of the tags. Returns an empty array if no matches or invalid input.
     */
    public getFeaturesByTags(tags: string[]): FeatureTaxonomy[] {
        if (!tags || tags.length === 0) {
            return [];
        }
        const lowerCaseTags = new Set(tags.map(tag => tag.toLowerCase()));
        return this.features.filter(feature =>
            feature.tags && feature.tags.some(featureTag => lowerCaseTags.has(featureTag.toLowerCase()))
        );
    }

    /**
     * Performs a comprehensive case-insensitive search across feature name, description, inputs, and tags.
     * If the query is empty or just whitespace, all features are returned.
     * @param query The search string.
     * @returns An array of FeatureTaxonomy objects that match the query.
     */
    public searchFeatures(query: string): FeatureTaxonomy[] {
        if (!query || query.trim() === '') {
            return [...this.features]; // If query is empty, return all features
        }
        const lowerCaseQuery = query.toLowerCase();
        return this.features.filter(feature =>
            feature.name.toLowerCase().includes(lowerCaseQuery) ||
            feature.description.toLowerCase().includes(lowerCaseQuery) ||
            feature.inputs.toLowerCase().includes(lowerCaseQuery) ||
            (feature.tags && feature.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery)))
        );
    }

    /**
     * Retrieves all unique categories present in the feature taxonomy.
     * @returns An array of unique category strings, sorted alphabetically.
     */
    public getUniqueCategories(): string[] {
        const categories = new Set<string>();
        this.features.forEach(feature => categories.add(feature.category));
        return Array.from(categories).sort();
    }

    /**
     * Retrieves all unique tags present in the feature taxonomy.
     * @returns An array of unique tag strings, sorted alphabetically.
     */
    public getUniqueTags(): string[] {
        const tags = new Set<string>();
        this.features.forEach(feature => {
            if (feature.tags) {
                feature.tags.forEach(tag => tags.add(tag));
            }
        });
        return Array.from(tags).sort();
    }

    /**
     * Retrieves features based on their lifecycle status.
     * @param status The FeatureStatus to filter by.
     * @returns An array of FeatureTaxonomy objects with the specified status. Returns an empty array if no matches or invalid input.
     */
    public getFeaturesByStatus(status: FeatureStatus): FeatureTaxonomy[] {
        if (!status) {
            return [];
        }
        return this.features.filter(feature => feature.status === status);
    }

    /**
     * Provides a mock recommendation system for features.
     * This implementation prioritizes:
     * 1. Explicitly related features defined in `relatedFeatures`.
     * 2. Other features within the same category.
     * 3. General popular features (based on mock usage count) if more recommendations are needed.
     * It avoids recommending the `currentFeatureId` itself and ensures unique recommendations.
     * @param currentFeatureId The ID of the feature for which recommendations are sought.
     * @param limit The maximum number of recommendations to return (default: 3).
     * @returns An array of recommended FeatureTaxonomy objects.
     */
    public recommendFeatures(currentFeatureId: string, limit: number = 3): FeatureTaxonomy[] {
        const currentFeature = this.getFeatureById(currentFeatureId);
        if (!currentFeature) {
            return [];
        }

        const recommendations: FeatureTaxonomy[] = [];
        const seenIds = new Set<string>([currentFeatureId]); // Avoid recommending the current feature

        // 1. Prioritize explicitly related features
        if (currentFeature.relatedFeatures && currentFeature.relatedFeatures.length > 0) {
            currentFeature.relatedFeatures.forEach(relatedId => {
                if (recommendations.length < limit && !seenIds.has(relatedId)) {
                    const relatedFeature = this.getFeatureById(relatedId);
                    if (relatedFeature) {
                        recommendations.push(relatedFeature);
                        seenIds.add(relatedId);
                    }
                }
            });
        }

        // 2. Add features from the same category, ordered by mock usage
        if (recommendations.length < limit) {
            const categoryFeatures = this.getFeaturesByCategory(currentFeature.category)
                                         .filter(f => !seenIds.has(f.id))
                                         .sort((a, b) => (this.featureUsage.get(b.id) || 0) - (this.featureUsage.get(a.id) || 0));

            for (const feature of categoryFeatures) {
                if (recommendations.length < limit) {
                    recommendations.push(feature);
                    seenIds.add(feature.id);
                } else {
                    break;
                }
            }
        }

        // 3. Fill up with general popular features from other categories if still needed
        if (recommendations.length < limit) {
            const allOtherFeatures = this.features
                .filter(f => !seenIds.has(f.id))
                // Sort by mock usage count (most used first)
                .sort((a, b) => (this.featureUsage.get(b.id) || 0) - (this.featureUsage.get(a.id) || 0));

            for (const feature of allOtherFeatures) {
                if (recommendations.length < limit) {
                    recommendations.push(feature);
                    seenIds.add(feature.id);
                } else {
                    break;
                }
            }
        }

        return recommendations;
    }

    /**
     * Mocks tracking the usage of a feature.
     * In a real application, this would send data to an analytics backend (e.g., Google Analytics, Amplitude).
     * This method increments an internal counter for demonstration purposes.
     * @param featureId The ID of the feature being used.
     */
    public trackFeatureUsage(featureId: string): void {
        if (this.featureUsage.has(featureId)) {
            const currentCount = this.featureUsage.get(featureId) || 0;
            this.featureUsage.set(featureId, currentCount + 1);
            // console.debug(`Feature '${featureId}' usage tracked. New count: ${currentCount + 1}`);
        } else {
            console.warn(`Attempted to track usage for unknown feature ID: ${featureId}. Initializing count to 1.`);
            this.featureUsage.set(featureId, 1); // Initialize if somehow new ID appears
        }
    }

    /**
     * Retrieves the mock usage count for a specific feature.
     * @param featureId The ID of the feature.
     * @returns The usage count, or 0 if the feature ID is unknown or has not been tracked.
     */
    public getFeatureUsageCount(featureId: string): number {
        return this.featureUsage.get(featureId) || 0;
    }

    /**
     * Resets the mock usage count for a specific feature or all features.
     * This is primarily for testing or development purposes.
     * @param featureId Optional. The ID of the feature to reset. If not provided, all usage counts are reset.
     */
    public resetFeatureUsage(featureId?: string): void {
        if (featureId) {
            if (this.featureUsage.has(featureId)) {
                this.featureUsage.set(featureId, 0);
                // console.debug(`Usage for feature '${featureId}' reset.`);
            } else {
                console.warn(`Attempted to reset usage for unknown feature ID: ${featureId}.`);
            }
        } else {
            this.featureUsage.clear();
            this.features.forEach(feature => this.featureUsage.set(feature.id, 0));
            // console.debug("All feature usage counts reset.");
        }
    }

    /**
     * Retrieves features that have been updated since a specific date.
     * @param sinceDate A Date object or ISO string representing the cutoff date.
     * @returns An array of features updated on or after the given date.
     */
    public getFeaturesUpdatedSince(sinceDate: Date | string): FeatureTaxonomy[] {
        const cutoffDate = (typeof sinceDate === 'string') ? new Date(sinceDate) : sinceDate;
        if (isNaN(cutoffDate.getTime())) {
            console.error("Invalid date provided for getFeaturesUpdatedSince.");
            return [];
        }
        return this.features.filter(feature => {
            if (feature.lastUpdated) {
                const featureUpdateDate = new Date(feature.lastUpdated);
                return !isNaN(featureUpdateDate.getTime()) && featureUpdateDate >= cutoffDate;
            }
            return false;
        });
    }
}

/**
 * The singleton instance of the TaxonomyService.
 * This ensures that all parts of the application use the same, consistent
 * set of feature taxonomy data and interaction logic.
 * It's initialized with the static FEATURE_TAXONOMY data.
 */
export const taxonomyService = new TaxonomyService(FEATURE_TAXONOMY);

// --- Initial Mock Usage Tracking (Simulating common user interactions upon app launch) ---
// These calls demonstrate how `trackFeatureUsage` would be invoked from other parts of the application
// when a user interacts with a feature, allowing for mock analytics and recommendation logic.
taxonomyService.trackFeatureUsage("ai-command-center");
taxonomyService.trackFeatureUsage("ai-command-center");
taxonomyService.trackFeatureUsage("ai-command-center"); // AI Command Center is often used
taxonomyService.trackFeatureUsage("ai-code-explainer");
taxonomyService.trackFeatureUsage("ai-code-explainer"); // Code Explainer is popular
taxonomyService.trackFeatureUsage("theme-designer");
taxonomyService.trackFeatureUsage("pr-summary-generator");
taxonomyService.trackFeatureUsage("ai-commit-generator"); // Dev tools get used often
taxonomyService.trackFeatureUsage("ai-commit-generator");
taxonomyService.trackFeatureUsage("ai-prompt-engineer");
taxonomyService.trackFeatureUsage("cron-job-builder");
taxonomyService.trackFeatureUsage("regex-sandbox");
taxonomyService.trackFeatureUsage("ai-code-migrator");
taxonomyService.trackFeatureUsage("ai-code-explainer"); // More usage for explainer
taxonomyService.trackFeatureUsage("ai-command-center"); // More usage for command center

// Verify some initial usages
// console.log(`AI Command Center usage: ${taxonomyService.getFeatureUsageCount("ai-command-center")}`); // Expected: 4
// console.log(`AI Code Explainer usage: ${taxonomyService.getFeatureUsageCount("ai-code-explainer")}`); // Expected: 3
// console.log(`AI Unit Test Generator usage: ${taxonomyService.getFeatureUsageCount("ai-unit-test-generator")}`); // Expected: 0
