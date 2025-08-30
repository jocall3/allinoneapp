
/**
 * @fileoverview The AetherLink Foreign Function Interface (FFI).
 * This module acts as the bridge between the sandboxed WebAssembly environment
 * and the JavaScript host (the browser).
 */

export class AetherLink {
    private wasmMemory: WebAssembly.Memory | null = null;

    constructor() {
        console.log("AetherLink FFI Gateway Initialized.");
    }
    
    /**
     * Late-binds the instantiated module's memory to the FFI gateway.
     * This is crucial for allowing JS to read/write to Wasm memory.
     */
    public setMemory(memory: WebAssembly.Memory) {
        this.wasmMemory = memory;
    }

    private readStringFromWasm(ptr: number, len: number): string {
        if (!this.wasmMemory) throw new Error("AetherLink Error: Wasm memory not available.");
        const buffer = new Uint8Array(this.wasmMemory.buffer, ptr, len);
        return new TextDecoder('utf-8').decode(buffer);
    }
    
    public createImportObject(): WebAssembly.Imports {
        return {
            host: {
                console_log: (ptr: number, len: number) => {
                    const message = this.readStringFromWasm(ptr, len);
                    console.log(`[Wasm -> JS]`, message);
                },
            },
            // `env` is a common namespace for system-like functions
            env: {
                abort: () => { console.error("Wasm module called abort!"); },
            }
        };
    }
}
