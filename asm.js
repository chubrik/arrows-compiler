const Args = {
    A: 0x0,
    B: 0x1,
    C: 0x2,
    D: 0x3,
    BYTE: 0x4
};

const instructions = [
    "adc", "add", "and", "clr", "dec", "hlt", "inc", "jc",
    "jmp", "jnc", "jno", "jns", "jnz", "jo", "js", "jz",
    "ld", "ldi", "mov", "neg", "nop", "not", "or", "rcl",
    "rcr", "rnd", "sar", "sbb", "shl", "shr", "st", "sub",
    "test", "xor"
];

const registers = ["a", "b", "c", "d"];

const keywords = ["db", "equ"];

const operators = ["+", "-"];

class Command {
    constructor(instruction, args, opcode) {
        this.instruction = instruction;
        this.args = args;
        this.opcode = opcode;
    }

    match(instruction, args) {
        const argc = this.args.length;
        let match = this.instruction === instruction && argc === args.length;
        if (match)
            for (let i = 0; i < argc; ++i) {
                const argType = this.args[i];
                const { type } = args[i];
                if (argType !== type) {
                    match = false;
                    break;
                }
            }
        return match;
    }
}

const commands = [
    new Command("nop", [], 0x00),
    new Command("hlt", [], 0x01),
    new Command("jmp", [Args.BYTE], 0x03),
    new Command("jmp", [Args.A], 0x04),
    new Command("jmp", [Args.B], 0x05),
    new Command("jmp", [Args.C], 0x06),
    new Command("jmp", [Args.D], 0x07),
    new Command("jz", [Args.BYTE], 0x08),
    new Command("js", [Args.BYTE], 0x09),
    new Command("jc", [Args.BYTE], 0x0A),
    new Command("jo", [Args.BYTE], 0x0B),
    new Command("jnz", [Args.BYTE], 0x0C),
    new Command("jns", [Args.BYTE], 0x0D),
    new Command("jnc", [Args.BYTE], 0x0E),
    new Command("jno", [Args.BYTE], 0x0F),

    new Command("jz", [Args.A], 0x10),
    new Command("js", [Args.A], 0x11),
    new Command("jc", [Args.A], 0x12),
    new Command("jo", [Args.A], 0x13),
    new Command("jz", [Args.B], 0x14),
    new Command("js", [Args.B], 0x15),
    new Command("jc", [Args.B], 0x16),
    new Command("jo", [Args.B], 0x17),
    new Command("jz", [Args.C], 0x18),
    new Command("js", [Args.C], 0x19),
    new Command("jc", [Args.C], 0x1A),
    new Command("jo", [Args.C], 0x1B),
    new Command("jz", [Args.D], 0x1C),
    new Command("js", [Args.D], 0x1D),
    new Command("jc", [Args.D], 0x1E),
    new Command("jo", [Args.D], 0x1F),

    new Command("jnz", [Args.A], 0x20),
    new Command("jns", [Args.A], 0x21),
    new Command("jnc", [Args.A], 0x22),
    new Command("jno", [Args.A], 0x23),
    new Command("jnz", [Args.B], 0x24),
    new Command("jns", [Args.B], 0x25),
    new Command("jnc", [Args.B], 0x26),
    new Command("jno", [Args.B], 0x27),
    new Command("jnz", [Args.C], 0x28),
    new Command("jns", [Args.C], 0x29),
    new Command("jnc", [Args.C], 0x2A),
    new Command("jno", [Args.C], 0x2B),
    new Command("jnz", [Args.D], 0x2C),
    new Command("jns", [Args.D], 0x2D),
    new Command("jnc", [Args.D], 0x2E),
    new Command("jno", [Args.D], 0x2F),

    new Command("st", [Args.A, Args.BYTE], 0x30),
    new Command("st", [Args.B, Args.A], 0x31),
    new Command("st", [Args.C, Args.A], 0x32),
    new Command("st", [Args.D, Args.A], 0x33),
    new Command("st", [Args.A, Args.B], 0x34),
    new Command("st", [Args.B, Args.BYTE], 0x35),
    new Command("st", [Args.C, Args.B], 0x36),
    new Command("st", [Args.D, Args.B], 0x37),
    new Command("st", [Args.A, Args.C], 0x38),
    new Command("st", [Args.B, Args.C], 0x39),
    new Command("st", [Args.C, Args.BYTE], 0x3A),
    new Command("st", [Args.D, Args.C], 0x3B),
    new Command("st", [Args.A, Args.D], 0x3C),
    new Command("st", [Args.B, Args.D], 0x3D),
    new Command("st", [Args.C, Args.D], 0x3E),
    new Command("st", [Args.D, Args.BYTE], 0x3F),

    new Command("ld", [Args.A, Args.A], 0x40),
    new Command("ld", [Args.B, Args.A], 0x41),
    new Command("ld", [Args.C, Args.A], 0x42),
    new Command("ld", [Args.D, Args.A], 0x43),
    new Command("ld", [Args.A, Args.B], 0x44),
    new Command("ld", [Args.B, Args.B], 0x45),
    new Command("ld", [Args.C, Args.B], 0x46),
    new Command("ld", [Args.D, Args.B], 0x47),
    new Command("ld", [Args.A, Args.C], 0x48),
    new Command("ld", [Args.B, Args.C], 0x49),
    new Command("ld", [Args.C, Args.C], 0x4A),
    new Command("ld", [Args.D, Args.C], 0x4B),
    new Command("ld", [Args.A, Args.D], 0x4C),
    new Command("ld", [Args.B, Args.D], 0x4D),
    new Command("ld", [Args.C, Args.D], 0x4E),
    new Command("ld", [Args.D, Args.D], 0x4F),

    new Command("ld", [Args.A, Args.BYTE], 0x50),
    new Command("ld", [Args.B, Args.BYTE], 0x51),
    new Command("ld", [Args.C, Args.BYTE], 0x52),
    new Command("ld", [Args.D, Args.BYTE], 0x53),
    new Command("ldi", [Args.A, Args.BYTE], 0x54),
    new Command("ldi", [Args.B, Args.BYTE], 0x55),
    new Command("ldi", [Args.C, Args.BYTE], 0x56),
    new Command("ldi", [Args.D, Args.BYTE], 0x57),

    new Command("inc", [Args.A], 0x60),
    new Command("add", [Args.B, Args.A], 0x61),
    new Command("add", [Args.C, Args.A], 0x62),
    new Command("add", [Args.D, Args.A], 0x63),
    new Command("add", [Args.A, Args.B], 0x64),
    new Command("inc", [Args.B], 0x65),
    new Command("add", [Args.C, Args.B], 0x66),
    new Command("add", [Args.D, Args.B], 0x67),
    new Command("add", [Args.A, Args.C], 0x68),
    new Command("add", [Args.B, Args.C], 0x69),
    new Command("inc", [Args.C], 0x6A),
    new Command("add", [Args.D, Args.C], 0x6B),
    new Command("add", [Args.A, Args.D], 0x6C),
    new Command("add", [Args.B, Args.D], 0x6D),
    new Command("add", [Args.C, Args.D], 0x6E),
    new Command("inc", [Args.D], 0x6F),

    new Command("dec", [Args.A], 0x70),
    new Command("sub", [Args.B, Args.A], 0x71),
    new Command("sub", [Args.C, Args.A], 0x72),
    new Command("sub", [Args.D, Args.A], 0x73),
    new Command("sub", [Args.A, Args.B], 0x74),
    new Command("dec", [Args.B], 0x75),
    new Command("sub", [Args.C, Args.B], 0x76),
    new Command("sub", [Args.D, Args.B], 0x77),
    new Command("sub", [Args.A, Args.C], 0x78),
    new Command("sub", [Args.B, Args.C], 0x79),
    new Command("dec", [Args.C], 0x7A),
    new Command("sub", [Args.D, Args.C], 0x7B),
    new Command("sub", [Args.A, Args.D], 0x7C),
    new Command("sub", [Args.B, Args.D], 0x7D),
    new Command("sub", [Args.C, Args.D], 0x7E),
    new Command("dec", [Args.D], 0x7F),

    new Command("not", [Args.A], 0x80),
    new Command("adc", [Args.B, Args.A], 0x81),
    new Command("adc", [Args.C, Args.A], 0x82),
    new Command("adc", [Args.D, Args.A], 0x83),
    new Command("adc", [Args.A, Args.B], 0x84),
    new Command("not", [Args.B], 0x85),
    new Command("adc", [Args.C, Args.B], 0x86),
    new Command("adc", [Args.D, Args.B], 0x87),
    new Command("adc", [Args.A, Args.C], 0x88),
    new Command("adc", [Args.B, Args.C], 0x89),
    new Command("not", [Args.C], 0x8A),
    new Command("adc", [Args.D, Args.C], 0x8B),
    new Command("adc", [Args.A, Args.D], 0x8C),
    new Command("adc", [Args.B, Args.D], 0x8D),
    new Command("adc", [Args.C, Args.D], 0x8E),
    new Command("not", [Args.D], 0x8F),

    new Command("neg", [Args.A], 0x90),
    new Command("sbb", [Args.B, Args.A], 0x91),
    new Command("sbb", [Args.C, Args.A], 0x92),
    new Command("sbb", [Args.D, Args.A], 0x93),
    new Command("sbb", [Args.A, Args.B], 0x94),
    new Command("neg", [Args.B], 0x95),
    new Command("sbb", [Args.C, Args.B], 0x96),
    new Command("sbb", [Args.D, Args.B], 0x97),
    new Command("sbb", [Args.A, Args.C], 0x98),
    new Command("sbb", [Args.B, Args.C], 0x99),
    new Command("neg", [Args.C], 0x9A),
    new Command("sbb", [Args.D, Args.C], 0x9B),
    new Command("sbb", [Args.A, Args.D], 0x9C),
    new Command("sbb", [Args.B, Args.D], 0x9D),
    new Command("sbb", [Args.C, Args.D], 0x9E),
    new Command("neg", [Args.D], 0x9F),

    new Command("clr", [Args.A], 0xA0),
    new Command("mov", [Args.B, Args.A], 0xA1),
    new Command("mov", [Args.C, Args.A], 0xA2),
    new Command("mov", [Args.D, Args.A], 0xA3),
    new Command("mov", [Args.A, Args.B], 0xA4),
    new Command("clr", [Args.B], 0xA5),
    new Command("mov", [Args.C, Args.B], 0xA6),
    new Command("mov", [Args.D, Args.B], 0xA7),
    new Command("mov", [Args.A, Args.C], 0xA8),
    new Command("mov", [Args.B, Args.C], 0xA9),
    new Command("clr", [Args.C], 0xAA),
    new Command("mov", [Args.D, Args.C], 0xAB),
    new Command("mov", [Args.A, Args.D], 0xAC),
    new Command("mov", [Args.B, Args.D], 0xAD),
    new Command("mov", [Args.C, Args.D], 0xAE),
    new Command("clr", [Args.D], 0xAF),

    new Command("test", [Args.A], 0xB0),
    new Command("and", [Args.B, Args.A], 0xB1),
    new Command("and", [Args.C, Args.A], 0xB2),
    new Command("and", [Args.D, Args.A], 0xB3),
    new Command("and", [Args.A, Args.B], 0xB4),
    new Command("test", [Args.B], 0xB5),
    new Command("and", [Args.C, Args.B], 0xB6),
    new Command("and", [Args.D, Args.B], 0xB7),
    new Command("and", [Args.A, Args.C], 0xB8),
    new Command("and", [Args.B, Args.C], 0xB9),
    new Command("test", [Args.C], 0xBA),
    new Command("and", [Args.D, Args.C], 0xBB),
    new Command("and", [Args.A, Args.D], 0xBC),
    new Command("and", [Args.B, Args.D], 0xBD),
    new Command("and", [Args.C, Args.D], 0xBE),
    new Command("test", [Args.D], 0xBF),

    new Command("rcl", [Args.A], 0xC0),
    new Command("or", [Args.B, Args.A], 0xC1),
    new Command("or", [Args.C, Args.A], 0xC2),
    new Command("or", [Args.D, Args.A], 0xC3),
    new Command("or", [Args.A, Args.B], 0xC4),
    new Command("rcl", [Args.B], 0xC5),
    new Command("or", [Args.C, Args.B], 0xC6),
    new Command("or", [Args.D, Args.B], 0xC7),
    new Command("or", [Args.A, Args.C], 0xC8),
    new Command("or", [Args.B, Args.C], 0xC9),
    new Command("rcl", [Args.C], 0xCA),
    new Command("or", [Args.D, Args.C], 0xCB),
    new Command("or", [Args.A, Args.D], 0xCC),
    new Command("or", [Args.B, Args.D], 0xCD),
    new Command("or", [Args.C, Args.D], 0xCE),
    new Command("rcl", [Args.D], 0xCF),

    new Command("rcr", [Args.A], 0xD0),
    new Command("xor", [Args.B, Args.A], 0xD1),
    new Command("xor", [Args.C, Args.A], 0xD2),
    new Command("xor", [Args.D, Args.A], 0xD3),
    new Command("xor", [Args.A, Args.B], 0xD4),
    new Command("rcr", [Args.B], 0xD5),
    new Command("xor", [Args.C, Args.B], 0xD6),
    new Command("xor", [Args.D, Args.B], 0xD7),
    new Command("xor", [Args.A, Args.C], 0xD8),
    new Command("xor", [Args.B, Args.C], 0xD9),
    new Command("rcr", [Args.C], 0xDA),
    new Command("xor", [Args.D, Args.C], 0xDB),
    new Command("xor", [Args.A, Args.D], 0xDC),
    new Command("xor", [Args.B, Args.D], 0xDD),
    new Command("xor", [Args.C, Args.D], 0xDE),
    new Command("rcr", [Args.D], 0xDF),

    new Command("shl", [Args.A], 0xE0),
    new Command("shl", [Args.B], 0xE1),
    new Command("shl", [Args.C], 0xE2),
    new Command("shl", [Args.D], 0xE3),
    new Command("shr", [Args.A], 0xE4),
    new Command("shr", [Args.B], 0xE5),
    new Command("shr", [Args.C], 0xE6),
    new Command("shr", [Args.D], 0xE7),
    new Command("sar", [Args.A], 0xE8),
    new Command("sar", [Args.B], 0xE9),
    new Command("sar", [Args.C], 0xEA),
    new Command("sar", [Args.D], 0xEB),
    new Command("rnd", [Args.A], 0xEC),
    new Command("rnd", [Args.B], 0xED),
    new Command("rnd", [Args.C], 0xEE),
    new Command("rnd", [Args.D], 0xEF),
];

class Token {
    static INSTRUCTION = 0x0;
    static NUMBER = 0x1;
    static NAME = 0x2;
    static CHAR = 0x3;
    static REGISTER = 0x4;
    static EOF = 0x5;
    static KEYWORD = 0x6;
    static OPERATOR = 0x7;
    static STRING = 0x8;

    constructor(type, value, position, error = null) {
        this.type = type;
        this.value = value;
        this.position = position;
        this.error = error;
    }

    toString() {
        return this.type === Token.EOF ? "<eof>" : `'${this.value}'`;
    }
}

const whitespace = /^[ \r]$/;
const digit = /^[0-9]$/;
const letter = /^[a-z]$/i;

export const cp1251chars = "ЂЃ‚ѓ„…†‡€‰Љ‹ЊЌЋЏђ‘’“”•–—?™љ›њќћџ ЎўЈ¤Ґ¦§Ё©Є«¬­®Ї°±Ііґµ¶·ё№є»јЅѕїАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя";
export const cp1251map = {};

for (let i = 0; i < cp1251chars.length; ++i)
    cp1251map[cp1251chars[i]] = 128 + i;

class Tokenizer {
    line = 0;
    column = 0;
    offset = 0;

    constructor(source) {
        this.source = source;
    }

    get position() {
        return [this.line, this.column];
    }

    peekch() {
        return this.source[this.offset];
    }

    consume() {
        if (this.peekch() === "\n") {
            ++this.line;
            this.column = 0;
        } else
            ++this.column;
        ++this.offset;
    }

    lookahead(skipNewline = true) {
        const { offset, line, column } = this;
        const token = this.next(skipNewline);
        this.offset = offset;
        this.line = line;
        this.column = column;
        return token;
    }

    next(skipNewline = true) {
        while (whitespace.test(this.peekch()) || (skipNewline && this.peekch() === "\n") || this.peekch() === ";") {
            while (whitespace.test(this.peekch()) || (skipNewline && this.peekch() === "\n"))
                this.consume();

            while (this.peekch() === ";") {
                this.consume();
                while (this.peekch() !== "\n" && this.peekch() != null)
                    this.consume();
            }
        }

        let ch = this.peekch();
        if (ch == null)
            return new Token(Token.EOF, null, this.position);
        else if (letter.test(ch) || ch === "_")
            return this.readName();
        else if (digit.test(ch))
            return this.readNumber();
        else if (ch === "\"")
            return this.readString();
        else {
            const { position } = this;
            this.consume();
            return new Token(operators.includes(ch) ? Token.OPERATOR : Token.CHAR, ch, position);
        }
    }

    readName() {
        const { position } = this;

        let name = "";

        let ch;
        while (letter.test(ch = this.peekch()) || digit.test(ch) || ch === "_") {
            this.consume();
            name += ch;
        }

        let type = Token.NAME;
        if (instructions.includes(name))
            type = Token.INSTRUCTION;
        else if (registers.includes(name))
            type = Token.REGISTER;
        else if (keywords.includes(name))
            type = Token.KEYWORD;
        return new Token(type, name, position);
    }

    readNumber() {
        const { position } = this;

        let number = "";

        let ch;
        while (digit.test(ch = this.peekch())) {
            this.consume();
            number += ch;
        }
        while (letter.test(ch = this.peekch()) || digit.test(ch)) {
            this.consume();
            number += ch;
        }

        return new Token(Token.NUMBER, number, position)
    }

    readString() {
        const { position } = this;
        this.consume();

        let string = "";
        let error = null;

        let ch;
        while ((ch = this.peekch()) !== "\"" && ch !== "\n" && ch != null) {
            this.consume();

            if (ch === "\\") {
                ch = this.peekch();
                if (ch === "\n" || ch == null)
                    break;
                this.consume();
                switch (ch) {
                    case "\\": string += ch; break;
                    case "\"": string += ch; break;
                    case "a": string += "\x07"; break;
                    case "b": string += "\b"; break;
                    case "t": string += "\t"; break;
                    case "n": string += "\n"; break;
                    case "v": string += "\v"; break;
                    case "f": string += "\f"; break;
                    case "r": string += "\r"; break;
                    default:
                        const sequencePosition = [this.position[0], this.position[1] - 2];
                        error ??= new AsmError(sequencePosition, `unexpected escape sequence '\\${ch}'`);
                }
            } else
                string += ch;
        }
        if (ch != null)
            this.consume();
        if (ch !== "\"")
            error ??= new AsmError(position, `unterminated string "${escapeStr(string)}"`);

        return new Token(Token.STRING, string, position, error);
    }
}

class AsmError {
    constructor(position, message) {
        this.position = position;
        this.message = message;
    }
}

class RefExpression {
    values = [];
    operations = [];
    canResolve = false;

    constructor(resolveCallback) {
        this.resolveCallback = resolveCallback;
    }

    tryResolve() {
        if (this.canResolve && this.values.every((value) => value != null))
            this.resolveCallback(this.values.reduce((a, b, index) => {
                if (a == null)
                    return b;
                switch (this.operations[index - 1]) {
                    case "+":
                        return a + b;
                    case "-":
                        return a - b;
                }
            }, null));
    }

    makeResolveCallback() {
        const index = this.values.length;
        this.values.push(null);
        return (value) => {
            this.values[index] = value;
            this.tryResolve();
        };
    }

    set = this.makeResolveCallback();

    add() {
        this.operations.push("+");
        return this.makeResolveCallback();
    }

    sub() {
        this.operations.push("-");
        return this.makeResolveCallback();
    }

    done() {
        this.canResolve = true;
        this.tryResolve();
    }
}

export class Compiler {
    bytes = [];
    errors = [];
    refs = [];
    names = {};

    constructor(source) {
        this.tokenizer = new Tokenizer(source);
    }

    parseArgs() {
        const args = [];
        let token;
        if ((token = this.tokenizer.lookahead(false)).type !== Token.CHAR || token.value !== "\n")
            if (this.parseArg(args, false)) {
                let i = 0;
                while ((token = this.tokenizer.lookahead()).type === Token.CHAR && token.value === ",") {
                    this.tokenizer.next();
                    if (!this.parseArg(args, true))
                        return null;
                    ++i;
                }
            } else
                return [];
        return args;
    }

    parseArg(args, required = false) {
        const token = this.tokenizer.lookahead();
        const arg = { position: token.position };
        if (token.type === Token.REGISTER) {
            this.tokenizer.next();
            arg.type = Args.A + registers.indexOf(token.value);
        } else if (token.type === Token.STRING) {
            this.tokenizer.next();
            arg.type = Args.BYTE;
            if (token.error)
                this.errors.push(token.error);
            else if (token.value.length !== 1)
                this.errors.push(new AsmError(token.position, `unexpected string "${escapeStr(token.value)}"`));
            else
                arg.value = this.getCharCode(token);
        } else if (this.parseExpression((value) => {
            arg.value = value;
            arg.resolveCallback?.(value);
        }, false))
            arg.type = Args.BYTE;
        else {
            if (required)
                this.errors.push(new AsmError(token.position, `unexpected ${token}`));
            return false;
        }
        args.push(arg);
        return true;
    }

    parseValue(resolveCallback, required = false) {
        let token = this.tokenizer.lookahead();
        if (token.type === Token.NAME) {
            const value = this.names[token.value];
            if (value != null)
                resolveCallback(value);
            else
                this.refs.push({ name: token.value, resolveCallback, position: token.position });
        } else if (token.type === Token.NUMBER)
            resolveCallback(this.parseNumber(token));
        else if (token.type === Token.CHAR && token.value === "$")
            resolveCallback(this.getCurrentAddress());
        else {
            if (required)
                this.errors.push(new AsmError(token.position, `unexpected ${token}`));
            return false;
        }
        this.tokenizer.next();
        return true;
    }

    parseNumber(token) {
        try {
            if (token.value[0] === "0" && token.value.length > 1)
                if (token.value.length === 2)
                    return parseInt(token.value.slice(1), 8);
                else
                    switch (token.value[1].toLowerCase()) {
                        case "x":
                            return parseInt(token.value.slice(2), 16);
                        case "b":
                            return parseInt(token.value.slice(2), 2);
                    }
            return parseInt(token.value);
        } catch {
            this.errors.push(new AsmError(token.position, `invalid number ${token.value}`));
        }
    }

    parseExpression(resolveCallback, required = false) {
        const ref = new RefExpression(resolveCallback);

        if (this.parseValue(ref.set, required)) {
            let token;
            while ((token = this.tokenizer.lookahead()).type === Token.OPERATOR) {
                this.tokenizer.next();
                switch (token.value) {
                    case "+":
                        if (!this.parseValue(ref.add(), required))
                            return false;
                        break;
                    case "-":
                        if (!this.parseValue(ref.sub(), required))
                            return false;
                        break;
                }
            }
            ref.done();
            return true;
        }
        return false;
    }

    resolveReference(name, value) {
        this.names[name] = value;

        for (let i = 0; i < this.refs.length; ++i) {
            const ref = this.refs[i];
            if (ref.name === name) {
                ref.resolveCallback(value);
                this.refs.splice(i--, 1);
            }
        }
    }

    getCurrentAddress() {
        return this.bytes.length < 256 ? this.bytes.length : (this.bytes.length & 0xFF) | 0x80;
    }

    getCharCode(token, index = 0) {
        let charCode = token.value.charCodeAt(index);
        if (charCode < 128)
            return charCode;
        charCode = cp1251map[token.value[index]];
        if (charCode == null) {
            const position = [token.position[0], token.position[1] + index + 1];
            this.errors.push(new AsmError(position, `unexpected character '${token.value[index]}'`));
        }
        return charCode || 0;
    }

    compile() {
        const names = {};

        let token;
        while ((token = this.tokenizer.next()).type !== Token.EOF)
            if (token.type === Token.INSTRUCTION) {
                const instruction = token.value;
                const { position } = token;

                const args = this.parseArgs();
                if (args == null)
                    continue;

                let opcode, argTypes;
                for (const command of commands)
                    if (command.match(instruction, args)) {
                        opcode = command.opcode;
                        argTypes = command.args;
                        break;
                    }

                if (opcode == null) {
                    this.errors.push(new AsmError(position, "unknown command"));
                    continue;
                }

                this.bytes.push(opcode);

                const argc = args.length;
                for (let i = 0; i < argc; ++i) {
                    const arg = args[i];
                    if (argTypes[i] === Args.BYTE)
                        if (arg.value)
                            this.bytes.push(arg.value & 0xFF);
                        else {
                            const offset = this.bytes.length;
                            this.bytes.push(0x00);
                            arg.resolveCallback = (value) => this.bytes[offset] = value & 0xFF;
                        }
                }
            } else if (token.type === Token.NAME) {
                const name = token.value;
                const { position } = token;

                token = this.tokenizer.next();

                if (token.type === Token.KEYWORD && token.value === "db") {
                    this.resolveReference(name, this.getCurrentAddress());
                    do {
                        if ((token = this.tokenizer.lookahead()).type === Token.STRING) {
                            this.tokenizer.next();
                            if (token.error)
                                this.errors.push(token.error);
                            else
                                for (let i = 0; i < token.value.length; ++i)
                                    this.bytes.push(this.getCharCode(token, i));
                        } else {
                            const offset = this.bytes.length;
                            this.bytes.push(0x00);
                            this.parseExpression((value) => this.bytes[offset] = value, true);
                        }
                    } while ((token = this.tokenizer.lookahead()).type === Token.CHAR && token.value === "," && this.tokenizer.next())
                } else if (token.type === Token.KEYWORD && token.value === "equ") {
                    if ((token = this.tokenizer.lookahead()).type === Token.STRING) {
                        this.tokenizer.next();
                        if (token.error)
                            this.errors.push(token.error);
                        else if (token.value.length !== 1)
                            this.errors.push(new AsmError(token.position, `unexpected string "${escapeStr(token.value)}"`));
                        else
                            this.bytes.push(this.getCharCode(token));
                    } else
                        this.parseExpression((value) => this.resolveReference(name, value), true);
                } else if (token.type === Token.CHAR && token.value === ":")
                    this.resolveReference(name, this.getCurrentAddress());
                else {
                    this.errors.push(new AsmError(token.position, `unexpected ${token}`));
                    continue;
                }

                if (name in names) {
                    this.errors.push(new AsmError(position, `label ${name} is already defined`));
                    continue;
                }
            } else
                this.errors.push(new AsmError(token.position, `unexpected ${token}`));

        for (const { name, position } of this.refs)
            this.errors.push(new AsmError(position, `unresolved ${name}`));

        if (this.bytes.length > 32768)
            this.errors.push(new AsmError([0, 0], "memory overflow"));
    }
}

function escapeStr(string) {
    return string
        .replace(/\\/g, "\\\\")
        .replace(/\"/g, "\\\"")
        .replace(/\x07/g, "\\a")
        .replace(/\x08/g, "\\b")
        .replace(/\t/g, "\\t")
        .replace(/\n/g, "\\n")
        .replace(/\v/g, "\\v")
        .replace(/\f/g, "\\f")
        .replace(/\r/g, "\\r");
}
