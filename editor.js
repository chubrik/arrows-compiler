import { Compiler, commands, instructions, registers, keywords } from "./asm.js";
import { instructionDocs } from "./docs.js";

const monacoBase = "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/";
const languageId = "arrows-asm";

export function createEditor(container, initialValue) {
    return new Promise((resolve) => {
        // Monaco workers can't be loaded cross-origin directly, so proxy them
        // through a data: URL that importScripts the CDN worker.
        self.MonacoEnvironment = {
            getWorkerUrl: () => "data:text/javascript;charset=utf-8," + encodeURIComponent(
                `self.MonacoEnvironment = { baseUrl: "${monacoBase}" };\n` +
                `importScripts("${monacoBase}vs/base/worker/workerMain.js");`)
        };

        require.config({ paths: { vs: monacoBase + "vs" } });
        require(["vs/editor/editor.main"], () => {
            const monaco = window.monaco;
            registerLanguage(monaco);
            registerCompletion(monaco);
            registerDefinition(monaco);
            registerHover(monaco);
            registerOccurrences(monaco);
            registerReferences(monaco);
            registerRename(monaco);
            registerFolding(monaco);

            const editor = monaco.editor.create(container, {
                value: initialValue,
                language: languageId,
                theme: "arrows-dark",
                fontFamily: "ui-monospace, Consolas, Menlo, monospace",
                fontSize: 14,
                minimap: { enabled: false },
                automaticLayout: true,
                scrollBeyondLastLine: false,
                tabSize: 4,
                insertSpaces: true,
                detectIndentation: false,
                wordBasedSuggestions: "off",
                bracketPairColorization: { enabled: false }, // an assembly program has no brackets
                showFoldingControls: "always" // the banks are few, let their arrows be visible
            });

            // The compiler and the URL hash expect LF regardless of platform
            editor.getModel().setEOL(monaco.editor.EndOfLineSequence.LF);

            resolve({ monaco, editor });
        });
    });
}

const bankSize = 128;

let bankZoneIds = [];
let overflowDecorations = null;
let bankFoldingRanges = [];
let bankFoldingChanged = null;

// The memory banks are the only foldable regions of an assembly program
function registerFolding(monaco) {
    bankFoldingChanged = new monaco.Emitter();
    monaco.languages.registerFoldingRangeProvider(languageId, {
        onDidChange: bankFoldingChanged.event,
        provideFoldingRanges: () => bankFoldingRanges
    });
}

// Draw a separator line between the lines of code where a 128-byte memory bank boundary passes,
// and mark the statements whose bytes span such a boundary
export function updateBankBoundaries(editor, lineOffsets, byteCount) {
    const model = editor.getModel();
    const boundaries = [];
    const overflows = [];

    // A program fitting into the default 256 addresses needs no banking at all
    if (byteCount > 2 * bankSize) {
        let nextBoundary = bankSize;
        let firstByteLine = -1;
        for (let i = 0; i < lineOffsets.length; ++i) {
            const [line, offset] = lineOffsets[i];
            while (offset >= nextBoundary) {
                boundaries.push({ afterLineNumber: findBoundaryLine(model, line + 1), bank: nextBoundary / bankSize });
                nextBoundary += bankSize;
            }

            const end = i + 1 < lineOffsets.length ? lineOffsets[i + 1][1] : byteCount;
            if (end > offset) {
                // The common part starts where the first byte is emitted, leaving the constants above
                if (firstByteLine < 0)
                    firstByteLine = line;

                // A statement whose bytes span a bank boundary: either the layout above has shifted,
                // or the data legitimately runs across the boundary — the hover names the exact spot
                if (Math.floor(offset / bankSize) !== Math.floor((end - 1) / bankSize))
                    overflows.push({ line: line + 1, start: offset, last: end - 1 });
            }
        }
        if (firstByteLine >= 0)
            boundaries.unshift({ afterLineNumber: findBoundaryLine(model, firstByteLine + 1), bank: 0 });
    }
    // Several boundaries land at the same spot when a statement spans a whole bank;
    // keep only the last one, naming the bank the following code actually starts in
    for (let i = boundaries.length - 1; i > 0; --i)
        if (boundaries[i].afterLineNumber === boundaries[i - 1].afterLineNumber)
            boundaries.splice(i - 1, 1);

    markOverflows(editor, model, overflows);

    // Each bank is a foldable region, starting with its header comments; so is the common part.
    // Without boundaries there is nothing to fold: an assembly program has no other structure
    bankFoldingRanges = [];
    for (let i = -1; boundaries.length > 0 && i < boundaries.length; ++i) {
        const end = i + 1 < boundaries.length ? boundaries[i + 1].afterLineNumber : findFoldEnd(model);
        const start = findFoldStart(model, i < 0 ? 1 : boundaries[i].afterLineNumber + 1, end);
        if (end > start)
            bankFoldingRanges.push({ start, end });
    }
    // Monaco asks for the ranges sooner than this rebuild happens, so tell it they are ready
    bankFoldingChanged.fire();

    const caretLine = editor.getPosition().lineNumber;
    const caretTop = editor.getTopForLineNumber(caretLine);

    // Rebuilt from scratch on every change: caching by the boundaries alone would let a zone
    // that got out of sync with the text survive any number of edits
    editor.changeViewZones((accessor) => {
        for (const id of bankZoneIds)
            accessor.removeZone(id);
        bankZoneIds = boundaries.map(({ afterLineNumber, bank }) => {
            const domNode = document.createElement("div");
            domNode.className = "bank-boundary";
            domNode.textContent = bank === 0 ? "COMMON" : `BANK ${bank}`;
            return accessor.addZone({ afterLineNumber, heightInPx: 18, domNode });
        });
    });

    // A separator appearing above the caret pushes it down by its height, and the editor has
    // scrolled to the caret long before that: follow the shift, or typing at the bottom edge
    // drops the caret out of sight — and the text jumps under the eye either way
    const shift = editor.getTopForLineNumber(caretLine) - caretTop;
    if (shift !== 0)
        editor.setScrollTop(editor.getScrollTop() + shift);
}

function markOverflows(editor, model, overflows) {
    const monaco = window.monaco;
    const decorations = [];
    for (const { line, start, last } of overflows) {
        const column = model.getLineMaxColumn(line);
        decorations.push({
            range: new monaco.Range(line, column, line, column),
            options: {
                after: {
                    content: "out of bank bounds",
                    inlineClassName: "bank-overflow",
                    inlineClassNameAffectsLetterSpacing: true // the class changes the font size
                },
                showIfCollapsed: true // the range is empty, it only marks the end of the line
            }
        });
        // A decoration carrying injected text draws no overview ruler mark, so it takes a separate one
        decorations.push({
            range: new monaco.Range(line, 1, line, column),
            options: {
                hoverMessage: {
                    value: "The bytes of this statement cross a bank boundary: they start in "
                        + `${bankAreaName(start)} at \`0x${formatHex(start)}\` `
                        + `and end in ${bankAreaName(last)} at \`0x${formatHex(last)}\`.`
                },
                overviewRuler: { color: "#ffc107", position: monaco.editor.OverviewRulerLane.Right }
            }
        });
    }
    if (overflowDecorations)
        overflowDecorations.set(decorations);
    else
        overflowDecorations = editor.createDecorationsCollection(decorations);
}

// The trailing empty lines belong to no bank: folded, the file still ends with a line to type on
function findFoldEnd(model) {
    let end = model.getLineCount();
    while (end > 1 && model.getLineContent(end).trim() === "")
        --end;
    return end;
}

// A folded region shows its first line, so skip the leading ruler comments like ";====":
// the header text below them is what the reader needs to see
function findFoldStart(model, start, end) {
    while (start < end && !/\p{L}/u.test(model.getLineContent(start)))
        ++start;
    return start;
}

function bankAreaName(offset) {
    return offset < bankSize ? "the common part" : "bank " + Math.floor(offset / bankSize);
}

// The separator sticks to the bank's header: walk up over the comments and
// blank lines preceding the statement, then back down over the blank ones,
// so the separator lands right before the header comments, if any
function findBoundaryLine(model, statementLine) {
    let top = statementLine;
    while (top > 1) {
        const text = model.getLineContent(top - 1).trim();
        if (text !== "" && !text.startsWith(";"))
            break;
        --top;
    }
    while (top < statementLine && model.getLineContent(top).trim() === "")
        ++top;
    return top - 1;
}

function registerLanguage(monaco) {
    monaco.languages.register({ id: languageId });

    monaco.languages.setLanguageConfiguration(languageId, {
        comments: { lineComment: ";" },
        autoClosingPairs: [{ open: "\"", close: "\"" }],
        surroundingPairs: [{ open: "\"", close: "\"" }]
    });

    monaco.languages.setMonarchTokensProvider(languageId, {
        defaultToken: "",
        instructions,
        registers,
        keywords,
        tokenizer: {
            root: [
                [/;.*/, "comment"],
                [/^([ \t]*)([a-zA-Z_]\w*)(?=[ \t]*:)/, ["white", "label"]],
                [/^([ \t]*)([a-zA-Z_]\w*)(?=[ \t]+(?:db|equ)\b)/, ["white", "label"]],
                [/[a-zA-Z_]\w*/, {
                    cases: {
                        "@instructions": "keyword",
                        "@registers": "register",
                        "@keywords": "directive",
                        "@default": "identifier"
                    }
                }],
                [/\d\w*/, "number"],
                [/"(?:[^"\\]|\\.)*"/, "string"],
                [/"(?:[^"\\]|\\.)*$/, "string.invalid"],
                [/[+\-]/, "operator"],
                [/[,:]/, "delimiter"],
                [/\$/, "number"],
                [/[ \t\r]+/, "white"]
            ]
        }
    });

    monaco.editor.defineTheme("arrows-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [
            { token: "register", foreground: "9CDCFE" },
            { token: "directive", foreground: "C586C0" },
            { token: "label", foreground: "DCDCAA" },
            { token: "string.invalid", foreground: "F44747" }
        ],
        colors: {
            "editor.background": "#1e1e1e"
        }
    });
}

function registerCompletion(monaco) {
    monaco.languages.registerCompletionItemProvider(languageId, {
        provideCompletionItems: (model, position) => {
            const line = model.getLineContent(position.lineNumber).substring(0, position.column - 1);
            // No suggestions inside comments and strings
            if (line.includes(";") || (line.split("\"").length - 1) % 2 === 1)
                return { suggestions: [] };

            const word = model.getWordUntilPosition(position);
            const range = new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn);
            const item = (label, kind, detail, sortText) =>
                ({ label, kind, detail, range, sortText, insertText: label });

            const beforeWord = line.substring(0, word.startColumn - 1);
            const instructionItems = () => instructions.map(name =>
                item(name, monaco.languages.CompletionItemKind.Keyword, "instruction", name));

            // Start of a statement: a line start or right after a "label:"
            if (/^\s*$/.test(beforeWord) || /^\s*[a-zA-Z_]\w*\s*:\s*$/.test(beforeWord))
                return { suggestions: instructionItems() };

            // Second word after a name: "db" or "equ"
            const firstWord = beforeWord.match(/^\s*([a-zA-Z_]\w*)\s+$/);
            if (firstWord && !reservedNames.has(firstWord[1]))
                return {
                    suggestions: keywords.map(name =>
                        item(name, monaco.languages.CompletionItemKind.Keyword, "directive", name))
                };

            // Argument position: registers (except in db/equ values) and known names
            const suggestions = [];
            if (!/\b(?:db|equ)\b/.test(beforeWord))
                for (const name of registers)
                    suggestions.push(item(name, monaco.languages.CompletionItemKind.Variable, "register", "0" + name));
            for (const [name, info] of collectNames(monaco, model))
                suggestions.push(item(name, info.kind, info.detail, "1" + name));
            return { suggestions };
        }
    });
}

function registerDefinition(monaco) {
    monaco.languages.registerDefinitionProvider(languageId, {
        provideDefinition: (model, position) => {
            const word = nameAt(model, position);
            if (!word)
                return null;

            const info = collectNames(monaco, model).get(word.word);
            if (!info)
                return null;
            return {
                uri: model.uri,
                range: new monaco.Range(info.lineNumber, info.column, info.lineNumber, info.column + word.word.length)
            };
        }
    });
}

const argTypeNames = ["a", "b", "c", "d", "addr"]; // indexed by the Args values

function registerHover(monaco) {
    monaco.languages.registerHoverProvider(languageId, {
        provideHover: (model, position) => {
            const prefix = model.getLineContent(position.lineNumber).substring(0, position.column - 1);
            if (prefix.includes(";") || (prefix.split("\"").length - 1) % 2 === 1)
                return null;

            const word = model.getWordAtPosition(position);
            if (!word)
                return null;
            const range = new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn);
            const name = word.word;
            const markdown = (...values) => ({ range, contents: values.map(value => ({ value })) });

            if (instructions.includes(name)) {
                const doc = instructionDocs[name];
                const nameCommands = commands.filter(command => command.instruction === name);
                const forms = nameCommands.map(command => `${name} ${command.args.map(arg =>
                    argTypeNames[arg] === "addr" && name === "ldi" ? "value" : argTypeNames[arg]).join(", ")}`.trim());
                const width = Math.max(...forms.map(form => form.length));
                // Markdown hard break (two trailing spaces) keeps the variants close together
                const contents = [(doc.variants ?? [doc]).map(variant =>
                    `**${name}**${variant.signature ? " " + variant.signature : ""} — ${variant.text}`).join("  \n")];
                if (doc.flags)
                    contents.push(doc.flags === "–" ? "No effect on flags" : `Affects flags: ${doc.flags}`);
                contents.push("```arrows-asm\n" + forms.map((form, index) =>
                    `${form.padEnd(width)}  ; opcode 0x${formatHex(nameCommands[index].opcode)}`).join("\n") + "\n```");
                return markdown(...contents);
            }

            if (registers.includes(name))
                return markdown(`**${name}** — register`);
            if (name === "db")
                return markdown("**db** — define bytes: numbers, chars, strings, expressions");
            if (name === "equ")
                return markdown("**equ** — define a named constant");

            const numberValue = parseNumberLiteral(name);
            if (numberValue != null)
                return markdown(`${numberValue} · 0x${formatHex(numberValue)} · 0b${numberValue.toString(2).padStart(8, "0")}`);

            const info = collectNames(monaco, model).get(name);
            if (!info)
                return null;
            const compiler = new Compiler(model.getValue());
            compiler.compile();
            const value = compiler.names[name];
            const kind = info.detail === "label" ? "label" : info.detail === "db" ? "db data" : "constant";
            const meaning = info.detail === "label" || info.detail === "db" ? "address" : "value";
            return markdown(`**${name}** — ${kind}`
                + (value != null ? `, ${meaning} ${value} · 0x${formatHex(value)}` : ""));
        }
    });
}

function formatHex(value) {
    return value.toString(16).toUpperCase().padStart(2, "0");
}

function parseNumberLiteral(text) {
    let match;
    if (match = text.match(/^0[xX]([0-9a-fA-F]+)$/))
        return parseInt(match[1], 16);
    if (match = text.match(/^0[bB]([01]+)$/))
        return parseInt(match[1], 2);
    if (match = text.match(/^0([0-7])$/))
        return parseInt(match[1], 8);
    if (/^[1-9]\d*$|^0$/.test(text))
        return parseInt(text, 10);
    return null;
}

function registerOccurrences(monaco) {
    monaco.languages.registerDocumentHighlightProvider(languageId, {
        provideDocumentHighlights: (model, position) => {
            const word = nameAt(model, position);
            if (!word)
                return null;
            const info = collectNames(monaco, model).get(word.word);
            return findOccurrences(monaco, model, word.word).map(range => ({
                range,
                kind: info && range.startLineNumber === info.lineNumber && range.startColumn === info.column
                    ? monaco.languages.DocumentHighlightKind.Write
                    : monaco.languages.DocumentHighlightKind.Read
            }));
        }
    });
}

function registerReferences(monaco) {
    monaco.languages.registerReferenceProvider(languageId, {
        provideReferences: (model, position) => {
            const word = nameAt(model, position);
            if (!word)
                return null;
            return findOccurrences(monaco, model, word.word).map(range => ({ uri: model.uri, range }));
        }
    });
}

function registerRename(monaco) {
    monaco.languages.registerRenameProvider(languageId, {
        provideRenameEdits: (model, position, newName) => {
            const word = nameAt(model, position);
            if (!word)
                return { edits: [], rejectReason: "You can only rename labels and constants" };
            if (!/^[a-zA-Z_]\w*$/.test(newName) || reservedNames.has(newName))
                return { edits: [], rejectReason: `'${newName}' is not a valid name` };
            return {
                edits: findOccurrences(monaco, model, word.word).map(range => ({
                    resource: model.uri,
                    textEdit: { range, text: newName },
                    versionId: model.getVersionId()
                }))
            };
        },
        resolveRenameLocation: (model, position) => {
            const word = nameAt(model, position);
            if (!word)
                return {
                    range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
                    text: "",
                    rejectReason: "You can only rename labels and constants"
                };
            return {
                range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
                text: word.word
            };
        }
    });
}

const reservedNames = new Set([...instructions, ...registers, ...keywords]);

// A word at the position, unless it is a comment, a string, a number or a reserved name
function nameAt(model, position) {
    const prefix = model.getLineContent(position.lineNumber).substring(0, position.column - 1);
    if (prefix.includes(";") || (prefix.split("\"").length - 1) % 2 === 1)
        return null;

    const word = model.getWordAtPosition(position);
    if (!word || reservedNames.has(word.word) || /^\d/.test(word.word))
        return null;
    return word;
}

// Blank out string literals and comments, preserving the column positions
function cleanLine(line) {
    return line
        .replace(/"(?:[^"\\]|\\.)*("|$)/g, match => " ".repeat(match.length))
        .replace(/;.*/, match => " ".repeat(match.length));
}

function findOccurrences(monaco, model, name) {
    const ranges = [];
    const pattern = new RegExp(`(?<!\\w)${name}(?!\\w)`, "g");
    for (let i = 1; i <= model.getLineCount(); ++i) {
        const line = cleanLine(model.getLineContent(i));
        let match;
        while (match = pattern.exec(line))
            ranges.push(new monaco.Range(i, match.index + 1, i, match.index + 1 + name.length));
    }
    return ranges;
}

// Completion, definition, hover and occurrences all ask for the same names, several times per
// keystroke; the model version tells when the previous answer still holds. The callers only
// read from the map
let namesCache = { versionId: -1, names: null };

function collectNames(monaco, model) {
    const versionId = model.getVersionId();
    if (namesCache.versionId === versionId)
        return namesCache.names;

    const names = new Map();
    for (let i = 1; i <= model.getLineCount(); ++i) {
        const line = model.getLineContent(i);
        const add = (name, kind, detail) =>
            names.set(name, { kind, detail, lineNumber: i, column: line.search(/\S/) + 1 });
        let match;
        if ((match = line.match(/^\s*([a-zA-Z_]\w*)\s*:/)) && !reservedNames.has(match[1]))
            add(match[1], monaco.languages.CompletionItemKind.Function, "label");
        else if ((match = line.match(/^\s*([a-zA-Z_]\w*)\s+db\b/)) && !reservedNames.has(match[1]))
            add(match[1], monaco.languages.CompletionItemKind.Variable, "db");
        else if ((match = line.match(/^\s*([a-zA-Z_]\w*)\s+equ\b\s*(.*)/)) && !reservedNames.has(match[1]))
            add(match[1], monaco.languages.CompletionItemKind.Constant, ("equ " + match[2]).trim());
    }
    namesCache = { versionId, names };
    return names;
}

