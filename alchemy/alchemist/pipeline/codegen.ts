/**
 * @fileoverview The Code Generator for the Alchemist compiler.
 * It takes a validated AST and emits WebAssembly Text Format (WAT) code.
 * This implementation uses a visitor pattern to traverse the AST.
 */

import * as AST from '../../tsal/syntax/ast';

export class CodeGenerator {
    private ast: AST.ProgramNode;
    private wat: string = '';

    constructor(ast: AST.ProgramNode) {
        this.ast = ast;
    }

    public generate(): string {
        console.log("[CodeGenerator] Starting Wasm code generation...");
        this.wat = '(module\n';
        
        // Define memory if needed (a real implementation would detect this)
        this.wat += '  (memory 1)\n';
        this.wat += '  (export "memory" (memory 0))\n';

        this.ast.body.forEach(node => {
            if (node.type === 'FunctionDeclaration') {
                this.visitFunctionDeclaration(node as AST.FunctionDeclarationNode);
            }
        });

        this.wat += '\n)';
        console.log("[CodeGenerator] Finished Wasm code generation.");
        return this.wat;
    }

    private visitFunctionDeclaration(node: AST.FunctionDeclarationNode) {
        const funcName = node.id.name;
        const params = node.parameters.map(p => `(param $${p.id.name} ${this.mapTypeToWasm(p.paramType)})`).join(' ');
        const result = `(result ${this.mapTypeToWasm(node.returnType)})`;

        this.wat += `  (func $${funcName} ${params} ${result}\n`;

        // Handle local variables
        // A real implementation would gather all locals first.

        node.body.body.forEach(stmt => this.visitStatement(stmt));

        this.wat += `  )\n`;
        
        if (node.modifiers.includes('export')) {
            this.wat += `  (export "${funcName}" (func $${funcName}))\n`;
        }
    }
    
    private visitStatement(node: AST.StatementNode) {
        switch(node.type) {
            case 'ObservableMeasurement': // Return statement
                this.visitExpression((node as AST.ObservableMeasurementNode).argument);
                this.wat += '    return\n';
                break;
            // Add other statement types
        }
    }

    private visitExpression(node: AST.ExpressionNode) {
        switch(node.type) {
            case 'Literal':
                this.wat += `    i32.const ${(node as AST.LiteralNode).value}\n`;
                break;
            case 'Identifier':
                this.wat += `    local.get $${(node as AST.IdentifierNode).name}\n`;
                break;
            case 'BinaryExpression':
                const binNode = node as AST.BinaryExpressionNode;
                this.visitExpression(binNode.left);
                this.visitExpression(binNode.right);
                this.wat += `    ${this.mapOperatorToWasm(binNode.operator)}\n`;
                break;
        }
    }

    private mapTypeToWasm(type: AST.TypeAnnotationNode): string {
        switch (type.type) {
            case 'I32Type': return 'i32';
            case 'I64Type': return 'i64';
            case 'F32Type': return 'f32';
            case 'F64Type': return 'f64';
            default: return 'i32'; // Fallback
        }
    }
    
    private mapOperatorToWasm(op: string): string {
        switch (op) {
            case '+': return 'i32.add';
            case '-': return 'i32.sub';
            case '*': return 'i32.mul';
            case '/': return 'i32.div_s';
            default: throw new Error(`Unsupported operator: ${op}`);
        }
    }
}
