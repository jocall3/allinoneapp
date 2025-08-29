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

        // 1. Lexical Analysis
        const lexer = new Lexer(source);
        const tokens = lexer.tokenize();
        console.log("1. Lexing complete. Tokens:", tokens);

        // 2. Parsing
        const parser = new Parser(tokens);
        const ast = parser.parse();
        console.log("2. Parsing complete. AST:", ast);

        // 3. Semantic Analysis
        const analyzer = new SemanticAnalyzer(ast);
        const validatedAst = analyzer.analyze();
        console.log("3. Semantic analysis complete.");

        // 4. Code Generation
        const generator = new CodeGenerator(validatedAst);
        const wat = generator.generate();
        console.log("4. Code generation complete. WAT:", wat);

        // This is where you would convert WAT to a .wasm binary buffer.
        // This step typically requires a tool like WABT (WebAssembly Binary Toolkit).
        // For this stub, we'll log a message instead.
        console.log("5. (SKIPPED) WAT to Wasm binary conversion.");
        const wasmBuffer = new Uint8Array(); // Placeholder for actual binary

        // 6. Instantiation via AetherLink
        console.log("6. Instantiating Wasm module...");
        const importObject = this.aetherLink.createImportObject();
        const instance = await WebAssembly.instantiate(wasmBuffer, importObject);
        console.log("--- Compilation and Instantiation Complete ---");
        
        return instance.instance;
    }
}
