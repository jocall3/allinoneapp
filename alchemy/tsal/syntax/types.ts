
/**
 * @fileoverview Defines the core primitive and conceptual types for the TSAL language.
 * These types map directly to WebAssembly concepts, but with a higher-level, quantum-inspired abstraction.
 */

// --- Core WebAssembly Numeric Types ---
export type i32 = number;
export type i64 = bigint;
export type f32 = number;
export type f64 = number;
export type bool = boolean; // Will be compiled to i32

// --- Conceptual & Advanced Types for TSAL ---

/**
 * An i32 value that represents an offset into the Wasm module's linear memory manifold.
 * This is a raw pointer and is inherently unsafe if not managed correctly by the compiler's
 * state-space analysis.
 */
export type mem_ptr = i32;

/**
 * A struct-like representation for strings stored in Wasm linear memory.
 * It contains a pointer to the start of the UTF-8 encoded string and its length in bytes.
 */
export type string_ref = {
    ptr: mem_ptr;
    len: i32;
};

/**
 * An opaque handle (represented as an i32) to an object or resource managed by the
 * JavaScript host environment (the browser). This represents a stable wormhole between
 * the Wasm universe and the JS universe.
 * @template T - The conceptual type of the host object this handle refers to.
 */
export type host_ref<T> = i32;

/**
 * A type representing a function pointer within the Wasm module, enabling higher-order functions.
 */
export type func_ref = number;

/**
 * Represents a value that exists in a superposition of multiple states until measured (observed).
 * This is a core concept for handling conditional paths in the compiler.
 * @template T - The type of the states in superposition.
 */
export class QuantumSuperposition<T> {
    private states: T[];

    constructor(states: T[]) {
        if (states.length === 0) {
            throw new Error("QuantumSuperposition must be initialized with at least one state.");
        }
        this.states = states;
    }

    /**
     * Collapses the wave function to a single classical state based on an observation.
     * In the compiler, this maps to resolving a conditional branch.
     * @param observer - A function that determines which state to collapse to.
     * @returns A single classical value of type T.
     */
    collapse(observer: (states: T[]) => T): T {
        return observer(this.states);
    }
}

/**
 * Represents an entangled reference between a Wasm memory location and a JS host object.
 * Any operation on this reference must be consistent with the laws of both universes.
 * The AetherLink FFI is responsible for maintaining this entanglement.
 * @template WasmType - The TSAL type stored in Wasm memory.
 * @template JSType - The conceptual JS type this is linked to.
 */
export class EntangledRef<WasmType, JSType> {
    readonly wasm_ptr: mem_ptr;
    readonly host_handle: host_ref<JSType>;

    constructor(wasm_ptr: mem_ptr, host_handle: host_ref<JSType>) {
        this.wasm_ptr = wasm_ptr;
        this.host_handle = host_handle;
    }
}
