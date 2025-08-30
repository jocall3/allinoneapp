import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ai, generateContent, generateJson, streamContent } from './geminiCore';

// Mock the @google/genai library
vi.mock('@google/genai', () => {
    const mockGenerateContent = vi.fn();
    const mockGenerateContentStream = vi.fn();
    const GoogleGenAI = vi.fn(() => ({
        models: {
            generateContent: mockGenerateContent,
            generateContentStream: mockGenerateContentStream,
        },
    }));
    return { GoogleGenAI, Type: {} };
});

const mockGenerateContent = vi.spyOn(ai.models, 'generateContent');
const mockGenerateContentStream = vi.spyOn(ai.models, 'generateContentStream');


describe('geminiCore', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('generateContent', () => {
        it('should call the Gemini API and return the text content', async () => {
            mockGenerateContent.mockResolvedValue({
                text: 'This is a test response.'
            });

            const result = await generateContent('test prompt', 'test instruction');

            expect(mockGenerateContent).toHaveBeenCalledWith({
                model: 'gemini-2.5-flash',
                contents: 'test prompt',
                config: {
                    systemInstruction: 'test instruction',
                    temperature: 0.5,
                },
            });
            expect(result).toBe('This is a test response.');
        });
    });

    describe('generateJson', () => {
        it('should call the Gemini API and return parsed JSON', async () => {
            const mockResponse = { name: 'test', value: 123 };
            mockGenerateContent.mockResolvedValue({
                text: JSON.stringify(mockResponse)
            });

            const schema = { type: 'object' };
            const result = await generateJson('json prompt', 'json instruction', schema);

            expect(mockGenerateContent).toHaveBeenCalledWith({
                model: 'gemini-2.5-flash',
                contents: 'json prompt',
                config: {
                    systemInstruction: 'json instruction',
                    responseMimeType: 'application/json',
                    responseSchema: schema,
                    temperature: 0.2,
                },
            });
            expect(result).toEqual(mockResponse);
        });
    });
    
    describe('streamContent', () => {
        it('should yield text chunks from the Gemini API stream', async () => {
            async function* mockStream() {
                yield { text: 'Hello ' };
                yield { text: 'world' };
                yield { text: '!' };
            }
            mockGenerateContentStream.mockResolvedValue(mockStream());

            const stream = streamContent('stream prompt', 'stream instruction');
            
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }

            expect(mockGenerateContentStream).toHaveBeenCalledWith({
                model: 'gemini-2.5-flash',
                contents: 'stream prompt',
                config: {
                    systemInstruction: 'stream instruction',
                    temperature: 0.5,
                },
            });
            expect(chunks).toEqual(['Hello ', 'world', '!']);
        });
    });
});
