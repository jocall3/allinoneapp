/**
 * @fileoverview Defines the Abstract Syntax Tree (AST) structure for the TSAL language.
 * Each interface represents a node in the tree that the Alchemist compiler will parse,
 * analyze, and generate code from. This AST is designed to capture the high-level,
 * physics-inspired concepts of TSAL.
 */

// --- Base Node Type ---
export interface ASTNode {
    type: string;
    // Optional location data for error reporting
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

// Represents an FFI call into the host environment, an "entanglement operation".
export interface EntanglementOperationNode extends CallExpressionNode {
    type: 'EntanglementOperation';
    hostNamespace: string; // e.g., 'console' or 'filesystem'
}

export type ExpressionNode = IdentifierNode | LiteralNode | BinaryExpressionNode | CallExpressionNode | EntanglementOperationNode;

// --- Statements (Instructions that perform actions) ---
export interface VariableDeclarationNode extends ASTNode {
    type: 'VariableDeclaration';
    id: IdentifierNode;
    varType: TypeAnnotationNode;
    initializer?: ExpressionNode;
    memoryScope: 'local' | 'global' | 'heap'; // Explicit memory scope
}

// Represents the "measurement" of a function's result.
export interface ObservableMeasurementNode extends ASTNode { // Formerly ReturnStatement
    type: 'ObservableMeasurement';
    argument: ExpressionNode;
}

// Represents a conditional branch, a "collapse" of a state vector.
export interface StateVectorCollapseNode extends ASTNode { // Formerly IfStatement
    type: 'StateVectorCollapse';
    test: ExpressionNode;
    consequent: BlockStatementNode;
    alternate?: BlockStatementNode;
}

export type StatementNode = VariableDeclarationNode | ObservableMeasurementNode | StateVectorCollapseNode | ExpressionNode;

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
    source: string; // e.g., "tsal:mem", "tsal:host:console"
}

// A block where the compiler's safety checks are explicitly bypassed.
export interface UnsafeBlockNode extends ASTNode {
    type: 'UnsafeBlock';
    body: BlockStatementNode;
}

// The root of the entire program's AST.
export interface ProgramNode extends ASTNode {
    type: 'Program';
    body: (FunctionDeclarationNode | ImportDeclarationNode)[];
}
