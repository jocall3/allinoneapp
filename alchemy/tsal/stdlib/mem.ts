/**
 * @fileoverview Stub implementation of the TSAL standard library for memory management.
 * In a real compiler, these functions would be intrinsics that map to direct
 * Wasm memory instructions or calls to a bundled memory allocator like `wee_alloc`.
 */

import type { mem_ptr } from '../syntax/types';

/**
 * Provides functions for interacting with the Wasm module's private linear memory heap.
 */
export const heap = {
    /**
     * Allocates a block of memory of the given size.
     * @param size The number of bytes to allocate.
     * @returns A memory pointer to the start of the allocated block, or 0 if allocation fails.
     */
    alloc(size: number): mem_ptr {
        console.log(`[TSAL STUB] heap.alloc(${size})`);
        // In a real implementation, this would call the allocator.
        // Returning a non-zero dummy pointer.
        return 1024; 
    },

    /**
     * Frees a previously allocated block of memory.
     * @param ptr The memory pointer to free.
     */
    free(ptr: mem_ptr): void {
        console.log(`[TSAL STUB] heap.free(${ptr})`);
        // In a real implementation, this would call the allocator's free function.
    }
};

/**
 * Provides functions for interacting with shared memory for multi-threading.
 */
export const shared_mem = {
    /**
     * Creates a shared memory buffer accessible by multiple Wasm threads.
     * @param size The size of the buffer in elements (not bytes).
     * @returns An opaque handle to the shared buffer.
     */
    create_buffer<T>(size: number): any {
        console.log(`[TSAL STUB] shared_mem.create_buffer(${size})`);
        // This would interact with SharedArrayBuffer on the JS side.
        return { bufferId: 1 };
    }
};
