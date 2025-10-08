// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

/**
 * @fileoverview A robust, zero-dependency, in-browser WAT to Wasm binary compiler (assembler).
 * This file significantly enhances the initial proof-of-concept by implementing a lexer and parser
 * to dynamically interpret and compile a subset of WebAssembly Text Format (WAT) into a Wasm binary.
 * It is designed to be self-contained and of high quality, akin to production-ready tools,
 * while adhering to the specific needs and output patterns of the Alchemy engine's CodeGenerator.
 *
 * It supports:
 * - Module structure with sections for Types, Functions, Exports, and Code.
 * - Dynamic function definitions with named parameters and local variables.
 * - `i32` value type for parameters, results, and local variables.
 * - Basic `i32` instructions: `local.get`, `i32.const`, `i32.add`, `i32.sub`, `i32.mul`.
 * - Exporting functions.
 * - Robust error handling with detailed messages and location information.
 * - Handling of various comment styles (line `;;` and block `(; ... ;)`, including nesting).
 */

// --- Wasm Binary Opcodes (subset, expanded) ---
// Note: These are internal to the compiler, allowing for flexible expansion.
const Opcodes = {
    'local.get': 0x20,
    'local.set': 0x21,
    'local.tee': 0x22,
    'i32.const': 0x41,
    'i32.add': 0x6a,
    'i32.sub': 0x6b,
    'i32.mul': 0x6c,
    'end': 0x0b,
};

// --- Wasm Section Codes ---
// Note: These are internal to the compiler.
const Section = {
    Type: 1,
    Import: 2,
    Function: 3,
    Table: 4,
    Memory: 5,
    Global: 6,
    Export: 7,
    Start: 8,
    Element: 9,
    Code: 10,
    Data: 11,
    Custom: 0,
};

/**
 * @public
 * @enum {number}
 * Defines the WebAssembly value types and their corresponding byte codes.
 */
export const WasmValueType = {
    'i32': 0x7f,
    'i64': 0x7e,
    'f32': 0x7d,
    'f64': 0x7c,
};

/**
 * @public
 * @enum {number}
 * Defines the external kind for export entries, indicating what kind of item is being exported.
 */
export const ExternalKind = {
    Function: 0x00,
    Table: 0x01,
    Memory: 0x02,
    Global: 0x03,
};

// --- LEB128 Encoding (unsigned and signed) ---

/**
 * Encodes an unsigned integer into a LEB128 byte array.
 * @param n The unsigned integer to encode.
 * @returns An array of bytes representing the LEB128 encoding.
 */
function encodeUnsignedLEB128(n: number): number[] {
    const buffer: number[] = [];
    do {
        let byte = n & 0x7f;
        n >>>= 7;
        if (n !== 0) {
            byte |= 0x80;
        }
        buffer.push(byte);
    } while (n !== 0);
    return buffer;
}

/**
 * Encodes a signed integer into a LEB128 byte array (sleb128).
 * @param n The signed integer to encode.
 * @returns An array of bytes representing the SLEB128 encoding.
 */
function encodeSignedLEB128(n: number): number[] {
    const buffer: number[] = [];
    let more = true;
    while (more) {
        let byte = n & 0x7f;
        n >>= 7; // Arithmetic right shift
        // Check if `n` still has significant bits or if `byte` needs sign extension
        if ((n === 0 && (byte & 0x40) === 0) || (n === -1 && (byte & 0x40) !== 0)) {
            more = false;
        } else {
            byte |= 0x80;
        }
        buffer.push(byte);
    }
    return buffer;
}


// --- Vector (Array) Encoding ---
/**
 * Encodes a vector (an array of bytes) by prefixing it with its LEB128-encoded length.
 * @param data The array of bytes to encode as a vector.
 * @returns An array of bytes representing the encoded vector.
 */
function encodeVector(data: number[]): number[] {
    return [...encodeUnsignedLEB128(data.length), ...data];
}

// --- String Encoding ---
/**
 * Encodes a string into a Wasm-compatible byte array, prefixed with its LEB128-encoded byte length.
 * @param s The string to encode.
 * @returns An array of bytes representing the encoded string.
 */
function encodeString(s: string): number[] {
    const bytes = [...s].map(c => c.charCodeAt(0));
    return [...encodeUnsignedLEB128(bytes.length), ...bytes];
}

// --- Section Encoding ---
/**
 * Creates a Wasm section by combining the section type, LEB128-encoded payload size, and payload data.
 * @param sectionType The numeric type of the section (e.g., `Section.Type`).
 * @param data The payload data for the section.
 * @returns An array of bytes representing the complete Wasm section.
 */
function createSection(sectionType: number, data: number[]): number[] {
    return [sectionType, ...encodeVector(data)];
}

// --- Error Handling ---

/**
 * @public
 * Custom error class for reporting compilation errors with detailed location information.
 */
export class WatCompilerError extends Error {
    constructor(message: string, public token?: Token, public line?: number, public col?: number) {
        let msg = message;
        if (token) {
            msg += ` at '${token.value}'`;
        }
        if (line !== undefined && col !== undefined) {
            msg += ` (line ${line}, col ${col})`;
        } else if (token) {
             msg += ` (line ${token.line}, col ${token.col})`;
        }
        super(msg);
        this.name = 'WatCompilerError';
        // Ensure proper prototype chain for `instanceof`
        Object.setPrototypeOf(this, WatCompilerError.prototype);
    }
}

// --- Lexer (Tokenizer) ---

/**
 * @public
 * @enum {number}
 * Defines the types of tokens recognized by the `WatLexer`.
 */
export enum TokenType {
    LEFT_PAREN,
    RIGHT_PAREN,
    KEYWORD,      // e.g., 'module', 'func', 'export', 'param', 'result', 'type', 'local'
    IDENTIFIER,   // e.g., '$add', '$a', 'add' (for string literals like "add")
    VALTYPE,      // e.g., 'i32', 'i64'
    NUMBER,       // e.g., '0', '1', '100', parsed as number
    OPCODE,       // e.g., 'local.get', 'i32.add', 'i32.const'
    EOF,          // End of file
}

/**
 * @public
 * Interface representing a single token emitted by the `WatLexer`.
 */
export interface Token {
    type: TokenType;
    value: string | number;
    line: number;
    col: number;
}

/**
 * @public
 * A lexer (tokenizer) for WebAssembly Text Format (WAT).
 * It converts a WAT string into a stream of `Token` objects, handling whitespace, comments,
 * and recognizing various WAT syntax elements.
 */
export class WatLexer {
    private position: number = 0;
    private line: number = 1;
    private column: number = 1;
    private readonly wat: string;
    private readonly keywords: Set<string>;
    private readonly valTypes: Set<string>;
    private readonly opcodes: Set<string>;
    private tokens: Token[] = [];
    private currentTokenIndex: number = 0;

    /**
     * Creates an instance of WatLexer.
     * @param wat The WebAssembly Text Format string to tokenize.
     */
    constructor(wat: string) {
        this.wat = wat;
        // Expanded keywords for better parsing structure, even if not all fully implemented yet.
        this.keywords = new Set(['module', 'func', 'export', 'param', 'result', 'type', 'local', 'memory', 'global', 'table', 'data', 'elem', 'import', 'start']);
        this.valTypes = new Set(Object.keys(WasmValueType));
        this.opcodes = new Set(Object.keys(Opcodes));
        this.tokenize(); // Pre-tokenize the entire input for easier parsing
    }

    /**
     * Checks if the lexer has reached the end of the input string.
     * @returns True if at the end, false otherwise.
     */
    private isAtEnd(): boolean {
        return this.position >= this.wat.length;
    }

    /**
     * Advances the lexer's position and returns the character at the previous position.
     * Updates line and column numbers.
     * @returns The character that was at the current position before advancing.
     */
    private advance(): string {
        const char = this.wat[this.position++];
        if (char === '\n') {
            this.line++;
            this.column = 1;
        } else {
            this.column++;
        }
        return char;
    }

    /**
     * Peeks at a character at a given offset from the current position without advancing.
     * @param offset The offset from the current position (default 0).
     * @returns The character at the peeked position, or undefined if out of bounds.
     */
    private peek(offset: number = 0): string | undefined {
        if (this.position + offset >= this.wat.length) return undefined;
        return this.wat[this.position + offset];
    }

    /**
     * Creates a `Token` object with the given type and value, assigning current line/column info.
     * @param type The `TokenType` of the token.
     * @param value The raw string or parsed number value of the token.
     * @returns The created `Token` object.
     */
    private createToken(type: TokenType, value: string | number): Token {
        return { type, value, line: this.line, col: this.column - String(value).length };
    }

    /**
     * Skips over whitespace and comments (line `;;` and nested block `(; ... ;)`) in the input.
     * @throws {WatCompilerError} If an unterminated block comment is encountered.
     */
    private skipWhitespace(): void {
        while (!this.isAtEnd()) {
            const char = this.peek();
            if (char === ' ' || char === '\r' || char === '\t' || char === '\n') {
                this.advance();
            } else if (char === ';') {
                if (this.peek(1) === ';') { // Line comment `;;`
                    while (!this.isAtEnd() && this.peek() !== '\n') {
                        this.advance();
                    }
                } else {
                    break; // Not a comment start, or just a semicolon (part of a symbol, handled later)
                }
            } else if (char === '(' && this.peek(1) === ';') { // Block comment `(; ... ;)`
                this.advance(); // consume '('
                this.advance(); // consume ';'
                let level = 1; // Track nesting level for block comments
                while (!this.isAtEnd() && level > 0) {
                    const next = this.advance();
                    if (next === '(' && this.peek() === ';') {
                        this.advance(); // consume ';'
                        level++;
                    } else if (next === ';' && this.peek() === ')') {
                        this.advance(); // consume ')'
                        level--;
                    }
                }
                if (level > 0) {
                    throw new WatCompilerError('Unterminated block comment', undefined, this.line, this.column);
                }
            } else {
                break; // Not whitespace or comment
            }
        }
    }

    /**
     * Tokenizes the entire WAT input string and stores the tokens internally.
     * @throws {WatCompilerError} For unexpected characters or unterminated strings.
     */
    private tokenize(): void {
        while (!this.isAtEnd()) {
            this.skipWhitespace();
            if (this.isAtEnd()) break;

            const startCol = this.column;
            const char = this.advance();

            if (char === '(') { this.tokens.push(this.createToken(TokenType.LEFT_PAREN, '(')); continue; }
            if (char === ')') { this.tokens.push(this.createToken(TokenType.RIGHT_PAREN, ')')); continue; }
            
            if (/\d/.test(char)) { // Numbers
                let value = char;
                while (!this.isAtEnd() && /\d/.test(this.peek())) {
                    value += this.advance();
                }
                this.tokens.push(this.createToken(TokenType.NUMBER, parseInt(value, 10)));
                continue;
            }

            if (/[a-zA-Z_$]/.test(char)) { // Identifiers, keywords, valtypes, opcodes
                let value = char;
                while (!this.isAtEnd() && /[a-zA-Z0-9_$.-]/.test(this.peek())) { // Wasm identifiers can have . and -
                    value += this.advance();
                }

                if (this.keywords.has(value)) {
                    this.tokens.push(this.createToken(TokenType.KEYWORD, value));
                } else if (this.valTypes.has(value)) {
                    this.tokens.push(this.createToken(TokenType.VALTYPE, value));
                } else if (this.opcodes.has(value)) {
                    this.tokens.push(this.createToken(TokenType.OPCODE, value));
                } else if (value.startsWith('$')) { // Symbol identifier, e.g., $add
                    this.tokens.push(this.createToken(TokenType.IDENTIFIER, value));
                } else { // Generic identifier (e.g., "add" if not a string literal)
                    this.tokens.push(this.createToken(TokenType.IDENTIFIER, value));
                }
                continue;
            }
            
            if (char === '"') { // String literals, e.g., "add" for export names
                let value = '';
                const initialLine = this.line;
                const initialCol = this.column - 1; 
                while (!this.isAtEnd() && this.peek() !== '"') {
                    // For simplicity, no escape sequences are handled.
                    value += this.advance();
                }
                if (this.isAtEnd()) {
                    throw new WatCompilerError('Unterminated string literal', undefined, initialLine, initialCol);
                }
                this.advance(); // consume closing '"'
                this.tokens.push(this.createToken(TokenType.IDENTIFIER, value)); // String literal value is treated as an identifier value
                continue;
            }

            throw new WatCompilerError(`Unexpected character: '${char}'`, undefined, this.line, startCol);
        }
        this.tokens.push(this.createToken(TokenType.EOF, 'EOF'));
    }

    /**
     * Returns the token at the current position plus an offset without consuming it.
     * @param offset The offset from the current token index (default 0).
     * @returns The `Token` object, or an EOF token if out of bounds.
     */
    public peekToken(offset: number = 0): Token {
        if (this.currentTokenIndex + offset >= this.tokens.length) {
            return this.tokens[this.tokens.length - 1]; // Always return EOF token at the end
        }
        return this.tokens[this.currentTokenIndex + offset];
    }

    /**
     * Consumes and returns the current token, advancing the lexer's internal token index.
     * @returns The consumed `Token` object, or an EOF token if at the end.
     */
    public eatToken(): Token {
        if (this.currentTokenIndex >= this.tokens.length) {
            return this.tokens[this.tokens.length - 1]; // Always return EOF token at the end
        }
        return this.tokens[this.currentTokenIndex++];
    }
}

// --- Parser ---

/**
 * @public
 * Interface representing a function's signature (parameter and return types).
 */
export interface FunctionSignature {
    paramTypes: number[];   // WasmValueType byte codes
    returnTypes: number[];  // WasmValueType byte codes
    typeIndex?: number;     // Assigned by parser, index in the Type section
}

/**
 * @public
 * Interface representing a local variable or parameter declaration within a function.
 */
export interface LocalDeclaration {
    name: string;   // e.g., '$a'
    type: number;   // WasmValueType byte code
    index?: number; // Assigned by parser within function scope
}

/**
 * @public
 * Interface representing a single WebAssembly instruction with its opcode and operands.
 */
export interface Instruction {
    opcode: number;
    operands: (number | string)[]; // Can be indices, constants, etc.
}

/**
 * @public
 * Interface representing a function's body, including its local variables and instructions.
 */
export interface FunctionBody {
    locals: LocalDeclaration[];
    instructions: Instruction[];
    functionIndex?: number; // Assigned by parser, index in the Function section
    typeIndex?: number;     // Reference to its FunctionSignature
}

/**
 * @public
 * Interface representing an export entry in the Wasm module.
 */
export interface ExportEntry {
    name: string;   // The name exported (e.g., "add")
    kind: number;   // ExternalKind (e.g., Function: 0x00)
    index: number;  // Index of the exported item (e.g., function index)
}

/**
 * Internal interface to store detailed function definition during parsing for symbol resolution.
 */
interface InternalFunctionDefinition {
    name: string;                   // e.g., '$add'
    typeIndex: number;              // Index in the Type section
    functionIndex: number;          // Index in the Function section
    signature: FunctionSignature;
    localsByName: Map<string, number>; // Maps local names (params + locals) to their indices
    paramCount: number;             // Number of parameters, useful for distinguishing params from locals
}

/**
 * @public
 * A parser for a subset of WebAssembly Text Format (WAT).
 * It takes a `WatLexer` instance and builds the necessary data structures
 * to assemble a Wasm binary, handling module, type, function, export, and code sections.
 */
export class WatParser {
    private lexer: WatLexer;

    // Collected Wasm module components
    private typeSignatures: FunctionSignature[] = [];
    private functionSectionEntries: number[] = []; // type indices for each function
    private exportSectionEntries: ExportEntry[] = [];
    private codeSectionBodies: FunctionBody[] = [];

    // Symbol tables for resolution during parsing
    private functionNameToIndex: Map<string, number> = new Map();         // Maps '$func_name' to its functionIndex
    private typeSignatureToTypeIndex: Map<string, number> = new Map();    // Maps stringified signature to type index

    /**
     * Creates an instance of WatParser.
     * @param lexer The `WatLexer` instance to draw tokens from.
     */
    constructor(lexer: WatLexer) {
        this.lexer = lexer;
    }

    /**
     * Consumes and returns the current token from the lexer, advancing its position.
     * @returns The consumed token.
     */
    private advance(): Token {
        return this.lexer.eatToken();
    }

    /**
     * Peeks at a token at a given offset from the current lexer position without consuming it.
     * @param offset The offset from the current token (default 0).
     * @returns The peeked token.
     */
    private peek(offset: number = 0): Token {
        return this.lexer.peekToken(offset);
    }

    /**
     * Consumes the current token if its type matches the `expectedType`, otherwise throws an error.
     * @param expectedType The `TokenType` expected.
     * @param errorMessage The error message if the type doesn't match.
     * @returns The consumed token.
     * @throws {WatCompilerError} If the current token's type does not match.
     */
    private eat(expectedType: TokenType, errorMessage: string): Token {
        const token = this.peek();
        if (token.type === expectedType) {
            return this.advance();
        }
        throw new WatCompilerError(errorMessage, token);
    }

    /**
     * Checks if the current token's type matches `expectedType` without consuming it.
     * @param expectedType The `TokenType` expected.
     * @param errorMessage The error message if the type doesn't match.
     * @returns The current token.
     * @throws {WatCompilerError} If the current token's type does not match.
     */
    private expect(expectedType: TokenType, errorMessage: string): Token {
        const token = this.peek();
        if (token.type !== expectedType) {
            throw new WatCompilerError(errorMessage, token);
        }
        return token; // Does not consume
    }

    /**
     * Consumes the current token if its type matches `expectedType` and returns true,
     * otherwise returns false without consuming the token.
     * @param expectedType The `TokenType` to match.
     * @returns True if the token matched and was consumed, false otherwise.
     */
    private match(expectedType: TokenType): boolean {
        if (this.peek().type === expectedType) {
            this.advance();
            return true;
        }
        return false;
    }

    /**
     * Resolves a WAT value type string (e.g., "i32") to its corresponding Wasm byte code.
     * @param typeName The string name of the value type.
     * @returns The byte code for the value type.
     * @throws {WatCompilerError} If the type name is unknown.
     */
    private getValTypeByte(typeName: string): number {
        const typeByte = WasmValueType[typeName as keyof typeof WasmValueType];
        if (typeByte === undefined) {
            throw new WatCompilerError(`Unknown value type: ${typeName}`, this.peek());
        }
        return typeByte;
    }

    /**
     * Resolves a WAT opcode string (e.g., "i32.add") to its corresponding Wasm byte code.
     * @param opcodeName The string name of the opcode.
     * @returns The byte code for the opcode.
     * @throws {WatCompilerError} If the opcode name is unknown.
     */
    private getOpcodeByte(opcodeName: string): number {
        const opcodeByte = Opcodes[opcodeName as keyof typeof Opcodes];
        if (opcodeByte === undefined) {
            throw new WatCompilerError(`Unknown opcode: ${opcodeName}`, this.peek());
        }
        return opcodeByte;
    }

    // --- Parsing Sub-functions ---

    /**
     * Parses a list of value types (e.g., `i32 i32`).
     * @returns An array of Wasm value type byte codes.
     */
    private parseValueTypeList(): number[] {
        const types: number[] = [];
        while (this.peek().type === TokenType.VALTYPE) {
            types.push(this.getValTypeByte(this.advance().value as string));
        }
        return types;
    }

    /**
     * Parses the `(param ...)` and `(result ...)` parts of a function signature.
     * This method is reusable for both type definitions and inline function definitions.
     * @returns An object containing `paramTypes` and `returnTypes`.
     * @throws {WatCompilerError} For syntax errors.
     */
    private parseFuncSignatureStructure(): { paramTypes: number[], returnTypes: number[] } {
        let paramTypes: number[] = [];
        let returnTypes: number[] = [];

        // Parse (param ...)
        if (this.peek().type === TokenType.LEFT_PAREN && this.peek(1).value === 'param') {
            this.advance(); // Consume '('
            this.advance(); // Consume 'param'
            // Handle optional named parameters within (param $a i32). For signature, only types matter.
            while (this.peek().type === TokenType.IDENTIFIER && String(this.peek().value).startsWith('$')) {
                 this.advance(); // Consume named param ($a)
            }
            paramTypes = this.parseValueTypeList();
            this.eat(TokenType.RIGHT_PAREN, "Expected ')' after parameters in function signature.");
        }

        // Parse (result ...) - optional
        if (this.peek().type === TokenType.LEFT_PAREN && this.peek(1).value === 'result') {
            this.advance(); // Consume '('
            this.advance(); // Consume 'result'
            returnTypes = this.parseValueTypeList();
            this.eat(TokenType.RIGHT_PAREN, "Expected ')' after results in function signature.");
        }
        
        return { paramTypes, returnTypes };
    }

    /**
     * Parses a `(type ...)` definition.
     * Example: `(type $add_t (func (param i32 i32) (result i32)))`
     * @returns The parsed `FunctionSignature`.
     * @throws {WatCompilerError} For syntax errors.
     */
    private parseTypeDefinition(): FunctionSignature {
        this.eat(TokenType.LEFT_PAREN, "Expected '(' for type definition.");
        this.eat(TokenType.KEYWORD, "Expected 'type' keyword."); // Consume 'type'

        const typeNameToken = this.eat(TokenType.IDENTIFIER, "Expected type identifier like '$add_t'.");
        const typeName = typeNameToken.value as string; // Store type name if needed for lookup later

        this.eat(TokenType.LEFT_PAREN, "Expected '(' for func type definition.");
        this.eat(TokenType.KEYWORD, "Expected 'func' keyword for type definition."); // Consume 'func'

        const { paramTypes, returnTypes } = this.parseFuncSignatureStructure();
        const signature: FunctionSignature = { paramTypes, returnTypes };

        this.eat(TokenType.RIGHT_PAREN, "Expected ')' after func type definition.");
        this.eat(TokenType.RIGHT_PAREN, "Expected ')' after type definition.");

        // Register the type signature by its structure to avoid duplicates
        const signatureKey = JSON.stringify(signature);
        if (!this.typeSignatureToTypeIndex.has(signatureKey)) {
            signature.typeIndex = this.typeSignatures.length;
            this.typeSignatures.push(signature);
            this.typeSignatureToTypeIndex.set(signatureKey, signature.typeIndex);
        } else {
            signature.typeIndex = this.typeSignatureToTypeIndex.get(signatureKey);
        }

        return signature;
    }

    /**
     * Parses an `(export ...)` declaration.
     * Example: `(export "add" (func $add))`
     * @returns The parsed `ExportEntry`.
     * @throws {WatCompilerError} For syntax errors or unresolved function names.
     */
    private parseExport(): ExportEntry {
        this.eat(TokenType.LEFT_PAREN, "Expected '(' for export declaration.");
        this.eat(TokenType.KEYWORD, "Expected 'export' keyword."); // Consume 'export'

        const exportNameToken = this.eat(TokenType.IDENTIFIER, "Expected string literal for export name (e.g., \"add\").");
        const exportName = exportNameToken.value as string;

        this.eat(TokenType.LEFT_PAREN, "Expected '(' for export kind.");
        this.expect(TokenType.KEYWORD, "Expected export kind ('func').");
        const kindToken = this.eat(TokenType.KEYWORD, "Expected export kind ('func').");
        if (kindToken.value !== 'func') {
            throw new WatCompilerError(`Unsupported export kind: ${kindToken.value}. Only 'func' is supported.`, kindToken);
        }
        
        // This can be a function name ($add) or an index (0)
        const funcRefToken = this.eat(TokenType.IDENTIFIER, "Expected function name (e.g., '$add') or index for export.");
        let funcIndex: number | undefined;

        if (String(funcRefToken.value).startsWith('$')) { // Named function reference
            const funcName = funcRefToken.value as string;
            funcIndex = this.functionNameToIndex.get(funcName);
            if (funcIndex === undefined) {
                throw new WatCompilerError(`Exported function '${funcName}' not found or not yet defined.`, funcRefToken);
            }
        } else if (typeof funcRefToken.value === 'number') { // Direct index reference
            funcIndex = funcRefToken.value;
        } else {
            throw new WatCompilerError(`Invalid function reference in export: '${funcRefToken.value}'. Expected identifier (e.g., '$add') or index.`, funcRefToken);
        }

        this.eat(TokenType.RIGHT_PAREN, "Expected ')' after export kind and function reference.");
        this.eat(TokenType.RIGHT_PAREN, "Expected ')' after export declaration.");

        const exportEntry: ExportEntry = {
            name: exportName,
            kind: ExternalKind.Function, // Currently only functions are supported
            index: funcIndex!,
        };
        this.exportSectionEntries.push(exportEntry);
        return exportEntry;
    }

    /**
     * Parses a `(func ...)` definition, including its signature, locals, and body instructions.
     * Example: `(func $add (param $a i32) (param $b i32) (result i32) local.get $a local.get $b i32.add)`
     * @throws {WatCompilerError} For syntax errors or duplicate function names.
     */
    private parseFunction(): void {
        this.eat(TokenType.LEFT_PAREN, "Expected '(' for function definition.");
        this.eat(TokenType.KEYWORD, "Expected 'func' keyword."); // Consume 'func'

        const funcNameToken = this.eat(TokenType.IDENTIFIER, "Expected function name like '$add'.");
        const funcName = funcNameToken.value as string;

        if (this.functionNameToIndex.has(funcName)) {
            throw new WatCompilerError(`Function '${funcName}' already defined.`, funcNameToken);
        }

        const currentFuncIndex = this.functionSectionEntries.length;
        this.functionNameToIndex.set(funcName, currentFuncIndex);

        const localsByName: Map<string, number> = new Map(); // Maps parameter and local names to their indices
        let paramTypes: number[] = [];
        let returnTypes: number[] = [];
        let paramCount: number = 0;

        // Parse inline parameters `(param $a i32)`
        while (this.peek().type === TokenType.LEFT_PAREN && this.peek(1).value === 'param') {
            this.advance(); // Consume '('
            this.advance(); // Consume 'param'
            let localName: string | undefined;
            if (this.peek().type === TokenType.IDENTIFIER && String(this.peek().value).startsWith('$')) {
                localName = this.advance().value as string;
            }
            const paramTypeToken = this.eat(TokenType.VALTYPE, "Expected value type (e.g., i32) for parameter.");
            const paramType = this.getValTypeByte(paramTypeToken.value as string);
            paramTypes.push(paramType);

            if (localName) {
                if (localsByName.has(localName)) {
                    throw new WatCompilerError(`Duplicate local parameter name: '${localName}'.`, this.peek(-1));
                }
                localsByName.set(localName, localsByName.size); // Assign index based on order of parameters
            }
            this.eat(TokenType.RIGHT_PAREN, "Expected ')' after parameter definition.");
        }
        paramCount = paramTypes.length;

        // Parse inline results `(result i32)`
        if (this.peek().type === TokenType.LEFT_PAREN && this.peek(1).value === 'result') {
            this.advance(); // Consume '('
            this.advance(); // Consume 'result'
            while (this.peek().type === TokenType.VALTYPE) {
                returnTypes.push(this.getValTypeByte(this.advance().value as string));
            }
            this.eat(TokenType.RIGHT_PAREN, "Expected ')' after result definition.");
        }

        // Determine or create the function's type signature
        const signature: FunctionSignature = { paramTypes, returnTypes };
        const signatureKey = JSON.stringify(signature); // Use stringified signature as key

        let typeIndex: number;
        if (!this.typeSignatureToTypeIndex.has(signatureKey)) {
            typeIndex = this.typeSignatures.length;
            signature.typeIndex = typeIndex;
            this.typeSignatures.push(signature);
            this.typeSignatureToTypeIndex.set(signatureKey, typeIndex);
        } else {
            typeIndex = this.typeSignatureToTypeIndex.get(signatureKey)!;
        }

        this.functionSectionEntries.push(typeIndex); // Add to the Function section

        // Parse local variables `(local $c i32)`
        const functionLocals: LocalDeclaration[] = [];
        while (this.peek().type === TokenType.LEFT_PAREN && this.peek(1).value === 'local') {
            this.advance(); // Consume '('
            this.advance(); // Consume 'local'

            let localName: string | undefined;
            if (this.peek().type === TokenType.IDENTIFIER && String(this.peek().value).startsWith('$')) {
                localName = this.advance().value as string;
            }
            const localTypeToken = this.eat(TokenType.VALTYPE, "Expected value type (e.g., i32) for local variable.");
            const localType = this.getValTypeByte(localTypeToken.value as string);

            if (localName) {
                if (localsByName.has(localName)) {
                    throw new WatCompilerError(`Duplicate local variable name: '${localName}'.`, this.peek(-1));
                }
                localsByName.set(localName, paramCount + functionLocals.length); // Local indices start after parameters
            }
            functionLocals.push({ name: localName || `_anon_local_${functionLocals.length}`, type: localType });
            this.eat(TokenType.RIGHT_PAREN, "Expected ')' after local variable definition.");
        }

        // Prepare context for parsing instructions
        const internalFuncDef: InternalFunctionDefinition = {
            name: funcName,
            typeIndex: typeIndex,
            functionIndex: currentFuncIndex,
            signature: signature,
            localsByName: localsByName,
            paramCount: paramCount,
        };

        const instructions: Instruction[] = this.parseInstructionList(internalFuncDef);

        const funcBody: FunctionBody = {
            locals: functionLocals,
            instructions: instructions,
            functionIndex: currentFuncIndex,
            typeIndex: typeIndex,
        };
        this.codeSectionBodies.push(funcBody);

        this.eat(TokenType.RIGHT_PAREN, "Expected ')' at end of function definition.");
    }

    /**
     * Parses the list of instructions within a function body.
     * @param funcDef The internal function definition providing context for local variable lookup.
     * @returns An array of `Instruction` objects.
     * @throws {WatCompilerError} For syntax errors, unknown opcodes, or undefined locals.
     */
    private parseInstructionList(funcDef: InternalFunctionDefinition): Instruction[] {
        const instructions: Instruction[] = [];
        while (this.peek().type !== TokenType.RIGHT_PAREN && this.peek().type !== TokenType.EOF) {
            if (this.peek().type === TokenType.OPCODE) {
                const opcodeName = this.advance().value as string;
                const opcodeByte = this.getOpcodeByte(opcodeName);
                const operands: (number | string)[] = [];

                // Handle operands for specific opcodes
                if (opcodeName.startsWith('local.')) { // e.g., local.get, local.set, local.tee
                    // Expect a local index or name ($a)
                    const operandToken = this.eat(TokenType.IDENTIFIER, `Expected local index or name for '${opcodeName}'.`);
                    let localIdx: number | undefined;
                    if (typeof operandToken.value === 'number') { // Direct index
                        localIdx = operandToken.value;
                    } else if (String(operandToken.value).startsWith('$')) { // Named local
                        localIdx = funcDef.localsByName.get(operandToken.value as string);
                        if (localIdx === undefined) {
                            throw new WatCompilerError(
                                `Undefined local variable or parameter '${operandToken.value}' in function '${funcDef.name}'.`,
                                operandToken
                            );
                        }
                    } else {
                        throw new WatCompilerError(
                            `Invalid local reference '${operandToken.value}'. Expected index or named local (e.g., '$a').`,
                            operandToken
                        );
                    }
                    operands.push(localIdx);
                } else if (opcodeName === 'i32.const') {
                    const operandToken = this.eat(TokenType.NUMBER, `Expected integer value for '${opcodeName}'.`);
                    operands.push(operandToken.value as number);
                }
                // Other opcodes (i32.add, i32.sub, i32.mul) do not require operands in this simplified subset.
                
                instructions.push({ opcode: opcodeByte, operands });
            } else {
                throw new WatCompilerError(`Unexpected token in function body: '${this.peek().value}'. Expected an opcode or 'end'.`, this.peek());
            }
        }
        instructions.push({ opcode: Opcodes.end, operands: [] }); // Implicit 'end' instruction for the function block
        return instructions;
    }

    /**
     * Parses the entire WAT module, identifying and processing all sections and their contents.
     * @returns An object containing the raw byte arrays for each Wasm section.
     * @throws {WatCompilerError} For any parsing or syntax errors in the module structure.
     */
    public parseModule(): {
        typeSection: number[];
        functionSection: number[];
        exportSection: number[];
        codeSection: number[];
    } {
        this.eat(TokenType.LEFT_PAREN, "Expected '(' at start of module.");
        this.eat(TokenType.KEYWORD, "Expected 'module' keyword."); // Consume 'module'

        while (this.peek().type !== TokenType.RIGHT_PAREN && this.peek().type !== TokenType.EOF) {
            if (this.peek().type === TokenType.LEFT_PAREN) {
                const nextToken = this.peek(1); // Look at the keyword inside the paren
                if (nextToken.type === TokenType.KEYWORD) {
                    if (nextToken.value === 'type') {
                        this.parseTypeDefinition();
                    } else if (nextToken.value === 'func') {
                        this.parseFunction();
                    } else if (nextToken.value === 'export') {
                        this.parseExport();
                    } else {
                        throw new WatCompilerError(`Unsupported top-level keyword '${nextToken.value}' inside module definition.`, nextToken);
                    }
                } else {
                    throw new WatCompilerError(`Unexpected token type '${TokenType[nextToken.type]}' inside module definition.`, nextToken);
                }
            } else {
                throw new WatCompilerError(`Unexpected token '${this.peek().value}' inside module definition.`, this.peek());
            }
        }

        this.eat(TokenType.RIGHT_PAREN, "Expected ')' at end of module.");
        this.eat(TokenType.EOF, "Expected end of file after module definition.");

        return this.assembleSections();
    }

    /**
     * Assembles the parsed components into their respective Wasm binary sections.
     * This method correctly orders sections according to the Wasm specification.
     * @returns An object containing the raw byte arrays for each Wasm section.
     */
    private assembleSections(): {
        typeSection: number[];
        functionSection: number[];
        exportSection: number[];
        codeSection: number[];
    } {
        // 1. Type Section (vector of func_types)
        const encodedFuncTypes: number[] = this.typeSignatures.flatMap(sig => {
            return [
                0x60, // func type prefix
                ...encodeVector(sig.paramTypes),
                ...encodeVector(sig.returnTypes)
            ];
        });
        const typeSection = createSection(Section.Type, encodeVector(encodedFuncTypes));

        // 2. Function Section (vector of type indices)
        const functionSection = createSection(Section.Function, encodeVector(this.functionSectionEntries));

        // 3. Export Section (vector of export_entries)
        const encodedExports: number[] = this.exportSectionEntries.flatMap(exp => {
            const encodedName = encodeString(exp.name);
            return [...encodedName, exp.kind, ...encodeUnsignedLEB128(exp.index)];
        });
        const exportSection = createSection(Section.Export, encodeVector(encodedExports));

        // 4. Code Section (vector of code_entries)
        const encodedCodeBodies: number[] = this.codeSectionBodies.flatMap(body => {
            // Encode locals: vector of (count:u32, type:valtype) pairs
            const localsGroupedByType = new Map<number, number>(); // type -> count
            for (const local of body.locals) {
                localsGroupedByType.set(local.type, (localsGroupedByType.get(local.type) || 0) + 1);
            }
            const encodedLocals: number[] = [];
            for (const [type, count] of localsGroupedByType.entries()) {
                encodedLocals.push(...encodeUnsignedLEB128(count), type);
            }

            // Encode instructions
            const functionInstructions: number[] = body.instructions.flatMap(instr => {
                const encodedOperands = instr.operands.flatMap(op => {
                    if (typeof op === 'number') {
                        // `i32.const` takes a signed LEB128, local indices take unsigned LEB128.
                        if (instr.opcode === Opcodes['i32.const']) {
                             return encodeSignedLEB128(op);
                        }
                        return encodeUnsignedLEB128(op); // For local indices
                    }
                    // String operands are not expected for current opcodes, but extendable
                    return [];
                });
                return [instr.opcode, ...encodedOperands];
            });

            // A function body is a vector containing its locals declarations and its sequence of instructions.
            const codeEntry = encodeVector([...encodeUnsignedLEB128(localsGroupedByType.size), ...encodedLocals, ...functionInstructions]);
            return codeEntry;
        });
        const codeSection = createSection(Section.Code, encodeVector(encodedCodeBodies));

        return {
            typeSection: typeSection,
            functionSection: functionSection,
            exportSection: exportSection,
            codeSection: codeSection,
        };
    }
}

/**
 * @public
 * The core function that compiles a simplified WAT string into a Wasm binary `Uint8Array`.
 * This function orchestrates the lexing, parsing, and assembly process.
 *
 * @param wat The WebAssembly Text Format string generated by `codegen.ts` or similar.
 * @returns A `Uint8Array` containing the Wasm binary.
 * @throws {WatCompilerError} If any syntax or compilation errors occur during the process.
 */
export function watToWasm(wat: string): Uint8Array {
    const lexer = new WatLexer(wat);
    const parser = new WatParser(lexer);
    
    // Parse the entire module and get the assembled sections
    const sections = parser.parseModule();

    const wasmMagic = [0x00, 0x61, 0x73, 0x6d]; // '\0asm'
    const wasmVersion = [0x01, 0x00, 0x00, 0x00];
    
    // Concatenate the Wasm magic number, version, and all sections in the specified order
    const binary = new Uint8Array([
        ...wasmMagic,
        ...wasmVersion,
        ...sections.typeSection,
        // sections.importSection, // Not yet implemented/supported in parser, but placeholder for Wasm spec order
        ...sections.functionSection,
        // sections.tableSection,
        // sections.memorySection,
        // sections.globalSection,
        ...sections.exportSection,
        // sections.startSection,
        // sections.elementSection,
        ...sections.codeSection,
        // sections.dataSection,
    ]);

    return binary;
}
