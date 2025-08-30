import { describe, it, expect } from 'vitest';
import { Lexer, TokenType } from './lexer';

describe('Lexer', () => {
    it('should tokenize a simple function declaration', () => {
        const source = 'export func add(a: i32, b: i32): i32 { return a + b; }';
        const lexer = new Lexer(source);
        const tokens = lexer.tokenize();

        const expectedTypes = [
            TokenType.Export, TokenType.Func, TokenType.Identifier, TokenType.OpenParen,
            TokenType.Identifier, TokenType.Colon, TokenType.I32, TokenType.Comma,
            TokenType.Identifier, TokenType.Colon, TokenType.I32, TokenType.CloseParen,
            TokenType.Colon, TokenType.I32, TokenType.OpenBrace, TokenType.Return,
            TokenType.Identifier, TokenType.Plus, TokenType.Identifier, TokenType.CloseBrace,
            TokenType.EOF,
        ];

        expect(tokens.map(t => t.type)).toEqual(expectedTypes);
        expect(tokens.find(t => t.type === TokenType.Identifier && t.value === 'add')).toBeDefined();
    });
});
