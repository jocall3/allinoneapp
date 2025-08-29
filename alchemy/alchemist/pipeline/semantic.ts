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
    private parent: SymbolTable | null;

    constructor(parent: SymbolTable | null = null) {
        this.parent = parent;
    }

    define(name: string, type: AST.TypeAnnotationNode): boolean {
        if (this.symbols.has(name)) {
            return false; // Already defined in this scope
        }
        this.symbols.set(name, { name, type });
        return true;
    }

    resolve(name: string): Symbol | null {
        const symbol = this.symbols.get(name);
        if (symbol) {
            return symbol;
        }
        if (this.parent) {
            return this.parent.resolve(name);
        }
        return null;
    }
}

export class SemanticAnalyzer {
    private ast: AST.ProgramNode;
    private currentScope: SymbolTable;

    constructor(ast: AST.ProgramNode) {
        this.ast = ast;
        this.currentScope = new SymbolTable();
    }

    public analyze(): AST.ProgramNode {
        console.log("[SemanticAnalyzer] Beginning analysis...");
        this.visitProgram(this.ast);
        console.log("[SemanticAnalyzer] Analysis complete.");
        return this.ast;
    }

    private visitProgram(node: AST.ProgramNode) {
        node.body.forEach(statement => this.visit(statement));
    }

    private visit(node: AST.ASTNode) {
        switch (node.type) {
            case 'FunctionDeclaration':
                this.visitFunctionDeclaration(node as AST.FunctionDeclarationNode);
                break;
            // Add cases for all other node types
        }
    }

    private visitFunctionDeclaration(node: AST.FunctionDeclarationNode) {
        console.log(`[SemanticAnalyzer] > Analyzing function '${node.id.name}'`);
        
        // Define function in the current scope
        // For simplicity, we'll use a placeholder type for the function itself
        this.currentScope.define(node.id.name, { type: 'I32Type' }); 

        // Create a new scope for the function body
        const functionScope = new SymbolTable(this.currentScope);
        this.currentScope = functionScope;

        // Add parameters to the new scope
        node.parameters.forEach(param => {
            this.currentScope.define(param.id.name, param.paramType);
        });

        // Analyze the function body
        this.visitBlockStatement(node.body);

        // Pop the scope
        this.currentScope = this.currentScope.parent!;
    }
    
    private visitBlockStatement(node: AST.BlockStatementNode) {
        node.body.forEach(statement => this.visitStatement(statement));
    }
    
    private visitStatement(node: AST.StatementNode) {
        // Here you would check types, e.g., for VariableDeclaration, check if initializer matches varType
        if(node.type === 'VariableDeclaration') {
            const decl = node as AST.VariableDeclarationNode;
            this.currentScope.define(decl.id.name, decl.varType);
            if (decl.initializer) {
                const initType = this.getTypeOfExpression(decl.initializer);
                // SUPER simplified type check
                if (initType.type !== decl.varType.type) {
                    throw new Error(`Semantic Error: Type mismatch for variable '${decl.id.name}'. Expected ${decl.varType.type} but got ${initType.type}.`);
                }
            }
        }
        // ... more checks for other statement types
    }
    
    private getTypeOfExpression(node: AST.ExpressionNode): AST.TypeAnnotationNode {
        // This would be a large function mapping expressions to their resulting types
        if (node.type === 'Literal') {
            if (typeof node.value === 'number') return { type: 'I32Type' };
        }
        if (node.type === 'Identifier') {
            const symbol = this.currentScope.resolve(node.name);
            if (!symbol) throw new Error(`Semantic Error: Undefined variable '${node.name}'.`);
            return symbol.type;
        }
        // For this stub, we'll just return a default
        return { type: 'I32Type' };
    }
}
