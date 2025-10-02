// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.


/**
 * @fileoverview The Parser for the TSAL language.
 * This implementation uses a recursive descent parser, which is straightforward
 * for the defined TSAL grammar. It takes tokens from the Lexer and constructs an
 * Abstract Syntax Tree (AST).
 */

import { Token, TokenType } from './lexer';
import * as AST from '../../tsal/syntax/ast';

export class Parser {
    private tokens: Token[];
    private position: number = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    public parse(): AST.ProgramNode {
        const programNode: AST.ProgramNode = { type: 'Program', body: [] };
        while (!this.isAtEnd()) {
            programNode.body.push(this.parseTopLevelDeclaration());
        }
        return programNode;
    }

    private parseTopLevelDeclaration(): AST.TopLevelNode {
        let isExported = false;
        if (this.match(TokenType.Export)) {
            isExported = true;
        }
        if (this.check(TokenType.Func)) {
            return this.parseFunctionDeclaration(isExported);
        }
        throw this.error("Expected 'export' or 'func' at top level.");
    }

    private parseFunctionDeclaration(isExported: boolean): AST.FunctionDeclarationNode {
        this.consume(TokenType.Func, "Expected 'func' keyword.");
        const name = this.consume(TokenType.Identifier, "Expected function name.");
        this.consume(TokenType.OpenParen, "Expected '(' after function name.");
        
        const parameters: AST.ParameterNode[] = [];
        if (!this.check(TokenType.CloseParen)) {
            do {
                parameters.push(this.parseParameter());
            } while (this.match(TokenType.Comma));
        }
        this.consume(TokenType.CloseParen, "Expected ')' after parameters.");
        this.consume(TokenType.Colon, "Expected ':' for return type annotation.");
        const returnType = this.parseTypeAnnotation();
        const body = this.parseBlockStatement();

        return {
            type: 'FunctionDeclaration',
            id: { type: 'Identifier', name: name.value },
            modifiers: isExported ? ['export'] : [],
            decorators: [], // Placeholder
            parameters,
            returnType,
            body,
        };
    }

    private parseParameter(): AST.ParameterNode {
        const name = this.consume(TokenType.Identifier, "Expected parameter name.");
        this.consume(TokenType.Colon, "Expected ':' for parameter type annotation.");
        const type = this.parseTypeAnnotation();
        return { type: 'Parameter', id: { type: 'Identifier', name: name.value }, paramType: type };
    }

    private parseTypeAnnotation(): AST.TypeAnnotationNode {
        if (this.match(TokenType.I32)) return { type: 'I32Type' };
        // ... add other types
        throw this.error("Expected a type annotation.");
    }

    private parseBlockStatement(): AST.BlockStatementNode {
        this.consume(TokenType.OpenBrace, "Expected '{' to start a block.");
        const statements: AST.StatementNode[] = [];
        while (!this.check(TokenType.CloseBrace) && !this.isAtEnd()) {
            statements.push(this.parseStatement());
        }
        this.consume(TokenType.CloseBrace, "Expected '}' to end a block.");
        return { type: 'BlockStatement', body: statements };
    }

    private parseStatement(): AST.StatementNode {
        if (this.match(TokenType.Return)) {
            const value = this.parseExpression();
            return { type: 'ReturnStatement', argument: value };
        }
        return this.parseExpression();
    }

    private parseExpression(): AST.ExpressionNode {
        return this.parseAddition();
    }

    private parseAddition(): AST.ExpressionNode {
        let expr = this.parseMultiplication();
        while(this.match(TokenType.Plus, TokenType.Minus)) {
            const operator = this.previous().value;
            const right = this.parseMultiplication();
            expr = { type: 'BinaryExpression', operator, left: expr, right };
        }
        return expr;
    }
    
    private parseMultiplication(): AST.ExpressionNode {
        let expr = this.parsePrimary();
        while(this.match(TokenType.Star, TokenType.Slash)) {
            const operator = this.previous().value;
            const right = this.parsePrimary();
            expr = { type: 'BinaryExpression', operator, left: expr, right };
        }
        return expr;
    }

    private parsePrimary(): AST.ExpressionNode {
        if (this.match(TokenType.IntegerLiteral)) {
            return { type: 'Literal', value: parseInt(this.previous().value, 10) };
        }
        if (this.match(TokenType.Identifier)) {
            return { type: 'Identifier', name: this.previous().value };
        }
        throw this.error("Expected an expression.");
    }

    // --- Helper methods ---
    private match(...types: TokenType[]): boolean {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }

    private consume(type: TokenType, message: string): Token {
        if (this.check(type)) return this.advance();
        throw this.error(message);
    }

    private check(type: TokenType): boolean {
        if (this.isAtEnd()) return false;
        return this.peek().type === type;
    }

    private advance(): Token {
        if (!this.isAtEnd()) this.position++;
        return this.previous();
    }

    private isAtEnd(): boolean { return this.peek().type === TokenType.EOF; }
    private peek(): Token { return this.tokens[this.position]; }
    private previous(): Token { return this.tokens[this.position - 1]; }
    private error(message: string): Error {
        const token = this.peek();
        return new Error(`[Parser Error] line ${token.line}, col ${token.column}: ${message}`);
    }
}
