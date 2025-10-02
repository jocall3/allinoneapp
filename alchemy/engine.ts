// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { generateJson } from '../services/geminiCore';
import type { Feature } from '../types';
import type { SemanticFeature, FeatureCatalog } from './types';
import { Type } from "@google/genai";

const semanticFeatureSchema = {
    type: Type.OBJECT,
    properties: {
        purpose: { 
            type: Type.STRING, 
            description: "A concise, one-sentence summary of what this tool's primary function is." 
        },
        expectedInput: { 
            type: Type.STRING, 
            description: "A short phrase describing the main type of data this tool takes as input (e.g., 'code snippet', 'natural language prompt', 'image data')."
        },
        primaryOutput: {
            type: Type.STRING,
            description: "A short phrase describing the main type of data this tool produces (e.g., 'markdown report', 'generated code', 'JSON object')."
        },
        potentialConnections: {
            type: Type.ARRAY,
            description: "An array of 2-3 other tool IDs that could logically follow this one in a workflow.",
            items: { type: Type.STRING }
        }
    },
    required: ["purpose", "expectedInput", "primaryOutput", "potentialConnections"]
};


export class AlchemistEngine {
    private catalog: FeatureCatalog = {};

    constructor() {
        console.log("Alchemist Engine awakening...");
    }

    /**
     * Analyzes a list of features to build a semantic catalog of the application's capabilities.
     * @param features - An array of Feature objects to be cataloged.
     */
    async buildCatalog(features: Feature[]): Promise<FeatureCatalog> {
        const systemInstruction = `You are an expert software architect analyzing a developer toolkit. Your task is to understand what each tool does and how it might connect to others.`;

        for (const feature of features) {
            if (this.catalog[feature.id]) {
                continue; // Skip if already cataloged
            }

            const prompt = `Analyze the following tool:\n\nName: "${feature.name}"\nDescription: "${feature.description}"\nCategory: "${feature.category}"\n\nBased on this information, provide its semantic properties.`;
            
            try {
                const analysisResult = await generateJson<Omit<SemanticFeature, 'id' | 'name'>>(
                    prompt,
                    systemInstruction,
                    semanticFeatureSchema
                );
                
                this.catalog[feature.id] = {
                    id: feature.id,
                    name: feature.name,
                    ...analysisResult,
                };

            } catch (error) {
                console.error(`Failed to analyze feature "${feature.name}":`, error);
            }
        }

        return this.catalog;
    }

    /**
     * Retrieves the current state of the feature catalog.
     */
    get aCatalog(): FeatureCatalog {
        return this.catalog;
    }
}
