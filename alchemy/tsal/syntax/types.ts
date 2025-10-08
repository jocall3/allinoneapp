// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.


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

// New unsigned integer types, essential for low-level memory operations, flags, and data representation.
export type u8 = number;  // Unsigned 8-bit integer (0-255)
export type u16 = number; // Unsigned 16-bit integer (0-65535)
export type u32 = number; // Unsigned 32-bit integer (0-4294967295)
export type u64 = bigint; // Unsigned 64-bit integer (0 to 2^64-1)

// --- Conceptual & Advanced Types for TSAL ---

/**
 * An i32 value that represents an offset into the Wasm module's linear memory manifold.
 * This is a raw pointer and is inherently unsafe if not managed correctly by the compiler's
 * state-space analysis or a robust memory manager.
 */
export type mem_ptr = i32;

/**
 * A struct-like representation for strings stored in Wasm linear memory.
 * It contains a pointer to the start of the UTF-8 encoded string and its length in bytes.
 * This encourages explicit management of string data in Wasm.
 */
export type string_ref = {
    ptr: mem_ptr;
    len: i32;
};

/**
 * A struct-like representation for arrays stored in Wasm linear memory.
 * It contains a pointer to the start of the array data, its length (number of elements),
 * and the size of each item in bytes to facilitate pointer arithmetic and bounds checking.
 * @template T - The TSAL type of the elements expected to be in the array.
 */
export type array_ref<T> = {
    ptr: mem_ptr;
    len: i32;
    item_size: i32; // Size in bytes of a single element of type T
};

/**
 * An opaque handle (represented as an i32) to an object or resource managed by the
 * JavaScript host environment (e.g., the browser or Node.js runtime). This represents a stable
 * "wormhole" between the Wasm universe and the JS universe, facilitating safe FFI operations.
 * @template T - The conceptual TypeScript/JavaScript type of the host object this handle refers to.
 */
export type host_ref<T> = i32;

/**
 * A type representing a function pointer within the Wasm module, enabling higher-order functions
 * and dynamic dispatch. In WebAssembly, this typically maps to an index in a function table.
 */
export type func_ref = i32;

/**
 * Represents the absence of a return value for a function, analogous to `void` in TypeScript or C.
 */
export type void_t = void;

/**
 * A generic type that can conceptually represent any primitive or complex TSAL type.
 * Use with caution, as it bypasses specific static type checks, similar to `any` in TypeScript.
 * In Wasm, this might conceptually map to `anyref` or `externref` if referencing host objects,
 * or a union of Wasm primitive types.
 */
export type any_t = i32 | i64 | f32 | f64 | bool | u8 | u16 | u32 | u64 | mem_ptr | string_ref | array_ref<any> | host_ref<any> | func_ref | void_t;

/**
 * An integer type representing an index into the Wasm module's global variables table.
 * Used by the compiler to reference global mutable and immutable values.
 */
export type WasmGlobalIndex = i32;

/**
 * An integer type representing an index into the Wasm module's function table.
 * Essential for indirect function calls and higher-order functions in Wasm.
 */
export type WasmTableIndex = i32;

/**
 * An integer type representing an index into the W Wasm module's linear memory array.
 * Relevant if the WebAssembly module uses multiple linear memories (supported in newer Wasm versions).
 */
export type WasmMemoryIndex = i32;

/**
 * A type representing a unique identifier or an index within the TSAL compiler's symbol table.
 * Used for referencing declared variables, functions, types, constants, and other lexical entries.
 */
export type SymbolTableRef = i32;

/**
 * Defines the signature of a TSAL function, including its parameters and results.
 * This is crucial for type checking function calls and validating function table entries.
 * @template ParamTypes - A tuple of types for the function's parameters. Defaults to any TSALType array.
 * @template ResultTypes - A tuple of types for the function's return values. Defaults to any TSALType array.
 */
export type WasmFunctionSignature<ParamTypes extends TSALType[] = TSALType[], ResultTypes extends TSALType[] = TSALType[]> = {
    params: ParamTypes;
    results: ResultTypes;
};

// --- TSAL Compiler Intrinsic Type System ---

/**
 * A union type representing all primitive data types natively supported by TSAL and WebAssembly.
 * These are the fundamental building blocks of data.
 */
export type TSALPrimitiveType = i32 | i64 | f32 | f64 | bool | u8 | u16 | u32 | u64 | void_t;

/**
 * A union type representing all complex (structured, reference, or conceptual) data types supported by TSAL.
 * These types often involve memory management, host interaction, or quantum abstractions.
 */
export type TSALComplexType = mem_ptr | string_ref | array_ref<any> | host_ref<any> | func_ref | QuantumSuperposition<any> | EntangledRef<any, any>;

/**
 * The overarching union type for any type expressible in TSAL. This is the root of the TSAL type system,
 * combining primitive and complex types. It also includes functional error handling and optional types.
 */
export type TSALType = TSALPrimitiveType | TSALComplexType | Option<any> | Result<any, any>;


/**
 * Represents a value that exists in a superposition of multiple states until measured (observed).
 * This is a core concept for handling conditional paths, speculative execution, or non-deterministic
 * outcomes within the TSAL compiler's intermediate representation.
 * @template T - The classical type of the states that are in superposition.
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
     * Retrieves all possible states currently in superposition.
     * @returns An immutable array of the possible states.
     */
    public getStates(): ReadonlyArray<T> {
        return this.states;
    }

    /**
     * Collapses the wave function to a single classical state based on an observation function.
     * In the TSAL compiler, this maps to resolving a conditional branch, selecting a specific
     * execution path, or determining a value from a set of possibilities.
     * @param observer - A deterministic or probabilistic function that takes the current states
     *                   and returns one specific classical value of type T.
     * @returns A single classical value of type T, representing the measured state.
     */
    public collapse(observer: (states: T[]) => T): T {
        return observer(this.states);
    }

    /**
     * Creates a new superposition by applying a transformation function to each state.
     * This represents an operation within the quantum realm that does not collapse the superposition,
     * but rather transforms the potential outcomes.
     * @param transform - A function to apply to each individual state in the superposition.
     * @returns A new QuantumSuperposition instance with the transformed states.
     */
    public map<U>(transform: (state: T) => U): QuantumSuperposition<U> {
        return new QuantumSuperposition(this.states.map(transform));
    }

    /**
     * Combines this superposition with another, creating a new superposition representing
     * all possible combinations of their states. This simulates entanglement or branching.
     * @param other - The other QuantumSuperposition to combine with.
     * @param combineFn - A function to combine individual states from both superpositions.
     * @returns A new QuantumSuperposition containing combined states.
     */
    public combine<U, V>(other: QuantumSuperposition<U>, combineFn: (stateA: T, stateB: U) => V): QuantumSuperposition<V> {
        const combinedStates: V[] = [];
        for (const stateA of this.states) {
            for (const stateB of other.states) {
                combinedStates.push(combineFn(stateA, stateB));
            }
        }
        return new QuantumSuperposition(combinedStates);
    }

    /**
     * Checks if two QuantumSuperposition instances represent the same set of states.
     * Note: This performs a shallow comparison of state values. For complex object types,
     * a custom equality predicate or deep comparison logic might be necessary in a real system.
     * @param other - The other QuantumSuperposition to compare against.
     * @returns True if they contain the same states (regardless of order), false otherwise.
     */
    public equals(other: QuantumSuperposition<T>): boolean {
        if (this.states.length !== other.states.length) {
            return false;
        }
        const sortedThis = [...this.states].sort();
        const sortedOther = [...other.states].sort();
        return sortedThis.every((state, i) => state === sortedOther[i]);
    }
}

/**
 * Represents an entangled reference between a Wasm memory location and a JavaScript host object.
 * This is a fundamental concept for the "AetherLink FFI," ensuring that operations on this reference
 * are consistent with the quantum-like laws of both the Wasm universe and the JS universe.
 * @template WasmType - The TSAL type expected to be stored in Wasm memory at `wasm_ptr`.
 * @template JSType - The conceptual TypeScript/JavaScript type of the host object linked to `host_handle`.
 */
export class EntangledRef<WasmType, JSType> {
    readonly wasm_ptr: mem_ptr;
    readonly host_handle: host_ref<JSType>;

    constructor(wasm_ptr: mem_ptr, host_handle: host_ref<JSType>) {
        if (wasm_ptr === 0 || host_handle === 0) { // Assuming 0 is an invalid pointer/handle
            console.warn("EntangledRef created with potentially invalid pointer/handle (value 0).");
        }
        this.wasm_ptr = wasm_ptr;
        this.host_handle = host_handle;
    }

    /**
     * Conceptually "disentangles" the reference, signaling that the link between
     * the Wasm memory and the JS host object is broken or no longer valid.
     * In a full runtime, this would trigger cleanup routines on both sides to release resources.
     * For a type definition, it serves as a semantic marker.
     */
    public disentangle(): void {
        console.log(`EntangledRef (Wasm ptr: ${this.wasm_ptr}, Host handle: ${this.host_handle}) has been conceptually disentangled.`);
        // A concrete implementation would call into the AetherLink FFI runtime to perform actual cleanup.
        // E.g., `AetherLink.releaseEntanglement(this.wasm_ptr, this.host_handle);`
    }

    /**
     * Checks the conceptual validity of the entangled reference.
     * A reference is considered valid if both its Wasm pointer and host handle are non-zero.
     * True validity also depends on whether the underlying resources are still alive, which
     * cannot be fully determined by this type alone but requires runtime checks.
     * @returns True if the reference is considered active and pointing to valid locations, false otherwise.
     */
    public isValid(): boolean {
        return this.wasm_ptr !== 0 && this.host_handle !== 0;
    }

    /**
     * Returns a string representation of the entangled reference, useful for debugging.
     */
    public toString(): string {
        return `EntangledRef<WasmPtr:${this.wasm_ptr}, HostHandle:${this.host_handle}>`;
    }
}

/**
 * A conceptual quantum register, holding a collection of quantum states or entangled references.
 * This can represent a segment of Wasm memory, a group of variables, or a logical collection
 * where quantum phenomena (superposition, entanglement) are applied.
 */
export class QuantumRegister {
    readonly name: string;
    private qbits: (QuantumSuperposition<any> | EntangledRef<any, any>)[];
    private nextQbitId: i32 = 0; // For unique identification if needed

    constructor(name: string, initialQbits: (QuantumSuperposition<any> | EntangledRef<any, any>)[] = []) {
        this.name = name;
        this.qbits = initialQbits.map(q => q); // Ensure a shallow copy
    }

    /**
     * Adds a quantum bit (a superposition or an entangled reference) to the register.
     * @param qbit - The quantum item to add.
     * @returns The index of the added qbit within the register.
     */
    public addQbit(qbit: QuantumSuperposition<any> | EntangledRef<any, any>): i32 {
        this.qbits.push(qbit);
        return this.qbits.length - 1;
    }

    /**
     * Retrieves a quantum bit by its index in the register.
     * @param index - The zero-based index of the qbit.
     * @returns The QuantumSuperposition or EntangledRef at the given index, or `undefined` if out of bounds.
     */
    public getQbit(index: i32): QuantumSuperposition<any> | EntangledRef<any, any> | undefined {
        if (index < 0 || index >= this.qbits.length) {
            return undefined;
        }
        return this.qbits[index];
    }

    /**
     * Measures (collapses) all `QuantumSuperposition` items within this register.
     * This simulates a global observation on the register. `EntangledRef` instances are returned as-is.
     * @param observer - A function that defines the measurement strategy for each superposition.
     *                   It takes an array of possible states and returns the chosen classical state.
     * @returns An array of the collapsed classical states or the original `EntangledRef` instances.
     */
    public measureAll(observer: (states: any[]) => any): any[] {
        return this.qbits.map(qbit => {
            if (qbit instanceof QuantumSuperposition) {
                return qbit.collapse(observer);
            }
            return qbit; // EntangledRefs are not collapsed by a measurement gate
        });
    }

    /**
     * Applies a quantum gate (transformation function) to all `QuantumSuperposition` instances
     * in the register without collapsing them. `EntangledRef` instances are unaffected by this operation directly.
     * This simulates a coherent operation across the quantum states.
     * @param gateFunction - A function that transforms a single state within a superposition to a new state.
     * @returns This QuantumRegister, allowing for method chaining.
     */
    public applyGate(gateFunction: (state: any) => any): QuantumRegister {
        this.qbits = this.qbits.map(qbit => {
            if (qbit instanceof QuantumSuperposition) {
                return qbit.map(gateFunction);
            }
            return qbit;
        });
        return this;
    }

    /**
     * Returns the current number of quantum items (qbits) in the register.
     */
    public size(): i32 {
        return this.qbits.length;
    }

    /**
     * Clears all quantum bits from this register.
     */
    public clear(): void {
        this.qbits = [];
        this.nextQbitId = 0;
    }
}

/**
 * Represents a "quantum field" or context within which quantum-like computations occur.
 * This can be used to manage the lifecycle, interactions, and global state of `QuantumRegister`
 * instances and `EntangledRef` instances. A `QuantumField` could conceptually represent a
 * designated memory segment or a scope within a Wasm module where quantum data resides.
 */
export class QuantumField {
    readonly id: string;
    private registers: Map<string, QuantumRegister>;
    private activeEntanglements: Set<EntangledRef<any, any>>;

    constructor(id: string) {
        this.id = id;
        this.registers = new Map();
        this.activeEntanglements = new Set();
    }

    /**
     * Creates and adds a new `QuantumRegister` to this field.
     * @param name - The unique name of the register within this field.
     * @param initialQbits - Optional initial qbits for the register.
     * @returns The newly created QuantumRegister.
     * @throws Error if a register with the same name already exists in this field.
     */
    public createRegister(name: string, initialQbits: (QuantumSuperposition<any> | EntangledRef<any, any>)[] = []): QuantumRegister {
        if (this.registers.has(name)) {
            throw new Error(`QuantumRegister with name '${name}' already exists in field '${this.id}'.`);
        }
        const register = new QuantumRegister(name, initialQbits);
        this.registers.set(name, register);
        return register;
    }

    /**
     * Retrieves an existing `QuantumRegister` from this field by its name.
     * @param name - The name of the register to retrieve.
     * @returns The `QuantumRegister`, or `undefined` if not found.
     */
    public getRegister(name: string): QuantumRegister | undefined {
        return this.registers.get(name);
    }

    /**
     * Registers an `EntangledRef` as active within this quantum field.
     * This allows the field to track and potentially manage the lifecycle of entanglements.
     * @param ref - The `EntangledRef` to register.
     */
    public registerEntanglement(ref: EntangledRef<any, any>): void {
        if (!ref.isValid()) {
            console.warn(`Attempted to register an invalid EntangledRef: ${ref.toString()}`);
        }
        this.activeEntanglements.add(ref);
    }

    /**
     * Deregisters an `EntangledRef`, marking it as no longer active within this field.
     * This method also calls `disentangle()` on the reference, conceptually breaking the link.
     * @param ref - The `EntangledRef` to deregister.
     */
    public deregisterEntanglement(ref: EntangledRef<any, any>): void {
        if (this.activeEntanglements.delete(ref)) {
            ref.disentangle();
        } else {
            console.warn(`Attempted to deregister an EntangledRef not found in QuantumField '${this.id}': ${ref.toString()}`);
        }
    }

    /**
     * Performs a global measurement across all `QuantumSuperposition` instances in all registers
     * within this field. This simulates a global observation event within the quantum field,
     * collapsing all superpositions.
     * @param observer - A function to apply to each superposition to collapse it.
     * @returns A map where keys are register names and values are arrays of collapsed states.
     */
    public globalMeasurement(observer: (states: any[]) => any): Map<string, any[]> {
        const results = new Map<string, any[]>();
        this.registers.forEach((register, name) => {
            results.set(name, register.measureAll(observer));
        });
        return results;
    }

    /**
     * Clears all registers and active entanglements within this field.
     * This simulates resetting the quantum state of the entire field, potentially releasing
     * associated resources through the `disentangle` calls.
     */
    public resetField(): void {
        this.registers.forEach(register => register.clear());
        this.registers.clear();
        this.activeEntanglements.forEach(ref => ref.disentangle());
        this.activeEntanglements.clear();
        console.log(`QuantumField '${this.id}' has been reset, all registers and entanglements cleared.`);
    }

    /**
     * Returns the number of active quantum registers in this field.
     */
    public get numRegisters(): i32 {
        return this.registers.size;
    }

    /**
     * Returns the number of active entangled references managed by this field.
     */
    public get numEntanglements(): i32 {
        return this.activeEntanglements.size;
    }
}

// --- Functional & Error Handling Types for Robust TSAL Programming ---

/**
 * Represents a value that may or may not be present, akin to Rust's `Option<T>` or Haskell's `Maybe T`.
 * This type encourages explicit handling of potential absence and helps in avoiding `null` or `undefined`
 * related runtime errors, promoting safer and more robust code.
 * @template T - The type of the value if it is present.
 */
export abstract class Option<T> {
    /**
     * Creates an `Option` representing a present value.
     * @param value - The value to wrap.
     * @returns A `Some<T>` instance containing the value.
     */
    public static Some<T>(value: T): Some<T> {
        return new Some(value);
    }

    /**
     * Creates an `Option` representing an absent value.
     * @returns A `None<T>` instance.
     */
    public static None<T>(): None<T> {
        return new None();
    }

    /**
     * Returns `true` if the option is `Some` (contains a value), `false` otherwise.
     */
    public abstract isSome(): boolean;

    /**
     * Returns `true` if the option is `None` (does not contain a value), `false` otherwise.
     */
    public abstract isNone(): boolean;

    /**
     * Returns the contained `Some` value. Throws an `Error` if the option is `None`.
     * This method should be used with caution, preferably when `isSome()` has already been checked.
     * Consider `unwrapOr()` or `map()` for safer value extraction.
     * @throws Error if the option is `None`.
     */
    public abstract unwrap(): T;

    /**
     * Returns the contained `Some` value or a provided default value if the option is `None`.
     * This is a safe way to extract a value while providing a fallback.
     * @param defaultValue - The value to return if the option is `None`.
     * @returns The contained value if `Some`, otherwise `defaultValue`.
     */
    public abstract unwrapOr(defaultValue: T): T;

    /**
     * Transforms an `Option<T>` to an `Option<U>` by applying a function to the contained `Some` value.
     * If the option is `None`, it remains `None`. This allows chaining operations on optional values.
     * @param fn - The function to apply to the contained value if the option is `Some`.
     * @returns A new `Option<U>` instance.
     */
    public abstract map<U>(fn: (value: T) => U): Option<U>;

    /**
     * Calls a side-effecting function with the contained value if the option is `Some`.
     * If the option is `None`, nothing happens.
     * @param fn - The function to call with the `Some` value.
     */
    public abstract ifSome(fn: (value: T) => void): void;

    /**
     * Calls a side-effecting function if the option is `None`.
     * If the option is `Some`, nothing happens.
     * @param fn - The function to call when the option is `None`.
     */
    public abstract ifNone(fn: () => void): void;
}

/**
 * Represents a present value in an `Option`.
 * @template T - The type of the value.
 */
export class Some<T> extends Option<T> {
    private readonly value: T;

    constructor(value: T) {
        super();
        this.value = value;
    }

    public isSome(): boolean { return true; }
    public isNone(): boolean { return false; }

    public unwrap(): T { return this.value; }
    public unwrapOr(_defaultValue: T): T { return this.value; }

    public map<U>(fn: (value: T) => U): Option<U> {
        return new Some(fn(this.value));
    }

    public ifSome(fn: (value: T) => void): void {
        fn(this.value);
    }

    public ifNone(_fn: () => void): void {
        // Do nothing
    }
}

/**
 * Represents an absent value in an `Option`.
 * @template T - The type that would have been present.
 */
export class None<T> extends Option<T> {
    constructor() {
        super();
    }

    public isSome(): boolean { return false; }
    public isNone(): boolean { return true; }

    public unwrap(): T {
        throw new Error("Attempted to unwrap a 'None' value.");
    }

    public unwrapOr(defaultValue: T): T { return defaultValue; }

    public map<U>(_fn: (value: T) => U): Option<U> {
        return new None();
    }

    public ifSome(_fn: (value: T) => void): void {
        // Do nothing
    }

    public ifNone(fn: () => void): void {
        fn();
    }
}

/**
 * Represents the result of an operation that can either succeed (`Ok`) with a value
 * or fail (`Err`) with an error. Akin to Rust's `Result<T, E>`.
 * This type promotes explicit error handling over traditional exceptions, making error paths
 * clear in the function signature and encouraging callers to deal with potential failures.
 * @template T - The type of the successful value.
 * @template E - The type of the error value.
 */
export abstract class Result<T, E> {
    /**
     * Creates a `Result` representing a successful operation.
     * @param value - The successful value.
     * @returns An `Ok<T, E>` instance.
     */
    public static Ok<T, E>(value: T): Ok<T, E> {
        return new Ok(value);
    }

    /**
     * Creates a `Result` representing a failed operation.
     * @param error - The error value.
     * @returns An `Err<T, E>` instance.
     */
    public static Err<T, E>(error: E): Err<T, E> {
        return new Err(error);
    }

    /**
     * Returns `true` if the result is `Ok` (contains a successful value), `false` otherwise.
     */
    public abstract isOk(): boolean;

    /**
     * Returns `true` if the result is `Err` (contains an error value), `false` otherwise.
     */
    public abstract isErr(): boolean;

    /**
     * Returns the contained `Ok` value. Throws an `Error` if the result is `Err`.
     * Use with caution, preferably after checking `isOk()`.
     * @throws Error if the result is `Err`.
     */
    public abstract unwrap(): T;

    /**
     * Returns the contained `Err` value. Throws an `Error` if the result is `Ok`.
     * Use with caution, preferably after checking `isErr()`.
     * @throws Error if the result is `Ok`.
     */
    public abstract unwrapErr(): E;

    /**
     * Transforms a `Result<T, E>` to `Result<U, E>` by applying a function to the contained `Ok` value.
     * If the result is `Err`, it remains `Err` with its original error.
     * @param fn - The function to apply to the contained `Ok` value.
     * @returns A new `Result<U, E>` instance.
     */
    public abstract map<U>(fn: (value: T) => U): Result<U, E>;

    /**
     * Transforms a `Result<T, E>` to `Result<T, F>` by applying a function to the contained `Err` value.
     * If the result is `Ok`, it remains `Ok` with its original value.
     * @param fn - The function to apply to the contained `Err` value.
     * @returns A new `Result<T, F>` instance.
     */
    public abstract mapErr<F>(fn: (error: E) => F): Result<T, F>;

    /**
     * Calls a side-effecting function with the contained `Ok` value if the result is `Ok`.
     * If the result is `Err`, nothing happens.
     * @param fn - The function to call with the `Ok` value.
     */
    public abstract ifOk(fn: (value: T) => void): void;

    /**
     * Calls a side-effecting function with the contained `Err` value if the result is `Err`.
     * If the result is `Ok`, nothing happens.
     * @param fn - The function to call with the `Err` value.
     */
    public abstract ifErr(fn: (error: E) => void): void;
}

/**
 * Represents a successful outcome in a `Result`.
 * @template T - The type of the successful value.
 * @template E - The type of the error value (not used in `Ok`, but required for type consistency).
 */
export class Ok<T, E> extends Result<T, E> {
    private readonly value: T;

    constructor(value: T) {
        super();
        this.value = value;
    }

    public isOk(): boolean { return true; }
    public isErr(): boolean { return false; }

    public unwrap(): T { return this.value; }
    public unwrapErr(): E { throw new Error("Attempted to unwrapErr on an 'Ok' value."); }

    public map<U>(fn: (value: T) => U): Result<U, E> {
        return new Ok(fn(this.value));
    }

    public mapErr<F>(_fn: (error: E) => F): Result<T, F> {
        return new Ok(this.value);
    }

    public ifOk(fn: (value: T) => void): void {
        fn(this.value);
    }

    public ifErr(_fn: (error: E) => void): void {
        // Do nothing
    }
}

/**
 * Represents a failed outcome in a `Result`.
 * @template T - The type of the successful value (not used in `Err`, but required for type consistency).
 * @template E - The type of the error value.
 */
export class Err<T, E> extends Result<T, E> {
    private readonly error: E;

    constructor(error: E) {
        super();
        this.error = error;
    }

    public isOk(): boolean { return false; }
    public isErr(): boolean { return true; }

    public unwrap(): T { throw new Error("Attempted to unwrap on an 'Err' value."); }
    public unwrapErr(): E { return this.error; }

    public map<U>(_fn: (value: T) => U): Result<U, E> {
        return new Err(this.error);
    }

    public mapErr<F>(fn: (error: E) => F): Result<T, F> {
        return new Err(fn(this.error));
    }

    public ifOk(_fn: (value: T) => void): void {
        // Do nothing
    }

    public ifErr(fn: (error: E) => void): void {
        fn(this.error);
    }
}