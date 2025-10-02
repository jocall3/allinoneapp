// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.


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
import { watToWasm } from './wabt';

export class Alchemist {
    private aetherLink: AetherLink;

    constructor() {
        this.aetherLink = new AetherLink();
    }

    public async compile(source: string): Promise<{ instance: WebAssembly.Instance, wat: string }> {
        console.log("--- Starting Alchemist Compilation Pipeline ---");
        try {
            // 1. Lexical Analysis
            const lexer = new Lexer(source);
            const tokens = lexer.tokenize();
            
            // 2. Syntactic Analysis
            const parser = new Parser(tokens);
            const ast = parser.parse();

            // 3. Semantic Analysis
            const analyzer = new SemanticAnalyzer();
            const validatedAst = analyzer.analyze(ast);

            // 4. Code Generation
            const generator = new CodeGenerator();
            const wat = generator.generate(validatedAst);
            
            // 5. Assemble WAT to Wasm Binary
            const wasmBuffer = watToWasm(wat);
            
            // 6. Instantiate Module with FFI
            const importObject = this.aetherLink.createImportObject();
            const { instance } = await WebAssembly.instantiate(wasmBuffer, importObject);
            
            this.aetherLink.setMemory(instance.exports.memory as WebAssembly.Memory);

            return { instance, wat };
        } catch (error) {
            console.error("ALCHEMIST COMPILATION FAILED:", error);
            throw error;
        }
    }
}
