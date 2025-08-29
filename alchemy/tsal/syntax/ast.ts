/**
 * @fileoverview Defines the Abstract Syntax Tree (AST) structure for the TSAL language.
 * Each interface represents a node in the tree that the Alchemist compiler will parse,
 * analyze, and generate code from.
 */

import type { i32, i64, f32, f64, bool, mem_ptr, string_ref, host_ref } from './types';

// --- Base Node Type ---
export interface ASTNode {
    type: string;
}

// --- Type Annotations ---
export type TypeAnnotationNode =
    | { type: 'I32Type' } | { type: 'I64Type' } | { type: 'F32Type' } | { type: 'F64Type' }
    | { type: 'BoolType' } | { type: 'MemPtrType' } | { type: 'StringRefType' }
    | { type: 'HostRefType', typeName: string }
    | { type: 'SharedMemBufferType', elementType: TypeAnnotationNode };

// --- Expressions ---
export interface IdentifierNode extends ASTNode { type: 'Identifier'; name: string; }
export interface LiteralNode extends ASTNode { type: 'Literal'; value: number | bigint | boolean | string; }
export interface BinaryExpressionNode extends ASTNode { type: 'BinaryExpression'; operator: string; left: ExpressionNode; right: ExpressionNode; }
export interface CallExpressionNode extends ASTNode { type: 'CallExpression'; callee: IdentifierNode; arguments: ExpressionNode[]; }
export type ExpressionNode = IdentifierNode | LiteralNode | BinaryExpressionNode | CallExpressionNode;

// --- Statements ---
export interface ReturnStatementNode extends ASTNode { type: 'ReturnStatement'; argument: ExpressionNode; }
export interface VariableDeclarationNode extends ASTNode { type: 'VariableDeclaration'; id: IdentifierNode; varType: TypeAnnotationNode; initializer?: ExpressionNode; memoryScope: 'local' | 'global' | 'heap'; }
export type StatementNode = ReturnStatementNode | VariableDeclarationNode | ExpressionNode;

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
    source: 'tsal:mem' | 'tsal:host:console' | 'tsal:host:filesystem' | 'tsal:threads';
}

export interface UnsafeBlockNode extends ASTNode {
    type: 'UnsafeBlock';
    body: BlockStatementNode; // In a real implementation, this could contain raw Wasm instructions.
}

export interface ProgramNode extends ASTNode {
    type: 'Program';
    body: (FunctionDeclarationNode | ImportDeclarationNode)[];
}
