/**
 * @fileoverview The main Alchemist compiler orchestrator.
 * This class ties together the lexer, parser, semantic analyzer, and code generator
 * to compile TSAL source code into WebAssembly.
 */

import { Lexer } from './pipeline/lexer';
import { Parser } from './pipeline/parser';
import { SemanticAnalyzer } from './pipeline/semantic';
import { CodeGenerator } from './pipeline/codegen';
import { AetherLink } from '../../aetherlink/ffi';

// In a real environment, you'd use a WAT to Wasm compiler like WABT.
// For the browser, a JS library would be needed. This is a placeholder.
async function watToWasm(wat: string): Promise<Uint8Array> {
    console.warn("[Compiler] WAT to Wasm conversion is a stub. An actual implementation (like WABT.js) is needed.");
    // This is a minimal valid Wasm module: (module)
    return new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]);
}


export class Alchemist {
    private aetherLink: AetherLink;

    constructor() {
        this.aetherLink = new AetherLink();
        console.log("Alchemist Compiler Initialized.");
    }

    /**
     * Compiles raw TSAL source code into an executable WebAssembly module.
     * @param source The TSAL source code string.
     * @returns A promise that resolves to the instantiated WebAssembly module instance.
     */
    public async compile(source: string): Promise<WebAssembly.Instance> {
        console.log("--- Starting Alchemist Compilation Pipeline ---");

        try {
            // 1. Lexical Analysis
            const lexer = new Lexer(source);
            const tokens = lexer.tokenize();
            console.log("1. Lexing complete.");

            // 2. Parsing
            const parser = new Parser(tokens);
            const ast = parser.parse();
            console.log("2. Parsing complete.");

            // 3. Semantic Analysis
            const analyzer = new SemanticAnalyzer(ast);
            const validatedAst = analyzer.analyze();
            console.log("3. Semantic analysis complete.");

            // 4. Code Generation
            const generator = new CodeGenerator(validatedAst);
            const wat = generator.generate();
            console.log("4. Code generation complete. WAT:", wat);

            // 5. WAT to Wasm binary conversion
            const wasmBuffer = await watToWasm(wat);
            console.log("5. Wasm binary generated (stub).");

            // 6. Instantiation via AetherLink
            console.log("6. Instantiating Wasm module...");
            const importObject = this.aetherLink.createImportObject(wasmBuffer);
            const { instance } = await WebAssembly.instantiate(wasmBuffer, importObject);
            
            // Give the allocator access to the instance's memory
            // allocator.setMemory(instance.exports.memory as WebAssembly.Memory);

            console.log("--- Compilation and Instantiation Complete ---");
            return instance;

        } catch (error) {
            console.error("ALCHEMIST COMPILATION FAILED:", error);
            throw error;
        }
    }
}
