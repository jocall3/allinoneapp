/**
 * @fileoverview The Lexer (or Scanner/Tokenizer) for the TSAL language.
 * It takes a raw source code string and breaks it into a sequence of tokens.
 */

export interface Token {
    type: TokenType;
    value: string;
}

export enum TokenType {
    Keyword,      // func, return, local, export, unsafe
    Type,         // i32, f64, bool, etc.
    Identifier,   // variable names, function names
    Operator,     // +, -, *, /, =
    Punctuation,  // {, }, (, ), :, ,
    Literal,      // 123, "hello"
    EOF,          // End of File
}

const KEYWORDS = ['func', 'return', 'local', 'export', 'unsafe', 'import', 'from'];
const TYPES = ['i32', 'i64', 'f32', 'f64', 'bool', 'mem_ptr', 'string_ref', 'host_ref'];

export class Lexer {
    private source: string;
    private position: number = 0;

    constructor(source: string) {
        this.source = source;
    }

    public tokenize(): Token[] {
        const tokens: Token[] = [];
        while (this.position < this.source.length) {
            const char = this.source[this.position];

            if (/\s/.test(char)) {
                this.position++;
                continue;
            }

            if (/[{}(),:;]/.test(char)) {
                tokens.push({ type: TokenType.Punctuation, value: char });
                this.position++;
                continue;
            }

            if (/[+\-*/=]/.test(char)) {
                tokens.push({ type: TokenType.Operator, value: char });
                this.position++;
                continue;
            }

            if (/\d/.test(char)) {
                let value = '';
                while (/\d/.test(this.source[this.position])) {
                    value += this.source[this.position];
                    this.position++;
                }
                tokens.push({ type: TokenType.Literal, value });
                continue;
            }

            if (/[a-zA-Z_]/.test(char)) {
                let value = '';
                while (/[a-zA-Z0-9_]/.test(this.source[this.position])) {
                    value += this.source[this.position];
                    this.position++;
                }

                if (KEYWORDS.includes(value)) {
                    tokens.push({ type: TokenType.Keyword, value });
                } else if (TYPES.includes(value)) {
                    tokens.push({ type: TokenType.Type, value });
                } else {
                    tokens.push({ type: TokenType.Identifier, value });
                }
                continue;
            }
            
            if (char === '"') {
                let value = '';
                this.position++; // Skip opening quote
                while(this.source[this.position] !== '"' && this.position < this.source.length) {
                    value += this.source[this.position];
                    this.position++;
                }
                this.position++; // Skip closing quote
                tokens.push({ type: TokenType.Literal, value });
                continue;
            }

            throw new Error(`Lexer Error: Unexpected character '${char}' at position ${this.position}`);
        }
        tokens.push({ type: TokenType.EOF, value: '' });
        return tokens;
    }
}
