/**
 * @fileoverview The Parser for the TSAL language.
 * This implementation uses a Pratt parser (top-down operator precedence parser),
 * which is excellent for handling expressions with different precedence levels.
 * It takes tokens from the Lexer and constructs an Abstract Syntax Tree (AST).
 */

import { Token, TokenType } from './lexer';
import * as AST from '../../tsal/syntax/ast';

type PrefixParselet = (token: Token) => AST.ExpressionNode;
type InfixParselet = (left: AST.ExpressionNode, token: Token) => AST.ExpressionNode;

enum Precedence {
    LOWEST,
    SUM,     // + -
    PRODUCT, // * /
    CALL,    // myFunc()
}

const PRECEDENCES: Partial<Record<TokenType, Precedence>> = {
    [TokenType.Plus]: Precedence.SUM,
    [TokenType.Minus]: Precedence.SUM,
    [TokenType.Star]: Precedence.PRODUCT,
    [TokenType.Slash]: Precedence.PRODUCT,
    [TokenType.OpenParen]: Precedence.CALL,
};

export class Parser {
    private tokens: Token[];
    private position: number = 0;
    private prefixParselets: Map<TokenType, PrefixParselet> = new Map();
    private infixParselets: Map<TokenType, InfixParselet> = new Map();

    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.registerParselets();
    }

    private registerParselets() {
        // Register prefix parselets for literals and identifiers
        this.prefixParselets.set(TokenType.Identifier, this.parseIdentifier.bind(this));
        this.prefixParselets.set(TokenType.IntegerLiteral, this.parseIntegerLiteral.bind(this));
        
        // Register infix parselets for binary operators
        this.registerInfix(TokenType.Plus, Precedence.SUM);
        this.registerInfix(TokenType.Minus, Precedence.SUM);
        this.registerInfix(TokenType.Star, Precedence.PRODUCT);
        this.registerInfix(TokenType.Slash, Precedence.PRODUCT);
    }

    private registerInfix(type: TokenType, precedence: Precedence) {
        this.infixParselets.set(type, (left, token) => {
            const right = this.parseExpression(precedence);
            return { type: 'BinaryExpression', operator: token.value, left, right };
        });
    }

    public parse(): AST.ProgramNode {
        const programNode: AST.ProgramNode = {
            type: 'Program',
            body: []
        };

        while (!this.isAtEnd()) {
            // For now, assume all we have are simple expressions for testing
            // A full implementation would have a `parseStatement` or `parseDeclaration` here.
            // This is just a placeholder to consume tokens.
             this.advance();
        }

        console.log("[Parser] Finished parsing. A full implementation would build a complete AST for declarations and statements.");
        return programNode;
    }

    public parseExpression(precedence: Precedence = Precedence.LOWEST): AST.ExpressionNode {
        const token = this.advance();
        const prefix = this.prefixParselets.get(token.type);

        if (!prefix) {
            throw new Error(`Parser Error: No prefix parselet found for token type ${token.type}`);
        }

        let left = prefix(token);

        while (precedence < this.getPrecedence()) {
            const infixToken = this.advance();
            const infix = this.infixParselets.get(infixToken.type);
            if (!infix) {
                throw new Error(`Parser Error: No infix parselet found for token type ${infixToken.type}`);
            }
            left = infix(left, infixToken);
        }

        return left;
    }
    
    private parseIdentifier(token: Token): AST.IdentifierNode {
        return { type: 'Identifier', name: token.value };
    }

    private parseIntegerLiteral(token: Token): AST.LiteralNode {
        return { type: 'Literal', value: parseInt(token.value, 10) };
    }

    private getPrecedence(): Precedence {
        const token = this.currentToken();
        return PRECEDENCES[token.type] || Precedence.LOWEST;
    }
    
    private currentToken(): Token {
        return this.tokens[this.position];
    }

    private advance(): Token {
        const token = this.currentToken();
        if (!this.isAtEnd()) this.position++;
        return token;
    }

    private isAtEnd(): boolean {
        return this.currentToken().type === TokenType.EOF;
    }
}
