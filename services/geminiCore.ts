// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Type, GenerateContentResponse, FunctionDeclaration, Modality } from "@google/genai";
import { logError } from './telemetryService';

// FIX: Use VITE_GEMINI_API_KEY consistent with vite.config.ts and .env.local
const API_KEY = process.env.VITE_GEMINI_API_KEY; 
if (!API_KEY) {
  // FIX: Updated error message for consistency.
  throw new Error("API key not found. Please set the VITE_GEMINI_API_KEY environment variable.");
}

export const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function* streamContent(prompt: string | { parts: any[] }, systemInstruction: string, temperature = 0.5) {
    try {
        const response = await ai.models.generateContentStream({ model: 'gemini-2.5-flash', contents: prompt as any, config: { systemInstruction, temperature } });
        for await (const chunk of response) { 
            yield chunk.text; 
        }
    } catch (error) {
        console.error("Error streaming from AI model:", error);
        logError(error as Error, { prompt, systemInstruction });
        if (error instanceof Error) { 
            yield `An error occurred while communicating with the AI model: ${error.message}`; 
        } else { 
            yield "An unknown error occurred while generating the response."; 
        }
    }
}

export async function generateContent(prompt: string, systemInstruction: string, temperature = 0.5): Promise<string> {
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { systemInstruction, temperature } });
        return response.text;
    } catch (error) {
         console.error("Error generating content from AI model:", error);
        logError(error as Error, { prompt, systemInstruction });
        throw error;
    }
}

export async function generateContentWithImage(prompt: string, base64Image: string, mimeType: string): Promise<string> {
    const imagePart = { inlineData: { data: base64Image, mimeType } };
    const textPart = { text: prompt };
    const contents = { parts: [imagePart, textPart] };
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents });
        return response.text;
    } catch (error) {
        console.error("Error generating content with image from AI model:", error);
        logError(error as Error, { prompt, hasImage: true });
        throw error;
    }
}

export async function generateJson<T>(prompt: string, systemInstruction: string, schema: any, temperature = 0.2): Promise<T> {
    try {
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { systemInstruction, responseMimeType: "application/json", responseSchema: schema, temperature } });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error generating JSON from AI model:", error);
        logError(error as Error, { prompt, systemInstruction });
        throw error;
    }
}

export const consumeStream = async (stream: AsyncGenerator<string, void, unknown>): Promise<string> => {
    let result = '';
    for await (const chunk of stream) {
        result += chunk;
    }
    return result;
};

export const generateImage = async (prompt: string): Promise<string> => {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: { numberOfImages: 1, outputMimeType: 'image/png' },
    });

    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/png;base64,${base64ImageBytes}`;
};

export const generateImageFromImageAndText = async (prompt: string, base64Image: string, mimeType: string): Promise<string> => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:image/png;base64,${base64ImageBytes}`;
      }
    }
    
    // Fallback if no image is returned, which can happen.
    if(response.text) {
        throw new Error(`The AI responded with text instead of an image: "${response.text}"`);
    }
    
    throw new Error('Image generation failed: No image data was returned.');
};

export interface CommandResponse { 
    text: string; 
    functionCalls?: { name: string; args: any; }[]; 
}

export const getInferenceFunction = async (prompt: string, functionDeclarations: FunctionDeclaration[], knowledgeBase: string): Promise<CommandResponse> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({ 
            model: "gemini-2.5-flash", 
            contents: prompt, 
            config: { 
                systemInstruction: `You are a helpful assistant for a developer tool. The user will ask you to perform a task.
Based on your knowledge base of available tools, you must decide which function to call to satisfy the user's request.
If no specific tool seems appropriate, you can respond with text.

Knowledge Base of Available Tools:
${knowledgeBase}`, 
                tools: [{ functionDeclarations }] 
            } 
        });
        
        const functionCalls: { name: string, args: any }[] = [];
        const parts = response.candidates?.[0]?.content?.parts ?? [];
        for (const part of parts) { 
            if (part.functionCall) { 
                functionCalls.push({ name: part.functionCall.name, args: part.functionCall.args }); 
            } 
        }
        return { text: response.text, functionCalls: functionCalls.length > 0 ? functionCalls : undefined };
    } catch (error) {
        logError(error as Error, { prompt });
        throw error;
    }
};