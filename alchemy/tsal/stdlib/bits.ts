
/**
 * @fileoverview A standard library for bitwise operations in TSAL.
 * These functions will be mapped to their corresponding WebAssembly instructions
 * by the Alchemist compiler.
 */

import type { i32 } from '../syntax/types';

/**
 * Performs a bitwise AND operation.
 * @param a The first operand.
 * @param b The second operand.
 * @returns The result of a & b.
 */
export function AND(a: i32, b: i32): i32 {
    return a & b;
}

/**
 * Performs a bitwise OR operation.
 * @param a The first operand.
 * @param b The second operand.
 * @returns The result of a | b.
 */
export function OR(a: i32, b: i32): i32 {
    return a | b;
}

/**
 * Performs a bitwise XOR operation.
 * @param a The first operand.
 * @param b The second operand.
 * @returns The result of a ^ b.
 */
export function XOR(a: i32, b: i32): i32 {
    return a ^ b;
}

/**
 * Performs a bitwise left shift.
 * @param a The value to shift.
 * @param b The number of bits to shift by.
 * @returns The result of a << b.
 */
export function SHL(a: i32, b: i32): i32 {
    return a << b;
}

/**
 * Performs a bitwise sign-propagating right shift.
 * @param a The value to shift.
 * @param b The number of bits to shift by.
 * @returns The result of a >> b.
 */
export function SHR_S(a: i32, b: i32): i32 {
    return a >> b;
}

/**
 * Performs a bitwise zero-filling right shift.
 * @param a The value to shift.
 * @param b The number of bits to shift by.
 * @returns The result of a >>> b.
 */
export function SHR_U(a: i32, b: i32): i32 {
    return a >>> b;
}
