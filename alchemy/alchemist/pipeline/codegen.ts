// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.


/**
 * @fileoverview The Code Generator for the Alchemist compiler.
 * It takes a validated AST and emits WebAssembly Text Format (WAT) code.
 */

import * as AST from '../../tsal/syntax/ast';

export class CodeGenerator {
    private wat: string = '';
    private indentLevel: number = 0;

    public generate(node: AST.ProgramNode): string {
        this.emit('(module');
        this.indent();

        // Standard library imports could go here
        
        node.body.forEach(n => this.visit(n));

        this.dedent();
        this.emit(')');
        return this.wat;
    }
    
    private visit(node: AST.ASTNode): void {
        switch (node.type) {
            case 'FunctionDeclaration': return this.visitFunctionDeclaration(node as AST.FunctionDeclarationNode);
            case 'BlockStatement': return this.visitBlockStatement(node as AST.BlockStatementNode);
            case 'ReturnStatement': return this.visitReturnStatement(node as AST.ReturnStatementNode);
            case 'BinaryExpression': return this.visitBinaryExpression(node as AST.BinaryExpressionNode);
            case 'Identifier': return this.visitIdentifier(node as AST.IdentifierNode);
            case 'Literal': return this.visitLiteral(node as AST.LiteralNode);
            default: throw new Error(`CodeGenerator: Unknown AST node type: ${node.type}`);
        }
    }

    private visitFunctionDeclaration(node: AST.FunctionDeclarationNode) {
        let funcDef = `(func $${node.id.name}`;

        if (node.modifiers.includes('export')) {
            funcDef += ` (export "${node.id.name}")`;
        }

        node.parameters.forEach(p => {
            funcDef += ` (param $${p.id.name} ${this.mapType(p.paramType)})`;
        });
        
        funcDef += ` (result ${this.mapType(node.returnType)})`;
        
        this.emit(funcDef);
        this.indent();

        this.visit(node.body);

        this.dedent();
        this.emit(')');
    }

    private visitBlockStatement(node: AST.BlockStatementNode) {
        node.body.forEach(s => this.visit(s));
    }
    
    private visitReturnStatement(node: AST.ReturnStatementNode) {
        this.visit(node.argument);
        // In Wasm, the last value on the stack is implicitly returned.
        // The 'return' keyword is handled by the block structure.
    }
    
    private visitBinaryExpression(node: AST.BinaryExpressionNode) {
        this.visit(node.left);
        this.visit(node.right);

        switch(node.operator) {
            case '+': this.emit('i32.add'); break;
            case '-': this.emit('i32.sub'); break;
            case '*': this.emit('i32.mul'); break;
            case '/': this.emit('i32.div_s'); break; // Signed division
            default: throw new Error(`Unsupported binary operator: ${node.operator}`);
        }
    }

    private visitIdentifier(node: AST.IdentifierNode) {
        this.emit(`(local.get $${node.name})`);
    }

    private visitLiteral(node: AST.LiteralNode) {
        if (typeof node.value === 'number') {
            this.emit(`(i32.const ${node.value})`);
        } else {
            throw new Error(`Unsupported literal type: ${typeof node.value}`);
        }
    }

    private mapType(typeNode: AST.TypeAnnotationNode): string {
        switch (typeNode.type) {
            case 'I32Type': return 'i32';
            case 'I64Type': return 'i64';
            case 'F32Type': return 'f32';
            case 'F64Type': return 'f64';
            default: throw new Error(`Unsupported type for Wasm: ${typeNode.type}`);
        }
    }

    private emit(str: string) {
        this.wat += `${'  '.repeat(this.indentLevel)}${str}\n`;
    }

    private indent() { this.indentLevel++; }
    private dedent() { this.indentLevel--; }
}
