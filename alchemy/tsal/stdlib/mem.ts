/**
 * @fileoverview A functional, simplified memory manager for the TSAL runtime.
 * This provides a concrete implementation of a bump allocator for the `heap` module.
 * In a real, production compiler, this might be replaced with a more complex allocator
 * like `wee_alloc`, but this provides a functional starting point.
 */

import type { mem_ptr } from '../syntax/types';

class BumpAllocator {
    private memory: WebAssembly.Memory;
    private heap_start: number;
    private current_ptr: number;

    constructor() {
        // Initialize with a default of 1 page (64KiB) if not provided.
        this.memory = new WebAssembly.Memory({ initial: 1 });
        // Reserve some space at the beginning for null, etc.
        this.heap_start = 16; 
        this.current_ptr = this.heap_start;
        console.log(`[TSAL Runtime] BumpAllocator initialized with ${this.memory.buffer.byteLength} bytes.`);
    }

    public setMemory(memory: WebAssembly.Memory) {
        this.memory = memory;
        console.log(`[TSAL Runtime] BumpAllocator attached to new memory instance.`);
    }

    /**
     * Allocates a block of memory of the given size with 8-byte alignment.
     * @param size The number of bytes to allocate.
     * @returns A memory pointer to the start of the allocated block, or 0 if allocation fails.
     */
    public alloc(size: number): mem_ptr {
        // 8-byte alignment
        const alignedSize = (size + 7) & ~7;
        const next_ptr = this.current_ptr + alignedSize;
        
        if (next_ptr > this.memory.buffer.byteLength) {
            const neededPages = Math.ceil((next_ptr - this.memory.buffer.byteLength) / (64 * 1024));
            try {
                this.memory.grow(neededPages);
            } catch (e) {
                console.error("[TSAL Runtime] Out of memory! Failed to grow memory.", e);
                return 0; // Allocation failed
            }
        }

        const ptr = this.current_ptr;
        this.current_ptr = next_ptr;
        return ptr;
    }

    /**
     * Frees a previously allocated block of memory.
     * NOTE: A simple bump allocator cannot free individual blocks.
     * Freeing requires resetting the entire heap.
     */
    public free(ptr: mem_ptr): void {
        // A simple bump allocator doesn't support individual frees.
        // This is a no-op. For a real system, you'd use a more complex allocator.
    }

    /**
     * Resets the entire heap, effectively freeing all allocated memory.
     */
    public reset(): void {
        this.current_ptr = this.heap_start;
        console.log("[TSAL Runtime] BumpAllocator heap has been reset.");
    }
}

export const allocator = new BumpAllocator();

export const heap = {
    alloc: (size: number): mem_ptr => allocator.alloc(size),
    free: (ptr: mem_ptr): void => allocator.free(ptr),
};

export const shared_mem = {
    create_buffer<T>(size: number): any {
        // In a real implementation, this would use SharedArrayBuffer
        console.log(`[TSAL STUB] shared_mem.create_buffer(${size})`);
        return { bufferId: 1 };
    }
};
