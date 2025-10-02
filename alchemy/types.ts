// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import type { Feature } from '../types';

/**
 * Represents the AI's semantic understanding of a single feature.
 */
export interface SemanticFeature {
    id: string;
    name: string;
    // The core purpose of the feature, as understood by the AI.
    purpose: string; 
    // What kind of data or input does this feature primarily operate on?
    // e.g., "code_snippet", "git_diff", "natural_language_prompt", "image_data"
    expectedInput: string;
    // What is the primary output or result of this feature?
    // e.g., "markdown_report", "generated_code", "json_object", "image_url"
    primaryOutput: string;
    // A list of other feature IDs that this feature could logically connect to.
    // e.g., The output of 'AiCodeExplainer' could be the input for 'TechnicalWhitepaperDrafter'.
    potentialConnections: string[];
}

/**
 * The complete, self-generated knowledge base of the application's capabilities.
 * The keys are the feature IDs.
 */
export type FeatureCatalog = Record<string, SemanticFeature>;
