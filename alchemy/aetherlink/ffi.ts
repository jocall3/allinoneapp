/**
 * @fileoverview The AetherLink Foreign Function Interface (FFI).
 * This module acts as the bridge between the sandboxed WebAssembly environment
 * and the JavaScript host (the browser). It provides the necessary "imports"
 * that TSAL-compiled modules need to interact with the outside world.
 */

export class AetherLink {
    private hostObjects: Map<number, any>;
    private nextHandleId: number;

    constructor() {
        this.hostObjects = new Map();
        this.nextHandleId = 1;
        console.log("AetherLink FFI Gateway Initialized.");
    }

    /**
     * Creates the import object required to instantiate a Wasm module.
     * This object contains functions that the Wasm module can call.
     * @returns The WebAssembly import object.
     */
    public createImportObject(): WebAssembly.Imports {
        return {
            // Namespace for host functions, e.g., `(import "host" "console_log" ...)`
            host: {
                console_log: (ptr: number, len: number) => {
                    // In a real implementation, you would need access to the Wasm module's memory
                    // to read the string at the given pointer and length.
                    console.log(`[Wasm -> JS] console_log called with ptr=${ptr}, len=${len}`);
                },
                
                fs_write_file: (pathPtr: number, pathLen: number, contentPtr: number, contentLen: number) => {
                    console.log(`[Wasm -> JS] fs_write_file called.`);
                    // Logic to read strings from Wasm memory and call FileSystemAccessAPI
                },
            },
            // Environment utilities
            env: {
                abort: () => { console.error("Wasm module called abort!"); },
            }
        };
    }

    /**
     * Registers a JavaScript object and returns an opaque handle for it.
     * This handle can be passed to a Wasm module.
     * @param obj The JavaScript object to register.
     * @returns A numeric handle.
     */
    public registerHostObject(obj: any): number {
        const handle = this.nextHandleId++;
        this.hostObjects.set(handle, obj);
        return handle;
    }

    /**
     * Retrieves a JavaScript object by its handle.
     * @param handle The numeric handle.
     * @returns The registered JavaScript object.
     */
    public getHostObject(handle: number): any {
        if (!this.hostObjects.has(handle)) {
            throw new Error(`AetherLink Error: No host object found for handle ${handle}`);
        }
        return this.hostObjects.get(handle);
    }
}
