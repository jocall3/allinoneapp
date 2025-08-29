/**
 * @fileoverview Defines the core primitive and conceptual types for the TSAL language.
 * These types map directly to WebAssembly concepts.
 */

// --- Core WebAssembly Numeric Types ---
export type i32 = number;
export type i64 = bigint;
export type f32 = number;
export type f64 = number;

// --- Conceptual Types for TSAL ---

/**
 * Represents a boolean value, which will be compiled to an i32 (0 or 1) in Wasm.
 */
export type bool = boolean;

/**
 * An i32 value that represents an offset into the Wasm module's linear memory.
 * This is a raw pointer and is inherently unsafe if not managed correctly.
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
 * JavaScript host environment (the browser). The generic type `T` is a conceptual hint
 * for the TSAL compiler's static analysis and for the AetherLink FFI, but is not
 * represented at runtime within the Wasm module itself.
 *
 * @template T - The conceptual type of the host object this handle refers to.
 */
export type host_ref<T> = i32;

/**
 * A type representing a function pointer, which can be passed to other functions
 * or stored. This is crucial for higher-order functions in Wasm.
 */
export type func_ref = number;
