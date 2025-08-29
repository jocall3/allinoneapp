/**
 * @fileoverview The Code Generator for the Alchemist compiler.
 * It takes a validated AST and emits WebAssembly Text Format (WAT) code.
 */

import * as AST from '../../tsal/syntax/ast';

export class CodeGenerator {
    private ast: AST.ProgramNode;

    constructor(ast: AST.ProgramNode) {
        this.ast = ast;
    }

    public generate(): string {
        console.log("[CodeGenerator STUB] Starting Wasm code generation...");
        
        let wat = '(module\n';
        
        // In a real generator, you'd add imports, memory definitions, etc.
        // wat += '  (import "js" "mem" (memory 1))\n';

        this.ast.body.forEach(node => {
            if (node.type === 'FunctionDeclaration') {
                wat += this.generateFunction(node as AST.FunctionDeclarationNode);
            }
        });

        wat += '\n)';

        console.log("[CodeGenerator STUB] Finished Wasm code generation.");
        return wat;
    }

    private generateFunction(node: AST.FunctionDeclarationNode): string {
        // This is a very simplified example for a function like `func add(a: i32, b: i32): i32 { return a + b; }`
        const funcName = node.id.name;
        const params = node.parameters.map(p => `(param $${p.id.name} i32)`).join(' ');
        const result = '(result i32)';

        let body = '';
        // A real implementation would recursively generate expressions.
        if (funcName === 'add' && node.parameters.length === 2) {
             body = '    local.get $a\n    local.get $b\n    i32.add\n';
        } else {
            body = '    ;; TODO: Implement full expression generation\n    i32.const 0\n'
        }

        return `  (func $${funcName} ${params} ${result}\n${body}  )\n  (export "${funcName}" (func $${funcName}))\n`;
    }
}
