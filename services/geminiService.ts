// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { GoogleGenAI, Type } from "@google/genai";
import type { OrganizationSuggestion, FileNode, DashboardData } from '../types';
import * as db from './database';
import { readFileContent } from './fileSystemService';

const MODEL_NAME = 'gemini-2.5-flash';
// FIX: Use VITE_GEMINI_API_KEY consistent with vite.config.ts and .env.local
const API_KEY = process.env.VITE_GEMINI_API_KEY; 

if (!API_KEY) {
  // FIX: Updated error message for consistency.
  throw new Error("VITE_GEMINI_API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const organizationSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      folderName: {
        type: Type.STRING,
        description: 'The suggested name for the new folder.',
      },
      fileNames: {
        type: Type.ARRAY,
        description: 'An array of file names that should be moved into this folder.',
        items: {
          type: Type.STRING,
        },
      },
    },
    required: ["folderName", "fileNames"],
  },
};

const dashboardSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A concise, one-paragraph summary of the folder's purpose and contents."
    },
    projectType: {
      type: Type.STRING,
      description: "A short label for the detected project type (e.g., 'React Application', 'Image Collection', 'Python Scripts', 'Document Archive')."
    },
    keyFiles: {
      type: Type.ARRAY,
      description: "An array of the 3-5 most important files in this directory.",
      items: {
        type: Type.OBJECT,
        properties: {
          fileName: { type: Type.STRING, description: "The name of the key file." },
          reason: { type: Type.STRING, description: "A brief, one-sentence reason why this file is important." }
        },
        required: ['fileName', 'reason']
      }
    },
    suggestedActions: {
      type: Type.ARRAY,
      description: "A list of 2-3 suggested next actions for the user.",
      items: {
        type: Type.OBJECT,
        properties: {
          action: { type: Type.STRING, description: "A short, actionable suggestion (e.g., 'Install dependencies')." },
          command: { type: Type.STRING, description: "An optional terminal command related to the action (e.g., 'npm install')." }
        },
        required: ['action']
      }
    },
    techStack: {
      type: Type.ARRAY,
      description: "A list of technologies, libraries, or frameworks detected in the folder.",
      items: { type: Type.STRING }
    }
  },
  required: ['summary', 'projectType', 'keyFiles', 'suggestedActions', 'techStack']
};


export async function suggestOrganization(fileNames: string[]): Promise<OrganizationSuggestion[]> {
  if (fileNames.length === 0) return [];
  const prompt = `Given the following list of file names, suggest a folder structure... File list: ${fileNames.join(', ')}`;
  const response = await ai.models.generateContent({ model: MODEL_NAME, contents: prompt, config: { responseMimeType: "application/json", responseSchema: organizationSchema }});
  const suggestions = JSON.parse(response.text.trim()) as OrganizationSuggestion[];
  const validFileNames = new Set(fileNames);
  return suggestions.map(s => ({ ...s, fileNames: s.fileNames.filter(f => validFileNames.has(f)) })).filter(s => s.fileNames.length > 0);
}

export async function explainFolder(fileNames: string[]): Promise<string> {
  if (fileNames.length === 0) return "This folder is empty.";
  const prompt = `Based on these filenames, summarize the folder's purpose: ${fileNames.join(', ')}`;
  const response = await ai.models.generateContent({ model: MODEL_NAME, contents: prompt });
  return response.text;
}

export async function generatePreview(fileName: string, fileContent: string): Promise<string> {
    const prompt = `Provide a very brief, one-sentence summary of the file named "${fileName}". Content excerpt: "${fileContent.substring(0, 2000)}"`;
    const response = await ai.models.generateContent({ model: MODEL_NAME, contents: prompt });
    return response.text;
}

export async function performSemanticSearch(query: string, rootHandle: FileSystemDirectoryHandle): Promise<FileNode[]> {
    const allDbFiles = await db.getAllFilesFromDB();
    const filesWithContent = await Promise.all(
        allDbFiles.filter(f => !f.isDirectory).map(async f => {
            try {
                const handle = await rootHandle.getFileHandle(f.path.split('/').slice(1).join('/'), { create: false });
                const content = await readFileContent(handle);
                return { name: f.path, content: content.substring(0, 4000) };
            } // FIX: Catch any errors during readFileContent (e.g., file not existing or permission denied)
            catch (error) { 
                console.warn(`Could not read content for semantic search: ${f.path}`, error);
                return null;
            }
        })
    );

    const validFiles = filesWithContent.filter(Boolean) as { name: string, content: string }[];
    const prompt = `Search for: "${query}". From the files provided, return a JSON array of the full file paths that are most relevant. Files: ${JSON.stringify(validFiles)}`;
    const response = await ai.models.generateContent({ model: MODEL_NAME, contents: prompt, config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } } }});
    const relevantPaths = JSON.parse(response.text.trim()) as string[];
    
    const relevantFileNodes: FileNode[] = [];
    for(const path of relevantPaths) {
        const file = allDbFiles.find(f => f.path === path);
        if (file) {
            try {
                const handle = await rootHandle.getFileHandle(file.path.split('/').slice(1).join('/'), { create: false });
                relevantFileNodes.push({ ...file, handle });
            } catch (error) { // FIX: Catch errors for getFileHandle during semantic search
                console.warn(`Could not get handle for relevant file ${file.path} after semantic search.`, error);
            }
        }
    }
    return relevantFileNodes;
}

export async function performContextualAction(action: 'summarize' | 'explain_code', fileContent: string): Promise<string> {
    let prompt = '';
    switch (action) {
        case 'summarize':
            prompt = `Provide a detailed summary of the following document:\n---\n${fileContent}\n---`;
            break;
        case 'explain_code':
            prompt = `Provide a detailed explanation of the following code:\n---\n${fileContent}\n---`;
            break;
    }
    const response = await ai.models.generateContent({ model: MODEL_NAME, contents: prompt });
    return response.text;
}

export async function generateProjectDashboard(files: FileNode[]): Promise<DashboardData> {
  const fileList = files.map(f => `${f.name}${f.isDirectory ? '/' : ` (${f.size} bytes)`}`).join('\n');
  const prompt = `
    As a senior project manager AI, analyze the following file list from a directory and provide a structured overview.

    File List:
    ---
    ${fileList}
    ---

    Based on this list, generate a JSON object that provides a summary, identifies the project type, lists key files, suggests next actions, and identifies the tech stack. Be concise and helpful.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: dashboardSchema,
    }
  });
  
  const dashboardData = JSON.parse(response.text.trim()) as DashboardData;
  const validFileNames = new Set(files.map(f => f.name));
  dashboardData.keyFiles = dashboardData.keyFiles.filter(kf => validFileNames.has(kf.fileName));

  return dashboardData;
}