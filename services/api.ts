/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { streamContent, generateJson, generateContent } from './geminiCore';
import type { ColorTheme, StructuredExplanation, StructuredPrSummary, GeneratedFile, CronParts } from '../types';
import { Type } from "@google/genai";

// FIX: Implement all missing API functions that are used by the feature components.

export const debugErrorStream = (error: Error) => {
    const prompt = `A developer is facing an error in their application. Explain the error in a clear, concise way and suggest possible causes and solutions. Be helpful and encouraging. Format the output as Markdown.

    **Error Message:** ${error.message}
    **Stack Trace:**
    ${error.stack}`;
    return streamContent(prompt, "You are an expert software debugger and a helpful AI assistant.");
};

export const generateCommitMessageStream = (diff: string) => {
    const prompt = `Based on the following git diff, generate a conventional commit message. The message should follow the format: <type>(<scope>): <subject>. The body should explain the 'what' and 'why' of the changes. Do not wrap the output in markdown backticks.

    **Git Diff:**
    \`\`\`diff
    ${diff}
    \`\`\`
    `;
    return streamContent(prompt, "You are an expert at writing conventional commit messages based on git diffs.");
};

const structuredExplanationSchema = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING, description: 'A high-level summary of what the code does.' },
        lineByLine: {
            type: Type.ARRAY,
            description: 'A line-by-line explanation of the code.',
            items: {
                type: Type.OBJECT,
                properties: {
                    lines: { type: Type.STRING, description: 'The line number or range (e.g., "1-5").' },
                    explanation: { type: Type.STRING, description: 'The explanation for that line/range.' },
                },
                required: ['lines', 'explanation'],
            },
        },
        complexity: {
            type: Type.OBJECT,
            description: 'The time and space complexity of the code.',
            properties: {
                time: { type: Type.STRING, description: 'Big O notation for time complexity (e.g., "O(n^2)").' },
                space: { type: Type.STRING, description: 'Big O notation for space complexity (e.g., "O(1)").' },
            },
            required: ['time', 'space'],
        },
        suggestions: {
            type: Type.ARRAY,
            description: 'A list of suggestions for improving or refactoring the code.',
            items: { type: Type.STRING },
        },
    },
    required: ['summary', 'lineByLine', 'complexity', 'suggestions'],
};

export const explainCodeStructured = (code: string): Promise<StructuredExplanation> => {
    const prompt = `Analyze the following code snippet and provide a structured explanation.
    
    **Code:**
    \`\`\`
    ${code}
    \`\`\`
    `;
    return generateJson<StructuredExplanation>(prompt, "You are an expert code analyst that provides structured explanations in JSON format.", structuredExplanationSchema);
};

export const migrateCodeStream = (code: string, from: string, to: string) => {
    const prompt = `Translate the following code snippet from ${from} to ${to}. Provide only the translated code, wrapped in a markdown code block with the appropriate language identifier.

    **Code to translate:**
    \`\`\`${from.toLowerCase()}
    ${code}
    \`\`\`
    `;
    return streamContent(prompt, "You are an expert programmer specializing in code translation and migration between languages and frameworks.");
};

export const generateUnitTestsStream = (code: string) => {
    const prompt = `Generate unit tests for the following code snippet. Use a popular testing framework relevant to the code's language (e.g., Jest/RTL for React, pytest for Python). Provide only the test code, wrapped in a markdown code block.
    
    **Code:**
    \`\`\`
    ${code}
    \`\`\`
    `;
    return streamContent(prompt, "You are a software quality engineer who writes thorough and effective unit tests.");
};

export const transcribeAudioToCodeStream = (base64Audio: string, mimeType: string) => {
    const audioPart = { inlineData: { data: base64Audio, mimeType } };
    const textPart = { text: "Transcribe the following audio, which is a developer dictating code. Generate only the code they describe, wrapped in a markdown code block." };
    const prompt = { parts: [audioPart, textPart] };
    return streamContent(prompt, "You are an expert programmer that can write code from audio dictation.");
};

export const generateChangelogFromLogStream = (log: string) => {
    const prompt = `Analyze the following raw 'git log' output and generate a categorized and well-formatted changelog in Markdown. Group changes by type (e.g., Features, Bug Fixes).
    
    **Git Log:**
    ${log}
    `;
    return streamContent(prompt, "You are a release manager who creates clean, user-friendly changelogs from git history.");
};

export const formatCodeStream = (code: string) => {
    const prompt = `Format the following code snippet according to standard conventions for its language. Return only the formatted code, wrapped in a markdown code block.
    
    **Code:**
    \`\`\`
    ${code}
    \`\`\`
    `;
    return streamContent(prompt, "You are an expert code formatter, similar to Prettier.");
};

export const reviewCodeStream = (code: string) => {
    const prompt = `Provide a detailed code review for the following snippet. Identify potential bugs, style issues, and areas for improvement. Format your review as Markdown.
    
    **Code:**
    \`\`\`
    ${code}
    \`\`\`
    `;
    return streamContent(prompt, "You are a senior software engineer providing a constructive code review.");
};

export const summarizeNotesStream = (notes: string) => {
    const prompt = `Summarize the following notes into a concise overview. Identify key themes and action items. Format as Markdown.
    
    **Notes:**
    ${notes}
    `;
    return streamContent(prompt, "You are a helpful assistant that summarizes meeting notes and ideas.");
};

export const generatePipelineCode = (flowDescription: string): Promise<string> => {
    const prompt = `Based on the following described workflow, generate a single JavaScript async function named 'runPipeline' that imports and calls the necessary tool functions to accomplish the task. Assume all tool functions are available via an import like \`import { toolName } from './services/index.ts';\`.
    
    **Workflow:**
    ${flowDescription}
    `;
    return generateContent(prompt, "You are an expert software engineer who writes pipeline code to connect various tools and services.");
};

export const generateRegExStream = (description: string) => {
    const prompt = `Generate a JavaScript regular expression literal (e.g., /pattern/flags) that matches the following description: "${description}". Return only the regex literal itself, with no explanation or backticks.`;
    return streamContent(prompt, "You are an expert in regular expressions.");
};

export const generateComponentFromImageStream = (base64Image: string) => {
    const imagePart = { inlineData: { data: base64Image, mimeType: 'image/png' } };
    const textPart = { text: "Analyze this image of a UI component and generate the React + Tailwind CSS code to build it. Only output the code, wrapped in a markdown code block." };
    const prompt = { parts: [imagePart, textPart] };
    return streamContent(prompt, "You are an expert frontend developer specializing in React and Tailwind CSS that creates code from images.");
};

export const enhanceSnippetStream = (code: string) => {
    const prompt = `Enhance the following code snippet by adding comments, improving clarity, and adding error handling where appropriate. Return only the enhanced code, wrapped in a markdown code block.
    
    **Code:**
    \`\`\`
    ${code}
    \`\`\`
    `;
    return streamContent(prompt, "You are a senior developer who refactors code for clarity and robustness.");
};

export const analyzeConcurrencyStream = (code: string) => {
    const prompt = `Analyze the following JavaScript code for potential concurrency issues, specifically related to Web Workers (e.g., race conditions, deadlocks, incorrect use of shared memory). Provide a detailed analysis and suggestions for fixes, formatted as Markdown.
    
    **Code:**
    \`\`\`javascript
    ${code}
    \`\`\`
    `;
    return streamContent(prompt, "You are an expert in concurrent programming and JavaScript Web Workers.");
};

export const convertJsonToXbrlStream = (json: string) => {
    const prompt = `Convert the following JSON data into a simplified, human-readable XBRL-like XML format. The XML should be well-structured and represent the hierarchy of the JSON data. Return only the XML output, wrapped in a markdown code block.
    
    **JSON:**
    \`\`\`json
    ${json}
    \`\`\`
    `;
    return streamContent(prompt, "You are a data transformation specialist converting JSON to a simplified XBRL-like XML format.");
};


const generatedFileSchema = {
    type: Type.ARRAY,
    description: "An array of files to be generated.",
    items: {
        type: Type.OBJECT,
        properties: {
            filePath: { type: Type.STRING, description: "The full path for the file, including the extension (e.g., 'src/components/MyComponent.tsx')." },
            content: { type: Type.STRING, description: "The code or text content of the file." },
            description: { type: Type.STRING, description: "A brief, one-sentence description of the file's purpose." },
        },
        required: ["filePath", "content"],
    }
};

export const generateFeature = (prompt: string): Promise<GeneratedFile[]> => {
    const fullPrompt = `Generate the necessary files to implement the following feature. The user is asking for: "${prompt}". Provide file paths, content, and a brief description for each file.`;
    return generateJson<GeneratedFile[]>(fullPrompt, "You are a full-stack software engineer that scaffolds new features by generating all the necessary files.", generatedFileSchema);
};

const structuredPrSummarySchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A concise, conventional commit style title for the pull request." },
        summary: { type: Type.STRING, description: "A paragraph summarizing the purpose and key changes of the pull request." },
        changes: {
            type: Type.ARRAY,
            description: "A bullet-point list of the most important individual changes.",
            items: { type: Type.STRING }
        },
    },
    required: ["title", "summary", "changes"],
};

export const generatePrSummaryStructured = (diff: string): Promise<StructuredPrSummary> => {
    const prompt = `Analyze the following git diff and generate a structured summary for a pull request.
    
    **Diff:**
    \`\`\`diff
    ${diff}
    \`\`\`
    `;
    return generateJson<StructuredPrSummary>(prompt, "You are an expert at writing clear and concise pull request summaries from code diffs.", structuredPrSummarySchema);
};

const colorPaletteSchema = {
    type: Type.OBJECT,
    properties: {
        colors: {
            type: Type.ARRAY,
            description: "An array of 6 hex color codes, from lightest to darkest.",
            items: { type: Type.STRING }
        },
    },
    required: ["colors"],
};

export const generateColorPalette = (baseColor: string): Promise<{ colors: string[] }> => {
    const prompt = `Generate a harmonious 6-color palette based on the primary color: ${baseColor}. The palette should range from a very light tint to a very dark shade of the base color.`;
    return generateJson<{ colors: string[] }>(prompt, "You are a professional UI/UX designer specializing in color theory.", colorPaletteSchema);
};

const cronPartsSchema = {
    type: Type.OBJECT,
    properties: {
        minute: { type: Type.STRING },
        hour: { type: Type.STRING },
        dayOfMonth: { type: Type.STRING },
        month: { type: Type.STRING },
        dayOfWeek: { type: Type.STRING },
    },
    required: ["minute", "hour", "dayOfMonth", "month", "dayOfWeek"],
};

export const generateCronFromDescription = (description: string): Promise<CronParts> => {
    const prompt = `Convert the following natural language description of a schedule into its component cron parts: "${description}". Current year is 2024.`;
    return generateJson<CronParts>(prompt, "You are an expert system administrator who converts natural language into cron expressions.", cronPartsSchema);
};

export const generateCodingChallengeStream = (topic: string | null) => {
    const prompt = `Generate a unique, interesting coding challenge for a developer. ${topic ? `The challenge should be related to: ${topic}.` : ''}
    
    The output should be well-structured in Markdown and include:
    - A title
    - A clear problem description
    - Input and output specifications
    - At least one example
    - Constraints or edge cases to consider
    `;
    return streamContent(prompt, "You are a programming instructor creating coding challenges.");
};

const colorThemeSchema = {
    type: Type.OBJECT,
    properties: {
        primary: { type: Type.STRING, description: "The primary accent color (e.g., for buttons, links)." },
        background: { type: Type.STRING, description: "The main background color of the app." },
        surface: { type: Type.STRING, description: "The color for card backgrounds or surfaces on top of the main background." },
        textPrimary: { type: Type.STRING, description: "The color for primary text like headings." },
        textSecondary: { type: Type.STRING, description: "The color for secondary, less important text." },
    },
    required: ["primary", "background", "surface", "textPrimary", "textSecondary"],
};

export const generateThemeFromDescription = (description: string): Promise<ColorTheme> => {
    const prompt = `Generate a complete UI color theme from the following description: "${description}". Provide hex codes for each color.`;
    return generateJson<ColorTheme>(prompt, "You are a UI/UX designer creating a color theme in JSON format.", colorThemeSchema);
};

export const transferCodeStyleStream = (args: { code: string, styleGuide: string }) => {
    const { code, styleGuide } = args;
    const prompt = `Rewrite the following code snippet to match the provided style guide. Return only the rewritten code in a markdown block.
    
    **Style Guide:**
    ${styleGuide}
    
    **Original Code:**
    \`\`\`
    ${code}
    \`\`\`
    `;
    return streamContent(prompt, "You are an AI programming assistant that refactors code to match specific style guides.");
};
