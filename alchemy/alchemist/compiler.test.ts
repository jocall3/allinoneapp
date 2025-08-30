import { describe, it, expect, vi } from 'vitest';
import { Alchemist } from './compiler';

// Mock the wabt part as it's complex
vi.mock('./wabt', () => ({
    watToWasm: vi.fn(() => new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]))
}));

describe('Alchemist Compiler', () => {
    it('should compile simple TSAL code without throwing', async () => {
        const alchemist = new Alchemist();
        const source = 'export func add(a: i32, b: i32): i32 { return a + b; }';

        await expect(alchemist.compile(source)).resolves.toBeDefined();
    });
});
