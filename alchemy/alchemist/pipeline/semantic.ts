
/**
 * @fileoverview The Semantic Analyzer for the TSAL language.
 * It walks the AST and performs checks like type checking, scope analysis, and ownership rules.
 * This is where the compiler *understands* the code.
 */

import * as AST from '../../tsal/syntax/ast';

interface Symbol {
    name: string;
    type: AST.TypeAnnotationNode;
}

class SymbolTable {
    private symbols: Map<string, Symbol> = new Map();
    public parent: SymbolTable | null;

    constructor(parent: SymbolTable | null = null) {
        this.parent = parent;
    }

    define(name: string, type: AST.TypeAnnotationNode): boolean {
        if (this.symbols.has(name)) return false;
        this.symbols.set(name, { name, type });
        return true;
    }

    resolve(name: string): Symbol | null {
        const symbol = this.symbols.get(name);
        if (symbol) return symbol;
        if (this.parent) return this.parent.resolve(name);
        return null;
    }
}

export class SemanticAnalyzer {
    private currentScope: SymbolTable;
    private currentFunction: AST.FunctionDeclarationNode | null = null;

    constructor() {
        this.currentScope = new SymbolTable();
    }

    public analyze(node: AST.ProgramNode): AST.ProgramNode {
        this.visit(node);
        return node;
    }

    private visit(node: AST.ASTNode): AST.TypeAnnotationNode | void {
        switch (node.type) {
            case 'Program': return this.visitProgram(node as AST.ProgramNode);
            case 'FunctionDeclaration': return this.visitFunctionDeclaration(node as AST.FunctionDeclarationNode);
            case 'BlockStatement': return this.visitBlockStatement(node as AST.BlockStatementNode);
            case 'ReturnStatement': return this.visitReturnStatement(node as AST.ReturnStatementNode);
            case 'BinaryExpression': return this.visitBinaryExpression(node as AST.BinaryExpressionNode);
            case 'Identifier': return this.visitIdentifier(node as AST.IdentifierNode);
            case 'Literal': return this.visitLiteral(node as AST.LiteralNode);
            default: throw new Error(`Unknown AST node type: ${node.type}`);
        }
    }

    private visitProgram(node: AST.ProgramNode) {
        node.body.forEach(n => this.visit(n));
    }

    private visitFunctionDeclaration(node: AST.FunctionDeclarationNode) {
        this.currentFunction = node;
        this.currentScope.define(node.id.name, { type: 'I32Type' }); // Simplified function type
        
        const functionScope = new SymbolTable(this.currentScope);
        this.currentScope = functionScope;
        
        node.parameters.forEach(p => this.currentScope.define(p.id.name, p.paramType));
        
        this.visit(node.body);
        
        this.currentScope = this.currentScope.parent!;
        this.currentFunction = null;
    }
    
    private visitBlockStatement(node: AST.BlockStatementNode) {
        node.body.forEach(s => this.visit(s));
    }

    private visitReturnStatement(node: AST.ReturnStatementNode) {
        if (!this.currentFunction) {
            throw new Error("Semantic Error: 'return' statement outside of a function.");
        }
        const returnType = this.visit(node.argument) as AST.TypeAnnotationNode;
        if (returnType.type !== this.currentFunction.returnType.type) {
            throw new Error(`Semantic Error: Type mismatch. Function expects to return ${this.currentFunction.returnType.type} but got ${returnType.type}.`);
        }
    }
    
    private visitBinaryExpression(node: AST.BinaryExpressionNode): AST.TypeAnnotationNode {
        const leftType = this.visit(node.left) as AST.TypeAnnotationNode;
        const rightType = this.visit(node.right) as AST.TypeAnnotationNode;
        // Super simplified type check: assumes everything is an i32
        if (leftType.type !== 'I32Type' || rightType.type !== 'I32Type') {
            throw new Error(`Semantic Error: Cannot perform binary operation on non-i32 types.`);
        }
        return { type: 'I32Type' };
    }

    private visitIdentifier(node: AST.IdentifierNode): AST.TypeAnnotationNode {
        const symbol = this.currentScope.resolve(node.name);
        if (!symbol) throw new Error(`Semantic Error: Undefined variable '${node.name}'.`);
        return symbol.type;
    }

    private visitLiteral(node: AST.LiteralNode): AST.TypeAnnotationNode {
        if (typeof node.value === 'number') return { type: 'I32Type' };
        throw new Error(`Unsupported literal type: ${typeof node.value}`);
    }
}
