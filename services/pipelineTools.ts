/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// This file provides documentation for available pipeline functions for the AI model.

export const PIPELINE_TOOLS_DOCUMENTATION = `
/*
 * Available Tools for Pipeline Generation
 *
 * You must import any of these functions from './services/index.ts'.
 * You must construct a pipeline that logically chains these functions together.
 * The output of one step should be used as the input for the next.
 * You may need to transform the data between steps. The final function should be named \`runPipeline\`.
 */

/**
 * Explains a code snippet, providing a structured analysis.
 * @param {string} code - The code snippet to analyze.
 * @returns {Promise<object>} A promise resolving to an object with summary, line-by-line analysis, complexity, and suggestions.
 */
// import { explainCodeStructured } from './services/index.ts';
// signature: explainCodeStructured(code: string): Promise<StructuredExplanation>

/**
 * Generates a UI color theme from a text description.
 * @param {string} description - A text description of the desired theme (e.g., "a dark, cyberpunk theme").
 * @returns {Promise<object>} A promise resolving to an object with theme colors.
 */
// import { generateThemeFromDescription } from './services/index.ts';
// signature: generateThemeFromDescription(description: string): Promise<ColorTheme>

/**
 * Generates a regular expression from a description.
 * @param {string} description - A text description of the pattern to match (e.g., "a valid email address").
 * @returns {Promise<string>} A promise resolving to a string containing the regex literal.
 */
// import { generateRegEx } from './services/index.ts';
// signature: generateRegEx(description: string): Promise<string>

/**
 * Generates a conventional commit message from a git diff.
 * @param {string} diff - A string containing the git diff.
 * @returns {Promise<string>} A promise resolving to the commit message string.
 */
// import { generateCommitMessage } from './services/index.ts';
// signature: generateCommitMessage(diff: string): Promise<string>

/**
 * Generates unit tests for a given code snippet.
 * @param {string} code - The code to generate tests for.
 * @returns {Promise<string>} A promise resolving to a string containing the unit test code.
 */
// import { generateUnitTests } from './services/index.ts';
// signature: generateUnitTests(code: string): Promise<string>

/**
 * Migrates code from one language/framework to another.
 * @param {string} code - The source code to migrate.
 * @param {string} from - The source language/framework (e.g., "SASS").
 * @param {string} to - The target language/framework (e.g., "CSS").
 * @returns {Promise<string>} A promise resolving to a string of the migrated code.
 */
// import { migrateCode } from './services/index.ts';
// signature: migrateCode(code: string, from: string, to: string): Promise<string>

/**
 * Converts a JSON string to a simplified XBRL-like XML format.
 * @param {string} json - The JSON string to convert.
 * @returns {Promise<string>} A promise resolving to the XML string.
 */
// import { convertJsonToXbrl } from './services/index.ts';
// signature: convertJsonToXbrl(json: string): Promise<string>

/**
 * Generates a cron expression from a natural language description.
 * @param {string} description - A text description of the schedule (e.g., "every weekday at 5pm").
 * @returns {Promise<object>} A promise resolving to an object with cron parts.
 */
// import { generateCronFromDescription } from './services/index.ts';
// signature: generateCronFromDescription(description: string): Promise<CronParts>

/**
 * Generates a changelog from a raw git log.
 * @param {string} log - The raw git log output.
 * @returns {Promise<string>} A promise resolving to a markdown string of the changelog.
 */
// import { generateChangelogFromLog } from './services/index.ts';
// signature: generateChangelogFromLog(log: string): Promise<string>

/**
 * Generates a structured Pull Request summary from a code diff.
 * @param {string} diff - The git diff string.
 * @returns {Promise<object>} A promise resolving to an object with title, summary, and changes.
 */
// import { generatePrSummaryStructured } from './services/index.ts';
// signature: generatePrSummaryStructured(diff: string): Promise<StructuredPrSummary>

/**
 * Generates a color palette from a base color.
 * @param {string} baseColor - A hex code for the base color (e.g., "#0047AB").
 * @returns {Promise<object>} A promise resolving to an object containing an array of color hex codes.
 */
// import { generateColorPalette } from './services/index.ts';
// signature: generateColorPalette(baseColor: string): Promise<{ colors: string[] }>

/**
 * Reviews a code snippet for issues and improvements.
 * @param {string} code - The code to review.
 * @returns {Promise<string>} A promise resolving to a markdown string with the review.
 */
// import { reviewCode } from './services/index.ts';
// signature: reviewCode(code: string): Promise<string>

/**
 * Generates an image from a text prompt.
 * @param {string} prompt - The text prompt describing the image.
 * @returns {Promise<string>} A promise resolving to a data URL of the generated image.
 */
// import { generateImage } from './services/index.ts';
// signature: generateImage(prompt: string): Promise<string>
`;

export const featureToFunctionMap: Record<string, string> = {
    'ai-code-explainer': 'explainCodeStructured',
    'theme-designer': 'generateThemeFromDescription',
    'regex-sandbox': 'generateRegEx',
    'ai-commit-generator': 'generateCommitMessage',
    'ai-unit-test-generator': 'generateUnitTests',
    'ai-code-migrator': 'migrateCode',
    'xbrl-converter': 'convertJsonToXbrl',
    'cron-job-builder': 'generateCronFromDescription',
    'changelog-generator': 'generateChangelogFromLog',
    'ai-pull-request-assistant': 'generatePrSummaryStructured',
    'color-palette-generator': 'generateColorPalette',
    'code-review-bot': 'reviewCode',
    'ai-image-generator': 'generateImage',
};
