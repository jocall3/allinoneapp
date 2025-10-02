// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.


/**
 * @fileoverview The Lexer (or Scanner/Tokenizer) for the TSAL language.
 * It takes a raw source code string and breaks it into a sequence of tokens.
 */

export interface Token {
    type: TokenType;
    value: string;
    line: number;
    column: number;
}

export enum TokenType {
    // Keywords
    Func = 'Func', Return = 'Return', Local = 'Local', Export = 'Export', Unsafe = 'Unsafe', Import = 'Import', From = 'From', Global = 'Global',
    If = 'If', Else = 'Else',
    
    // Types
    I32 = 'I32', I64 = 'I64', F32 = 'F32', F64 = 'F64', Bool = 'Bool',
    MemPtr = 'MemPtr', StringRef = 'StringRef', HostRef = 'HostRef',

    // Symbols
    Identifier = 'Identifier',
    IntegerLiteral = 'IntegerLiteral',
    StringLiteral = 'StringLiteral',

    // Operators
    Equals = '=', Plus = '+', Minus = '-', Star = '*', Slash = '/',

    // Punctuation
    OpenParen = '(', CloseParen = ')', OpenBrace = '{', CloseBrace = '}',
    Colon = ':', Comma = ',',
    
    // Decorators
    Decorator = '@',

    EOF = 'EOF',
}

const KEYWORDS: Record<string, TokenType> = {
    'func': TokenType.Func, 'return': TokenType.Return, 'local': TokenType.Local,
    'export': TokenType.Export, 'unsafe': TokenType.Unsafe, 'import': TokenType.Import,
    'from': TokenType.From, 'global': TokenType.Global, 'if': TokenType.If, 'else': TokenType.Else
};

const TYPES: Record<string, TokenType> = {
    'i32': TokenType.I32, 'i64': TokenType.I64, 'f32': TokenType.F32, 'f64': TokenType.F64,
    'bool': TokenType.Bool, 'mem_ptr': TokenType.MemPtr, 'string_ref': TokenType.StringRef,
    'host_ref': TokenType.HostRef
};


export class Lexer {
    private source: string;
    private position: number = 0;
    private line: number = 1;
    private column: number = 1;

    constructor(source: string) {
        this.source = source;
    }

    private advance(): string {
        const char = this.source[this.position++];
        if (char === '\n') {
            this.line++;
            this.column = 1;
        } else {
            this.column++;
        }
        return char;
    }

    private peek(): string {
        return this.source[this.position];
    }
    
    private createToken(type: TokenType, value: string): Token {
        return { type, value, line: this.line, column: this.column - value.length };
    }

    public tokenize(): Token[] {
        const tokens: Token[] = [];
        while (this.position < this.source.length) {
            const startPos = this.position;
            const char = this.advance();

            switch (char) {
                case ' ': case '\r': case '\t': break;
                case '\n': break; // Handled in advance()

                // Punctuation
                case '(': tokens.push(this.createToken(TokenType.OpenParen, char)); break;
                case ')': tokens.push(this.createToken(TokenType.CloseParen, char)); break;
                case '{': tokens.push(this.createToken(TokenType.OpenBrace, char)); break;
                case '}': tokens.push(this.createToken(TokenType.CloseBrace, char)); break;
                case ':': tokens.push(this.createToken(TokenType.Colon, char)); break;
                case ',': tokens.push(this.createToken(TokenType.Comma, char)); break;
                case '@': tokens.push(this.createToken(TokenType.Decorator, char)); break;

                // Operators
                case '+': tokens.push(this.createToken(TokenType.Plus, char)); break;
                case '-': tokens.push(this.createToken(TokenType.Minus, char)); break;
                case '*': tokens.push(this.createToken(TokenType.Star, char)); break;
                case '/': tokens.push(this.createToken(TokenType.Slash, char)); break;
                case '=': tokens.push(this.createToken(TokenType.Equals, char)); break;

                default:
                    if (/[a-zA-Z_]/.test(char)) {
                        let value = char;
                        while (/[a-zA-Z0-9_]/.test(this.peek())) {
                            value += this.advance();
                        }
                        const keywordType = KEYWORDS[value];
                        const typeType = TYPES[value];
                        if (keywordType) {
                            tokens.push(this.createToken(keywordType, value));
                        } else if (typeType) {
                            tokens.push(this.createToken(typeType, value));
                        } else {
                            tokens.push(this.createToken(TokenType.Identifier, value));
                        }
                    } else if (/\d/.test(char)) {
                        let value = char;
                        while (/\d/.test(this.peek())) {
                            value += this.advance();
                        }
                        tokens.push(this.createToken(TokenType.IntegerLiteral, value));
                    } else if (char === '"') {
                        let value = '';
                        while (this.peek() !== '"' && this.position < this.source.length) {
                            value += this.advance();
                        }
                        this.advance(); // consume closing quote
                        tokens.push(this.createToken(TokenType.StringLiteral, value));
                    } else {
                        throw new Error(`Lexer Error: Unexpected character '${char}' at line ${this.line}, column ${this.column}`);
                    }
                    break;
            }
        }
        tokens.push({ type: TokenType.EOF, value: '', line: this.line, column: this.column });
        return tokens;
    }
}
