// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.


/**
 * @fileoverview Defines the Abstract Syntax Tree (AST) structure for the TSAL language.
 * Each interface represents a node in the tree that the Alchemist compiler will parse,
 * analyze, and generate code from. This AST is designed to capture the high-level,
 * physics-inspired concepts of TSAL.
 */

// --- Base Node Type ---
export interface ASTNode {
    type: string;
    loc?: { start: { line: number, column: number }, end: { line: number, column: number } };
}

// --- Type Annotations ---
export type TypeAnnotationNode =
    | { type: 'I32Type' } | { type: 'I64Type' } | { type: 'F32Type' } | { type: 'F64Type' }
    | { type: 'BoolType' } | { type: 'MemPtrType' } | { type: 'StringRefType' }
    | { type: 'HostRefType', typeName: string }
    | { type: 'SharedMemBufferType', elementType: TypeAnnotationNode };

// --- Expressions (The building blocks of computation) ---
export interface IdentifierNode extends ASTNode { type: 'Identifier'; name: string; }
export interface LiteralNode extends ASTNode { type: 'Literal'; value: number | bigint | boolean | string; }
export interface BinaryExpressionNode extends ASTNode { type: 'BinaryExpression'; operator: string; left: ExpressionNode; right: ExpressionNode; }
export interface CallExpressionNode extends ASTNode { type: 'CallExpression'; callee: IdentifierNode; arguments: ExpressionNode[]; }

export interface EntanglementOperationNode extends ASTNode {
    type: 'EntanglementOperation';
    callee: IdentifierNode;
    arguments: ExpressionNode[];
    hostNamespace: string;
}

export type ExpressionNode = IdentifierNode | LiteralNode | BinaryExpressionNode | CallExpressionNode | EntanglementOperationNode;

// --- Statements (Instructions that perform actions) ---
export interface VariableDeclarationNode extends ASTNode {
    type: 'VariableDeclaration';
    id: IdentifierNode;
    varType: TypeAnnotationNode;
    initializer?: ExpressionNode;
    memoryScope: 'local' | 'global' | 'heap';
}

export interface ReturnStatementNode extends ASTNode {
    type: 'ReturnStatement';
    argument: ExpressionNode;
}

export interface StateVectorCollapseNode extends ASTNode {
    type: 'StateVectorCollapse';
    test: ExpressionNode;
    consequent: BlockStatementNode;
    alternate?: BlockStatementNode;
}

export type StatementNode = VariableDeclarationNode | ReturnStatementNode | StateVectorCollapseNode | ExpressionNode;

// --- Blocks & Top-Level Structures ---
export interface BlockStatementNode extends ASTNode { type: 'BlockStatement'; body: StatementNode[]; }
export interface ParameterNode extends ASTNode { type: 'Parameter'; id: IdentifierNode; paramType: TypeAnnotationNode; }

export interface PermissionDecoratorNode extends ASTNode {
    type: 'PermissionDecorator';
    permissionType: 'read' | 'write' | 'network';
    resourceName: string;
}

export interface FunctionDeclarationNode extends ASTNode {
    type: 'FunctionDeclaration';
    id: IdentifierNode;
    modifiers: ('export' | 'inline')[];
    decorators: PermissionDecoratorNode[];
    parameters: ParameterNode[];
    returnType: TypeAnnotationNode;
    body: BlockStatementNode;
}

export interface ImportDeclarationNode extends ASTNode {
    type: 'ImportDeclaration';
    specifiers: { importedName: string }[];
    source: string;
}

export interface UnsafeBlockNode extends ASTNode {
    type: 'UnsafeBlock';
    body: BlockStatementNode;
}

export type TopLevelNode = FunctionDeclarationNode | ImportDeclarationNode;

export interface ProgramNode extends ASTNode {
    type: 'Program';
    body: TopLevelNode[];
}
